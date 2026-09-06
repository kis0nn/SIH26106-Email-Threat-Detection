from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
import uuid
import datetime
import os
from typing import Optional

from database import init_db, save_analysis, get_analysis
from parser import parse_email
from detection import run_detection
from forensics import get_ip_geolocation, get_domain_intel, check_safe_browsing

app = FastAPI(title="SIH26106 Email Threat Detection API")

# Allow all origins so any hosted frontend (GitHub Pages, Vercel, localhost) can call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    init_db()

@app.get("/health")
def health():
    return {"status": "ok"}

class RawEmailRequest(BaseModel):
    raw_email: str

def _run_analysis(email_content: str) -> dict:
    """Core analysis pipeline — shared by both input methods."""
    parsed = parse_email(email_content)
    detection = run_detection(parsed)

    geo = None
    if parsed.get("originating_ip"):
        geo = get_ip_geolocation(parsed["originating_ip"])

    domain_intel = None
    sender_domain = parsed.get("sender", {}).get("domain")
    if sender_domain:
        domain_intel = get_domain_intel(sender_domain)

    all_urls = []
    if sender_domain:
        all_urls.append(f"http://{sender_domain}")
    for link in parsed.get("links", []):
        if link.get("href"):
            all_urls.append(link["href"])

    # Safe Browsing (needs API key — gracefully returns None if not set)
    safe_browsing = check_safe_browsing(all_urls)

    result = {
        "id": str(uuid.uuid4()),
        "created_at": datetime.datetime.utcnow().isoformat() + "Z",
        "sender": parsed.get("sender"),
        "subject": parsed.get("subject"),
        "fraud_score": detection.get("fraud_score"),
        "risk_level": detection.get("risk_level"),
        "findings": detection.get("findings"),
        "header_analysis": parsed.get("header_analysis"),
        "relay_analysis": parsed.get("relay_analysis"),
        "geolocation": geo,
        "domain_intel": domain_intel
    }

    save_analysis(result)
    return result

@app.post("/analyze")
async def analyze_email(
    request: Request,
    file: Optional[UploadFile] = File(None),
    raw_email: Optional[str] = Form(None)
):
    """Accept .eml file upload (multipart) OR raw email JSON body."""
    email_content = None

    content_type = request.headers.get("content-type", "")

    if "multipart/form-data" in content_type:
        if file and file.filename:
            content_bytes = await file.read()
            email_content = content_bytes.decode('utf-8', errors='ignore')
        elif raw_email:
            email_content = raw_email
    elif "application/json" in content_type:
        body = await request.json()
        email_content = body.get("raw_email")

    if not email_content:
        raise HTTPException(status_code=400, detail="Must provide 'file' (multipart) or 'raw_email' (JSON body or form field)")

    return _run_analysis(email_content)

# Serve built frontend static files if available (single-service web deployment on Render / Railway)
FRONTEND_DIST = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))
if os.path.exists(FRONTEND_DIST):
    assets_dir = os.path.join(FRONTEND_DIST, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api") or full_path in ["health", "analyze", "docs", "openapi.json", "redoc"]:
            raise HTTPException(status_code=404, detail="Not Found")
        file_path = os.path.join(FRONTEND_DIST, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        index_file = os.path.join(FRONTEND_DIST, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        raise HTTPException(status_code=404, detail="Frontend index.html not found")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
