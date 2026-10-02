# Procfile for Railway Deployment Services

web: npm run build && npx serve -s dist -l tcp://0.0.0.0:$PORT

# Service 2: FastAPI AI Plant Doctor Backend (Optionally deploy from backend/ai_plant_doctor)
# api: cd backend/ai_plant_doctor && uvicorn app:app --host 0.0.0.0 --port $PORT

# Service 3: Voice Calling Agent (Optionally deploy from services/voice_agent)
# voice: cd services/voice_agent && node index.js
