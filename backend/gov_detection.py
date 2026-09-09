"""
Government Domain Detection Module — Tier 2
Detects if an email claims to represent Indian government bodies and
verifies whether the sender's domain matches official patterns.
"""

import re
import logging

logger = logging.getLogger(__name__)

# Known Indian government body keywords (display name / body text patterns)
GOV_BODY_KEYWORDS = [
    "income tax", "incometax", "income-tax",
    "police", "cyber police", "cyber cell",
    "uidai", "aadhaar", "aadhar",
    "pan card", "pan verification",
    "gst", "goods and services tax",
    "rbi", "reserve bank of india",
    "ministry of", "government of india",
    "niti aayog", "election commission",
    "epfo", "provident fund",
    "sebi", "securities and exchange",
    "customs", "central excise",
    "enforcement directorate",
    "cbi", "central bureau",
    "nda", "national defence",
    "drdo",
    "isro",
    "passport seva",
    "digilocker",
    "umang",
    "irctc",
    "sbi",  # State Bank of India is government-owned
    "india post",
    "bsnl",
    "mtnl",
]

# Official government domain patterns
GOV_DOMAIN_PATTERNS = [
    r"\.gov\.in$",
    r"\.nic\.in$",
    r"\.ac\.in$",       # academic institutions
    r"^sbi\.co\.in$",   # SBI is government-owned
    r"^irctc\.co\.in$",
    r"^indianrailways\.gov\.in$",
    r"^incometax\.gov\.in$",
    r"^uidai\.gov\.in$",
    r"^epfindia\.gov\.in$",
    r"^passportindia\.gov\.in$",
    r"^digilocker\.gov\.in$",
    r"^india\.gov\.in$",
]


def check_gov_domain(sender: dict, text_body: str = "", html_body: str = "") -> dict:
    """
    Check if an email claims to represent a government body and
    whether the sender's domain is actually a government domain.

    Returns:
        {
            "is_gov": bool,       # True if sender domain is a legitimate gov domain
            "claims_gov": bool    # True if display name or body claims government identity
        }
    """
    display_name = (sender.get("display_name") or "").lower()
    sender_domain = (sender.get("domain") or "").lower()
    email_addr = (sender.get("email") or "").lower()

    # Combine all text for keyword search
    all_text = f"{display_name} {text_body} {html_body}".lower()

    # Check if sender domain IS a government domain
    is_gov = False
    for pattern in GOV_DOMAIN_PATTERNS:
        if re.search(pattern, sender_domain):
            is_gov = True
            break

    # Check if email CLAIMS to be from a government body
    claims_gov = False

    # Check display name first (strongest signal)
    for keyword in GOV_BODY_KEYWORDS:
        if keyword in display_name:
            claims_gov = True
            break

    # If not found in display name, check email subject area of the body
    # (only the first 500 chars to avoid false positives from forwarded content)
    if not claims_gov:
        body_snippet = all_text[:500]
        for keyword in GOV_BODY_KEYWORDS:
            if keyword in body_snippet:
                claims_gov = True
                break

    return {
        "is_gov": is_gov,
        "claims_gov": claims_gov,
    }
