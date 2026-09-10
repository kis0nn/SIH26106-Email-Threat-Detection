# SIH26106: AI-Powered Email Threat Detection, Geolocation & Forensic Intelligence Platform
## Complete Technical Dossier, Architectural Blueprint & Judge Q&A Guide
**Smart India Hackathon (SIH 2026)** | **Problem ID:** SIH26106 | **Category:** Cyber Security / AI  
**Target Organization:** AICTE Cyber Security Cell  
**Team Repository:** `https://github.com/kis0nn/SIH26106-Email-Threat-Detection`  
**Live Web Deployment:** `https://kis0nn.github.io/SIH26106-Email-Threat-Detection/`  

---

## Executive Summary

Email remains the #1 initial infection vector for cyberattacks worldwide, responsible for over 90% of data breaches, Business Email Compromise (BEC) fraud, and advanced persistent threat (APT) spear-phishing. Traditional email security gateways rely on static signature matching, outdated blacklists, and simplistic spam heuristics that are trivially bypassed by domain spoofing, display-name deception, lookalike domains (typosquatting), and compromised relay servers. Furthermore, existing security tools act as proprietary "black boxes"—they block or quarantine an email without providing actionable, tamper-evident forensic intelligence that incident responders, law enforcement, or cyber defense cells require.

**SIH26106** addresses this critical gap by delivering an end-to-end, enterprise-grade **Forensic Intelligence Platform & Convenience Input Layer**. It combines multi-layer deterministic header forensics, fine-tuned transformer NLP AI, automated brand identity verification, geographic network hop tracing, attachment danger analysis, and a **cryptographic blockchain-inspired tamper-evident audit chain**. The result is a dual-interface ecosystem: a 1-click **Chrome Extension (Manifest V3)** for everyday users inside webmail, and a comprehensive **Web Forensic Investigation Dashboard** for SOC analysts and law enforcement investigators.

---

<div style="page-break-after: always;"></div>

## Table of Contents

