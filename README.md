# PhishGuard AI: Threat Simulation & Human Risk Management Platform

PhishGuard AI is an intelligent full-stack cybersecurity platform designed to detect complex phishing threats, measure organizational human vulnerability, deliver contextual micro-learning, and give security teams actionable telemetry through a real-time Security Operations Center (SOC).

---

## 🛡️ Key System Architecture

```
                               ┌───────────────────────────────────────────────┐
                               │             Next.js 14 Web Portal             │
                               │   (Dashboard, Sandbox, Admin SOC, Auth)       │
                               └──────────────────────┬────────────────────────┘
                                                      │ HTTP / REST
                               ┌──────────────────────▼────────────────────────┐
                               │           Node.js / Express Server            │
                               │  (Telemetry, Session State, User Management)  │
                               └──────────────────────┬────────────────────────┘
                                                      │ HTTP / JSON
                               ┌──────────────────────▼────────────────────────┐
                               │       FastAPI Threat Detection Engine         │
                               │ ┌───────────────────────────────────────────┐ │
                               │ │ Tier 1: Network & Protocol Analysis       │ │
                               │ │   - Raw IPv4/IPv6 address detection       │ │
                               │ │   - Unencrypted HTTP credential theft     │ │
                               │ │   - High-risk / malicious TLD analysis    │ │
                               │ ├───────────────────────────────────────────┤ │
                               │ │ Tier 2: Brand Whitelist & Verification    │ │
                               │ │   - Verified official domain registries   │ │
                               │ │   - Known safe enterprise platform checks │ │
                               │ ├───────────────────────────────────────────┤ │
                               │ │ Tier 3: Levenshtein Typosquatting Analysis│ │
                               │ │   - Root domain edit distance algorithm   │ │
                               │ │   - Brand spoofing detection              │ │
                               │ ├───────────────────────────────────────────┤ │
                               │ │ Tier 4: Sender Identity Verification      │ │
                               │ │   - Webmail provider brand impersonation  │ │
                               │ │   - Sender header validation              │ │
                               │ ├───────────────────────────────────────────┤ │
                               │ │ Tier 5: NLP Vector ML Classifier          │ │
                               │ │   - Scikit-Learn TF-IDF (1,2-grams)       │ │
                               │ │   - Logistic Regression intent scoring    │ │
                               │ ├───────────────────────────────────────────┤ │
                               │ │ Tier 6: Grounded Gemini Micro-Training    │ │
                               │ │   - Contextual cyber safety education     │ │
                               │ └───────────────────────────────────────────┘ │
                               └───────────────────────────────────────────────┘
```

---

## 🚀 Quick Start Guide

### 1. AI Service (Python FastAPI & Threat Engine)
```bash
cd ai-service
pip install -r requirements.txt
python train_model.py
uvicorn main:app --reload --port 8000
```
- API Documentation: `http://127.0.0.1:8000/docs`
- Predict Endpoint: `POST http://127.0.0.1:8000/predict`

### 2. Backend Gateway (Node.js Express)
```bash
cd backend
npm install
npm start
```
- Server runs on `http://localhost:5000`

### 3. Frontend Application (Next.js 14 & Tailwind CSS)
```bash
cd frontend
npm install
npm run dev
```
- Web Application: `http://localhost:3000`

---

## 🎯 Threat Detection Vectors Covered

1. **Typosquatting & Lookalike Domains**: Catches permutations like `amazon00.com`, `11flipkart.com`, `paypa1.com`.
2. **Direct IP Navigation**: Identifies malicious raw IPv4/IPv6 links like `http://192.168.1.105/auth/reset`.
3. **Suspicious Top-Level Domains (TLDs)**: Evaluates high-risk TLDs like `.xyz`, `.top`, `.su`, `.click`, `.download`.
4. **Brand Impersonation in Free Webmail**: Flags addresses like `amazon-security@gmail.com` claiming to be corporate teams.
5. **Psychological Manipulation**: Analyzes urgency, greed lures, lottery payouts, and credential harvesting keywords.
6. **Legitimate Corporate Communications**: Accurately whitelists authentic communications from Google, Amazon, Zoom, DocuSign, Slack, and Microsoft without false positives.
