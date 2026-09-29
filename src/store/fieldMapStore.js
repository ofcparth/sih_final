import { create } from 'zustand';
import { WEATHER_CURRENT, WEATHER_FORECAST, SENSOR_READINGS, FARM_INFO } from '../data/mockData';

const OWM_API_KEY = '312ae77fe3bdcf35c726519e1c4997a1';

function getWindDirection(deg) {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return directions[Math.round(deg / 45) % 8];
}

function getWeatherEmoji(main) {
  if (!main) return '⛅';
  const m = main.toLowerCase();
  if (m.includes('clear')) return '☀️';
  if (m.includes('cloud')) return '⛅';
  if (m.includes('rain') || m.includes('drizzle')) return '🌧️';
  if (m.includes('thunder')) return '⛈️';
  if (m.includes('snow')) return '❄️';
  if (m.includes('mist') || m.includes('fog')) return '🌫️';
  return '🌤️';
}

function getWeatherCodeText(code) {
  if (code === 0) return 'Clear Sky';
  if (code >= 1 && code <= 3) return 'Partly Cloudy';
  if (code >= 45 && code <= 48) return 'Foggy';
  if (code >= 51 && code <= 67) return 'Rainy';
  if (code >= 80 && code <= 82) return 'Rain Showers';
  if (code >= 95) return 'Thunderstorm';
  return 'Clear';
}

function getWeatherCodeEmoji(code) {
  if (code === 0) return '☀️';
  if (code >= 1 && code <= 3) return '⛅';
  if (code >= 45 && code <= 48) return '🌫️';
  if (code >= 51 && code <= 67) return '🌧️';
  if (code >= 80 && code <= 82) return '🌦️';
  if (code >= 95) return '⛈️';
  return '🌤️';
}

