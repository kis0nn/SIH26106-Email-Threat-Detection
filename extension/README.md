# Chrome Extension (Convenience Input Layer)

> **Role in Architecture:** Convenience input layer for end users in webmail (Gmail / Outlook).

```
[Gmail / Webmail Tab]
       │
       ▼ (1-Click Extract via Extension)
[POST /analyze] ──► [FastAPI Backend Core Pipeline]
```

### Purpose
While the **Web Dashboard** is the primary, universal investigation hub (accepting `.eml` file uploads and raw RFC 822 source text), this Chrome Extension provides 1-click convenience for daily users:
1. Extracts the active email DOM / raw headers from Gmail.
2. Sends the payload to the unified FastAPI `POST /analyze` pipeline.
3. Renders a summary risk badge and direct link to the full forensic intelligence dashboard.

### Architecture Scope
- **Manifest V3** compliant.
- Utilizes the same unified backend REST API (`POST /analyze`).
- Scheduled for development in **Tier 2 / Tier 3**.
