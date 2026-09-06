# SIH26106 — AI-Powered Email Threat Detection, GeoLocation & Forensic Intelligence Platform

> **Smart India Hackathon 2026** | Problem Statement ID: 26106  
> **Organization:** All India Council for Technical Education (Cyber Security Cell)  
> **Category:** Software | **Theme:** Blockchain & Cybersecurity

[![Live Demo](https://img.shields.io/badge/Live_Demo-Open_App-brightgreen?style=for-the-badge&logo=vercel)](https://github.com)
[![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-Automated_Deploy-blue?style=for-the-badge&logo=github)](https://github.com)

---

## 🛡️ Overview

A web-based forensic intelligence platform that analyzes any email for fraud, phishing, and impersonation — tracing headers, sender location, and domain/brand reputation to generate investigator-ready reports.

## 🌐 Live Web Deployment & PPT Demo

This platform is ready to be hosted on the web with **one-click live testing**:

### Option 1: Render (Recommended — 100% Free Full-Stack)
Render builds both the React Frontend and FastAPI Backend into **a single live URL**:
1. Push your repository to GitHub.
2. Log in to [render.com](https://render.com) (free).
3. Click **New +** → **Blueprint** → Select this repository.
4. Render automatically reads `render.yaml` and deploys your full app at:
   `https://your-app-name.onrender.com`
5. Copy that link into your PPT presentation and GitHub repo **About** section!

### Option 2: GitHub Pages (Automated Workflow Included)
An automated GitHub Actions workflow (`.github/workflows/deploy-pages.yml`) is already configured:
1. In your GitHub repository, go to **Settings** → **Pages**.
2. Under **Build and deployment** → **Source**, select **GitHub Actions**.
3. Push to `main` — GitHub will automatically build and host the UI at:
   `https://<your-username>.github.io/<your-repo-name>/`

---

## 🏗️ Architecture

```
[Input: .eml file upload / raw source paste / 1-click demo sample]
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
| **Forensic APIs** | ip-api.com (geolocation), python-whois, Google Safe Browsing |
| **DevOps** | Docker, Render Blueprint, GitHub Actions |

## 📦 Local Development

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** (or **http://localhost:8000** when serving frontend through FastAPI).

---

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

---

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/analyze` | Analyze email (.eml upload or JSON) |

---

## 🧪 Test Results

| Email | Score | Risk | Findings |
|-------|-------|------|----------|
| Phishing (`paypa1-secure.tk`) | 70 | 🔴 High Risk | 9 findings (typosquatting, link mismatch, suspicious TLD, urgency language) |
| Legitimate (`gmail.com`) | 0 | 🟢 Looks Safe | 0 findings (all SPF/DKIM/DMARC pass) |

---

## 👥 Team

> _Add your team name and members here_

## 📄 License

This project was built for SIH 2026. All rights reserved.
