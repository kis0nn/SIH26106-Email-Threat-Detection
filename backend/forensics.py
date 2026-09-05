import requests
import whois
from datetime import datetime

def get_ip_geolocation(ip: str) -> dict | None:
    try:
        resp = requests.get(f"http://ip-api.com/json/{ip}?fields=status,message,country,regionName,city,lat,lon,isp", timeout=5)
        if resp.status_code == 200:
            data = resp.json()
            if data.get("status") == "success":
                return {
                    "ip": ip,
                    "country": data.get("country"),
                    "city": data.get("city"),
                    "lat": data.get("lat"),
                    "lon": data.get("lon"),
                    "isp": data.get("isp")
                }
    except Exception:
        pass
    return None

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
