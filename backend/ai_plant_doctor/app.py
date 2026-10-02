from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from io import BytesIO
from plant_doctor import PlantDoctor
from PIL import Image
from drive_service import DriveService
from gsheet_service import fetch_and_process_gsheet_data
import base64

import mission_service

app = FastAPI(title="Kisan AI & Field Mission Planner API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

doctor = PlantDoctor()
drive_svc = DriveService()

# ── Pydantic Request Schemas ──
class ValidateFieldRequest(BaseModel):
    coordinates: List[List[float]] # [[lng, lat], ...]

class RouteGenerateRequest(BaseModel):
    coordinates: List[List[float]]
    start_point: Optional[Dict[str, float]] = None # {"lat": ..., "lng": ...}
    end_point: Optional[Dict[str, float]] = None # {"lat": ..., "lng": ...}
    critical_points: List[Dict[str, Any]] = []
    path_spacing_m: float = 0.5
    turning_radius_m: float = 0.8
    safety_buffer_m: float = 0.5
    cruising_speed_mps: float = 0.6
    strategy: str = "boustrophedon"

class SaveMissionRequest(BaseModel):
    mission_id: Optional[str] = None
    name: str = "Wheat Field Mission"
    location: Dict[str, Any] = {}
    field: Dict[str, Any] = {}
    start_point: Optional[Dict[str, Any]] = None
    end_point: Optional[Dict[str, Any]] = None
    critical_points: List[Dict[str, Any]] = []
    route: Dict[str, Any] = {}

# ── Mission Planner Endpoints ──
@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "Kisan Mission Planner"}

@app.post("/api/fields/validate")
def validate_field(req: ValidateFieldRequest):
    res = mission_service.validate_polygon_geometry(req.coordinates)
    return res

@app.post("/api/routes/generate")
def generate_route(req: RouteGenerateRequest):
    res = mission_service.generate_coverage_route(
        coordinates=req.coordinates,
        start_point=req.start_point,
        end_point=req.end_point,
        critical_points=req.critical_points,
        path_spacing_m=req.path_spacing_m,
        turning_radius_m=req.turning_radius_m,
        safety_buffer_m=req.safety_buffer_m,
        cruising_speed_mps=req.cruising_speed_mps,
        strategy=req.strategy
    )
    if "error" in res:
        raise HTTPException(status_code=400, detail=res["error"])
    return res

@app.post("/api/missions")
def save_mission_endpoint(req: SaveMissionRequest):
    data_dict = req.model_dump() if hasattr(req, 'model_dump') else req.dict()
    res = mission_service.save_mission(data_dict)
    return res

@app.get("/api/missions")
def list_missions_endpoint():
    return mission_service.get_all_missions()

@app.get("/api/missions/{mission_id}")
def get_mission_endpoint(mission_id: str):
    m = mission_service.get_mission_by_id(mission_id)
    if not m:
        raise HTTPException(status_code=404, detail="Mission not found")
    return m

# ── Existing Kisan AI Endpoints ──
@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    contents = await file.read()
    image = Image.open(BytesIO(contents))
    result = doctor.diagnose(image, include_nutrients=True, include_pesticides=True)
    return result

@app.get("/drive/latest")
async def fetch_latest_from_drive():
    drive_data, error = drive_svc.get_latest_image()
    if error:
        return {"error": error}
        
    image = drive_data["image"]
    filename = drive_data["filename"]
    timestamp = drive_data["timestamp"]
    
    result = doctor.diagnose(image, include_nutrients=True, include_pesticides=True)
    
    buffered = BytesIO()
    image.save(buffered, format="JPEG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    
    return {
        "source": "drive",
        "folder_id": drive_svc.folder_id,
        "folder_name": drive_svc.folder_name,
        "account_email": drive_svc.account_email,
        "filename": filename,
        "timestamp": timestamp,
        "original_image": f"data:image/jpeg;base64,{img_str}",
        "diagnosis": result
    }

@app.get("/drive/config")
async def get_drive_configuration():
    return {
        "folder_id": drive_svc.folder_id,
        "folder_name": drive_svc.folder_name,
        "account_email": drive_svc.account_email,
        "is_authenticated": drive_svc.service is not None
    }

@app.post("/drive/config")
async def update_drive_configuration(config: dict):
    drive_svc.update_config(
        folder_id=config.get("folder_id"),
        folder_name=config.get("folder_name"),
        account_email=config.get("account_email")
    )
    return {
        "status": "success",
        "message": "Drive configuration updated successfully",
        "config": {
            "folder_id": drive_svc.folder_id,
            "folder_name": drive_svc.folder_name,
            "account_email": drive_svc.account_email
        }
    }

from redis_service import redis_service

@app.get("/gsheet/latest")
async def fetch_latest_gsheet_data():
    cached = redis_service.get("gsheet_latest")
    if cached:
        return {"data": cached, "cached": True}

    df = fetch_and_process_gsheet_data()
    if df is None or df.empty:
        return {"error": "Failed to fetch or process Google Sheets data."}
    
    latest_row = df.iloc[-1].to_dict()
    redis_service.set("gsheet_latest", latest_row, ttl_seconds=15)
    return {"data": latest_row, "cached": False}


import os

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8001))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=False)

