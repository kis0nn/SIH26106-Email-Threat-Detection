"""
Relay-Hop Anomaly Detection — Tier 3
Detects time-gap anomalies, geographic impossibilities, Return-Path mismatches,
and excessive hop counts using Tier 2's per-hop geolocation data.
"""

import re
import logging
from datetime import datetime
from email.utils import parsedate_to_datetime

logger = logging.getLogger(__name__)

# Rough continent mapping by country name for geographic impossibility checks
CONTINENT_MAP = {
    # North America
    "united states": "NA", "canada": "NA", "mexico": "NA",
    # South America
    "brazil": "SA", "argentina": "SA", "colombia": "SA", "chile": "SA", "peru": "SA",
    # Europe
    "united kingdom": "EU", "germany": "EU", "france": "EU", "spain": "EU",
    "italy": "EU", "netherlands": "EU", "sweden": "EU", "norway": "EU",
    "poland": "EU", "romania": "EU", "ukraine": "EU", "switzerland": "EU",
    "belgium": "EU", "austria": "EU", "czech republic": "EU", "finland": "EU",
    "ireland": "EU", "portugal": "EU", "denmark": "EU", "greece": "EU",
    "russian federation": "EU", "russia": "EU",
    # Asia
    "china": "AS", "japan": "AS", "india": "AS", "south korea": "AS",
    "indonesia": "AS", "thailand": "AS", "vietnam": "AS", "singapore": "AS",
    "malaysia": "AS", "philippines": "AS", "taiwan": "AS", "pakistan": "AS",
    "bangladesh": "AS", "iran": "AS", "iraq": "AS", "saudi arabia": "AS",
    "united arab emirates": "AS", "israel": "AS", "turkey": "AS",
    # Africa
    "nigeria": "AF", "south africa": "AF", "egypt": "AF", "kenya": "AF",
    "ghana": "AF", "ethiopia": "AF", "tanzania": "AF", "morocco": "AF",
    # Oceania
    "australia": "OC", "new zealand": "OC",
}

# Maximum plausible transit time between continents (in seconds)
# If time delta between hops on different continents is less than this, it's suspicious
IMPOSSIBLE_TRANSIT_SECONDS = 60  # 1 minute — packets can't physically travel that fast across continents with mail relay


def _parse_timestamp(ts_str: str) -> datetime | None:
    """Try to parse a timestamp string from a Received header."""
    if not ts_str:
        return None
    try:
        return parsedate_to_datetime(ts_str)
    except Exception:
        pass
    # Try ISO format
    try:
        return datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
    except Exception:
        pass
    return None


def _get_continent(country: str) -> str | None:
    """Map country name to continent code."""
    if not country:
        return None
    return CONTINENT_MAP.get(country.lower().strip())


def detect_relay_anomalies(
    hops: list[dict],
    sender_domain: str = "",
    return_path: str = "",
    from_email: str = "",
) -> list[str]:
    """
    Analyze relay hops for anomalies.

    Returns a list of human-readable anomaly descriptions.
    """
    anomalies = []

    # ── 1. Hop count anomaly (>8 hops) ─────────────────────────────────────
    if len(hops) > 8:
        anomalies.append(
            f"Excessive relay hops ({len(hops)} hops detected). "
            "Normal email delivery uses 3-6 hops. Excessive bouncing may indicate "
            "relay obfuscation to hide the true origin."
        )

    # ── 2. Time-gap anomalies ──────────────────────────────────────────────
    prev_time = None
    prev_hop_num = None
    for hop in hops:
        ts = _parse_timestamp(hop.get("timestamp"))
        if ts is None:
            prev_time = None
            continue

        if prev_time is not None:
            delta = (ts - prev_time).total_seconds()

            # Negative time gap — likely forged headers
            if delta < -60:  # Allow 60s clock skew
                anomalies.append(
                    f"Hop {hop.get('hop', '?')}: Negative time gap ({int(delta)}s) from hop {prev_hop_num}. "
                    "This indicates likely header forgery — timestamps should only increase."
                )

            # Excessively long delay (>30 min)
            elif delta > 1800:
                minutes = int(delta / 60)
                anomalies.append(
                    f"Hop {hop.get('hop', '?')}: Unusual {minutes}-minute delay from hop {prev_hop_num}. "
                    "Normal relay transit takes seconds. Extended delays may indicate "
                    "queuing at a suspicious intermediary."
                )

        prev_time = ts
        prev_hop_num = hop.get("hop", "?")

    # ── 3. Geographic impossibility ────────────────────────────────────────
    prev_country = None
    prev_continent = None
    prev_ts = None
    prev_hop_geo = None
    for hop in hops:
        country = hop.get("country")
        continent = _get_continent(country)
        ts = _parse_timestamp(hop.get("timestamp"))

        if (
            prev_continent is not None
            and continent is not None
            and prev_continent != continent
            and prev_ts is not None
            and ts is not None
        ):
            delta = abs((ts - prev_ts).total_seconds())
            if delta < IMPOSSIBLE_TRANSIT_SECONDS:
                anomalies.append(
                    f"Hop {hop.get('hop', '?')}: Geographic impossibility — "
                    f"transit from {prev_country} ({prev_continent}) to {country} ({continent}) "
                    f"in {int(delta)}s. Cross-continent email relay cannot physically occur this fast."
                )

        prev_country = country
        prev_continent = continent
        prev_ts = ts
        prev_hop_geo = hop.get("hop")

    # ── 4. Return-Path vs From mismatch ────────────────────────────────────
    if return_path and from_email:
        # Extract domain from return_path
        rp_clean = return_path.strip().strip("<>")
        rp_domain = rp_clean.split("@")[-1].lower() if "@" in rp_clean else ""
        from_domain = from_email.split("@")[-1].lower() if "@" in from_email else ""

        if rp_domain and from_domain and rp_domain != from_domain:
            anomalies.append(
                f"Return-Path domain ({rp_domain}) does not match From domain ({from_domain}). "
                "This is a common indicator of spoofing or email forwarding abuse."
            )

    return anomalies
