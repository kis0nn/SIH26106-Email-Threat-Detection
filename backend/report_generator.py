"""
PDF Forensic Report Generator — Tier 2
Generates professional forensic reports with optional PII masking using ReportLab.
"""

import io
import re
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

try:
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.units import mm, cm
    from reportlab.lib.colors import (
        HexColor, black, white, red, green, gray,
    )
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
    from reportlab.platypus import (
        SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
        HRFlowable, PageBreak,
    )
    _REPORTLAB_AVAILABLE = True
except ImportError:
    _REPORTLAB_AVAILABLE = False
    logger.warning("⚠️ ReportLab not installed — PDF report generation unavailable")


# ── PII Masking Functions ──────────────────────────────────────────────────

def mask_email(email_str: str) -> str:
    """Mask email: user@domain.com → u***@d***.com"""
    if not email_str or "@" not in email_str:
        return email_str or "[REDACTED]"
    user, domain = email_str.split("@", 1)
    parts = domain.rsplit(".", 1)
    if len(parts) == 2:
        domain_name, tld = parts
        return f"{user[0]}***@{domain_name[0]}***.{tld}"
    return f"{user[0]}***@{domain[0]}***"


def mask_ip(ip_str: str) -> str:
    """Mask IP: 198.51.100.5 → xxx.xxx.xxx.5"""
    if not ip_str:
        return "[REDACTED]"
    parts = ip_str.split(".")
    if len(parts) == 4:
        return f"xxx.xxx.xxx.{parts[3]}"
    return "[REDACTED]"


def mask_name(name: str) -> str:
    """Mask name: any name → [REDACTED]"""
    if not name:
        return "[REDACTED]"
    return "[REDACTED]"


def _apply_pii_masking(analysis: dict) -> dict:
    """Return a deep copy of the analysis with PII redacted."""
    import copy
    masked = copy.deepcopy(analysis)

    # Mask sender info
    sender = masked.get("sender", {})
    if sender.get("email"):
        sender["email"] = mask_email(sender["email"])
    if sender.get("display_name"):
        sender["display_name"] = mask_name(sender["display_name"])
    if sender.get("reply_to"):
        sender["reply_to"] = mask_email(sender["reply_to"])

    # Mask geolocation IP
    geo = masked.get("geolocation")
    if geo and geo.get("ip"):
        geo["ip"] = mask_ip(geo["ip"])

    # Mask relay hop IPs
    relay = masked.get("relay_analysis", {})
    for hop in relay.get("hops", []):
        if hop.get("ip"):
            hop["ip"] = mask_ip(hop["ip"])

    # Mask header return path
    header = masked.get("header_analysis", {})
    if header.get("return_path"):
        header["return_path"] = mask_email(header["return_path"])

    return masked


# ── PDF Generation ─────────────────────────────────────────────────────────

def _get_risk_color(risk_level: str) -> HexColor:
    """Return color matching frontend risk badges."""
    level = (risk_level or "").lower()
    if level == "low":
        return HexColor("#10b981")    # emerald-500
    elif level == "medium":
        return HexColor("#f59e0b")    # amber-500
    elif level == "high":
        return HexColor("#e11d48")    # rose-600
    return HexColor("#6b7280")        # gray-500


