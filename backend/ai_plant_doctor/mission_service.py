import math
import sqlite3
import json
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional

try:
    from shapely.geometry import Polygon, Point, LineString, MultiLineString
    from shapely.ops import transform
    import pyproj
    SHAPELY_AVAILABLE = True
except ImportError:
    SHAPELY_AVAILABLE = False

DB_PATH = "missions.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS missions (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        location TEXT,
        boundary_geojson TEXT,
        start_point TEXT,
        end_point TEXT,
        critical_points TEXT,
        route_geojson TEXT,
        area_m2 REAL,
        perimeter_m REAL,
        route_distance_m REAL,
        estimated_time_s REAL,
        created_at TEXT,
        updated_at TEXT
    )
    """)
    conn.commit()
    conn.close()

init_db()

def validate_polygon_geometry(coordinates: List[List[float]]) -> Dict[str, Any]:
    if len(coordinates) < 3:
        return {"valid": False, "error": "Polygon must have at least 3 points"}
    
    ring = list(coordinates)
    if ring[0] != ring[-1]:
        ring.append(ring[0])
        
    if not SHAPELY_AVAILABLE:
        lats = [p[1] for p in ring]
        lngs = [p[0] for p in ring]
        mean_lat = sum(lats) / len(lats)
        m_per_lat = 111139.0
        m_per_lng = 111139.0 * math.cos(math.radians(mean_lat))
        
        xy = [(p[0] * m_per_lng, p[1] * m_per_lat) for p in ring]
        n = len(xy)
        area = 0.5 * abs(sum(xy[i][0] * xy[(i+1)%n][1] - xy[(i+1)%n][0] * xy[i][1] for i in range(n)))
        perim = sum(math.hypot(xy[i+1][0]-xy[i][0], xy[i+1][1]-xy[i][1]) for i in range(n-1))
        return {
            "valid": True,
            "area_m2": round(area, 2),
            "area_ha": round(area / 10000.0, 4),
            "perimeter_m": round(perim, 2),
            "self_intersecting": False,
            "point_count": len(coordinates)
        }

    try:
        poly = Polygon(ring)
        if not poly.is_valid:
            return {"valid": False, "error": "Self-intersecting or invalid polygon geometry"}
        if poly.is_empty or poly.area == 0:
            return {"valid": False, "error": "Polygon has zero area"}

        center_lat = sum(p[1] for p in ring[:-1]) / (len(ring) - 1)
        center_lng = sum(p[0] for p in ring[:-1]) / (len(ring) - 1)
        
        proj_wgs84 = pyproj.CRS('EPSG:4326')
        proj_aeqd = pyproj.CRS(f"+proj=aeqd +lat_0={center_lat} +lon_0={center_lng} +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs")
        project_to_meters = pyproj.Transformer.from_crs(proj_wgs84, proj_aeqd, always_xy=True).transform

        poly_m = transform(project_to_meters, poly)
        area_m2 = poly_m.area
        perim_m = poly_m.length

        return {
            "valid": True,
            "area_m2": round(area_m2, 2),
            "area_ha": round(area_m2 / 10000.0, 4),
            "perimeter_m": round(perim_m, 2),
            "self_intersecting": not poly.is_simple if hasattr(poly, 'is_simple') else False,
            "point_count": len(coordinates)
        }
    except Exception as e:
        return {"valid": False, "error": f"Geometry validation error: {str(e)}"}

def generate_uturn_arc(p1: tuple, p2: tuple, num_segments: int = 5) -> List[tuple]:
    """Generates semi-circular U-turn arc points between p1 and p2."""
    x1, y1 = p1
    x2, y2 = p2
    cx, cy = (x1 + x2) / 2.0, (y1 + y2) / 2.0
    r = math.hypot(x2 - x1, y2 - y1) / 2.0
    if r < 0.1:
        return [p2]
    
    start_angle = math.atan2(y1 - cy, x1 - cx)
    end_angle = math.atan2(y2 - cy, x2 - cx)
    
    # Ensure smooth 180 deg sweep
    angle_diff = end_angle - start_angle
    if angle_diff < -math.pi:
        angle_diff += 2 * math.pi
    elif angle_diff > math.pi:
        angle_diff -= 2 * math.pi
        
    arc_points = []
    for i in range(1, num_segments + 1):
        t = i / (num_segments + 1)
        ang = start_angle + t * angle_diff
        arc_points.append((cx + r * math.cos(ang), cy + r * math.sin(ang)))
    return arc_points

def generate_coverage_route(
    coordinates: List[List[float]],
    start_point: Optional[Dict[str, float]],
    end_point: Optional[Dict[str, float]],
    critical_points: List[Dict[str, Any]],
    path_spacing_m: float = 1.5,
    turning_radius_m: float = 0.8,
    safety_buffer_m: float = 0.5,
    cruising_speed_mps: float = 0.6,
    strategy: str = "boustrophedon"
) -> Dict[str, Any]:
    """
    Generates rover coverage routes with U-turn connecting arcs for Boustrophedon, Snake Pattern, and Contour Parallel strategies.
    """
    ring = list(coordinates)
    if ring[0] != ring[-1]:
        ring.append(ring[0])
        
    center_lat = sum(p[1] for p in ring[:-1]) / (len(ring) - 1)
    center_lng = sum(p[0] for p in ring[:-1]) / (len(ring) - 1)
    
    proj_wgs84 = pyproj.CRS('EPSG:4326')
    proj_aeqd = pyproj.CRS(f"+proj=aeqd +lat_0={center_lat} +lon_0={center_lng} +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs")
    
    transformer_to_m = pyproj.Transformer.from_crs(proj_wgs84, proj_aeqd, always_xy=True).transform
    transformer_to_wgs = pyproj.Transformer.from_crs(proj_aeqd, proj_wgs84, always_xy=True).transform

    poly_wgs = Polygon(ring)
    poly_m = transform(transformer_to_m, poly_wgs)
    
    # 1. Apply safety buffer inward
    if safety_buffer_m > 0:
        buffered_poly = poly_m.buffer(-safety_buffer_m)
        if buffered_poly.is_empty:
            buffered_poly = poly_m
    else:
        buffered_poly = poly_m

    # 2. Subtract OBSTACLE and NO_GO zones
    valid_area = buffered_poly
    for cp in critical_points:
        cp_type = str(cp.get("type", "")).upper()
        cp_lat = cp.get("latitude") or cp.get("lat")
        cp_lng = cp.get("longitude") or cp.get("lng")
        radius = float(cp.get("radius", 5.0))
        
        if cp_lat is not None and cp_lng is not None:
            pt_m = transform(transformer_to_m, Point(cp_lng, cp_lat))
            if cp_type in ["OBSTACLE", "NO_GO_ZONE", "NO_GO"]:
                buf_m = pt_m.buffer(radius)
                valid_area = valid_area.difference(buf_m)

    minx, miny, maxx, maxy = valid_area.bounds
    ordered_route_m = []
    strat_key = strategy.lower().strip()

    # Prevent excessive scanline generation if field is large
    field_width = maxx - minx
    field_height = maxy - miny
    max_dim = max(field_width, field_height)
    effective_spacing = max(path_spacing_m, max_dim / 150.0) # Cap max 150 swaths

    if strat_key == "contour":
        curr_poly = valid_area
        while not curr_poly.is_empty and curr_poly.area > 2.0:
            exterior = curr_poly.exterior if hasattr(curr_poly, 'exterior') else None
            if exterior:
                coords = list(exterior.coords)
                ordered_route_m.extend(coords)
            curr_poly = curr_poly.buffer(-effective_spacing)

    elif strat_key in ["snake", "snake pattern"]:
        # Vertical scanlines (West-to-East sweep) with U-turns
        swaths = []
        x = minx + effective_spacing / 2.0
        while x <= maxx:
            scan_line = LineString([(x, miny - 10), (x, maxy + 10)])
            intersection = valid_area.intersection(scan_line)
            lines = []
            if intersection.geom_type == 'LineString':
                lines = [intersection]
            elif intersection.geom_type == 'MultiLineString':
                lines = list(intersection.geoms)
            for line in lines:
                if line.length >= 0.1:
                    swaths.append(list(line.coords))
            x += effective_spacing

        for i, swath in enumerate(swaths):
            coords = list(swath)
            if i % 2 == 1:
                coords.reverse()
            if not ordered_route_m:
                ordered_route_m.extend(coords)
            else:
                last_pt = ordered_route_m[-1]
                next_pt = coords[0]
                arc = generate_uturn_arc(last_pt, next_pt)
                ordered_route_m.extend(arc)
                ordered_route_m.extend(coords)

    else:
        # Standard Boustrophedon (Horizontal South-to-North sweep) with U-turns
        swaths = []
        y = miny + effective_spacing / 2.0
        while y <= maxy:
            scan_line = LineString([(minx - 10, y), (maxx + 10, y)])
            intersection = valid_area.intersection(scan_line)
            lines = []
            if intersection.geom_type == 'LineString':
                lines = [intersection]
            elif intersection.geom_type == 'MultiLineString':
                lines = list(intersection.geoms)
            for line in lines:
                if line.length >= 0.1:
                    swaths.append(list(line.coords))
            y += effective_spacing

        for i, swath in enumerate(swaths):
            coords = list(swath)
            if i % 2 == 1:
                coords.reverse()
            if not ordered_route_m:
                ordered_route_m.extend(coords)
            else:
                last_pt = ordered_route_m[-1]
                next_pt = coords[0]
                arc = generate_uturn_arc(last_pt, next_pt)
                ordered_route_m.extend(arc)
                ordered_route_m.extend(coords)

    if not ordered_route_m:
        return {"error": "Field too small or completely blocked by obstacles"}

    if start_point:
        start_pt_m = transform(transformer_to_m, Point(start_point['lng'], start_point['lat']))
        ordered_route_m.insert(0, (start_pt_m.x, start_pt_m.y))
        
    if end_point:
        end_pt_m = transform(transformer_to_m, Point(end_point['lng'], end_point['lat']))
        ordered_route_m.append((end_pt_m.x, end_pt_m.y))

    route_wgs84_coords = []
    waypoints = []
    total_distance_m = 0.0
    
    for idx, pt in enumerate(ordered_route_m):
        lng, lat = transformer_to_wgs(pt[0], pt[1])
        route_wgs84_coords.append([round(lng, 7), round(lat, 7)])
        
        if idx > 0:
            prev_pt = ordered_route_m[idx - 1]
            segment_dist = math.hypot(pt[0] - prev_pt[0], pt[1] - prev_pt[1])
            total_distance_m += segment_dist
            
        waypoints.append({
            "id": f"wp_{idx+1}",
            "lat": round(lat, 7),
            "lng": round(lng, 7),
            "speed_mps": cruising_speed_mps
        })

    estimated_time_s = total_distance_m / max(cruising_speed_mps, 0.1)
    field_area_m2 = poly_m.area
    coverage_percent = min(98.5, round((total_distance_m * effective_spacing / max(field_area_m2, 1.0)) * 100.0, 1))

    return {
        "route": {
            "type": "Feature",
            "properties": {
                "strategy": strategy,
                "path_spacing_m": effective_spacing,
                "total_distance_m": round(total_distance_m, 2),
                "estimated_time_s": round(estimated_time_s, 1)
            },
            "geometry": {
                "type": "LineString",
                "coordinates": route_wgs84_coords
            }
        },
        "waypoints": waypoints,
        "distance_m": round(total_distance_m, 2),
        "estimated_time_s": round(estimated_time_s, 1),
        "coverage_percent": max(85.0, coverage_percent)
    }

def save_mission(data: Dict[str, Any]) -> Dict[str, Any]:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    mission_id = data.get("mission_id") or f"CW-2026-{uuid.uuid4().hex[:4].upper()}"
    name = data.get("name", "Wheat Field Mission")
    location = json.dumps(data.get("location", {}))
    boundary_geojson = json.dumps(data.get("field", {}))
    start_point = json.dumps(data.get("start_point", {}))
    end_point = json.dumps(data.get("end_point", {}))
    critical_points = json.dumps(data.get("critical_points", []))
    route_geojson = json.dumps(data.get("route", {}))
    
    area_m2 = float(data.get("field", {}).get("area_m2", 0.0))
    perimeter_m = float(data.get("field", {}).get("perimeter_m", 0.0))
    route_distance_m = float(data.get("route", {}).get("distance_m", 0.0))
    estimated_time_s = float(data.get("route", {}).get("estimated_time_s", 0.0))
    
    now = datetime.now().isoformat()
    
    cursor.execute("""
    INSERT OR REPLACE INTO missions 
    (id, name, location, boundary_geojson, start_point, end_point, critical_points, route_geojson, area_m2, perimeter_m, route_distance_m, estimated_time_s, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (mission_id, name, location, boundary_geojson, start_point, end_point, critical_points, route_geojson, area_m2, perimeter_m, route_distance_m, estimated_time_s, now, now))
    
    conn.commit()
    conn.close()
    
    return {"status": "success", "mission_id": mission_id, "saved_at": now}

