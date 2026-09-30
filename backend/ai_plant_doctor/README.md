# Standalone AI Plant Doctor Engine

This folder contains the complete, decoupled AI Plant Doctor inference engine. You can drop this entire folder into any Python project (FastAPI, Flask, Django, Streamlit, CLI) to instantly add crop disease detection, pesticide advisory, and AI-driven nutrient deficiency analysis.

## 📂 Folder Structure
- `models/` - Contains the ONNX ML model (`mobilenet_v2_plant_disease.onnx`) and the label configuration (`onnx_config.json`).
- `plant_disease.json` - Comprehensive database of plant diseases, causes, and standard treatments.
- `plant_doctor.py` - The main `PlantDoctor` class. Your entry point for inference.
- `pesticide_advisory.py` - Logic to generate specific pesticide/spray recommendations.
- `ai_agronomy_service.py` - Generative AI integration (Gemini/Groq) for deeper agronomy and nutrient analysis.
- `.env` - Environment variables configuration.

## 🛠️ Setup

1. **Install Requirements:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure API Keys:**
   Open the `.env` file and add your API keys.
   - For demo mode without API limits, keep `ASSISTANT_PROVIDER="demo"`.
   - To enable live AI analysis, set `ASSISTANT_PROVIDER="gemini"` or `"openai"` and provide the respective `GEMINI_API_KEY` or `LLM_API_KEY`.

## 🚀 Usage

You can import and use the `PlantDoctor` in your code like this:

```python
from plant_doctor import PlantDoctor

# Initialize the engine (automatically loads ONNX models and labels)
doctor = PlantDoctor()

# Pass an image file path (or a PIL Image object)
image_path = "path/to/sick_leaf.jpg"

# Run full diagnosis (Disease classification + Pesticides + Nutrients)
diagnosis = doctor.diagnose(
    image_path, 
    include_nutrients=True, 
    include_pesticides=True
)

# Print results
print(f"Disease Detected: {diagnosis['disease_name']}")
print(f"Confidence: {diagnosis['confidence']}%")
print(f"Pesticide Advisory: {diagnosis.get('pesticide_advisory')}")
print(f"Nutrient Analysis: {diagnosis.get('nutrient_analysis')}")
```

## 🧠 Model Details
The AI uses a MobileNetV2 architecture converted to ONNX for highly optimized, CPU-friendly inference. It supports classifying numerous plant diseases across various crop types, filtering out non-plant background images.
