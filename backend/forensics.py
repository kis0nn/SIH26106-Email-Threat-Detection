import requests
import whois
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

def get_ip_geolocation(ip: str) -> dict | None:
    try:
        resp = requests.get(f"http://ip-api.com/json/{ip}?fields=status,message,country,regionName,city,lat,lon,isp,org", timeout=5)
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
    Geolocate multiple IPs in one call using ip-api's batch endpoint.
    Returns a dict mapping IP -> {"country": str, "city": str}.
    Falls back to empty results on failure.
    """
    if not ips:
        return {}
    try:
        # Deduplicate and filter out private/null IPs
        import re
        unique_ips = []
        seen = set()
        for ip in ips:
            if ip and ip not in seen:
                # Skip private IPs
                if not re.match(r'^(10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.|127\.)', ip):
                    unique_ips.append(ip)
                    seen.add(ip)

        if not unique_ips:
            return {}

        # ip-api batch endpoint (max 100 IPs per call)
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

def get_domain_intel(domain: str) -> dict | None:
    if not domain:
        return None
    try:
        w = whois.whois(domain)
        creation_date = w.creation_date
        if isinstance(creation_date, list):
            creation_date = creation_date[0]
            
        if creation_date:
            age_days = (datetime.now() - creation_date).days
            is_newly_registered = age_days < 30
            return {
                "domain": domain,
                "age_days": age_days,
                "is_newly_registered": is_newly_registered,
                "registrar": w.registrar,
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
