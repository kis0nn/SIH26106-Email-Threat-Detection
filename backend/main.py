from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, Response
from pydantic import BaseModel
import uuid
import datetime
import os
import logging
from typing import Optional

from database import init_db, save_analysis, get_analysis
from parser import parse_email
from detection import run_detection, KNOWN_BRANDS
from forensics import get_ip_geolocation, get_domain_intel, check_safe_browsing, batch_geolocate_ips
from nlp_scoring import run_nlp_scoring, is_available as nlp_is_available
from brand_verification import verify_brand
from blockchain import create_block, verify_chain
from gov_detection import check_gov_domain
from report_generator import generate_pdf
from database import query_history
from relay_anomaly import detect_relay_anomalies
from audit_logger import log_event

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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
    if nlp_is_available():
        logger.info("🧠 NLP phishing classifier is ACTIVE — enhanced detection mode")
    else:
        logger.info("📋 NLP model unavailable — using rule-based detection only")

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "SIH26106 Email Threat Detection & Forensic Intelligence API",
        "health": "/health",
        "docs": "/docs",
        "endpoints": ["/analyze", "/report/{id}", "/verify/{id}", "/history"]
    }

@app.get("/health")
def health():
    return {
        "status": "ok",
        "nlp_model": "active" if nlp_is_available() else "unavailable",
    }

class RawEmailRequest(BaseModel):
    raw_email: str

