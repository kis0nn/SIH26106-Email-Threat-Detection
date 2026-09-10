import email
from email import policy
import email.utils
import re
from bs4 import BeautifulSoup

# ── IP ranges belonging to major email providers (Google, Microsoft, Yahoo, Amazon SES)
# These are RELAY IPs — not the actual attacker's IP. We skip them to find the real origin.
PROVIDER_PREFIXES = (
    # Google / Gmail
    '209.85.', '74.125.', '66.102.', '64.233.', '72.14.', '108.177.',
    '142.250.', '172.217.', '216.58.', '34.', '35.',
    # Microsoft / Outlook / Office 365
    '40.92.', '40.107.', '52.100.', '104.47.',
    # Yahoo / AOL
    '98.136.', '66.196.', '67.195.',
    # Amazon SES
    '199.255.192.', '199.127.232.',
    # SendGrid / Mailchimp
    '167.89.', '208.117.', '198.2.', '205.201.',
    # RFC 5737 documentation/example IPs — NOT real, used in test emails
    '192.0.2.', '198.51.100.', '203.0.113.',
)

def is_provider_ip(ip: str) -> bool:
    """Return True if this IP belongs to a known major mail relay provider."""
    return any(ip.startswith(prefix) for prefix in PROVIDER_PREFIXES)

def extract_urls_from_html(html_content):
    urls = []
    if not html_content:
        return urls
    soup = BeautifulSoup(html_content, 'html.parser')
    for a_tag in soup.find_all('a', href=True):
        text = a_tag.get_text(strip=True)
        href = a_tag.get('href', '')
        urls.append({"text": text, "href": href})
    return urls

def parse_email(raw_email_string) -> dict:
    msg = email.message_from_string(raw_email_string, policy=policy.default)
    
    # Extract Sender
    from_header = msg.get("From", "")
    display_name, sender_email = email.utils.parseaddr(from_header)
    sender_domain = sender_email.split('@')[1] if '@' in sender_email else ""
    
    # Other headers
    return_path = msg.get("Return-Path", "")
    reply_to = msg.get("Reply-To", "")
    message_id = msg.get("Message-ID", "")
    subject = msg.get("Subject", "")
    
    # Authentication-Results
    auth_results = msg.get_all("Authentication-Results", [])
    spf = dkim = dmarc = "none"
    for res in auth_results:
        spf_match = re.search(r'spf=(pass|fail|softfail|neutral|none)', res, re.I)
        dkim_match = re.search(r'dkim=(pass|fail|none)', res, re.I)
        dmarc_match = re.search(r'dmarc=(pass|fail|none)', res, re.I)
        if spf_match: spf = spf_match.group(1).lower()
        if dkim_match: dkim = dkim_match.group(1).lower()
        if dmarc_match: dmarc = dmarc_match.group(1).lower()
        
    header_analysis = {
        "spf": spf,
        "dkim": dkim,
        "dmarc": dmarc,
        "return_path": return_path
    }
    
    # Received Headers — parse oldest-first (reversed = chronological send order)
    received_headers = msg.get_all("Received", [])
    relay_chain = []
    ip_pattern = re.compile(r'\b(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\b')
    
    for i, recv in enumerate(reversed(received_headers)):
        ips = ip_pattern.findall(recv)
        # Pick the first non-loopback IP found in this hop
        ip = next((x for x in ips if not x.startswith('127.')), None)
        
        server = None
        server_match = re.search(r'from\s+(\S+)', recv, re.I)
        if server_match:
            server = server_match.group(1)
            
        timestamp = None
        if ';' in recv:
            timestamp = recv.split(';')[-1].strip()
            
        relay_chain.append({
            "hop": i + 1,
            "ip": ip,
            "server": server,
            "timestamp": timestamp
        })
    
    # ── Find TRUE originating IP ─────────────────────────────────────────────
    # Strategy:
    #   1. Skip private/loopback ranges (10.x, 172.16-31.x, 192.168.x, 127.x)
    #   2. Skip known major mail provider relay IPs (Google, Microsoft, Yahoo…)
    #   3. Take the FIRST remaining public IP — this is the attacker's real server
    originating_ip = None
    private_re = re.compile(
        r'^(10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.|127\.)'
    )
    for hop in relay_chain:
        ip = hop["ip"]
        if not ip:
            continue
        if private_re.match(ip):
            continue
        if is_provider_ip(ip):
            continue
        # This is a genuine external non-provider IP → true sender origin
        originating_ip = ip
        break
    
    # Fallback: if all IPs were provider IPs (e.g., internal Google relay),
    # take the very first public non-private IP so we show SOMETHING
    if not originating_ip:
        for hop in relay_chain:
            ip = hop["ip"]
            if ip and not private_re.match(ip):
                originating_ip = ip
                break
                
    # Body
    text_body = ""
    html_body = ""
    
    body_part = msg.get_body(preferencelist=('plain',))
    if body_part:
        text_body = body_part.get_content()
        
    html_part = msg.get_body(preferencelist=('html',))
    if html_part:
        html_body = html_part.get_content()
        
    links = extract_urls_from_html(html_body)
    
    # ── Tier 3: Attachments ──────────────────────────────────────────────────
    from attachment_analysis import analyze_attachments
    attachments = analyze_attachments(msg)
    
    return {
        "sender": {
            "display_name": display_name,
            "email": sender_email,
            "domain": sender_domain,
            "reply_to": reply_to
        },
        "subject": subject,
        "message_id": message_id,
        "header_analysis": header_analysis,
        "relay_analysis": {
            "total_hops": len(relay_chain),
            "hops": relay_chain
        },
        "originating_ip": originating_ip,
        "text_body": text_body,
        "html_body": html_body,
        "links": links,
        "attachments": attachments
    }
