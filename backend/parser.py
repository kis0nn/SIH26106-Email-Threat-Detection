import email
from email import policy
import email.utils
import re
from bs4 import BeautifulSoup

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
        spf_match = re.search(r'spf=(pass|fail|none)', res, re.I)
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
    
    # Received Headers
    received_headers = msg.get_all("Received", [])
    relay_chain = []
    ip_pattern = re.compile(r'\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b')
    for i, recv in enumerate(reversed(received_headers)):
        ip_match = ip_pattern.search(recv)
        ip = ip_match.group(0) if ip_match else None
        server = None
        server_match = re.search(r'from\s+([^\s]+)', recv, re.I)
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
        
    originating_ip = None
    for hop in relay_chain:
        ip = hop["ip"]
        if ip:
            if not re.match(r'^(10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.|127\.)', ip):
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
        "links": links
    }
