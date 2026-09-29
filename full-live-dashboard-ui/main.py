from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import sys

# Import the existing fully featured model from your backend
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))
from app.ml.disease_adapter import disease_adapter

app = FastAPI(title="Full Live AI Plant Doctor Dashboard")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "uploads"))
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

@app.post("/predict")
async def predict_image(file: UploadFile = File(...)):
    temp_file = os.path.join(UPLOAD_DIR, f"scan_{file.filename}")
    with open(temp_file, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        # Calls your powerful backend model which returns accuracy, heatmap, bbox, cure, cause, advisory
        response = disease_adapter.predict(temp_file, output_dir=UPLOAD_DIR)
        
        # Attach URLs for the UI
        response["bounding_box_url"] = f"/uploads/{response.get('bounding_box_filename')}"
        response["heatmap_url"] = f"/uploads/{response.get('heatmap_filename')}"
        
        return JSONResponse(content=response)
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

@app.get("/", response_class=HTMLResponse)
def serve_ui():
    index_path = os.path.join(os.path.dirname(__file__), "index.html")
    with open(index_path, "r") as f:
        return f.read()

if __name__ == "__main__":
    import uvicorn
    # Using 8060 to avoid conflict with the other project
    uvicorn.run("main:app", host="0.0.0.0", port=8060, reload=True)