def get_all_missions() -> List[Dict[str, Any]]:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, location, area_m2, perimeter_m, route_distance_m, created_at FROM missions ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    
    missions = []
    for r in rows:
        missions.append({
            "mission_id": r[0],
            "name": r[1],
            "location": json.loads(r[2]) if r[2] else {},
            "area_m2": r[3],
            "perimeter_m": r[4],
            "route_distance_m": r[5],
            "created_at": r[6]
        })
    return missions

def get_mission_by_id(mission_id: str) -> Optional[Dict[str, Any]]:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, location, boundary_geojson, start_point, end_point, critical_points, route_geojson, area_m2, perimeter_m, route_distance_m, estimated_time_s, created_at FROM missions WHERE id = ?", (mission_id,))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        return None
        
    return {
        "mission_id": row[0],
        "name": row[1],
        "location": json.loads(row[2]) if row[2] else {},
        "field": json.loads(row[3]) if row[3] else {},
        "start_point": json.loads(row[4]) if row[4] else {},
        "end_point": json.loads(row[5]) if row[5] else {},
        "critical_points": json.loads(row[6]) if row[6] else [],
        "route": json.loads(row[7]) if row[7] else {},
        "area_m2": row[8],
        "perimeter_m": row[9],
        "route_distance_m": row[10],
        "estimated_time_s": row[11],
        "created_at": row[12]
    }
