from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from inference.pipeline import WheatPipeline

app = FastAPI(title="Critical Wheat Vision - Live Dashboard")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pipeline = None

os.makedirs("results", exist_ok=True)
app.mount("/results", StaticFiles(directory="results"), name="results")

@app.on_event("startup")
def load_model():
    global pipeline
    try:
        pipeline = WheatPipeline(
            yolo_path="../models/yolo/best.pt",
            cnn_path="../models/cnn/efficientnet_b0.pth"
        )
    except Exception as e:
        print(f"Warning: Failed to load models: {e}")

@app.post("/predict/image")
async def predict_image(file: UploadFile = File(...)):
    if pipeline is None:
        return JSONResponse({"error": "Pipeline not loaded."}, status_code=500)
    
    temp_file = f"temp_{file.filename}"
    with open(temp_file, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        response, annotated_path = pipeline.predict(temp_file)
        response["annotated_image_url"] = f"/results/{os.path.basename(annotated_path)}" if annotated_path else None
        os.remove(temp_file)
        return response
    except Exception as e:
        if os.path.exists(temp_file):
            os.remove(temp_file)
        return JSONResponse({"error": str(e)}, status_code=500)

@app.get("/", response_class=HTMLResponse)
def serve_ui():
    index_path = os.path.join(os.path.dirname(__file__), "index.html")
    with open(index_path, "r") as f:
        return f.read()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8050, reload=True)
