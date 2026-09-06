# SIH26106 — AI-Powered Email Threat Detection, GeoLocation & Forensic Intelligence Platform

> **Smart India Hackathon 2026** | **Problem Statement ID:** 26106  
> **Organization:** All India Council for Technical Education (Cyber Security Cell)  
> **Category:** Software | **Theme:** Blockchain & Cybersecurity

---

### 🌐 Live Interactive Demo
🚀 **Access the Live Web Application:**  
**`https://<YOUR-GITHUB-USERNAME>.github.io/<YOUR-REPO-NAME>/`**  
*(Automated deployment configured via GitHub Pages — runs full forensic evaluation in any web browser!)*

---

## 🛡️ Executive Summary

Current email security systems primarily filter or block suspicious content but provide limited intelligence for forensic tracing of email origins and sender infrastructure. 

**SIH26106** is an end-to-end intelligence platform that:
1. Performs deep structural parsing of RFC 822 email headers and body.
2. Applies a multi-vector fraudulent email detection engine (typosquatting, display-name spoofing, suspicious TLDs, link redirects, and social-engineering urgency heuristics).
3. Reconstructs transmission relay chains and origin geolocation.
4. Generates investigator-ready risk classifications and visual intelligence.

---

## 📸 Key Features & Dashboard Overview

- **Dynamic Risk Badge**: Color-coded risk grading (Low / Medium / High Risk) with numeric threat index.
- **Header Authentication Analysis**: Instant cryptographic verification for SPF, DKIM, DMARC, and Return-Path.
- **Forensic Findings Timeline**: Granular breakdown of detected anomalies with individual threat contributions.
- **Origin Geolocation Mapping**: Interactive Leaflet.js map plotting sender IP, geographical coordinates, and ISP infrastructure.
- **Domain Intelligence Card**: Domain registration telemetry, registrar identification, and newly-registered domain alert badges.
- **Relay Hop Visualization**: Step-by-step timeline of mail transfer agent (MTA) transmission hops.
- **1-Click Demo Samples**: Pre-loaded phishing and safe email samples for instant demonstration during presentations.

---

## 🏗️ System Architecture

```
[Input: .eml File Upload / Raw RFC 822 Source / 1-Click Demo]
                         │
                         ▼
        ┌──────────────────────────────────┐
        │       FastAPI Core Pipeline      │
        │       (or In-Browser Fallback)   │
        └────────────────┬─────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
   [Email Parser] [Fraud Engine] [Forensics Engine]
   • Headers      • Typosquat    • IP Geolocation
   • Relay Hops   • Spoofing     • WHOIS Intel
   • Links & Body • Urgency NLP  • Safe Browsing
         └───────────────┬───────────────┘
                         │
                         ▼
     [Interactive Forensic Intelligence Dashboard]
     (Risk Score • Header Auth • Leaflet Map • Relay Path)
```

---

## 🔍 Detection Engine Heuristics

| Security Check | Contribution | Method & Rationale |
|:---|:---:|:---|
| **Lookalike Domain Detection** | `+20 pts` | Levenshtein distance ratio against 20+ monitored enterprise & banking brands |
| **Display-Name Spoofing** | `+15 pts` | Identifies brand claims in header display names originating from unauthorized domains |
| **Suspicious TLD Screening** | `+10 pts` | Flags high-abuse top-level domains (`.tk`, `.ml`, `.ga`, `.ru`, `.xyz`, etc.) |
| **Link vs. Href Mismatch** | `+20 pts` | Compares visible link text with destination URLs to detect deceitful redirects |
| **Obfuscated / Shortened URLs**| `+15 pts` | Identifies URL shorteners (bit.ly, tinyurl) and raw IP-based web addresses |
| **Urgency & Social Engineering** | `+15 pts` | Heuristic NLP scanning for coercion patterns ("account suspended", "verify immediately") |

**Threat Classification Thresholds:**
- 🟢 `0 – 29 pts` : **Low Risk / Looks Safe**
- 🟡 `30 – 59 pts` : **Medium Risk / Caution**
- 🔴 `60 – 100 pts`: **High Risk / Malicious Threat**

---

## 🚀 Deployment Guide

### Option 1: Automated GitHub Pages (1-Click Client Deployment)
This repository includes a GitHub Actions workflow (`.github/workflows/deploy-pages.yml`) and an in-browser forensic engine:
1. Push this repository to your GitHub account:
   ```bash
   git remote add origin https://github.com/<YOUR-USERNAME>/<YOUR-REPO-NAME>.git
   git branch -M main
   git push -u origin main
   ```
2. On GitHub, navigate to **Settings** → **Pages**.
3. Under **Build and deployment** → **Source**, select **GitHub Actions**.
4. Within 60 seconds, your site will be live at:  
   `https://<YOUR-USERNAME>.github.io/<YOUR-REPO-NAME>/`

### Option 2: Full-Stack Cloud Deployment (Render / Docker)
For running both the Python FastAPI backend and React frontend together on a single cloud service:
- Connect the repo to [Render.com](https://render.com) using the included `render.yaml` or `Dockerfile`.

### Option 3: Local Development
**Backend:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # On Windows
# source venv/bin/activate     # On Linux/macOS
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Benchmark Verification

| Sample Test | Fraud Score | Risk Level | Highlights |
|:---|:---:|:---:|:---|
| `phishing_test.eml` | **70** | 🔴 **High Risk** | 9 findings: Lookalike domain, spoofed PayPal identity, link target mismatch, suspicious TLD, failed SPF/DKIM/DMARC |
| `legitimate_test.eml` | **0** | 🟢 **Looks Safe** | 0 findings: Clean headers, passing SPF/DKIM/DMARC authentication |

---

## 📄 Compliance & License

Developed for the **Smart India Hackathon (SIH 2026)**.  
Licensed under the [MIT License](LICENSE).
