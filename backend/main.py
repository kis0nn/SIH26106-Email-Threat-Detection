from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uuid
import datetime
from typing import Optional

from database import init_db, save_analysis, get_analysis
from parser import parse_email
from detection import run_detection
from forensics import get_ip_geolocation, get_domain_intel, check_safe_browsing

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
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

    # Check content type to decide how to parse
    content_type = request.headers.get("content-type", "")

    if "multipart/form-data" in content_type:
        # File upload or form data
        if file and file.filename:
            content_bytes = await file.read()
            email_content = content_bytes.decode('utf-8', errors='ignore')
        elif raw_email:
            email_content = raw_email
    elif "application/json" in content_type:
        # JSON body
        body = await request.json()
        email_content = body.get("raw_email")

    if not email_content:
        raise HTTPException(status_code=400, detail="Must provide 'file' (multipart) or 'raw_email' (JSON body or form field)")

    return _run_analysis(email_content)
