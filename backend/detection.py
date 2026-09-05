from rapidfuzz import fuzz
import re
import urllib.parse

KNOWN_BRANDS = {
    "paypal": "paypal.com", "google": "google.com", "microsoft": "microsoft.com",
    "amazon": "amazon.com", "apple": "apple.com", "facebook": "facebook.com",
    "netflix": "netflix.com", "instagram": "instagram.com", "whatsapp": "whatsapp.com",
    "linkedin": "linkedin.com", "sbi": "sbi.co.in", "hdfc": "hdfcbank.com",
    "icici": "icicibank.com", "incometax": "incometax.gov.in",
    "irs": "irs.gov", "chase": "chase.com", "wellsfargo": "wellsfargo.com",
    "bankofamerica": "bankofamerica.com", "citibank": "citibank.com",
    "dropbox": "dropbox.com", "twitter": "twitter.com"
}

def extract_domain(url_or_text):
    if not url_or_text.startswith(('http://', 'https://')):
        url_or_text = 'http://' + url_or_text
    try:
        netloc = urllib.parse.urlparse(url_or_text).netloc
        netloc = netloc.lower().replace('www.', '')
        return netloc
    except:
        return ""

def run_detection(parsed_email) -> dict:
    fraud_score = 0
    findings = []
    
    sender_domain = parsed_email.get("sender", {}).get("domain", "").lower()
    display_name = parsed_email.get("sender", {}).get("display_name", "").lower()
    
    # 1. Lookalike domain (+20)
    for brand, brand_domain in KNOWN_BRANDS.items():
        ratio = fuzz.ratio(sender_domain, brand_domain)
        if 75 < ratio < 100:
            findings.append({
                "check": "Lookalike domain",
                "severity": "high",
                "score_contribution": 20,
                "detail": f"Sender domain typosquats {brand}"
            })
            fraud_score += 20
            break
            
    # 2. Display-name spoofing (+15)
    for brand, brand_domain in KNOWN_BRANDS.items():
        if brand in display_name and brand_domain != sender_domain:
            findings.append({
                "check": "Display-name spoofing",
                "severity": "medium",
                "score_contribution": 15,
                "detail": f"Display name contains '{brand}' but domain is {sender_domain}"
            })
            fraud_score += 15
            break
            
    # 3. Suspicious TLD (+10)
    suspicious_tlds = ['.tk', '.ml', '.ga', '.cf', '.gq', '.ru', '.xyz', '.top', '.click', '.loan', '.win', '.download']
    if any(sender_domain.endswith(tld) for tld in suspicious_tlds):
        findings.append({
            "check": "Suspicious TLD",
            "severity": "medium",
            "score_contribution": 10,
            "detail": f"Sender domain uses suspicious TLD"
        })
        fraud_score += 10
        
    # 4 & 5. Link checks
    link_mismatch_score = 0
    obfuscated_score = 0
    shorteners = ['bit.ly', 'tinyurl.com', 't.co', 'is.gd', 'cutt.ly', 'goo.gl']
    
    for link in parsed_email.get("links", []):
        text = link.get("text", "")
        href = link.get("href", "")
        
        # 4. Link text vs href mismatch
        if '.' in text and ' ' not in text:
            text_domain = extract_domain(text)
            href_domain = extract_domain(href)
            if text_domain and href_domain and text_domain != href_domain:
                if link_mismatch_score < 20:
                    added = min(20, 20 - link_mismatch_score)
                    link_mismatch_score += added
                    findings.append({
                        "check": "Link mismatch",
                        "severity": "high",
                        "score_contribution": added,
                        "detail": f"Link text domain '{text_domain}' differs from target '{href_domain}'"
                    })
                    
        # 5. Obfuscated/shortened URLs
        href_domain = extract_domain(href)
        is_shortener = href_domain in shorteners
        has_ip = bool(re.search(r'\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b', href))
        has_hex = bool(re.search(r'%[0-9a-fA-F]{2}', href))
        
        if is_shortener or has_ip or has_hex:
            if obfuscated_score < 15:
                added = min(10, 15 - obfuscated_score)
                obfuscated_score += added
                findings.append({
                    "check": "Obfuscated URL",
                    "severity": "medium",
                    "score_contribution": added,
                    "detail": f"Suspicious URL format detected: {href}"
                })
                
    fraud_score += link_mismatch_score + obfuscated_score
    
    # 6. Urgency language (+3 each, cap +15)
    urgency_patterns = [
        r"verify your account", r"account.*(suspended|closed|locked)", r"immediate action",
        r"unusual activity", r"wire transfer", r"confirm your (password|details|payment)",
        r"click here now", r"limited time", r"act now", r"expires? soon", r"urgent"
    ]
    
    urgency_score = 0
    text_content = parsed_email.get("subject", "") + " " + parsed_email.get("text_body", "") + " " + parsed_email.get("html_body", "")
    for pattern in urgency_patterns:
        if re.search(pattern, text_content, re.IGNORECASE):
            if urgency_score < 15:
                added = min(3, 15 - urgency_score)
                urgency_score += added
                findings.append({
                    "check": "Urgency language",
                    "severity": "low",
                    "score_contribution": added,
                    "detail": f"Matched urgency pattern: {pattern}"
                })
                
    fraud_score += urgency_score
    
    fraud_score = min(100, fraud_score)
    if fraud_score < 30:
        risk_level = "low"
    elif fraud_score < 60:
        risk_level = "medium"
    else:
        risk_level = "high"
        
    return {
        "fraud_score": fraud_score,
        "risk_level": risk_level,
        "findings": findings
    }
