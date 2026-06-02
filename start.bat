@echo off
echo Starting AI Phishing Project Services...

echo Starting AI Service on port 8000...
start cmd /k "cd ai-service && python -m uvicorn main:app --reload --port 8000"

echo Starting Backend Node Server on port 5000...
start cmd /k "cd backend && npm start"

echo Starting Frontend Next.js Server on port 3000...
start cmd /k "cd frontend && npm run dev"

echo All services are starting up!
echo Frontend will be available at http://localhost:3000
echo Backend API will be available at http://localhost:5000
echo AI Service will be available at http://localhost:8000
pause
