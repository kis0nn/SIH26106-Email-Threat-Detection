import requests
import whois
from datetime import datetime
import logging
import re

logger = logging.getLogger(__name__)

# IPs that should NEVER be geolocated — they are fake/documentation/provider IPs
PRIVATE_RE = re.compile(
    r'^(10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.|127\.|0\.)'
)
# RFC 5737 documentation ranges — used in examples/tests, NOT real routable IPs
DOCUMENTATION_PREFIXES = ('192.0.2.', '198.51.100.', '203.0.113.')
# Major mail provider relay IP prefixes — these are relay hops, not the true sender
PROVIDER_PREFIXES = (
    '209.85.', '74.125.', '66.102.', '64.233.', '72.14.',
    '108.177.', '142.250.', '172.217.', '216.58.',
    '40.92.', '40.107.', '52.100.', '104.47.',
    '98.136.', '66.196.', '67.195.',
    '199.255.192.', '199.127.232.',
    '167.89.', '208.117.', '198.2.', '205.201.',
)

def is_bogon_ip(ip: str) -> bool:
    """Return True if this IP should NOT be geolocated (private, doc, or provider relay)."""
    if not ip:
        return True
    if PRIVATE_RE.match(ip):
        return True
    if any(ip.startswith(p) for p in DOCUMENTATION_PREFIXES):
        return True
    if any(ip.startswith(p) for p in PROVIDER_PREFIXES):
        return True
    return False

def get_ip_geolocation(ip: str) -> dict | None:
    """Geolocate a single IP. Returns None if IP is bogon/provider/documentation."""
    if not ip or is_bogon_ip(ip):
        return None
    try:
        resp = requests.get(
            f"http://ip-api.com/json/{ip}?fields=status,message,country,regionName,city,lat,lon,isp,org",
            timeout=5
        )
        if resp.status_code == 200:
            data = resp.json()
            if data.get("status") == "success":
                return {
                    "ip": ip,
                    "country": data.get("country"),
                    "city": data.get("city"),
                    "lat": data.get("lat"),
                    "lon": data.get("lon"),
                    "isp": data.get("isp"),
                    "org": data.get("org")
                }
    except Exception:
        pass
    return None


def batch_geolocate_ips(ips: list[str]) -> dict:
    """
    Geolocate multiple IPs using ip-api's batch endpoint.
    Skips private, RFC 5737 documentation, and known provider relay IPs.
    Returns a dict mapping IP -> {"country": str, "city": str}.
    """
    if not ips:
        return {}
    try:
        unique_ips = []
        seen = set()
        for ip in ips:
            if ip and ip not in seen and not is_bogon_ip(ip):
                unique_ips.append(ip)
                seen.add(ip)

        if not unique_ips:
            return {}

        batch_payload = [{"query": ip, "fields": "status,query,country,city"} for ip in unique_ips[:100]]
        resp = requests.post("http://ip-api.com/batch", json=batch_payload, timeout=10)

        if resp.status_code == 200:
            results = resp.json()
            ip_map = {}
            for entry in results:
                if entry.get("status") == "success":
                    ip_map[entry["query"]] = {
                        "country": entry.get("country"),
                        "city": entry.get("city"),
                    }
            return ip_map
    except Exception as e:
        logger.warning("Batch IP geolocation failed: %s", e)
    return {}


import concurrent.futures
_whois_pool = concurrent.futures.ThreadPoolExecutor(max_workers=3)

def get_domain_intel(domain: str) -> dict | None:
    if not domain:
        return None
    try:
        f = _whois_pool.submit(whois.whois, domain)
        w = f.result(timeout=2.0)
        if not w:
            return None
        creation_date = getattr(w, "creation_date", None)
        if isinstance(creation_date, list):
            creation_date = creation_date[0]

        if creation_date:
            age_days = (datetime.now() - creation_date).days
            is_newly_registered = age_days < 30
            return {
                "domain": domain,
                "age_days": age_days,
                "is_newly_registered": is_newly_registered,
                "registrar": getattr(w, "registrar", None),
                "created_date": creation_date.isoformat() if hasattr(creation_date, 'isoformat') else str(creation_date)
            }
    except Exception:
        pass
    return None

def check_safe_browsing(urls: list[str], api_key: str = None) -> dict | None:
    if not api_key or not urls:
        return None
    try:
        api_url = f"https://safebrowsing.googleapis.com/v4/threatMatches:find?key={api_key}"
        payload = {
            "client": {
                "clientId": "sih-email-threat-detector",
                "clientVersion": "1.0.0"
            },
            "threatInfo": {
                "threatTypes": ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
                "platformTypes": ["ANY_PLATFORM"],
                "threatEntryTypes": ["URL"],
                "threatEntries": [{"url": url} for url in urls]
            }
        }
        resp = requests.post(api_url, json=payload, timeout=5)
        if resp.status_code == 200:
            data = resp.json()
            matches = data.get("matches", [])
            flagged = list(set([m["threat"]["url"] for m in matches]))
            return {"flagged_urls": flagged}
    except Exception:
        pass
    return None