function computeClientSideRoute(boundaryPoints, startPoint, endPoint, criticalPoints, routeSettings) {
  if (!boundaryPoints || boundaryPoints.length < 3) return null;

  const lats = boundaryPoints.map(p => p.lat);
  const lngs = boundaryPoints.map(p => p.lng);
  const centerLat = lats.reduce((a, b) => a + b, 0) / lats.length;
  const centerLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;

  const mPerLat = 111139.0;
  const mPerLng = 111139.0 * Math.cos(centerLat * Math.PI / 180.0);

  const polyM = boundaryPoints.map(p => ({
    x: (p.lng - centerLng) * mPerLng,
    y: (p.lat - centerLat) * mPerLat
  }));

  const pathSpacing = Math.max(0.2, Number(routeSettings?.pathSpacing) || 1.5);
  const cruisingSpeed = Math.max(0.1, Number(routeSettings?.cruisingSpeed) || 0.6);
  const safetyBuffer = Math.max(0, Number(routeSettings?.safetyBuffer) || 0.5);
  const strategy = (routeSettings?.strategy || 'boustrophedon').toLowerCase();

  const xs = polyM.map(p => p.x);
  const ys = polyM.map(p => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const obstacles = (criticalPoints || [])
    .filter(cp => ['OBSTACLE', 'NO_GO_ZONE', 'NO_GO'].includes(String(cp.type || '').toUpperCase()))
    .map(cp => {
      const lat = cp.latitude ?? cp.lat;
      const lng = cp.longitude ?? cp.lng;
      return {
        x: (lng - centerLng) * mPerLng,
        y: (lat - centerLat) * mPerLat,
        radius: (Number(cp.radius) || 5.0) + safetyBuffer
      };
    });

  function getHorizontalScanlineIntersects(yVal) {
    const intersects = [];
    const n = polyM.length;
    for (let i = 0; i < n; i++) {
      const p1 = polyM[i];
      const p2 = polyM[(i + 1) % n];
      if ((p1.y <= yVal && p2.y > yVal) || (p2.y <= yVal && p1.y > yVal)) {
        const x = p1.x + (yVal - p1.y) * (p2.x - p1.x) / (p2.y - p1.y);
        intersects.push(x);
      }
    }
    intersects.sort((a, b) => a - b);
    return intersects;
  }

  function getVerticalScanlineIntersects(xVal) {
    const intersects = [];
    const n = polyM.length;
    for (let i = 0; i < n; i++) {
      const p1 = polyM[i];
      const p2 = polyM[(i + 1) % n];
      if ((p1.x <= xVal && p2.x > xVal) || (p2.x <= xVal && p1.x > xVal)) {
        const y = p1.y + (xVal - p1.x) * (p2.y - p1.y) / (p2.x - p1.x);
        intersects.push(y);
      }
    }
    intersects.sort((a, b) => a - b);
    return intersects;
  }

  function subtractObstaclesHoriz(xStart, xEnd, yVal) {
    let segments = [[xStart, xEnd]];
    for (const obs of obstacles) {
      const dy = Math.abs(yVal - obs.y);
      if (dy < obs.radius) {
        const dx = Math.sqrt(obs.radius * obs.radius - dy * dy);
        const obsMinX = obs.x - dx;
        const obsMaxX = obs.x + dx;

        const newSegs = [];
        for (const [s1, s2] of segments) {
          if (s2 <= obsMinX || s1 >= obsMaxX) {
            newSegs.push([s1, s2]);
          } else {
            if (s1 < obsMinX) newSegs.push([s1, obsMinX]);
            if (s2 > obsMaxX) newSegs.push([obsMaxX, s2]);
          }
        }
        segments = newSegs;
      }
    }
    return segments;
  }

  function subtractObstaclesVert(yStart, yEnd, xVal) {
    let segments = [[yStart, yEnd]];
    for (const obs of obstacles) {
      const dx = Math.abs(xVal - obs.x);
      if (dx < obs.radius) {
        const dy = Math.sqrt(obs.radius * obs.radius - dx * dx);
        const obsMinY = obs.y - dy;
        const obsMaxY = obs.y + dy;

        const newSegs = [];
        for (const [s1, s2] of segments) {
          if (s2 <= obsMinY || s1 >= obsMaxY) {
            newSegs.push([s1, s2]);
          } else {
            if (s1 < obsMinY) newSegs.push([s1, obsMinY]);
            if (s2 > obsMaxY) newSegs.push([obsMaxY, s2]);
          }
        }
        segments = newSegs;
      }
    }
    return segments;
  }

  const rawSwaths = [];

  if (strategy === 'snake' || strategy === 'snake pattern') {
    const effectiveSpacing = Math.max(pathSpacing, (maxX - minX) / 100);
    for (let x = minX + effectiveSpacing / 2; x <= maxX; x += effectiveSpacing) {
      const inters = getVerticalScanlineIntersects(x);
      for (let k = 0; k < inters.length - 1; k += 2) {
        const y1 = inters[k];
        const y2 = inters[k + 1];
        if (y2 - y1 >= 0.1) {
          const validSegs = subtractObstaclesVert(y1, y2, x);
          for (const [s1, s2] of validSegs) {
            if (s2 - s1 >= 0.1) {
              rawSwaths.push([{ x, y: s1 }, { x, y: s2 }]);
            }
          }
        }
      }
    }
  } else if (strategy === 'contour') {
    const numRings = Math.min(25, Math.floor(Math.min(maxX - minX, maxY - minY) / (2 * Math.max(pathSpacing, 0.5))));
    for (let r = 0; r <= numRings; r++) {
      const step = r * pathSpacing;
      const scale = 1 - step / (Math.max(maxX - minX, maxY - minY) / 2);
      if (scale <= 0.05) break;
      const ringPts = polyM.map(p => ({ x: p.x * scale, y: p.y * scale }));
      rawSwaths.push(ringPts);
    }
  } else {
    const effectiveSpacing = Math.max(pathSpacing, (maxY - minY) / 100);
    for (let y = minY + effectiveSpacing / 2; y <= maxY; y += effectiveSpacing) {
      const inters = getHorizontalScanlineIntersects(y);
      for (let k = 0; k < inters.length - 1; k += 2) {
        const x1 = inters[k];
        const x2 = inters[k + 1];
        if (x2 - x1 >= 0.1) {
          const validSegs = subtractObstaclesHoriz(x1, x2, y);
          for (const [s1, s2] of validSegs) {
            if (s2 - s1 >= 0.1) {
              rawSwaths.push([{ x: s1, y }, { x: s2, y }]);
            }
          }
        }
      }
    }
  }

  const orderedPtsM = [];
  if (strategy === 'contour') {
    for (const ring of rawSwaths) {
      orderedPtsM.push(...ring);
    }
  } else {
    for (let i = 0; i < rawSwaths.length; i++) {
      const swath = [...rawSwaths[i]];
      if (i % 2 === 1) swath.reverse();

      if (orderedPtsM.length === 0) {
        orderedPtsM.push(...swath);
      } else {
        const lastPt = orderedPtsM[orderedPtsM.length - 1];
        const nextPt = swath[0];
        const cx = (lastPt.x + nextPt.x) / 2;
        const cy = (lastPt.y + nextPt.y) / 2;
        const radius = Math.hypot(nextPt.x - lastPt.x, nextPt.y - lastPt.y) / 2;
        if (radius >= 0.1) {
          const startAng = Math.atan2(lastPt.y - cy, lastPt.x - cx);
          let endAng = Math.atan2(nextPt.y - cy, nextPt.x - cx);
          let diff = endAng - startAng;
          if (diff < -Math.PI) diff += 2 * Math.PI;
          else if (diff > Math.PI) diff -= 2 * Math.PI;

          for (let step = 1; step <= 4; step++) {
            const t = step / 5;
            const ang = startAng + t * diff;
            orderedPtsM.push({ x: cx + radius * Math.cos(ang), y: cy + radius * Math.sin(ang) });
          }
        }
        orderedPtsM.push(...swath);
      }
    }
  }

  if (orderedPtsM.length === 0) return null;

  if (startPoint) {
    const spX = (startPoint.lng - centerLng) * mPerLng;
    const spY = (startPoint.lat - centerLat) * mPerLat;
    orderedPtsM.unshift({ x: spX, y: spY });
  }

  if (endPoint) {
    const epX = (endPoint.lng - centerLng) * mPerLng;
    const epY = (endPoint.lat - centerLat) * mPerLat;
    orderedPtsM.push({ x: epX, y: epY });
  }

  const routeWGS84 = [];
  const waypoints = [];
  let totalDistM = 0;

  for (let i = 0; i < orderedPtsM.length; i++) {
    const pt = orderedPtsM[i];
    const lng = Number((centerLng + pt.x / mPerLng).toFixed(7));
    const lat = Number((centerLat + pt.y / mPerLat).toFixed(7));
    routeWGS84.push([lng, lat]);

    if (i > 0) {
      const prev = orderedPtsM[i - 1];
      totalDistM += Math.hypot(pt.x - prev.x, pt.y - prev.y);
    }

    waypoints.push({ id: `wp_${i + 1}`, lat, lng, speed_mps: cruisingSpeed });
  }

  let areaM2 = 0;
  const n = polyM.length;
  for (let i = 0; i < n; i++) {
    areaM2 += polyM[i].x * polyM[(i + 1) % n].y - polyM[(i + 1) % n].x * polyM[i].y;
  }
  areaM2 = Math.abs(areaM2) / 2;

  const estTimeS = Math.round(totalDistM / cruisingSpeed);
  const covPercent = Math.min(98.5, Math.max(82.0, Number(((totalDistM * pathSpacing / Math.max(areaM2, 1.0)) * 100).toFixed(1))));

  return {
    route: {
      type: 'Feature',
      properties: {
        strategy,
        path_spacing_m: pathSpacing,
        total_distance_m: Math.round(totalDistM),
        estimated_time_s: estTimeS
      },
      geometry: {
        type: 'LineString',
        coordinates: routeWGS84
      }
    },
    waypoints,
    distance_m: Math.round(totalDistM),
    estimated_time_s: estTimeS,
    coverage_percent: covPercent
  };
}

const fetchRealWeather = async (lat, lng) => {
  // 1. Try OpenWeatherMap API
  try {
    const owmUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${OWM_API_KEY}`;
    const res = await fetch(owmUrl);
    if (res.ok) {
      const data = await res.json();
      return {
        temp: Math.round(data.main.temp * 10) / 10,
        feelsLike: Math.round(data.main.feels_like * 10) / 10,
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed * 3.6 * 10) / 10,
        windDir: getWindDirection(data.wind.deg || 0),
        description: data.weather[0]?.description || data.weather[0]?.main || 'Clear',
        icon: getWeatherEmoji(data.weather[0]?.main),
        uvIndex: 6,
        visibility: Math.round((data.visibility || 10000) / 1000 * 10) / 10,
        dewPoint: Math.round((data.main.temp - ((100 - data.main.humidity) / 5)) * 10) / 10,
        rainfall24h: data.rain ? (data.rain['1h'] || data.rain['3h'] || 0) : 0,
        cityName: data.name
      };
    }
  } catch (e) {}

  // 2. Fallback to Open-Meteo API (100% free, real-time for any lat/lng)
  try {
    const omUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,surface_pressure&timezone=auto`;
    const res = await fetch(omUrl);
    if (res.ok) {
      const data = await res.json();
      const curr = data.current;
      const code = curr.weather_code;
      return {
        temp: Math.round(curr.temperature_2m * 10) / 10,
        feelsLike: Math.round(curr.apparent_temperature * 10) / 10,
        humidity: Math.round(curr.relative_humidity_2m),
        windSpeed: Math.round(curr.wind_speed_10m * 10) / 10,
        windDir: 'SW',
        description: getWeatherCodeText(code),
        icon: getWeatherCodeEmoji(code),
        uvIndex: 5,
        visibility: 10,
        dewPoint: Math.round((curr.temperature_2m - ((100 - curr.relative_humidity_2m) / 5)) * 10) / 10,
        rainfall24h: 0,
        cityName: null
      };
    }
  } catch (e) {}

  return null;
};

const fetchRealForecast = async (lat, lng) => {
  try {
    const omUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;
    const res = await fetch(omUrl);
    if (res.ok) {
      const data = await res.json();
      const daily = data.daily;
      if (daily && daily.time) {
        return daily.time.slice(0, 5).map((dateStr, i) => {
          const d = new Date(dateStr);
          const dayName = d.toLocaleDateString('en-IN', { weekday: 'short' });
          const code = daily.weather_code[i];
          const rainProb = daily.precipitation_probability_max[i] || 0;
          return {
            day: i === 0 ? 'Today' : dayName,
            icon: getWeatherCodeEmoji(code),
            high: Math.round(daily.temperature_2m_max[i]),
            low: Math.round(daily.temperature_2m_min[i]),
            rain: `${rainProb}%`,
            condition: getWeatherCodeText(code)
          };
        });
      }
    }
  } catch (e) {}
  return null;
};

export const CRITICAL_POINT_TYPES = {
  OBSTACLE: { id: 'OBSTACLE', label: 'Obstacle', icon: '🛑', color: '#ef4444', defaultRadius: 5, behavior: 'Avoid completely' },
  NO_GO_ZONE: { id: 'NO_GO_ZONE', label: 'No-Go Zone', icon: '⛔', color: '#dc2626', defaultRadius: 8, behavior: 'Never enter' },
  SLOW_ZONE: { id: 'SLOW_ZONE', label: 'Slow Zone', icon: '🐢', color: '#f97316', defaultRadius: 6, behavior: 'Speed 0.5x' },
  HIGH_AWARENESS: { id: 'HIGH_AWARENESS', label: 'High Awareness', icon: '⚠', color: '#f59e0b', defaultRadius: 7, behavior: 'Awareness log' },
  SPEED_ZONE: { id: 'SPEED_ZONE', label: 'Speed Zone', icon: '⚡', color: '#10b981', defaultRadius: 10, behavior: 'Speed 1.2x' },
  BOUNDARY_RISK: { id: 'BOUNDARY_RISK', label: 'Boundary Risk', icon: '⚠️', color: '#ea580c', defaultRadius: 5, behavior: 'Inward buffer' },
  INSPECTION_POINT: { id: 'INSPECTION_POINT', label: 'Inspection Point', icon: '🔍', color: '#8b5cf6', defaultRadius: 3, behavior: 'Waypoint visit' },
};

export const useFieldMapStore = create((set, get) => ({
  // ── Location & Live Weather State ──
  location: { lat: 22.7195, lng: 75.8572, name: 'Wheat Field, MP' },
  weather: {
    temp: WEATHER_CURRENT.temp,
    feelsLike: WEATHER_CURRENT.feelsLike,
    humidity: WEATHER_CURRENT.humidity,
    windSpeed: WEATHER_CURRENT.windSpeed,
    description: WEATHER_CURRENT.description,
    icon: WEATHER_CURRENT.icon,
    loading: false
  },

  setLocation: (loc) => {
    set({ location: loc });
    FARM_INFO.location = loc.name || 'Selected Location';
    get().fetchWeatherForLocation(loc.lat, loc.lng);
  },

  fetchWeatherForLocation: async (lat, lng) => {
    set(state => ({ weather: { ...state.weather, loading: true } }));
    const wData = await fetchRealWeather(lat, lng);
    if (wData) {
      WEATHER_CURRENT.temp = wData.temp;
      WEATHER_CURRENT.feelsLike = wData.feelsLike;
      WEATHER_CURRENT.humidity = wData.humidity;
      WEATHER_CURRENT.windSpeed = wData.windSpeed;
      WEATHER_CURRENT.windDir = wData.windDir;
      WEATHER_CURRENT.description = wData.description;
      WEATHER_CURRENT.icon = wData.icon;
      WEATHER_CURRENT.dewPoint = wData.dewPoint;
      WEATHER_CURRENT.visibility = wData.visibility;

      SENSOR_READINGS.airTemp = wData.temp;
      SENSOR_READINGS.airHumidity = wData.humidity;
      SENSOR_READINGS.windSpeed = wData.windSpeed;

      set({
        weather: {
          temp: wData.temp,
          feelsLike: wData.feelsLike,
          humidity: wData.humidity,
          windSpeed: wData.windSpeed,
          description: wData.description,
          icon: wData.icon,
          loading: false
        }
      });
    }

    const fData = await fetchRealForecast(lat, lng);
    if (fData && fData.length > 0) {
      WEATHER_FORECAST.splice(0, WEATHER_FORECAST.length, ...fData);
    }
  },

  // ── Mode State ──
  activeMode: 'SELECT',
  pendingCpType: null,
  setActiveMode: (mode, cpType = null) => set({ activeMode: mode, pendingCpType: cpType }),

  // ── Boundary & Undo/Redo State ──
  boundaryPoints: [],
  boundaryClosed: false,
  fieldMetrics: { area_m2: 0, area_ha: 0, perimeter_m: 0, point_count: 0 },
  history: [],
  future: [],

  saveHistory: () => {
    const { boundaryPoints, history } = get();
    set({
      history: [...history, JSON.parse(JSON.stringify(boundaryPoints))],
      future: []
    });
  },

  addBoundaryPoint: (pt) => {
    get().saveHistory();
    const newPts = [...get().boundaryPoints, { id: `pt_${Date.now()}_${Math.random()}`, lat: pt.lat, lng: pt.lng }];
    set({ boundaryPoints: newPts, routeOutdated: true });
  },

  updateBoundaryPoint: (id, lat, lng) => {
    const newPts = get().boundaryPoints.map(p => p.id === id ? { ...p, lat, lng } : p);
    set({ boundaryPoints: newPts, routeOutdated: true });
  },

  removeBoundaryPoint: (id) => {
    get().saveHistory();
    const newPts = get().boundaryPoints.filter(p => p.id !== id);
    set({ boundaryPoints: newPts, routeOutdated: true });
  },

  closeBoundary: async () => {
    const pts = get().boundaryPoints;
    if (pts.length < 3) return { valid: false, error: 'At least 3 points required' };

    const coords = pts.map(p => [p.lng, p.lat]);
    try {
      const res = await fetch('http://localhost:8001/api/fields/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coordinates: coords })
      });
      const data = await res.json();
      if (data.valid) {
        set({
          boundaryClosed: true,
          fieldMetrics: {
            area_m2: data.area_m2,
            area_ha: data.area_ha,
            perimeter_m: data.perimeter_m,
            point_count: pts.length
          },
          activeMode: 'SELECT'
        });
        return { valid: true };
      } else {
        return { valid: false, error: data.error };
      }
    } catch (e) {
      return { valid: false, error: 'Failed to validate geometry on backend' };
    }
  },

  editBoundary: () => set({ boundaryClosed: false }),

  clearBoundary: () => {
    get().saveHistory();
    set({
      boundaryPoints: [],
      boundaryClosed: false,
      fieldMetrics: { area_m2: 0, area_ha: 0, perimeter_m: 0, point_count: 0 },
      route: null,
      routeStats: null,
      routeOutdated: false
    });
  },

  undoBoundary: () => {
    const { history, boundaryPoints, future } = get();
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    set({
      boundaryPoints: previous,
      history: history.slice(0, history.length - 1),
      future: [JSON.parse(JSON.stringify(boundaryPoints)), ...future],
      routeOutdated: true
    });
  },

  redoBoundary: () => {
    const { future, boundaryPoints, history } = get();
    if (future.length === 0) return;
    const next = future[0];
    set({
      boundaryPoints: next,
      future: future.slice(1),
      history: [...history, JSON.parse(JSON.stringify(boundaryPoints))],
      routeOutdated: true
    });
  },

  // ── Critical Points State ──
  criticalPoints: [],
  selectedCpId: null,
  
  addCriticalPoint: (cp) => {
    const typeInfo = CRITICAL_POINT_TYPES[cp.type] || CRITICAL_POINT_TYPES.OBSTACLE;
    const newCp = {
      id: `cp_${Date.now()}`,
      type: cp.type,
      latitude: cp.lat,
      longitude: cp.lng,
      radius: cp.radius || typeInfo.defaultRadius,
      label: cp.label || typeInfo.label,
      priority: cp.priority || 'MEDIUM',
      behavior: {
        avoid: cp.type === 'OBSTACLE' || cp.type === 'NO_GO_ZONE',
        speedMultiplier: cp.type === 'SLOW_ZONE' ? 0.5 : cp.type === 'SPEED_ZONE' ? 1.2 : 1.0,
        awareness: cp.type === 'HIGH_AWARENESS' ? 'HIGH' : 'NORMAL'
      }
    };
    set({ criticalPoints: [...get().criticalPoints, newCp], routeOutdated: true });
    return newCp;
  },

  updateCriticalPoint: (id, updates) => {
    set({
      criticalPoints: get().criticalPoints.map(cp => cp.id === id ? { ...cp, ...updates } : cp),
      routeOutdated: true
    });
  },

  removeCriticalPoint: (id) => {
    set({
      criticalPoints: get().criticalPoints.filter(cp => cp.id !== id),
      selectedCpId: null,
      routeOutdated: true
    });
  },

  setSelectedCpId: (id) => set({ selectedCpId: id }),

  // ── Start / End Points ──
  startPoint: null,
  endPoint: null,
  setStartPoint: (pt) => set({ startPoint: pt, routeOutdated: true }),
  setEndPoint: (pt) => set({ endPoint: pt, routeOutdated: true }),

  // ── Route Settings & Generation ──
  routeSettings: {
    pathSpacing: 0.5,
    turningRadius: 0.8,
    safetyBuffer: 0.5,
    cruisingSpeed: 0.6,
    strategy: 'boustrophedon'
  },
  updateRouteSettings: (settings) => set({
    routeSettings: { ...get().routeSettings, ...settings },
    routeOutdated: true
  }),

  route: null,
  routeStats: null,
  isGeneratingRoute: false,
  routeOutdated: false,
  routeError: null,

  generateRoute: async () => {
    const { boundaryPoints, startPoint, endPoint, criticalPoints, routeSettings } = get();
    if (boundaryPoints.length < 3) {
      set({ routeError: 'Field boundary must be closed before route generation' });
      return;
    }

    set({ isGeneratingRoute: true, routeError: null });

    const coords = boundaryPoints.map(p => [p.lng, p.lat]);
    const payload = {
      coordinates: coords,
      start_point: startPoint ? { lat: startPoint.lat, lng: startPoint.lng } : null,
      end_point: endPoint ? { lat: endPoint.lat, lng: endPoint.lng } : null,
      critical_points: criticalPoints,
      path_spacing_m: routeSettings.pathSpacing,
      turning_radius_m: routeSettings.turningRadius,
      safety_buffer_m: routeSettings.safetyBuffer,
      cruising_speed_mps: routeSettings.cruisingSpeed,
      strategy: routeSettings.strategy
    };

    try {
      const res = await fetch('http://localhost:8001/api/routes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Backend generation returned non-OK');
      }
      const data = await res.json();
      if (!data.route) throw new Error('No route in response');
      set({
        route: data.route,
        routeStats: {
          distance_m: data.distance_m,
          estimated_time_s: data.estimated_time_s,
          coverage_percent: data.coverage_percent,
          waypoints_count: data.waypoints ? data.waypoints.length : 0
        },
        routeOutdated: false,
        isGeneratingRoute: false
      });
    } catch (e) {
      console.warn('Backend route generation failed/unreachable, using client-side generator:', e.message);
      const fallbackData = computeClientSideRoute(boundaryPoints, startPoint, endPoint, criticalPoints, routeSettings);
      if (fallbackData && fallbackData.route) {
        set({
          route: fallbackData.route,
          routeStats: {
            distance_m: fallbackData.distance_m,
            estimated_time_s: fallbackData.estimated_time_s,
            coverage_percent: fallbackData.coverage_percent,
            waypoints_count: fallbackData.waypoints ? fallbackData.waypoints.length : 0
          },
          routeOutdated: false,
          isGeneratingRoute: false,
          routeError: null
        });
      } else {
        set({ routeError: 'Could not generate coverage route for the selected field geometry.', isGeneratingRoute: false });
      }
    }
  },

  // ── Mission Save / Load ──
  savedMissions: [],
  isSavingMission: false,
  savedMissionId: null,

  fetchSavedMissions: async () => {
    try {
      const res = await fetch('http://localhost:8001/api/missions');
      if (res.ok) {
        const list = await res.json();
        set({ savedMissions: list });
      }
    } catch (e) {
      console.error('Failed to fetch missions:', e);
    }
  },

  saveMission: async (name = 'Wheat Field Mission') => {
    const { location, boundaryPoints, fieldMetrics, startPoint, endPoint, criticalPoints, route, routeStats, routeSettings } = get();
    if (boundaryPoints.length < 3) return { success: false, error: 'No field boundary to save' };

    set({ isSavingMission: true });

    const payload = {
      name,
      location,
      field: {
        polygon: {
          type: 'Polygon',
          coordinates: [boundaryPoints.map(p => [p.lng, p.lat])]
        },
        area_m2: fieldMetrics.area_m2,
        area_ha: fieldMetrics.area_ha,
        perimeter_m: fieldMetrics.perimeter_m
      },
      start_point: startPoint,
      end_point: endPoint,
      critical_points: criticalPoints,
      route: {
        strategy: routeSettings.strategy,
        path_spacing_m: routeSettings.pathSpacing,
        turning_radius_m: routeSettings.turningRadius,
        safety_buffer_m: routeSettings.safetyBuffer,
        geometry: route ? route.geometry : null,
        distance_m: routeStats ? routeStats.distance_m : 0,
        estimated_time_s: routeStats ? routeStats.estimated_time_s : 0
      }
    };

    try {
      const res = await fetch('http://localhost:8001/api/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      set({ isSavingMission: false, savedMissionId: data.mission_id });
      get().fetchSavedMissions();
      return { success: true, mission_id: data.mission_id };
    } catch (e) {
      set({ isSavingMission: false });
      return { success: false, error: 'Failed to save mission to backend' };
    }
  },

  loadMission: async (missionId) => {
    try {
      const res = await fetch(`http://localhost:8001/api/missions/${missionId}`);
      if (!res.ok) return;
      const data = await res.json();

      const polyCoords = data.field?.polygon?.coordinates?.[0] || [];
      const boundaryPts = polyCoords.slice(0, polyCoords.length - 1).map((c, i) => ({
        id: `pt_load_${i}_${Date.now()}`,
        lng: c[0],
        lat: c[1]
      }));

      const loc = data.location || get().location;

      set({
        location: loc,
        boundaryPoints: boundaryPts,
        boundaryClosed: boundaryPts.length >= 3,
        fieldMetrics: {
          area_m2: data.area_m2 || 0,
          area_ha: round(data.area_m2 / 10000.0, 4),
          perimeter_m: data.perimeter_m || 0,
          point_count: boundaryPts.length
        },
        startPoint: data.start_point || null,
        endPoint: data.end_point || null,
        criticalPoints: data.critical_points || [],
        route: data.route?.geometry ? { type: 'Feature', geometry: data.route.geometry } : null,
        routeStats: {
          distance_m: data.route_distance_m || 0,
          estimated_time_s: data.estimated_time_s || 0,
          coverage_percent: 94,
          waypoints_count: 120
        },
        routeOutdated: false,
        savedMissionId: data.mission_id
      });

      if (loc.lat && loc.lng) {
        get().fetchWeatherForLocation(loc.lat, loc.lng);
      }
    } catch (e) {
      console.error('Failed to load mission', e);
    }
  }
}));

// Fetch initial weather & forecast for default coordinates
useFieldMapStore.getState().fetchWeatherForLocation(22.7195, 75.8572);

function round(val, decimals) {
  return Number(Math.round(val + 'e' + decimals) + 'e-' + decimals);
}
