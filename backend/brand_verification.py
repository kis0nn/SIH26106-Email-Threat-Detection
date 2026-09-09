"""
Brand Verification Module — Tier 2
Extracts claimed brand from display name, verifies via Wikipedia REST API,
computes Brand Trust Score (0-100).
"""

import requests
import logging
import re

logger = logging.getLogger(__name__)

# Import KNOWN_BRANDS from detection module
from detection import KNOWN_BRANDS


def _query_wikipedia(brand_name: str) -> bool:
    """Check if brand exists as a Wikipedia article. Returns True if verified."""
    try:
        url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{brand_name}"
        resp = requests.get(url, timeout=5, headers={"User-Agent": "SIH26106-EmailThreat/1.0"})
        if resp.status_code == 200:
            data = resp.json()
            # Check it's a real article (not disambiguation or missing)
            return data.get("type") == "standard"
    except Exception as e:
        logger.warning("Wikipedia API call failed for '%s': %s", brand_name, e)
    return False


def _extract_claimed_brand(display_name: str) -> tuple[str | None, str | None]:
    """
    Cross-reference display name against known brands.
    Returns (brand_key, official_domain) or (None, None).
    """
    if not display_name:
        return None, None

    lower_name = display_name.lower()
    for brand_key, official_domain in KNOWN_BRANDS.items():
        if brand_key in lower_name:
            return brand_key, official_domain

    return None, None


def verify_brand(
    display_name: str,
    sender_domain: str,
    domain_intel: dict | None = None,
    header_analysis: dict | None = None,
    safe_browsing_result: dict | None = None,
    is_typosquat: bool = False,
) -> dict | None:
    """
    Compute brand verification and trust score.

    Returns:
        {
            "claimed_brand": str,
            "brand_verified": bool,
            "official_domain": str,
            "brand_trust_score": int (0-100),
            "explanation": str
        }
    or None if no brand is claimed.
    """
    brand_key, official_domain = _extract_claimed_brand(display_name)

    if not brand_key:
        return None

    # Capitalize brand name for display
    claimed_brand = brand_key.capitalize()
    if brand_key == "bankofamerica":
        claimed_brand = "Bank of America"
    elif brand_key == "wellsfargo":
        claimed_brand = "Wells Fargo"
    elif brand_key == "incometax":
        claimed_brand = "Income Tax"

    # Query Wikipedia for verification
    brand_verified = _query_wikipedia(claimed_brand)

    # Compute Brand Trust Score
    score = 50  # base score
    explanations = []

    # +20 if Wikipedia-verified
    if brand_verified:
        score += 20
        explanations.append(f"{claimed_brand} is a verified organization (Wikipedia)")
    else:
        explanations.append(f"Could not verify {claimed_brand} as a known organization")

    # +30 if domain exactly matches the brand's official domain
    sender_domain_lower = (sender_domain or "").lower()
    if sender_domain_lower == official_domain:
        score += 30
        explanations.append(f"Sender domain matches official domain ({official_domain})")
    else:
        explanations.append(f"Sender domain ({sender_domain_lower}) does not match official ({official_domain})")

    # -40 if typosquat/lookalike
    if is_typosquat:
        score -= 40
        explanations.append("Domain appears to be a typosquat/lookalike")

    # -20 if domain is newly registered (<30 days)
    if domain_intel and domain_intel.get("is_newly_registered"):
        score -= 20
        explanations.append("Domain was registered less than 30 days ago")

    # -30 if flagged by Safe Browsing
    if safe_browsing_result and safe_browsing_result.get("flagged_urls"):
        score -= 30
        explanations.append("URLs flagged by Google Safe Browsing")

    # -10 for each SPF/DKIM/DMARC failure
    if header_analysis:
        for check_name in ["spf", "dkim", "dmarc"]:
            status = header_analysis.get(check_name, "none")
            if status == "fail":
                score -= 10
                explanations.append(f"{check_name.upper()} authentication failed")

    # Clamp to [0, 100]
    score = max(0, min(100, score))

    # Build summary explanation
    if score >= 70:
        summary = f"Claims to be {claimed_brand} and appears legitimate."
    elif score >= 40:
        summary = f"Claims to be {claimed_brand} but some trust indicators are missing."
    else:
        summary = f"Claims to be {claimed_brand} but sent from {'typosquatted' if is_typosquat else 'unauthorized'} domain."

    return {
        "claimed_brand": claimed_brand,
        "brand_verified": brand_verified,
        "official_domain": official_domain,
        "brand_trust_score": score,
        "explanation": summary,
    }
