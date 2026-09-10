# SIH26106 — AI-Powered Email Threat Detection, GeoLocation & Forensic Intelligence Platform

> **Smart India Hackathon 2026** | **Problem Statement ID:** 26106
> **Organization:** All India Council for Technical Education (Cyber Security Cell)
> **Category:** Software | **Theme:** Blockchain & Cybersecurity

---

### 🌐 Live Interactive Demo
🚀 **Access the Live Web Application:**
**[https://kis0nn.github.io/SIH26106-Email-Threat-Detection/](https://kis0nn.github.io/SIH26106-Email-Threat-Detection/)**
*(Automated deployment via GitHub Pages — runs full offline forensic evaluation in any web browser!)*

---

## 🛡️ Executive Summary

Current email security systems primarily filter or block suspicious content but provide limited intelligence for forensic tracing of email origins and sender infrastructure.

**SIH26106** is an enterprise-grade, dual-interface forensic intelligence platform that:
1. Performs deep structural parsing of RFC 822 email headers and body.
2. Applies a multi-vector AI detection engine (DistilBERT NLP + typosquatting + display-name spoofing + authentication checks).
3. Reconstructs transmission relay chains, detects anomalies, and geolocates each hop.
4. Generates a tamper-evident **SHA-256 blockchain audit chain** for legal chain-of-custody.
5. Exports **court-ready PDF forensic reports** with optional PII masking.
6. Scans directly from **Gmail via a Chrome Extension** — no copy-paste required.

---

## 📸 Key Features & Dashboard Overview

| Feature | Description |
|:---|:---|
| 🔴 **Dynamic Risk Badge** | Color-coded risk grading (Low / Medium / High) with 0–100 numeric fraud score |
| 🔐 **Header Authentication** | Instant SPF, DKIM, DMARC, and Return-Path cryptographic verification |
| 🧠 **DistilBERT NLP AI** | Transformer AI model analyzes email tone, intent, and phishing semantic patterns |
| 🗺️ **Origin Geolocation Map** | Interactive Leaflet.js map plotting sender IP, coordinates, ISP, and AS Organization |
| 🌐 **Relay Hop Timeline** | Per-hop geographic visualization with anomaly detection (negative timestamps, continent jumps) |
| 🏛️ **Gov Domain Engine** | Detects unauthorized `.gov.in` / `.nic.in` impersonation attempts (Indian agencies) |
| 🏷️ **Brand Verification** | Dynamic Wikipedia API verification of claimed corporate identity vs actual sender domain |
| 📎 **Attachment Analysis** | Flags double-extension cloaking (`.pdf.exe`), macro payloads, and executables |
| ⛓️ **Blockchain Audit Chain** | SHA-256 tamper-evident audit chain with 1-click chain integrity verification |
| 📄 **Forensic PDF Report** | Court-ready PDF with PII masking — download directly from the dashboard |
| 📂 **Case History** | Searchable historical database of all past email analyses |
| 🧩 **Chrome Extension** | 1-click Gmail scanner with inline inbox risk badges and auto-injected email threat banners |

---

## 🏗️ System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                     USER TOUCHPOINTS                             │
├─────────────────────────┬────────────────────────────────────────┤
│  Chrome Extension (MV3) │     React Web Dashboard                │
│  • Scans Gmail inbox    │     • Upload .eml file                 │
│  • Inline risk badges   │     • Paste raw RFC 822 text           │
│  • Auto email banner    │     • 1-click demo examples            │
│  • Opens Full Report ↗  │     • Case History search              │
└────────────┬────────────┴───────────────┬────────────────────────┘
             │  HTTP POST /analyze         │
             ▼                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                   FASTAPI BACKEND ENGINE                         │
├──────────────────────────────────────────────────────────────────┤
│  [1] RFC 822 MIME Parser     → Headers, Sender, Relay Hops       │
│  [2] Rule-Based Engine       → SPF/DKIM/DMARC, Typosquatting     │
│  [3] DistilBERT NLP AI       → Phishing Probability Score        │
│  [4] Gov Domain Check        → .gov.in / .nic.in Verification    │
│  [5] Brand Trust Engine      → Wikipedia API Verification        │
│  [6] IP Geolocation          → IP-API Batch Geolocate Hops       │
│  [7] Relay Anomaly Detector  → Time gaps, Continent jumps        │
│  [8] Attachment Inspector    → Double ext, Macros, Executables   │
│  [9] Blockchain Engine       → SHA-256 Chain of Custody          │
│ [10] ReportLab PDF Engine    → PII-Masked Court Dossier          │
│ [11] SQLite Case Store       → Searchable History Repository     │
└──────────────────────────────────────────────────────────────────┘
```

### 📁 Repository Structure

```
SIH26106-Email-Threat-Detection/
│
├── start.bat                    # ⭐ ONE-CLICK launcher (starts all servers + opens browser)
│
├── backend/                     # Python FastAPI core engine
│   ├── main.py                  # REST API: /analyze /verify /report /history
│   ├── parser.py                # RFC 822 MIME parser & relay hop extractor
│   ├── detection.py             # Rule-based fraud detection (6 vectors)
│   ├── nlp_scoring.py           # DistilBERT phishing classifier (AI)
│   ├── brand_verification.py    # Wikipedia-powered brand trust engine
│   ├── gov_detection.py         # Indian government domain impersonation engine
│   ├── relay_anomaly.py         # Per-hop time & geographic anomaly detector
│   ├── attachment_analysis.py   # Attachment danger analysis
│   ├── blockchain.py            # SHA-256 tamper-evident audit chain
│   ├── audit_logger.py          # Chain of custody event logger
│   ├── report_generator.py      # ReportLab PDF generator with PII masking
│   ├── forensics.py             # IP geolocation, WHOIS, Safe Browsing
│   ├── database.py              # SQLite persistence & case history
│   └── requirements.txt         # Python dependencies
│
├── frontend/                    # React + Vite + Tailwind CSS dashboard
│   ├── src/
│   │   ├── App.jsx              # Main app with routing & URL param auto-loader
│   │   ├── components/          # UI widgets (Map, RiskBadge, RelayPath, etc.)
│   │   └── pages/HistoryPage.jsx  # Case history search & browse
│   └── package.json
│
└── extension/                   # Chrome Extension (Manifest V3)
    ├── manifest.json            # Extension config & permissions
    ├── background.js            # Service worker (CORS-free API relay)
    ├── content.js               # Gmail DOM injector (inbox badges + email banner)
    ├── popup.html               # Extension popup UI
    └── popup.js                 # Popup logic
```

---

## 🚀 Quick Start

### ⭐ Option 1: One-Click Auto Launcher (Windows) — Recommended

```bash
# 1. Clone the repository
git clone https://github.com/kis0nn/SIH26106-Email-Threat-Detection.git
cd SIH26106-Email-Threat-Detection

# 2. Install backend dependencies (one time only)
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
cd ..

# 3. Install frontend dependencies (one time only)
cd frontend
npm install
cd ..

# 4. Double-click start.bat OR run it:
start.bat
```

> `start.bat` automatically starts the backend on port 8000, the frontend on port 5173, and opens your browser. You never need to start servers manually again.

---

### Option 2: Live GitHub Pages (No Installation)

Access the hosted demo instantly — no backend required:
**[https://kis0nn.github.io/SIH26106-Email-Threat-Detection/](https://kis0nn.github.io/SIH26106-Email-Threat-Detection/)**

> **Note:** The live GitHub Pages version uses a client-side offline engine. For the **full AI/NLP pipeline, blockchain verification, PDF reports, and case history**, run the app locally using `start.bat`.

---

### Option 3: Manual Start

**Backend:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate       # Windows
# source venv/bin/activate  # Linux / macOS
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

**Frontend (in a separate terminal):**
```bash
cd frontend
npm install
npm run dev
```

Then open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 🧩 Chrome Extension — Installation Guide

The Chrome Extension adds a **1-click threat scanner directly inside Gmail**. It automatically injects color-coded risk badges into your inbox list and a full threat banner when you open an email.

### Step 1: Download the Extension from GitHub

**Option A — Clone the full repository (recommended):**
```bash
git clone https://github.com/kis0nn/SIH26106-Email-Threat-Detection.git
```
The extension files are inside the `extension/` folder.

**Option B — Download without Git:**
1. Go to **[https://github.com/kis0nn/SIH26106-Email-Threat-Detection](https://github.com/kis0nn/SIH26106-Email-Threat-Detection)**
2. Click the green **`<> Code`** button
3. Click **"Download ZIP"**
4. Extract the ZIP anywhere on your computer (e.g., `C:\Users\YourName\Downloads\SIH26106\`)
5. The extension folder is at: `SIH26106-Email-Threat-Detection-main\extension\`

### Step 2: Load the Extension into Chrome

1. Open **Google Chrome**
2. In the address bar, type: `chrome://extensions` and press **Enter**
3. In the top-right corner, toggle **"Developer mode"** → **ON** (turns blue)
4. Click **"Load unpacked"** (top-left corner)
5. In the file picker, navigate to and select the **`extension`** folder from step 1
6. Click **"Select Folder"**

✅ **Done!** The **"SIH26106 Email Threat Forensics"** extension will appear in your list.

### Step 3: Pin the Extension to Toolbar

1. Click the 🧩 **puzzle-piece icon** in the top-right of Chrome
2. Find **SIH26106 Email Threat Forensics**
3. Click the 📌 **pin icon** — the shield icon will now always be visible in your toolbar

### Step 4: Using the Extension

> ⚠️ **Prerequisite:** The local backend must be running (`start.bat` or `uvicorn main:app --port 8000`).

**A — Automatic Email Banner (no clicks needed):**
1. Open [mail.google.com](https://mail.google.com) in Chrome
2. Click any email to open it
3. The extension **automatically** injects a colored banner above the email body:
   - 🔴 `HIGH RISK — Score: 87/100 | ⚠️ GOVERNMENT IMPERSONATION | Full Report ↗`
   - 🟡 `MEDIUM RISK — Score: 42/100 | Full Report ↗`
   - 🟢 `LOW RISK — Score: 8/100 | Full Report ↗`
4. Click **"Full Report ↗"** → the web dashboard opens with the **complete forensic analysis pre-loaded automatically** (Geo Map, Blockchain receipt, Relay hops, PDF download)

**B — Scan Inbox List (inline badges):**
1. Go to your Gmail **inbox list** (the screen showing all emails)
2. Click the **SIH26106 Threat Scanner** shield icon in the Chrome toolbar
3. Click the green **"Scan Inbox List (Inline Badges)"** button
4. Watch as color-coded badges appear next to every email's timestamp:
   - 🔴 `85` — High Risk (red)
   - 🟡 `42` — Medium Risk (amber)
   - 🟢 `8` — Safe (green)

**C — Popup Scan:**
1. Open an email in Gmail
2. Click the shield icon → click **"Scan Open Email"**
3. See Risk Level + Fraud Score + Gov Warning in the popup

---

## 🔍 Detection Engine — Scoring Model

$$\text{Fraud Score} = \min\left(100,\ \sum \text{Rule Penalties} + \text{NLP Score} + \text{Relay Penalty} + \text{Attachment Penalty}\right)$$

| Check | Score Contribution | Method |
|:---|:---:|:---|
| SPF Authentication Fail | `+20` | RFC 7208 DNS record verification |
| DKIM Signature Fail | `+15` | Cryptographic body/header signature check |
| DMARC Policy Fail | `+20` | Domain alignment enforcement |
| Display Name Spoofing | `+25` | Name claims brand but email differs |
| Typosquat / Lookalike Domain | `+30` | Levenshtein edit distance via RapidFuzz |
| Urgency / Coercion Keywords | `+15` | Heuristic NLP keyword scanning |
| DistilBERT AI (>85% confidence) | `+25` | Transformer semantic phishing classification |
| DistilBERT AI (50–85% confidence) | `+15` | Transformer semantic phishing classification |
| Relay Hop Anomaly | `+15` | Negative timestamp / continent-jump detection |
| Dangerous Attachment | `+40` | Double-extension or executable/macro file |

**Risk Classification:**
- 🟢 `0–29` : **Low Risk** — Looks Safe
- 🟡 `30–59` : **Medium Risk** — Caution
- 🔴 `60–100` : **High Risk** — Malicious Threat Detected

---

## ⛓️ Blockchain Audit Chain

Every email analysis is cryptographically linked into a tamper-evident SHA-256 chain:

```
Block #1: SHA256(Analysis_Data_1 + "0")          → Hash_A
Block #2: SHA256(Analysis_Data_2 + Hash_A)       → Hash_B
Block #3: SHA256(Analysis_Data_3 + Hash_B)       → Hash_C
```

If any past record is altered in the database, the entire chain collapses from that point forward. Click **"Verify Integrity"** in the dashboard to cryptographically confirm chain-of-custody.

---

## 🧪 Benchmark Results

| Sample | Fraud Score | Risk | Key Findings |
|:---|:---:|:---:|:---|
| Income Tax Phishing | **87** | 🔴 High | Gov impersonation, suspicious domain, urgency keywords |
| SBI KYC Scam | **92** | 🔴 High | Brand spoof, typosquat, DKIM fail, malicious link |
| CEO Wire Fraud | **75** | 🔴 High | DistilBERT coercion detection, display name spoof |
| PayPal Typosquat | **80** | 🔴 High | Levenshtein match `paypa1.com`, SPF fail |
| Legitimate Work Email | **0** | 🟢 Safe | All checks passed, no anomalies |
| Marketing Promo Email | **38** | 🟡 Medium | Minor urgency keywords, no auth failures |

---

## 📄 Compliance & License

Developed for the **Smart India Hackathon (SIH 2026)**.
Licensed under the [MIT License](LICENSE).