1. [Problem Definition & Industry Context](#1-problem-definition--industry-context)
2. [Dual-Layer Product Architecture](#2-dual-layer-product-architecture)
3. [Complete Technology Stack & Design Rationale](#3-complete-technology-stack--design-rationale)
   - 3.1 Frontend Stack (UI/UX)
   - 3.2 Backend Stack (Core Engine)
   - 3.3 Artificial Intelligence & NLP Engine
   - 3.4 Forensic Services & OSINT APIs
   - 3.5 Cryptography & Storage Engine
4. [Deep Dive: Core Technical Modules & Algorithms](#4-deep-dive-core-technical-modules--algorithms)
   - 4.1 RFC 822 / 5322 Parsing Engine
   - 4.2 Multi-Layered Threat Scoring Pipeline
   - 4.3 Transformer NLP Phishing Classification
   - 4.4 Indian Government Domain Impersonation Engine
   - 4.5 Wikipedia REST API Dynamic Brand Trust Engine
   - 4.6 Per-Hop Network Relay Anomaly Detection
   - 4.7 Attachment Danger Analysis
   - 4.8 The Blockchain-Inspired Audit Chain (Deep Dive)
   - 4.9 Court-Ready PDF Forensic Report Generator with PII Masking
   - 4.10 Searchable Investigation History & Case Management
   - 4.11 Chrome Extension (Manifest V3)
5. [System Workflow & Data Flow Diagrams](#5-system-workflow--data-flow-diagrams)
6. [Judges Q&A Preparation: 25+ Hard Technical & Conceptual Questions](#6-judges-qa-preparation-25-hard-technical--conceptual-questions)
   - Category A: Architecture, Stack & Design Decisions
   - Category B: AI, Machine Learning & Detection Edge Cases
   - Category C: Blockchain, Cryptography & Chain of Custody
   - Category D: Network Forensics, Spoofing & Geolocation
   - Category E: Privacy, Compliance & Real-World Feasibility
   - Category F: Live Demonstration & Code Walkthrough Traps

---

<div style="page-break-after: always;"></div>

## 1. Problem Definition & Industry Context

### 1.1 The Threat Landscape
Modern email attacks no longer consist of clumsy "Nigerian Prince" scams with obvious spelling errors. Modern cyber adversaries utilize:
1. **Business Email Compromise (BEC) & CEO Fraud:** Impersonating executives or vendors using visually indistinguishable lookalike domains (e.g., `micros0ft.com`, `sbi-kyc-update.tk`).
2. **Indian Government Identity Spoofing:** Pretending to be income tax authorities, police cyber cells, or public sector banks (SBI, PNB) without possessing official `.gov.in` or `.nic.in` credentials.
3. **Forged Header Routing & Relay Bouncing:** Manipulating RFC 822 `Received:` headers and routing messages through compromised intermediaries or bulletproof VPS hosts across multiple jurisdictions to hinder attribution.
4. **Dangerous Attachment Cloaking:** Utilizing double extensions (e.g., `invoice_march2026.pdf.exe`) or macro-enabled documents (`.docm`, `.xlsm`) to deliver initial-access payloads.

### 1.2 Who Are the Stakeholders?
* **SOC (Security Operations Center) Analysts:** Need instant, deep header decoding, authentication verification (SPF, DKIM, DMARC), geographic visualization, and relay latency profiling.
* **Law Enforcement & Cyber Crime Cells:** Need court-ready chain of custody, tamper-evident cryptographic hashes, and exportable forensic dossiers with privacy-compliant PII masking.
* **Enterprise Employees & Everyday Webmail Users:** Need zero-friction, 1-click scanning directly in Google Chrome / Gmail without copying/pasting sensitive messages into third-party websites.

### 1.3 Why Existing Solutions Fall Short
* **Black-Box Architecture:** Commercial filters (e.g., Proofpoint, Mimecast) classify emails as binary "Spam / Not Spam" without transparently explaining *why* to analysts.
* **Lack of Tamper Evident Integrity:** Standard database logs can be edited or deleted by rogue system administrators or internal adversaries. There is no proof that evidence wasn't modified after extraction.
* **Static, Fragile Brand Rules:** Most systems rely on static hardcoded lists of brand names that quickly become outdated.
* **No Specialized Indian Gov Identity Engine:** Global security vendors lack specialized context for Indian national cyber infrastructure (e.g., strict verification against `.gov.in` and `nic.in`).

---

<div style="page-break-after: always;"></div>

## 2. Dual-Layer Product Architecture

The platform is designed with a high-cohesion, decoupled two-tier architecture:

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        USER & ANALYST TOUCHPOINTS                        │
├──────────────────────────────────────┬───────────────────────────────────┤
│    Convenience Input Layer           │     Forensic Intelligence Hub     │
│    (Chrome Extension - MV3)          │     (React + Vite Web App)        │
│    • Injects into Gmail DOM          │     • Geolocation Map (Leaflet)   │
│    • 1-Click "Scan Email"            │     • Visual Relay Timeline       │
│    • Instant Risk & Gov Spoof Badge  │     • Brand Trust Panel           │
│    • "Open Full Report" Button       │     • Blockchain Audit Verifier   │
│                                      │     • PII-Masked PDF Downloader   │
│                                      │     • Historical Case Search      │
└──────────────────┬───────────────────┴─────────────────┬─────────────────┘
                   │                                     │
                   │ HTTP POST (Multipart / JSON)        │ HTTP GET/POST
                   ▼                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                      FASTAPI HIGH-PERFORMANCE BACKEND                    │
├──────────────────────────────────────────────────────────────────────────┤
│  [1] Parser Engine (RFC 822 / 5322 MIME & Received unwinding)            │
│  [2] Rule-Based Detection Engine (SPF/DKIM, Typosquatting, Urgent Flags) │
│  [3] DistilBERT NLP Phishing Classifier (Transformer AI Logits)         │
│  [4] Indian Government Verification Engine (.gov.in / nic.in)            │
│  [5] OSINT Brand Trust Engine (Wikipedia REST API & Edit Distance)       │
│  [6] Batch IP Geolocation (IP-API) & Relay Hop Anomaly Detector          │
│  [7] Attachment Danger Inspector (Double Ext / Macro Analysis)           │
│  [8] Blockchain Cryptographic Engine (SHA-256 Tamper-Evident Chain)     │
│  [9] ReportLab PDF Engine (PII Masking & Law Enforcement Dossier)       │
│ [10] SQLite Persistent Store & Searchable Case History Repository        │
└──────────────────────────────────────────────────────────────────────────┘
```

---

<div style="page-break-after: always;"></div>

## 3. Complete Technology Stack & Design Rationale

Here is every tool, library, and framework used in the project, including their full names, purposes, and explicit comparisons with alternatives.

### 3.1 Frontend Stack (User Interface)

| Technology | Full Name | Purpose in Project | Why Chosen Over Alternatives |
| :--- | :--- | :--- | :--- |
| **React.js** | React JavaScript Library | Powers the reactive Single-Page Application (SPA) dashboard, managing complex state across 10+ forensic widgets. | **vs Vanilla JS:** Vanilla JS creates spaghetti DOM code when handling dynamic maps, modals, and filters. <br>**vs Angular:** Angular has excessive enterprise boilerplate. React is modular, component-based, and renders faster via Virtual DOM. |
| **Vite** | French word for "Fast" (Build Tool & Bundler) | Provides instantaneous Hot Module Replacement (HMR) and bundles production code via Rolldown. | **vs Create React App (Webpack):** CRA/Webpack is deprecated and slow (bundles entire app before serving). Vite uses native browser ES Modules, compiling in milliseconds. |
| **Tailwind CSS** | Tailwind Cascading Style Sheets | Utility-first styling framework used for responsive layout, dark/light risk color badges (rose, amber, emerald). | **vs Bootstrap:** Bootstrap enforces generic component themes and has heavy stylesheet overhead. Tailwind purges unused CSS at build time, resulting in a tiny ~49 KB CSS bundle. <br>**vs Custom CSS:** Custom CSS causes naming collisions and bloated files. |
| **Lucide React** | Lucide Icon Collection | Provides lightweight, accessible SVG cybersecurity icons (`Shield`, `AlertTriangle`, `Server`, `Paperclip`, `Link`). | **vs FontAwesome:** FontAwesome requires heavy font asset downloads. Lucide compiles purely as tree-shakable SVG JSX components. |
| **Leaflet.js** | Leaflet Open-Source Mapping Library | Renders the interactive map showing the originating IP address coordinates, country, and ISP. | **vs Google Maps API:** Google Maps requires paid API keys, credit card registration, and leaks user queries. Leaflet is open-source, free, and uses privacy-preserving OpenStreetMap tiles. |

### 3.2 Backend Stack (Core Engine)

| Technology | Full Name | Purpose in Project | Why Chosen Over Alternatives |
| :--- | :--- | :--- | :--- |
| **Python 3.14** | Python Programming Language | Serves as the primary language for email parsing, forensic networking, machine learning inference, and database access. | **vs Node.js:** Python is the undisputed industry standard for cybersecurity, digital forensics, and AI/NLP libraries (`transformers`, `torch`, `email`). |
| **FastAPI** | Fast Application Programming Interface | High-performance asynchronous REST API framework handling `/analyze`, `/verify`, `/report`, and `/history`. | **vs Flask:** Flask is synchronous (blocking), lacks built-in data validation, and handles high concurrency poorly. <br>**vs Django:** Django is an over-engineered monolithic framework with unnecessary ORM overhead. FastAPI is native ASGI (asynchronous), 300% faster, and generates interactive Swagger docs (`/docs`) automatically. |
| **Pydantic** | Pydantic Data Validation Library | Enforces strict type checking and JSON schema serialization for all request/response models. | **vs Manual Dict Checks:** Prevents runtime TypeError exceptions and validates API inputs before execution. |
| **Uvicorn** | ASGI Web Server (Lightning-fast ASGI server) | Runs the asynchronous FastAPI application using `uvloop`. | **vs Gunicorn / WSGI:** WSGI cannot run asynchronous Python (`async/await`). Uvicorn is built on `uvloop` (written in C) and matches Node/Go concurrency benchmarks. |
| **SQLite3** | Structured Query Language Lite | Self-contained, zero-configuration relational database storing analyses, blockchain receipts, and audit logs. | **vs PostgreSQL / MySQL:** For a standalone security appliance or rapid-deployment triage station, requiring a dedicated DB server creates deployment friction. SQLite stores everything in a single portable file (`email_threat.db`), requires zero maintenance, and handles thousands of reads/writes effortlessly. |

### 3.3 Artificial Intelligence & NLP Engine

| Technology | Full Name | Purpose in Project | Why Chosen Over Alternatives |
| :--- | :--- | :--- | :--- |
| **DistilBERT** | Distilled Bidirectional Encoder Representations from Transformers | Fine-tuned transformer model (`cybersectony/phishing-email-detection-distilbert_v2.4.1`) that computes the contextual semantic phishing probability of subject and body text. | **vs OpenAI / Claude API (Cloud LLMs):** Sending proprietary, confidential corporate or government emails to third-party US cloud APIs violates GDPR, the Indian DPDP Act 2023, and corporate confidentiality. DistilBERT runs **100% on-premise/locally** with zero API costs. <br>**vs Standard BERT:** Standard BERT is twice as large and slow. DistilBERT retains **97% of BERT's linguistic capability** while being **40% smaller and 60% faster**. <br>**vs Naive Bayes / TF-IDF:** Bag-of-words models ignore context (e.g., negations or semantic subtlety). Transformers understand full sentence syntax. |
| **Hugging Face Transformers** | Hugging Face Model Library | Provides the model loading, tokenizer (`AutoTokenizer`), and pipeline execution framework for DistilBERT. | **vs Writing PyTorch from scratch:** Provides standardized tokenization, attention masks, and optimized inference routines. |
| **Graceful AI Fallback** | Software Architecture Pattern | Code design pattern in `nlp_scoring.py` that catches missing dependencies/hardware and smoothly defaults to rule-based detection without crashing. | **vs Crashing the server:** Guarantees **100% service availability** even in resource-constrained environments (e.g., lightweight cloud instances or offline deployments). |

### 3.4 Forensic Services & OSINT APIs

| Technology | Full Name | Purpose in Project | Why Chosen Over Alternatives |
| :--- | :--- | :--- | :--- |
| **IP-API** | IP Geolocation Application Programming Interface | Resolves IPv4 addresses into latitude, longitude, country, city, ISP, and Autonomous System Organization (AS-Org). | **vs MaxMind GeoIP:** MaxMind requires local database downloads, licensing, and updates. IP-API provides a high-speed `/batch` endpoint that can resolve up to 15 relay IPs in a single HTTP POST request, preventing rate-limiting. |
| **Wikipedia REST API** | Wikimedia REST API | Dynamically queries Wikipedia search and page summary endpoints to verify whether a claimed brand is an authentic entity and discovers their official domain. | **vs Hardcoded Brand Lists:** Static lists become obsolete immediately when new brands emerge. Wikipedia represents a continuously updated global knowledge graph. |
| **Python `email` + `policy.default`** | Standard Library RFC 822 / 5322 MIME Parser | Decodes raw email headers, multi-part MIME boundaries, character encodings, and attachment metadata. | **vs Regex-only parsing:** Email RFC standards are notoriously complex (folded headers, quoted strings, base64/quoted-printable payloads). Regex alone fails on edge cases; Python's official policy parser conforms strictly to IETF standards. |
| **RapidFuzz** | Rapid Fuzzy String Matching Library | Calculates Levenshtein edit distance and partial token ratios to catch lookalike typosquatting domains (e.g., `paypa1.com` vs `paypal.com`). | **vs FuzzyWuzzy:** RapidFuzz is written in C++ with SIMD acceleration, making it over 10x faster than pure-Python fuzzy matching tools. |
| **BeautifulSoup4** | Beautiful Soup HTML Parser | Strips HTML formatting, extracts anchor tags (`<a href>`), and discovers hidden or mismatched link destinations. | **vs Regex URL Extraction:** Attackers use obfuscated HTML attributes, HTML entities, and nested tags. BeautifulSoup accurately traverses the DOM tree. |

### 3.5 Cryptography & Storage Engine

| Technology | Full Name | Purpose in Project | Why Chosen Over Alternatives |
| :--- | :--- | :--- | :--- |
| **SHA-256 (via `hashlib`)** | Secure Hash Algorithm 256-bit | Generates deterministic cryptographic message digests for raw analyses and blocks in the audit chain. | **vs MD5 / SHA-1:** MD5 and SHA-1 have known collision vulnerabilities and are strictly disallowed in digital forensics and court testimony. SHA-256 is mathematically secure and FIPS-compliant. |
| **ReportLab** | ReportLab PDF Toolkit | Programmatically draws court-ready forensic PDF dossiers containing metadata, headers, risk scoring, and PII masking. | **vs Browser `window.print()` / HTML-to-PDF:** Browser printing relies on user screen resolutions and CSS print styles. ReportLab provides pixel-perfect programmatic layout control, embedded tables, and digital watermarking. |

---

<div style="page-break-after: always;"></div>

## 4. Deep Dive: Core Technical Modules & Algorithms

### 4.1 RFC 822 / 5322 Parsing Engine (`parser.py`)
When an `.eml` file or raw text string is submitted:
1. It is parsed into an `email.message.EmailMessage` object using modern `policy.default`.
2. **Sender Dissection:** `From:` headers are parsed into `display_name`, `sender_email`, and `sender_domain`.
3. **Authentication Recovery:** Scans `Authentication-Results:` and `Received-SPF:` headers for cryptographic verification results:
   * **SPF (Sender Policy Framework):** Verifies if sending IP was authorized by sender domain's DNS.
   * **DKIM (DomainKeys Identified Mail):** Verifies digital cryptographic signature on the email body.
   * **DMARC (Domain-based Message Authentication):** Enforces alignment between From domain, SPF, and DKIM.
4. **Received Header Unwinding:** Extracts every `Received:` header in reverse chronological order. It extracts the intermediary server names, hop IP addresses, and timestamps.
5. **Originating IP Extraction:** The engine iterates through the relay hops from bottom to top, filtering out private non-routable IP ranges (RFC 1918: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.0/8`) to isolate the true public originating IP.

### 4.2 Multi-Layered Threat Scoring Pipeline (`detection.py` + `main.py`)
The system computes an objective **Fraud Score (0 to 100)** through additive heuristic contributions:

$$\text{Fraud Score} = \min\left(100, \sum \text{Rule Penalty} + \text{NLP Contribution} + \text{Relay Penalty} + \text{Attachment Penalty}\right)$$

* **Rule Contributions:**
  * SPF Fail: **+20 points**
  * DKIM Fail: **+15 points**
  * DMARC Fail: **+20 points**
  * Display Name Spoofing (Display name contains an email differing from `From:`): **+25 points**
  * Urgency / Psychological Coercion Keywords ("act now", "suspended immediately"): **+15 points**
  * Domain Age < 30 days (WHOIS check): **+25 points**
  * Typosquatting / Lookalike Brand Domain: **+30 points**
  * Safe Browsing Match / Blacklisted URL: **+40 points**
* **Classification Thresholds:**
  * **Low Risk (Safe):** $0 \le \text{Score} < 30$ (Green Badge)
  * **Medium Risk (Caution):** $30 \le \text{Score} < 60$ (Amber Badge)
  * **High Risk (Threat):** $60 \le \text{Score} \le 100$ (Rose Red Badge)

### 4.3 Transformer NLP Phishing Classification (`nlp_scoring.py`)
* **Architecture:** DistilBERT pre-trained on English language corpora and fine-tuned on labeled email phishing datasets.
* **Tokenization:** Inputs are tokenized into sub-word tokens using WordPiece with a `max_length` of 512 tokens.
* **Inference:**
  $$\text{Logits} = \text{DistilBERT}(\text{Tokens})$$
  $$P(\text{Phishing}) = \text{Softmax}(\text{Logits})_1 = \frac{e^{z_1}}{e^{z_0} + e^{z_1}}$$
* **Score Mapping:**
  * If $P(\text{Phishing}) \ge 0.85$: Severity is **Critical**, adds **+25 points** to Fraud Score.
  * If $0.50 \le P(\text{Phishing}) < 0.85$: Severity is **Medium**, adds **+15 points**.
  * If $P(\text{Phishing}) < 0.50$: Phishing probability is low; adds 0 points.
* **Fault-Tolerant Design:** The module runs under a global try-except wrapper. If PyTorch or Transformers are absent, it returns `None`, logs a status message, and the core pipeline continues seamlessly.

### 4.4 Indian Government Domain Impersonation Engine (`gov_detection.py`)
* **Target Agencies:** Recognizes Indian government and public sector institutions: State Bank of India (SBI), Income Tax Department, Reserve Bank of India (RBI), Unique Identification Authority of India (UIDAI / Aadhaar), DigiLocker, Ministry of Home Affairs (MHA), etc.
* **Verification Algorithm:**
  1. Compares sender domain against approved top-level domains: `\.gov\.in$` and `\.nic\.in$`.
  2. If matched: sets `is_gov = True`.
  3. Scans sender display name, subject, and email body for government entity keywords (e.g., "State Bank of India", "Income Tax", "Police Cyber Cell").
  4. If keywords are found: sets `claims_gov = True`.
* **Alert Trigger:**
  $$\text{Claims Gov} \land \neg \text{Is Gov} \implies \text{\textbf{CRITICAL GOVERNMENT IMPERSONATION WARNING}}$$
  In the UI, this triggers a flashing red banner alert indicating an illegal impersonation attempt.

### 4.5 Wikipedia REST API Dynamic Brand Trust Engine (`brand_verification.py`)
Instead of a static dictionary, the system performs dynamic OSINT:
1. **Entity Extraction:** Extracts claimed corporate identity from `display_name` or domain tokens.
2. **Wikipedia Query:** Queries `https://en.wikipedia.org/api/rest_v1/page/summary/{brand}`. If Wikipedia returns an authentic organizational summary, `brand_verified = True`.
3. **Official Domain Discovery:** Extracts the authoritative website URL from the Wikipedia data and compares it to the actual email sender domain.
4. **Brand Trust Score (0 to 100):**
   * Starts at base: **50**
   * Wikipedia Verified Entity: **+20**
   * Sender Domain matches Official Domain: **+30**
   * Lookalike / Typosquat Detected: **-40**
   * New Domain (<30 days): **-20**
   * Email Authentication Failure: **-10 per failure**
   * Safe Browsing Blacklist: **-30**

### 4.6 Per-Hop Network Relay Anomaly Detection (`relay_anomaly.py`)
Using per-hop IP geolocation (via IP-API batch requests), the relay engine flags 4 critical network anomalies:
1. **Time-Gap / Forgery Anomaly:** Checks $\Delta t = t_{\text{hop}_n} - t_{\text{hop}_{n-1}}$.
   * If $\Delta t < -60\text{ seconds}$: Flags **Negative Time Gap** (indicates forged RFC 822 timestamps).
   * If $\Delta t > 1800\text{ seconds}$ (30 min): Flags **Unusual Transit Latency** (suspicious queuing).
2. **Geographic Impossibility:**
   * Maps each hop's country to its continent (NA, SA, EU, AS, AF, OC).
   * If $\text{Continent}_{n} \ne \text{Continent}_{n-1}$ and $\Delta t < 60\text{ seconds}$, flags **Geographic Impossibility** (data packets cannot traverse continents in seconds through mail relays).
3. **Relay Bouncing:** Flags any relay chain with $> 8\text{ hops}$ (typical of botnet obfuscation).
4. **Return-Path vs From Mismatch:** Flags when the envelope sender domain differs from the header sender domain.

### 4.7 Attachment Danger Analysis (`attachment_analysis.py`)
Inspects MIME parts marked as attachments:
* **Double Extension Check:** Identifies patterns like `document.pdf.exe` or `invoice.xlsx.scr`.
* **Executable Extensions:** Flags `.exe`, `.scr`, `.bat`, `.cmd`, `.msi`, `.ps1`, `.vbs`, etc.
* **Macro-Enabled Documents:** Flags `.docm`, `.xlsm`, `.pptm` which can trigger malicious VBA code upon opening.
* **Safe Handling Guarantee:** Only file metadata (name, MIME type, byte size) is analyzed and recorded. Raw binary payloads are never executed or stored.

---

<div style="page-break-after: always;"></div>

### 4.8 The Blockchain-Inspired Audit Chain (Deep Dive)

#### Why Was This Built? (The Problem)
In digital forensics and incident response, evidence presented in legal proceedings or insurance claims must satisfy the **Chain of Custody** requirement. If an organization stores threat logs in an ordinary SQL database, an adversary with database access (or a rogue insider) could modify an analysis record (e.g., lowering a fraud score from 95 to 10) to cover up an intrusion. Standard databases lack native mathematical immutability.

#### How It Works (The Solution)
Our platform implements a tamper-evident cryptographic hash chain running on **SHA-256**:

```
[ GENESIS BLOCK #0 ]
  Hash: "0"
       │
       ▼
[ BLOCK #1 ]
  Analysis Hash: SHA256( Canonical_JSON( Analysis #1 ) )
  Previous Hash: "0"
  Block Hash:    SHA256( "0" + Analysis_Hash_1 + Timestamp_1 )
       │
       ▼
[ BLOCK #2 ]
  Analysis Hash: SHA256( Canonical_JSON( Analysis #2 ) )
  Previous Hash: Block Hash #1
  Block Hash:    SHA256( Block_Hash_1 + Analysis_Hash_2 + Timestamp_2 )
       │
       ▼
[ BLOCK #n ]
  Block Hash:    SHA256( Block_Hash_(n-1) + Analysis_Hash_n + Timestamp_n )
```

#### The Verification Algorithm (`GET /verify/{analysis_id}`)
When an investigator clicks **"Verify Integrity"** on the dashboard:
1. The backend retrieves all blocks from Block #0 to the targeted block index.
2. It fetches the original stored analysis JSON and re-computes its canonical SHA-256 hash.
3. It iterates forward from genesis, recalculating every `block_hash` using the previous block's hash.
4. If a single byte in any past analysis was modified, the recalculation produces a mismatch:
   $$\text{Calculated Hash} \ne \text{Stored Hash} \implies \text{\textbf{CHAIN INTEGRITY COMPROMISED}}$$
5. If all hashes match: returns `verified: True`, confirming the evidence is authentic and tamper-free.

---

### 4.9 Court-Ready PDF Forensic Report Generator with PII Masking (`report_generator.py`)
Built using ReportLab, this module outputs an official digital forensic dossier:
* **Header & Metadata:** Case ID, Timestamp, Cryptographic Block Index.
* **Visual Score Summary:** Color-coded threat badge, Risk Score gauge.
* **Findings Matrix:** Detailed table of every heuristic rule, severity, and score penalty.
* **Network Attribution:** Originating IP, AS-Org, Country, ISP, and Relay Path.
* **Authentication Results:** Explicit breakdown of SPF, DKIM, and DMARC status.
* **PII Masking Toggle (`mask_pii=True`):**
  * Email Masking: `john.doe@company.com` $\to$ `j***@c***.com`
  * IP Masking: `198.51.100.45` $\to$ `xxx.xxx.xxx.45`
  * Display Names: `John Doe` $\to$ `[REDACTED]`
  * Allows sharing reports with external teams without violating privacy regulations.

### 4.10 Searchable Investigation History & Case Management (`HistoryPage.jsx` + `database.py`)
* Provides a SOC case view querying `GET /history`.
* Supports real-time debounced text searching across sender email, sender domain, and email subject.
* Risk-level filter buttons (All, High, Medium, Low).
* Clicking **"View Analysis"** loads historical records into the main dashboard without needing to re-upload the email.

### 4.11 Chrome Extension (Manifest V3) (`extension/`)
* **Role:** Convenience input layer for Google Chrome.
* **Permissions:** Restricted strictly to `activeTab` and `scripting` on `mail.google.com`.
* **Mechanism:** When the user clicks the toolbar icon on an open Gmail email, a content script extracts visible header and body fields, formats them into standard RFC text, and submits them to the backend API (`POST /analyze`).
* **Instant Feedback:** Displays the Risk Level, Fraud Score, and any Government Impersonation warnings inside the popup, with a direct link to open the full analysis in the Web Dashboard.

---

<div style="page-break-after: always;"></div>

## 5. System Workflow & Data Flow Diagrams

### 5.1 End-to-End Analysis Pipeline

```
[ Inbound Email (.eml / Gmail) ]
               │
               ▼
   [ RFC 822 MIME Parser ] ───► Extract Sender, Headers, Body, Links, Attachments
               │
   ┌───────────┴────────────────────────────────────────────────┐
   │                                                            │
   ▼                                                            ▼
[ Heuristic Engine ]                                 [ DistilBERT Transformer ]
• SPF/DKIM/DMARC checks                              • Tokenize (WordPiece)
• Display name spoofing                              • Phishing probability logit
• RapidFuzz Typosquatting                            • +15 to +25 score penalty
• Keyword & urgency checks                                      │
   │                                                            │
   └───────────────────────────┬────────────────────────────────┘
                               │
                               ▼
   ┌────────────────────────────────────────────────────────────┐
   │                  ENRICHMENT & INTELLIGENCE                 │
   ├────────────────────────────────────────────────────────────┤
   │ • Indian Gov Check   ──► .gov.in / nic.in validation       │
   │ • Brand Verification ──► Wikipedia API query               │
   │ • IP-API Geolocation ──► Origin coords + Batch Relay Hops  │
   │ • Relay Anomalies    ──► Time gaps, continent hops, bounce │
   │ • Attachments        ──► Double ext, macros, executables   │
   └───────────────────────────┬────────────────────────────────┘
                               │
                               ▼
                   [ Compute Unified Fraud Score ]
                     (0 - 100 Risk Classification)
                               │
                               ▼
            [ Persist Analysis in SQLite DB ]
                               │
                               ▼
            [ Append to SHA-256 Blockchain Chain ]
            (Generates Block Index & Tamper Receipt)
                               │
                               ▼
       [ Return JSON Response to React Dashboard / Extension ]
```

---

<div style="page-break-after: always;"></div>

## 6. Judges Q&A Preparation: 25+ Hard Technical & Conceptual Questions

Review these questions with your team. Every member should be familiar with the answers in their area.

---

### Category A: Architecture, Stack & Design Decisions

#### Q1: Why did you build a Web Dashboard AND a Chrome Extension instead of choosing just one?
> **Answer:** They serve two different personas. Everyday employees need zero-friction, 1-click protection inside their email client (Gmail) without uploading files. Security analysts and law enforcement investigators need a comprehensive forensic workspace with maps, relay timelines, blockchain verification, and PDF generation. The Chrome Extension acts as the convenience input layer, while the Web Dashboard serves as the deep investigation hub.

#### Q2: Why did you choose FastAPI over Flask or Django?
> **Answer:** FastAPI is built natively on ASGI using `uvloop`, making it asynchronous and up to 300% faster than Flask. In an email gateway processing hundreds of concurrent MIME payloads, synchronous Flask threads would block. FastAPI also integrates Pydantic for automatic request validation and automatically generates interactive Swagger API documentation at `/docs`. Django was avoided because its monolithic ORM and admin boilerplate add unnecessary overhead for a microservice API.

#### Q3: Why SQLite instead of PostgreSQL or MongoDB?
> **Answer:** For a forensic security appliance or rapid-deployment triage tool, zero-configuration deployment is a key advantage. SQLite stores everything in a single, portable file (`email_threat.db`), requiring no external database server, credentials, or network configuration. SQLite easily handles up to 100,000 queries per day with microsecond response times. Because our backend uses standard SQL, transitioning to PostgreSQL in a scaled enterprise deployment requires changing only the database connection string.

#### Q4: Why Vite instead of Create React App?
> **Answer:** Create React App is officially deprecated by the React team and relies on Webpack, which bundles the entire codebase in memory before serving, resulting in slow startup and build times. Vite leverages native ES Modules (ESM) in the browser, providing sub-second Hot Module Replacement (HMR) during development and faster, smaller production bundles.

---

### Category B: AI, Machine Learning & Detection Edge Cases

#### Q5: Why DistilBERT? Why not use an LLM API like GPT-4 or Claude?
> **Answer:** 
> 1. **Data Privacy & Compliance:** Sending sensitive corporate or government emails to third-party US cloud APIs violates data privacy regulations like GDPR and India's Digital Personal Data Protection (DPDP) Act 2023. Our model runs **100% locally on-premise**.
> 2. **Operational Cost:** Cloud LLM APIs charge per token. Scanning millions of enterprise emails via GPT-4 would be cost-prohibitive.
> 3. **Latency:** DistilBERT inference takes approximately 20–50 ms on standard CPUs, whereas cloud LLM round-trips take 1.5 to 3 seconds.
> 4. **Efficiency:** DistilBERT retains **97% of BERT's language understanding** while being **40% smaller and 60% faster**.

#### Q6: How do you handle false positives where a legitimate marketing email uses urgent language?
> **Answer:** The system uses a multi-layered scoring pipeline rather than relying on any single check. Urgent language alone contributes only +15 points, keeping the email safely in the **Low Risk** category (<30). An email is only flagged as High Risk (60+) if urgent language is combined with technical failure indicators, such as SPF/DKIM authentication failures, typosquatted domains, or lookalike display names.

#### Q7: What happens if the server hosting this system doesn't have a GPU or enough RAM to run PyTorch?
> **Answer:** We implemented **Graceful AI Degradation** in `nlp_scoring.py`. If PyTorch or Transformers fail to load, the system catches the exception at startup, logs a warning, and continues operating using the rule-based heuristic and OSINT engines. The platform maintains **100% operational uptime** even on low-resource hardware.

---

### Category C: Blockchain, Cryptography & Chain of Custody

#### Q8: Why did you use a blockchain-style hash chain instead of a regular database table?
> **Answer:** Standard database records can be altered using a basic `UPDATE` query. If a system administrator or attacker modifies an email's risk score from 90 to 10, a traditional database shows no sign of tampering. Our audit chain cryptographically links each record to the previous one using SHA-256:
> $$\text{Block Hash}_n = \text{SHA256}(\text{Block Hash}_{n-1} + \text{Analysis Hash}_n + \text{Timestamp})$$
> If an attacker changes a single byte in an earlier record, the hash of that block changes, breaking all subsequent block hashes. When the `/verify/{id}` endpoint recalculates the chain, it immediately detects the tampering.

#### Q9: Why didn't you use a public blockchain like Ethereum or Polygon?
> **Answer:**
> 1. **Data Privacy:** Public blockchains are publicly viewable. Even hashed email metadata could leak sensitive communication patterns.
> 2. **Transaction Fees (Gas):** Recording an audit block on a public chain costs transaction fees for every email scanned, making it impractical at enterprise scale.
> 3. **Latency:** Public blockchains require block confirmation times of 12 seconds to several minutes. Our internal SHA-256 hash chain provides instantaneous cryptographic immutability with zero gas costs.

#### Q10: What happens if an attacker deletes the entire database file?
> **Answer:** Deleting the database is an availability attack, which is mitigated using standard database replication, automated offsite backups, and write-once-read-many (WORM) storage. The primary purpose of the cryptographic audit chain is to prevent **silent data tampering**—ensuring that existing records cannot be altered undetected.

---

### Category D: Network Forensics, Spoofing & Geolocation

#### Q11: Can an attacker forge the `Received:` headers to hide their true origin?
> **Answer:** An attacker can forge `Received:` headers that they inject themselves on their own server. However, they **cannot** forge the `Received:` header added by the *receiving* mail server (e.g., Google or Microsoft), because that header is written directly by the recipient's infrastructure. Our parser processes relay headers from bottom to top, identifying the first trustworthy public hop and checking for header forgery through negative time gaps and geographical impossibilities.

#### Q12: How do you detect "Geographic Impossibility" in relay hops?
> **Answer:** We map the IP address of each relay hop to its continent using our batch IP-API integration. We then check the timestamp delta between consecutive hops. If Hop A is in Germany (Europe) and Hop B is in Australia (Oceania), and the transit time is less than 60 seconds, we flag a **Geographic Impossibility Anomaly**. Email relaying across continents requires physical network transit, DNS resolution, and queuing that cannot realistically complete in a few seconds.

#### Q13: What if the attacker uses a VPN or Tor exit node?
> **Answer:** If an attacker sends an email through a commercial VPN or Tor exit node, the originating IP will resolve to the VPN datacenter's ISP. Our IP-API integration captures the Autonomous System Organization (`org` field). In our scoring engine, emails claiming to originate from private individuals or banks that route through known hosting datacenters (e.g., DigitalOcean, Linode, OVH) rather than residential or corporate mail relays receive elevated suspicion scores.

---

### Category E: Privacy, Compliance & Real-World Feasibility

#### Q14: How does your system comply with data privacy laws like India's DPDP Act 2023 or GDPR?
> **Answer:**
> 1. **Local Processing:** No email content is sent to third-party AI APIs.
> 2. **PII Masking:** The report generator includes an automated PII Masking engine that redacts sender names to `[REDACTED]`, masks emails to `u***@d***.com`, and anonymizes IP addresses to `xxx.xxx.xxx.42`.
> 3. **Payload Safety:** Raw attachment binaries are never saved to disk—only metadata (filename, extension, size) is inspected.

#### Q15: Is this solution economically viable for a government cyber cell or an enterprise?
> **Answer:** Yes. The entire stack is built on open-source software with zero licensing fees:
> * Frontend: React/Vite (Free open-source, hosted for free on GitHub Pages).
> * Backend: FastAPI & Python (Free open-source).
> * AI: DistilBERT (Open-source Hugging Face model running on standard CPU/GPU).
> * Database: SQLite (Free open-source).
> The operational cost for a deployment is limited to standard cloud compute infrastructure, with no per-seat or per-token fees.

#### Q16: How does the system scale to handle millions of emails per day?
> **Answer:** 
> 1. **Asynchronous Architecture:** FastAPI handles I/O-bound requests asynchronously without blocking.
> 2. **Batch Geolocation:** Resolving relay IPs in batches of 15 reduces external network requests by up to 90%.
> 3. **Microservices Ready:** The architecture separates the parsing, AI inference, and storage layers. In an enterprise deployment, the DistilBERT inference can run on a dedicated worker pool (e.g., Celery + Redis), and the SQLite database can be swapped to PostgreSQL with connection pooling.

---

### Category F: Live Demonstration & Code Walkthrough Traps

#### Q17: "Show me where the Indian government domain check is implemented."
> **Answer:** "It is implemented in `backend/gov_detection.py`. The function `check_gov_domain()` uses regular expressions to verify if the domain ends in `.gov.in` or `.nic.in`. It then scans the display name and email body for government keywords like 'Income Tax', 'State Bank of India', or 'Police'. If an email claims government affiliation without an authorized domain, it sets `claims_gov: True` and `is_gov: False`, which triggers the red warning banner in `GovDomainBanner.jsx`."

#### Q18: "Show me how the blockchain integrity verification works in the code."
> **Answer:** "In `backend/blockchain.py`, the `create_block()` function computes `analysis_hash = hashlib.sha256(json.dumps(analysis, sort_keys=True).encode()).hexdigest()` and links it to `previous_block_hash`. In `verify_chain(analysis_id)`, it fetches the full chain from Block #1, recomputes the SHA-256 hash for every historical block, and verifies that the recalculated hash matches the stored `block_hash`. If any record was altered, the verification fails."

#### Q19: "What happens if Wikipedia is down or rate-limits the Brand Verification check?"
> **Answer:** "In `backend/brand_verification.py`, the Wikipedia API call is enclosed in a `try-except` block with a short 4-second timeout. If the request times out, fails, or is rate-limited, the system catches the error, sets `brand_verified = False`, and assigns a default neutral Brand Trust Score of 50. The core threat detection pipeline continues running without interruption."

#### Q20: "Why doesn't your Chrome extension require permission to read all websites?"
> **Answer:** "Following the principle of least privilege, our `manifest.json` uses Google Chrome's **Manifest V3** standard. It requests only `activeTab` and `scripting` permissions, with `host_permissions` restricted strictly to `https://mail.google.com/*` and our backend API. It cannot access any other browser tabs, browsing history, or personal data."

---

<div style="page-break-after: always;"></div>

## 7. Step-by-Step Live Demo Script for Judges

When presenting at 3:00 PM, follow this 3-minute demonstration flow:

1. **Step 1: The Context & Problem (30 Seconds)**
   * *"Respected judges, over 90% of cyber breaches begin with email threats that evade standard spam filters through typosquatting, government impersonation, and relay bouncing. We built SIH26106 to solve this with a unified, tamper-evident forensic platform."*
2. **Step 2: The Chrome Extension (Convenience Input Layer) (45 Seconds)**
   * Open an email in Gmail.
   * Click the **SIH26106 Threat Scanner** Chrome extension icon.
   * Click **"Scan Current Email"**.
   * Point out the instant result: **Risk Level: HIGH**, **Fraud Score: 85/100**, and the red warning: **⚠️ Government Impersonation Detected!**
   * Click **"Open Full Forensic Report"** to transition to the main dashboard.
3. **Step 3: The Deep-Dive Forensic Dashboard (60 Seconds)**
   * **Government Alert Banner:** Show the red banner highlighting unauthorized origin for an entity claiming government status.
   * **Brand Trust Panel:** Point out the Wikipedia verification and trust score breakdown.
   * **Geographic Map & Relay Path:** Show the Leaflet map tracking the originating IP and the relay timeline with detected anomaly alerts.
   * **Attachment Analysis:** Show the flagged double-extension file (`invoice.pdf.exe`).
4. **Step 4: The Innovation — Blockchain Audit & Court Report (45 Seconds)**
   * Scroll to the **Blockchain Audit Receipt**.
   * Click **"Verify Integrity"** $\to$ show the green verification banner: *"Immutable Chain Verified: Record Tamper-Free ✓"*.
   * Click **"Download Forensic Report (PDF)"** $\to$ toggle **Mask PII** $\to$ download the generated PDF and open it to demonstrate the court-ready evidence report.
5. **Step 5: Conclusion**
   * *"Our platform bridges the gap between everyday employee usability and deep, tamper-evident forensic intelligence for cyber defense cells. Thank you!"*

---
*End of Technical Dossier. Built with pride for Smart India Hackathon 2026.*