def generate_pdf(analysis: dict, mask_pii: bool = False) -> bytes:
    """
    Generate a forensic PDF report for the given analysis.
    Returns PDF file bytes.
    """
    if not _REPORTLAB_AVAILABLE:
        raise RuntimeError("ReportLab is not installed. Cannot generate PDF reports.")

    # Apply PII masking if requested
    data = _apply_pii_masking(analysis) if mask_pii else analysis

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=2 * cm,
        rightMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        "ReportTitle",
        parent=styles["Title"],
        fontSize=20,
        textColor=HexColor("#1e3a5f"),
        spaceAfter=6,
    )
    subtitle_style = ParagraphStyle(
        "ReportSubtitle",
        parent=styles["Normal"],
        fontSize=10,
        textColor=HexColor("#6b7280"),
        alignment=TA_CENTER,
        spaceAfter=20,
    )
    section_style = ParagraphStyle(
        "SectionHeader",
        parent=styles["Heading2"],
        fontSize=14,
        textColor=HexColor("#1e3a5f"),
        spaceBefore=16,
        spaceAfter=8,
    )
    body_style = ParagraphStyle(
        "BodyText",
        parent=styles["Normal"],
        fontSize=10,
        textColor=black,
        spaceAfter=4,
    )
    small_style = ParagraphStyle(
        "SmallText",
        parent=styles["Normal"],
        fontSize=8,
        textColor=HexColor("#6b7280"),
    )

    elements = []

    # ── Header ──
    elements.append(Paragraph("🛡️ Email Threat Intelligence Report", title_style))
    elements.append(Paragraph("SIH26106 — AI-Powered Email Threat Detection Platform", subtitle_style))
    elements.append(HRFlowable(width="100%", color=HexColor("#d1d5db"), thickness=1))
    elements.append(Spacer(1, 10))

    # ── Case Info ──
    elements.append(Paragraph("Case Information", section_style))
    case_data = [
        ["Analysis ID", data.get("id", "N/A")],
        ["Timestamp", data.get("created_at", "N/A")],
        ["PII Masking", "Enabled" if mask_pii else "Disabled"],
    ]
    # Add blockchain info if available
    bc = data.get("blockchain_receipt")
    if bc:
        case_data.append(["Block Index", str(bc.get("block_index", "N/A"))])
        case_data.append(["Block Hash", bc.get("block_hash", "N/A")[:32] + "..."])

    case_table = Table(case_data, colWidths=[120, 350])
    case_table.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("TEXTCOLOR", (0, 0), (0, -1), HexColor("#374151")),
        ("TEXTCOLOR", (1, 0), (1, -1), HexColor("#111827")),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    elements.append(case_table)
    elements.append(Spacer(1, 10))

    # ── Risk Assessment ──
    elements.append(Paragraph("Risk Assessment", section_style))
    risk_level = data.get("risk_level", "unknown")
    fraud_score = data.get("fraud_score", 0)
    risk_color = _get_risk_color(risk_level)

    risk_data = [
        ["Fraud Score", str(fraud_score)],
        ["Risk Level", risk_level.upper()],
        ["Subject", data.get("subject", "N/A")],
    ]
    sender = data.get("sender", {})
    risk_data.append(["Sender", f'{sender.get("display_name", "")} <{sender.get("email", "N/A")}>'])
    risk_data.append(["Sender Domain", sender.get("domain", "N/A")])
    if sender.get("reply_to"):
        risk_data.append(["Reply-To", sender["reply_to"]])

    risk_table = Table(risk_data, colWidths=[120, 350])
    risk_table.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("TEXTCOLOR", (0, 0), (0, -1), HexColor("#374151")),
        ("TEXTCOLOR", (1, 0), (1, 0), risk_color),  # Score colored
        ("TEXTCOLOR", (1, 1), (1, 1), risk_color),  # Risk level colored
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
    ]))
    elements.append(risk_table)
    elements.append(Spacer(1, 10))

    # ── Findings Table ──
    findings = data.get("findings", [])
    if findings:
        elements.append(Paragraph("Security Findings", section_style))
        findings_header = [["#", "Check", "Severity", "Score", "Detail"]]
        findings_rows = []
        for i, f in enumerate(findings, 1):
            findings_rows.append([
                str(i),
                f.get("check", "Unknown"),
                f.get("severity", "N/A").upper(),
                f"+{f.get('score_contribution', 0)}",
                Paragraph(f.get("detail", ""), small_style),
            ])

        findings_table = Table(
            findings_header + findings_rows,
            colWidths=[25, 90, 60, 40, 255],
        )
        findings_table.setStyle(TableStyle([
            # Header row
            ("BACKGROUND", (0, 0), (-1, 0), HexColor("#1e3a5f")),
            ("TEXTCOLOR", (0, 0), (-1, 0), white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, 0), 8),
            # Body
            ("FONTSIZE", (0, 1), (-1, -1), 8),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#d1d5db")),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            # Alternating row colors
            *[("BACKGROUND", (0, i), (-1, i), HexColor("#f9fafb"))
              for i in range(2, len(findings_rows) + 1, 2)],
        ]))
        elements.append(findings_table)
        elements.append(Spacer(1, 10))

    # ── Sender Origin / Geolocation / ISP ──
    geo = data.get("geolocation")
    if geo:
        elements.append(Paragraph("Sender Geolocation & ISP", section_style))
        geo_data = [
            ["IP Address", geo.get("ip", "N/A")],
            ["Country", geo.get("country", "N/A")],
            ["City", geo.get("city", "N/A")],
            ["ISP", geo.get("isp", "N/A")],
            ["Organization", geo.get("org", "N/A")],
            ["Coordinates", f'{geo.get("lat", "N/A")}, {geo.get("lon", "N/A")}'],
        ]
        geo_table = Table(geo_data, colWidths=[120, 350])
        geo_table.setStyle(TableStyle([
            ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ("TOPPADDING", (0, 0), (-1, -1), 3),
        ]))
        elements.append(geo_table)
        elements.append(Spacer(1, 6))

    # ── Domain Intel / WHOIS ──
    di = data.get("domain_intel")
    if di:
        elements.append(Paragraph("Domain Intelligence (WHOIS)", section_style))
        di_data = [
            ["Domain", di.get("domain", "N/A")],
            ["Age", f'{di.get("age_days", "N/A")} days'],
            ["Newly Registered", "YES ⚠️" if di.get("is_newly_registered") else "No"],
            ["Registrar", di.get("registrar", "N/A")],
            ["Created Date", di.get("created_date", "N/A")],
        ]
        di_table = Table(di_data, colWidths=[120, 350])
        di_table.setStyle(TableStyle([
            ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ("TOPPADDING", (0, 0), (-1, -1), 3),
        ]))
        elements.append(di_table)
        elements.append(Spacer(1, 6))

    # ── SPF / DKIM / DMARC Table ──
    header = data.get("header_analysis", {})
    if header:
        elements.append(Paragraph("Email Authentication (SPF / DKIM / DMARC)", section_style))
        auth_header = [["Protocol", "Status"]]
        auth_rows = [
            ["SPF", header.get("spf", "none").upper()],
            ["DKIM", header.get("dkim", "none").upper()],
            ["DMARC", header.get("dmarc", "none").upper()],
            ["Return-Path", header.get("return_path", "N/A")],
        ]
        auth_table = Table(auth_header + auth_rows, colWidths=[120, 350])
        auth_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), HexColor("#1e3a5f")),
            ("TEXTCOLOR", (0, 0), (-1, 0), white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTNAME", (0, 1), (0, -1), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#d1d5db")),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
        ]))
        elements.append(auth_table)
        elements.append(Spacer(1, 10))

    # ── Footer ──
    elements.append(HRFlowable(width="100%", color=HexColor("#d1d5db"), thickness=1))
    elements.append(Spacer(1, 6))
    elements.append(Paragraph(
        f"Generated by SIH26106 Email Threat Detection Platform — {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}",
        small_style,
    ))
    if mask_pii:
        elements.append(Paragraph("⚠️ PII has been redacted in this report.", small_style))

    # Build PDF
    doc.build(elements)
    return buffer.getvalue()