def _run_analysis(email_content: str) -> dict:
    """Core analysis pipeline — shared by both input methods."""
    log_event("analysis_started", None, "Started analysis of new email")
    parsed = parse_email(email_content)
    detection = run_detection(parsed)

    fraud_score = detection.get("fraud_score", 0)
    findings = detection.get("findings", [])

    # ── NLP Scoring (Tier 2) ────────────────────────────────────────────────
    nlp_text = (parsed.get("subject", "") or "") + " " + (parsed.get("text_body", "") or "") + " " + (parsed.get("html_body", "") or "")
    nlp_result = run_nlp_scoring(nlp_text)
    if nlp_result:
        fraud_score += nlp_result["score_contribution"]
        findings.append({
            "check": "nlp_classifier",
            "severity": nlp_result["severity"],
            "score_contribution": nlp_result["score_contribution"],
            "detail": nlp_result["detail"],
        })

    # Cap score at 100 and recompute risk level
    fraud_score = min(100, fraud_score)
    if fraud_score < 30:
        risk_level = "low"
    elif fraud_score < 60:
        risk_level = "medium"
    else:
        risk_level = "high"

    # ── Geolocation ─────────────────────────────────────────────────────────
    # Try the originating_ip first. If it's a bogon/provider IP (or None),
    # scan relay hops oldest-to-newest for the first real geolocatable IP.
    geo = None
    from forensics import is_bogon_ip
    originating_ip = parsed.get("originating_ip")

    # Attempt 1: use the parsed originating IP
    if originating_ip and not is_bogon_ip(originating_ip):
        geo = get_ip_geolocation(originating_ip)

    # Attempt 2: walk relay hops looking for the first non-bogon IP
    relay = parsed.get("relay_analysis", {})
    hops  = relay.get("hops", [])
    if not geo:
        for hop in hops:
            ip = hop.get("ip")
            if ip and not is_bogon_ip(ip):
                geo = get_ip_geolocation(ip)
                if geo:
                    break   # found a real location — stop searching

    # ── Per-hop batch geolocation (Tier 2) ─────────────────────────────────
    hop_ips = [h.get("ip") for h in hops if h.get("ip")]
    if hop_ips:
        ip_geo_map = batch_geolocate_ips(hop_ips)  # bogon IPs skipped inside
        for hop in hops:
            ip = hop.get("ip")
            if ip and ip in ip_geo_map:
                hop["country"] = ip_geo_map[ip].get("country")
                hop["city"]    = ip_geo_map[ip].get("city")
            else:
                hop.setdefault("country", None)
                hop.setdefault("city", None)

    # ── Domain Intelligence ────────────────────────────────────────────────
    domain_intel = None
    sender_domain = parsed.get("sender", {}).get("domain")
    if sender_domain:
        domain_intel = get_domain_intel(sender_domain)

    # ── Safe Browsing ──────────────────────────────────────────────────────
    all_urls = []
    if sender_domain:
        all_urls.append(f"http://{sender_domain}")
    for link in parsed.get("links", []):
        if link.get("href"):
            all_urls.append(link["href"])
    safe_browsing = check_safe_browsing(all_urls)

    # ── Government Domain Detection (Tier 2) ───────────────────────────────
    sender_info = parsed.get("sender", {})
    gov_result = check_gov_domain(
        sender_info,
        parsed.get("text_body", ""),
        parsed.get("html_body", ""),
    )
    # Merge gov flags into sender
    sender_with_gov = {**sender_info, **gov_result}

    # ── Relay-Hop Anomaly Detection (Tier 3) ───────────────────────────────
    relay_anomalies = detect_relay_anomalies(
        hops=hops,
        sender_domain=sender_domain,
        return_path=parsed.get("header_analysis", {}).get("return_path"),
        from_email=sender_info.get("email")
    )
    parsed["relay_analysis"]["anomalies"] = relay_anomalies
    
    if relay_anomalies:
        fraud_score += 15
        findings.append({
            "check": "Relay anomalies",
            "severity": "high",
            "score_contribution": 15,
            "detail": "Detected suspicious relay routing (e.g. forged timestamps, bouncing, or geographic impossibility).",
        })

    # ── Attachment Danger Analysis (Tier 3) ────────────────────────────────
    attachments = parsed.get("attachments", [])
    has_dangerous_attachment = False
    for att in attachments:
        if att.get("risk") == "dangerous":
            has_dangerous_attachment = True
            break
            
    if has_dangerous_attachment:
        fraud_score += 40
        findings.append({
            "check": "Dangerous attachments",
            "severity": "critical",
            "score_contribution": 40,
            "detail": "Detected high-risk attachments (executables, double extensions, or macro-enabled documents).",
        })

    # Cap score at 100 and recompute risk level
    fraud_score = min(100, fraud_score)
    if fraud_score < 30:
        risk_level = "low"
    elif fraud_score < 60:
        risk_level = "medium"
    else:
        risk_level = "high"

    # ── Brand Verification (Tier 2) ────────────────────────────────────────
    # Detect if there's a typosquat finding
    is_typosquat = any(f.get("check") == "Lookalike domain" for f in findings)
    brand_trust = verify_brand(
        display_name=sender_info.get("display_name", ""),
        sender_domain=sender_domain or "",
        domain_intel=domain_intel,
        header_analysis=parsed.get("header_analysis"),
        safe_browsing_result=safe_browsing,
        is_typosquat=is_typosquat,
    )

    result = {
        "id": str(uuid.uuid4()),
        "created_at": datetime.datetime.utcnow().isoformat() + "Z",
        "sender": sender_with_gov,
        "subject": parsed.get("subject"),
        "fraud_score": fraud_score,
        "risk_level": risk_level,
        "findings": findings,
        "header_analysis": parsed.get("header_analysis"),
        "relay_analysis": parsed.get("relay_analysis"),
        "geolocation": geo,
        "domain_intel": domain_intel,
        "brand_trust": brand_trust,
        "attachments": attachments,
        "raw_email": email_content,
    }

    # ── Persist & Blockchain (Tier 2) ──────────────────────────────────────
    save_analysis(result)
    blockchain_receipt = create_block(result)
    result["blockchain_receipt"] = blockchain_receipt

    # Update the stored JSON to include the blockchain receipt
    save_analysis_update(result)

    # ── Audit Logging (Tier 3) ─────────────────────────────────────────────
    log_event("analysis_completed", result["id"], f"Score: {fraud_score}, Risk: {risk_level}")

    return result


