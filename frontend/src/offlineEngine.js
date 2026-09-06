// Client-side fallback forensic engine
// Runs directly in the browser when the backend is offline (e.g. standalone GitHub Pages demo)

const KNOWN_BRANDS = {
  paypal: "paypal.com",
  google: "google.com",
  microsoft: "microsoft.com",
  amazon: "amazon.com",
  apple: "apple.com",
  facebook: "facebook.com",
  netflix: "netflix.com",
  instagram: "instagram.com",
  whatsapp: "whatsapp.com",
  linkedin: "linkedin.com",
  sbi: "sbi.co.in",
  hdfc: "hdfcbank.com",
  icici: "icicibank.com",
  incometax: "incometax.gov.in",
  irs: "irs.gov"
};

const SUSPICIOUS_TLDS = ['.tk', '.ml', '.ga', '.cf', '.gq', '.ru', '.xyz', '.top', '.click', '.loan', '.win', '.download'];

function levenshteinDistance(s1, s2) {
  const m = s1.length;
  const n = s2.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

function stringSimilarityRatio(s1, s2) {
  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 100;
  const dist = levenshteinDistance(s1, s2);
  return Math.round(((maxLen - dist) / maxLen) * 100);
}

export function analyzeEmailClientSide(rawEmail) {
  const text = typeof rawEmail === 'string' ? rawEmail : '';
  
  // 1. Extract From Header
  const fromMatch = text.match(/^From:\s*(.+)$/im);
  let displayName = '';
  let emailAddr = '';
  let domain = '';

  if (fromMatch) {
    const rawFrom = fromMatch[1].trim();
    const addrMatch = rawFrom.match(/<([^>]+)>/);
    if (addrMatch) {
      emailAddr = addrMatch[1].trim();
      displayName = rawFrom.replace(/<[^>]+>/, '').replace(/["']/g, '').trim();
    } else {
      emailAddr = rawFrom.replace(/["']/g, '').trim();
      displayName = emailAddr.split('@')[0] || '';
    }
    domain = (emailAddr.split('@')[1] || '').toLowerCase();
  }

  // 2. Extract Subject
  const subjectMatch = text.match(/^Subject:\s*(.+)$/im);
  const subject = subjectMatch ? subjectMatch[1].trim() : 'No Subject';

  // 3. Extract Return-Path & Reply-To
  const returnPathMatch = text.match(/^Return-Path:\s*<?([^>\r\n]+)>?/im);
  const returnPath = returnPathMatch ? returnPathMatch[1].trim() : emailAddr;

  const replyToMatch = text.match(/^Reply-To:\s*<?([^>\r\n]+)>?/im);
  const replyTo = replyToMatch ? replyToMatch[1].trim() : '';

  // 4. Extract Auth Results
  const authMatch = text.match(/^Authentication-Results:\s*(.+)$/im);
  const authStr = authMatch ? authMatch[1].toLowerCase() : '';
  const spf = authStr.includes('spf=pass') ? 'pass' : (authStr.includes('spf=fail') ? 'fail' : 'none');
  const dkim = authStr.includes('dkim=pass') ? 'pass' : (authStr.includes('dkim=fail') ? 'fail' : 'none');
  const dmarc = authStr.includes('dmarc=pass') ? 'pass' : (authStr.includes('dmarc=fail') ? 'fail' : 'none');

  // 5. Extract Received chain
  const receivedLines = [...text.matchAll(/Received:\s*(.+?)(?=(?:\r?\n[^\s]|\r?\n\r?\n|$))/gis)];
  const hops = [];
  const ipRegex = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/;

  receivedLines.forEach((m, idx) => {
    const block = m[1];
    const ipM = block.match(ipRegex);
    const serverM = block.match(/from\s+([^\s;]+)/i);
    const timeM = block.split(';').pop()?.trim();

    hops.push({
      hop: idx + 1,
      ip: ipM ? ipM[0] : '198.51.100.5',
      server: serverM ? serverM[1] : 'mail.relay.net',
      timestamp: timeM || new Date().toUTCString()
    });
  });

  if (hops.length === 0) {
    hops.push({
      hop: 1,
      ip: '198.51.100.5',
      server: domain ? `mail.${domain}` : 'mail.origin.net',
      timestamp: new Date().toUTCString()
    });
  }

  // 6. Forensic checks
  let fraudScore = 0;
  const findings = [];

  // Lookalike check
  for (const [brand, brandDomain] of Object.entries(KNOWN_BRANDS)) {
    const ratio = stringSimilarityRatio(domain, brandDomain);
    if (ratio > 75 && ratio < 100) {
      fraudScore += 20;
      findings.push({
        check: "Lookalike domain",
        severity: "high",
        score_contribution: 20,
        detail: `Domain '${domain}' is typosquatting '${brandDomain}' (${ratio}% edit similarity).`
      });
      break;
    }
  }

  // Display-name spoofing
  const lowerDisplayName = displayName.toLowerCase();
  for (const [brand, brandDomain] of Object.entries(KNOWN_BRANDS)) {
    if (lowerDisplayName.includes(brand) && domain !== brandDomain) {
      fraudScore += 15;
      findings.push({
        check: "Display-name spoofing",
        severity: "medium",
        score_contribution: 15,
        detail: `Sender displays '${brand}' identity but email originates from unauthorized domain '${domain}'.`
      });
      break;
    }
  }

  // Suspicious TLD
  if (SUSPICIOUS_TLDS.some(tld => domain.endsWith(tld))) {
    fraudScore += 10;
    findings.push({
      check: "Suspicious TLD",
      severity: "medium",
      score_contribution: 10,
      detail: `Sender domain uses high-abuse TLD (${domain.slice(domain.lastIndexOf('.'))}) associated with disposable phishing infrastructure.`
    });
  }

  // Link mismatch check
  const linkRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi;
  let linkMatch;
  let linkScore = 0;
  while ((linkMatch = linkRegex.exec(text)) !== null) {
    const href = linkMatch[1];
    const linkText = linkMatch[2].replace(/<[^>]+>/g, '').trim();

    if (linkText.includes('.') && !linkText.includes(' ')) {
      try {
        const textHost = linkText.replace(/https?:\/\//, '').split('/')[0].replace('www.', '');
        const hrefHost = href.replace(/https?:\/\//, '').split('/')[0].replace('www.', '');
        if (textHost && hrefHost && textHost !== hrefHost && linkScore < 20) {
          linkScore += 20;
          findings.push({
            check: "Link mismatch",
            severity: "high",
            score_contribution: 20,
            detail: `Visible link text claims '${textHost}' but destination redirects to '${hrefHost}'.`
          });
        }
      } catch (e) {
        // ignore
      }
    }
  }
  fraudScore += linkScore;

  // Obfuscated / Shortened links
  const shorteners = ['bit.ly', 'tinyurl.com', 't.co', 'is.gd', 'cutt.ly', 'goo.gl'];
  if (shorteners.some(s => text.includes(s)) || /http:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(text)) {
    fraudScore += 10;
    findings.push({
      check: "Obfuscated URL",
      severity: "medium",
      score_contribution: 10,
      detail: `Email contains shortened redirect or raw IP URL designed to bypass automated security scanners.`
    });
  }

  // Urgency patterns
  const urgencyPatterns = [
    { regex: /verify\s+your\s+account/i, name: "verify your account" },
    { regex: /account\s+(?:suspended|closed|locked|access\s+restricted)/i, name: "account suspension threat" },
    { regex: /immediate\s+action/i, name: "immediate action pressure" },
    { regex: /unusual\s+activity/i, name: "unusual activity alert" },
    { regex: /wire\s+transfer/i, name: "wire transfer request" },
    { regex: /confirm\s+your\s+(?:password|details|payment)/i, name: "credentials confirmation" },
    { regex: /click\s+here\s+now/i, name: "call-to-action click urgency" },
    { regex: /act\s+now|expires?\s+soon|limited\s+time/i, name: "time expiration constraint" }
  ];

  let urgencyScore = 0;
  urgencyPatterns.forEach(p => {
    if (p.regex.test(text) && urgencyScore < 15) {
      urgencyScore += 3;
      findings.push({
        check: "Urgency language",
        severity: "low",
        score_contribution: 3,
        detail: `Social engineering indicator detected: '${p.name}'.`
      });
    }
  });
  fraudScore += urgencyScore;

  fraudScore = Math.min(100, fraudScore);
  const riskLevel = fraudScore < 30 ? "low" : (fraudScore < 60 ? "medium" : "high");

  // Geolocation routing based on sample identity
  const originIp = hops[0]?.ip || '198.51.100.5';
  let geo;
  let domainAge = 4;
  let isNew = true;
  let registrar = "Freenom Domains Ltd";
  let createdDate = "2026-09-02";

  if (domain === 'gmail.com') {
    geo = {
      ip: originIp,
      country: "United States",
      city: "Mountain View",
      lat: 37.3861,
      lon: -122.084,
      isp: "Google LLC"
    };
    domainAge = 7840;
    isNew = false;
    registrar = "MarkMonitor Inc.";
    createdDate = "2004-04-01";
  } else if (domain.includes('sbi') || text.includes('SBI')) {
    geo = {
      ip: originIp,
      country: "Russian Federation",
      city: "Moscow",
      lat: 55.7558,
      lon: 37.6173,
      isp: "Bulletproof Hosting Services"
    };
    domainAge = 3;
    isNew = true;
    registrar = "Namecheap Inc.";
    createdDate = "2026-09-03";
  } else if (domain.includes('vendor') || domain.includes('billing')) {
    geo = {
      ip: originIp,
      country: "United Kingdom",
      city: "London",
      lat: 51.5074,
      lon: -0.1278,
      isp: "Cloud Transit UK Ltd"
    };
    domainAge = 195;
    isNew = false;
    registrar = "GoDaddy.com LLC";
    createdDate = "2026-02-23";
  } else {
    geo = {
      ip: originIp,
      country: "Romania",
      city: "Bucharest",
      lat: 44.4267,
      lon: 26.1025,
      isp: "Autonomous Transit Network"
    };
  }

  return {
    id: "demo-" + Math.random().toString(36).substring(2, 9),
    created_at: new Date().toISOString(),
    sender: {
      display_name: displayName,
      email: emailAddr,
      domain: domain,
      reply_to: replyTo
    },
    subject: subject,
    fraud_score: fraudScore,
    risk_level: riskLevel,
    findings: findings,
    header_analysis: {
      spf: spf,
      dkim: dkim,
      dmarc: dmarc,
      return_path: returnPath
    },
    relay_analysis: {
      total_hops: hops.length,
      hops: hops
    },
    geolocation: geo,
    domain_intel: {
      domain: domain,
      age_days: domainAge,
      is_newly_registered: isNew,
      registrar: registrar,
      created_date: createdDate
    },
    is_client_fallback: true
  };
}
