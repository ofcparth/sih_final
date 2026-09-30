# Smart Farming Assistant & Autonomous Agronomy Rover Dashboard (SIH Final)

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-blue)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%2B%20ONNX-009688)](https://fastapi.tiangolo.com/)
[![GIS](https://img.shields.io/badge/GIS-MapLibre%20%2B%20Turf.js-orange)](https://maplibre.org/)
[![AI Engine](https://img.shields.io/badge/AI-MobileNetV2%20%2B%20Gemini%2FGroq-8E44AD)](https://onnxruntime.ai/)

An end-to-end, high-precision Precision Agriculture and Autonomous Rover Management System built for Smart India Hackathon (SIH). This unified platform integrates real-time IoT field telemetry, autonomous rover GIS mission planning, ONNX vision-based crop disease diagnosis, and generative agronomy AI advisory.

---

## 🌟 Key System Architecture & Features

```
               +-------------------------------------------------------+
               |         React 18 + Vite Web Dashboard (UI)            |
               +-------------------------------------------------------+
                /                  |                 \               \
               /                   |                  \               \
    [ MapLibre / GIS ]     [ Leaf AI Vision ]   [ Telemetry Sync ]  [ AI Agronomy ]
           |                       |                    |                   |
    Field Boundary           FastAPI ONNX           Google Sheets      Gemini / Groq
    Coverage Planner       MobileNetV2 Engine      & Drive Stream      LLM Advisory
           |                       |                    |                   |
           +-----------------------+--------------------+-------------------+
                                   |
                     FastAPI Backend (Port 8001)
                     SQLite Mission Store (missions.db)
```

### 1. 🌾 GIS Autonomous Field Mission Planner (`FieldMapTab.jsx` + `mission_service.py`)
- **Polygon Lawn Mower Swath Generation**: Automatic Bounding-Box scanline generation taking field polygon coordinates, buffer margins, overlap ratios, and turning radiuses.
- **Critical Point Routing**: Dynamically incorporates high-priority disease/weed inspection waypoints into optimized rover navigation paths.
- **Turn Radius & Speed Safety Engine**: Calculates exact mission execution duration, route distance (meters), turn count, and energy/battery usage metrics.
- **MapLibre GL Vector Graphics**: Interactive vector map with interactive draw tools, critical point placement, live rover telemetry simulation playback, and geojson mission export.

### 2. 🍃 AI Plant Doctor & Vision Engine (`AnalysisTab.jsx` + `plant_doctor.py`)
- **ONNX MobileNetV2 Vision Classifier**: Offline-first leaf disease detection with fallback filtering for non-leaf background noise.
- **Chemical & Organic Pesticide Advisory**: Dynamic formulation breakdown (e.g. Copper Oxychloride 50% WP) complete with precise application dosage (`g/L`), safety intervals, and spray schedules.
- **Nutrient Deficiency Assessment**: Diagnostic breakdown of Nitrogen (N), Phosphorus (P), Potassium (K), and Micronutrient deficiencies.
- **Generative AI Agronomist**: Integrated Gemini / Groq LLM fallback for deep multi-turn agronomy Q&A.

### 3. 📊 Real-Time IoT Telemetry & Google Cloud Sync (`LiveDashboardTab.jsx` + `drive_service.py`)
- **Live Sensor Sync**: Automated background polling for Soil Moisture, Soil pH, NPK levels, Ambient Temperature, Humidity, and Solar Radiation.
- **Cloud Camera Feed Stream**: Integrates with Google Drive & Cloud Storage to automatically fetch real-time rover snapshot images (`drive_service.py`).
- **Google Sheets Data Pipeline**: Automatic CSV streaming and parsing from connected field sensor spreadsheets (`gsheet_service.py`).

### 4. ☀️ Precision Weather & Irrigation Advisory (`WeatherTab.jsx` & `IrrigationTab.jsx`)
- **Real-Time Weather Integration**: Live OpenWeatherMap API integration providing current weather conditions, 5-day forecasts, wind speeds, UV index, and rain probabilities.
- **Smart Irrigation Engine**: Evapotranspiration-driven water schedule recommendations to optimize field moisture.

---

## 📁 Repository Directory Structure

```
sih_final/
├── backend/
│   └── ai_plant_doctor/                # Core FastAPI & AI Inference Engine
│       ├── app.py                      # FastAPI App entrypoint (Port 8001)
│       ├── plant_doctor.py             # MobileNetV2 ONNX Vision Classifier engine
│       ├── mission_service.py          # GIS Field Coverage Path Planner algorithm
│       ├── ai_agronomy_service.py      # LLM Agronomy Advisory service (Gemini/Groq)
│       ├── pesticide_advisory.py       # Organic & chemical dosage advisory engine
│       ├── gsheet_service.py           # Google Sheets telemetry ingestion pipeline
│       ├── drive_service.py            # Google Drive live camera feed stream
│       ├── plant_disease.json          # Plant disease knowledge database
│       └── models/                     # ONNX model weights and label manifests
├── src/                                # Frontend React Application Source
│   ├── App.jsx                         # Main Router & Application Shell
│   ├── components/                     # Component Modules
│   │   ├── FieldMapTab.jsx             # MapLibre GIS Field Planner & Waypoint Editor
│   │   ├── LiveDashboardTab.jsx        # Sensor Telemetry & Camera Stream View
│   │   ├── AnalysisTab.jsx             # Leaf Disease Diagnosis & Pest AI Panel
│   │   ├── CriticalPointEditor.jsx     # High-priority inspection marker tool
│   │   ├── WeatherTab.jsx              # OpenWeather Live Forecasts
│   │   ├── FarmReportTab.jsx           # Field Audit & Printable Reports
│   │   ├── IrrigationTab.jsx           # Smart Evapotranspiration Scheduler
│   │   ├── DiseaseTab.jsx              # Crop Disease Registry
│   │   ├── NutrientTab.jsx             # NPK Soil Deficiency Calculator
│   │   └── PestTab.jsx                 # Pest Outbreak Monitor
│   ├── store/
│   │   └── fieldMapStore.js            # Zustand State Store (Routes, GeoJSON, Sensors)
│   └── index.css                       # Modern Tailwind/CSS Design System & Glassmorphism
├── public/                             # Static Assets & Icons
├── docs/                               # System Documentation & Legacy Prototypes
├── index.html                          # Entry HTML Template
├── package.json                        # Frontend NPM Dependencies
├── vite.config.js                      # Vite Bundler Configuration
└── README.md                           # Master Documentation (This file)
```

---

## ⚙️ Installation & Local Setup Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: v3.10 or higher
- **Git**

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/parthsharma17prs/sih_final.git
cd sih_final
```

---

### Step 2: Set Up Backend Server (FastAPI)

1. Navigate to the backend directory and create a virtual environment:
   ```bash
   cd backend/ai_plant_doctor
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. (Optional) Configure environment variables in `.env`:
   ```env
   PORT=8001
   ASSISTANT_PROVIDER="gemini"
   GEMINI_API_KEY="your-gemini-api-key-here"
   ```

4. Launch the FastAPI server:
   ```bash
   python app.py
   ```
   > Server will start at `http://127.0.0.1:8001`. You can access interactive Swagger API documentation at `http://127.0.0.1:8001/docs`.

---

### Step 3: Set Up Frontend Dashboard (React + Vite)

1. Open a new terminal window at the repository root (`sih_final/`):
   ```bash
   npm install
   ```

2. Start the Vite development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

---

## 📡 API Reference Overview

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/health` | `GET` | Health check endpoint returning backend status |
| `/api/routes/generate` | `POST` | Generates GIS rover coverage path from polygon coordinates |
| `/api/missions` | `POST / GET` | Saves or retrieves field rover missions from SQLite store |
| `/analyze` | `POST` | Accepts uploaded leaf image and returns ONNX disease diagnosis |
| `/gsheet/latest` | `GET` | Fetches recent IoT sensor telemetry stream from Google Sheets |
| `/drive/latest` | `GET` | Returns latest camera snapshot image from Google Drive |

---

## 🛠️ Built With

- **Frontend**: [React 18](https://reactjs.org/), [Vite](https://vitejs.dev/), [Zustand](https://github.com/pmndrs/zustand), [Lucide Icons](https://lucide.dev/), [Recharts](https://recharts.org/)
- **GIS & Mapping**: [MapLibre GL JS](https://maplibre.org/), [Turf.js](https://turfjs.org/)
- **Backend Framework**: [FastAPI](https://fastapi.tiangolo.com/), [Uvicorn](https://www.uvicorn.org/), [Pydantic v2](https://docs.pydantic.dev/)
- **Machine Learning & AI**: [ONNX Runtime](https://onnxruntime.ai/), [MobileNetV2](https://arxiv.org/abs/1801.04381), [Google Gemini AI API](https://ai.google.dev/)
- **Database**: SQLite3

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.