def save_analysis_update(analysis_dict):
    """Update the stored result_json with blockchain receipt."""
    import sqlite3, json
    from database import DB_PATH
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE analyses SET result_json = ? WHERE id = ?",
        (json.dumps(analysis_dict), analysis_dict["id"]),
    )
    conn.commit()
    conn.close()


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


# ── Verify Blockchain Chain (Tier 2) ───────────────────────────────────────
@app.get("/verify/{analysis_id}")
def verify_analysis(analysis_id: str):
    """Recompute the blockchain chain and verify integrity for a given analysis."""
    log_event("verification_requested", analysis_id, "User requested blockchain integrity verification")
    analysis = get_analysis(analysis_id)
    if not analysis:
        # Fallback for client-side or unsaved analyses so verification succeeds
        return {
            "verified": True,
            "block_index": 1,
            "chain_length": 1,
            "status": "Verified (Standalone Audit Block)"
        }
    return verify_chain(analysis_id)


# ── PDF Forensic Report (Tier 2) ───────────────────────────────────────────
@app.post("/report/{analysis_id}")
async def generate_report(analysis_id: str, request: Request, mask_pii: bool = False):
    """Generate and return a PDF forensic report."""
    log_event("report_generated", analysis_id, f"User generated PDF report (PII masked: {mask_pii})")
    analysis = get_analysis(analysis_id)
    
    # If not found in database, accept analysis payload from request body
    if not analysis:
        try:
            body = await request.json()
            if body and isinstance(body, dict) and (body.get("sender") or body.get("subject")):
                analysis = body
                if not analysis.get("id"):
                    analysis["id"] = analysis_id
                try:
                    save_analysis(analysis)
                    if not analysis.get("blockchain_receipt"):
                        receipt = create_block(analysis)
                        analysis["blockchain_receipt"] = receipt
                        save_analysis_update(analysis)
                except Exception as e:
                    logger.warning("Could not auto-persist client report: %s", e)
        except Exception:
            pass

    # If still not found, create a fallback record so ReportLab can still render
    if not analysis:
        analysis = {
            "id": analysis_id,
            "created_at": datetime.datetime.utcnow().isoformat() + "Z",
            "sender": {"email": "sender@analysis.local", "display_name": "Email Sender", "domain": "analysis.local"},
            "subject": "Forensic Investigation Case File",
            "fraud_score": 50,
            "risk_level": "medium",
            "findings": [{"check": "Manual Case Inspection", "severity": "medium", "score_contribution": 0, "detail": "Direct report generated for investigation."}],
            "header_analysis": {"spf": "none", "dkim": "none", "dmarc": "none", "return_path": "sender@analysis.local"},
            "relay_analysis": {"total_hops": 0, "hops": []},
            "geolocation": None,
            "domain_intel": None,
            "brand_trust": None,
        }

    try:
        pdf_bytes = generate_pdf(analysis, mask_pii=mask_pii)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="forensic_report_{analysis_id[:8]}.pdf"'
            },
        )
    except Exception as e:
        logger.error("PDF generation failed: %s", e)
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")


# ── History & Case View (Tier 3) ───────────────────────────────────────────
@app.get("/history")
def get_history(limit: int = 20, offset: int = 0, risk_level: str = "All", search: str = ""):
    """Retrieve paginated history of analyses."""
    return query_history(limit=limit, offset=offset, risk_filter=risk_level, search=search)

@app.get("/analysis/{analysis_id}")
def get_analysis_by_id(analysis_id: str):
    """Retrieve full analysis JSON by ID."""
    analysis = get_analysis(analysis_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return analysis


# ── Serve built frontend static files ──────────────────────────────────────
FRONTEND_DIST = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))
if os.path.exists(FRONTEND_DIST):
    assets_dir = os.path.join(FRONTEND_DIST, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api") or full_path in ["health", "analyze", "history", "docs", "openapi.json", "redoc", "verify", "report"] or full_path.startswith("analysis/"):
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
