# Human Risk & Phishing Defense Platform

A full-stack AI-powered cybersecurity platform that detects phishing attacks, analyzes human behavior risk, and educates users in real-time.

## Prerequisites
- Node.js (v18+)
- Python 3.9+
- MongoDB (Running locally on `mongodb://127.0.0.1:27017` or configured via `MONGODB_URI`)

## How to Run Locally

### 1. AI Service (Python / FastAPI)
Open a terminal in the `ai-service` folder:
```bash
cd ai-service
pip install -r requirements.txt
python train_model.py  # This will generate phishing_model.pkl
uvicorn main:app --reload --port 8000
```

### 2. Backend Service (Node.js / Express)
Open a new terminal in the `backend` folder:
```bash
cd backend
npm install
npm start
```
*Note: Make sure MongoDB is running. The server connects to `mongodb://127.0.0.1:27017/phishing_platform` by default.*

### 3. Frontend Service (Next.js)
Open a new terminal in the `frontend` folder:
```bash
cd frontend
npm install
npm run dev
```
Access the application at `http://localhost:3000`.

## Features Included
- **AI Phishing Detection**: A basic Logistic Regression model trained on synthetic data.
- **Human Risk Scoring**: Users gain or lose points based on interacting with safe or malicious links.
- **Micro-Training**: Users receive immediate feedback when they fall for a simulated phishing attack.
- **Admin Dashboard**: Visualizations of risk scores using Chart.js.
