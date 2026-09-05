# SIH26106 — AI-Powered Email Threat Detection, GeoLocation & Forensic Intelligence Platform

> **Smart India Hackathon 2026** | Problem Statement ID: 26106  
> **Organization:** All India Council for Technical Education (Cyber Security Cell)  
> **Category:** Software | **Theme:** Blockchain & Cybersecurity

## 🛡️ Overview

A web-based forensic intelligence platform that analyzes any email for fraud, phishing, and impersonation — tracing headers, sender location, and domain/brand reputation to generate investigator-ready reports.

## 🏗️ Architecture

```
[Input: .eml file upload / raw source paste]
        ↓
[Backend — POST /analyze pipeline]
  1. Email Parser → headers, body, links, SPF/DKIM/DMARC, relay chain
  2. Detection Engine → rule-based checks → fraud score + findings
  3. Forensic Intelligence → IP geolocation, WHOIS, Safe Browsing
        ↓
[Frontend Dashboard]
  Risk badge, findings list, header analysis, relay path,
  geolocation map, domain intel
```

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Python, FastAPI, Uvicorn, SQLite |
| **Frontend** | React, Vite, Tailwind CSS, Leaflet.js |
| **Detection** | RapidFuzz (Levenshtein), Regex NLP |
| **APIs** | ip-api.com (geolocation), python-whois, Google Safe Browsing |

## 📦 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

## 🔍 Detection Capabilities

| Check | Points | Description |
|-------|--------|-------------|
| Lookalike Domain | +20 | Levenshtein distance against 21 known brands |
| Display-Name Spoofing | +15 | Brand name in display name but wrong domain |
| Suspicious TLD | +10 | .tk, .ml, .ga, .ru, .xyz, etc. |
| Link Mismatch | +20 | Visible URL differs from actual href |
| Obfuscated URLs | +15 | Shorteners, raw IPs, hex encoding |
| Urgency Language | +15 | "verify your account", "act now", etc. |

**Risk Levels:** 0-29 = Low (Safe) · 30-59 = Medium (Caution) · 60-100 = High Risk

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/analyze` | Analyze email (.eml upload or JSON) |

## 🧪 Test Results

| Email | Score | Risk | Findings |
|-------|-------|------|----------|
| Phishing (paypa1-secure.tk) | 70 | 🔴 High Risk | 9 findings |
| Legitimate (gmail.com) | 0 | 🟢 Looks Safe | 0 findings |

## 👥 Team

> _Add your team name and members here_

## 📄 License

This project was built for SIH 2026. All rights reserved.
