// content.js — runs inside https://mail.google.com
// Two jobs:
//   1. Scan inbox list rows and inject risk badges next to the timestamp.
//   2. When an email is open, inject a threat banner inside the reading pane.

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function buildRawEmail({ senderName, senderEmail, subject, body }) {
  return `From: "${senderName}" <${senderEmail}>\nSubject: ${subject}\n\n${body}`;
}

function riskColors(risk) {
  if (risk === 'high')   return { bg: '#fee2e2', text: '#be123c', border: '#fca5a5' };
  if (risk === 'medium') return { bg: '#fef3c7', text: '#b45309', border: '#fcd34d' };
  return                        { bg: '#d1fae5', text: '#047857', border: '#6ee7b7' };
}

function riskEmoji(risk) {
  if (risk === 'high')   return '🔴';
  if (risk === 'medium') return '🟡';
  return '🟢';
}

// Call the background service worker to make the API request
function analyzeEmail(rawEmail) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { action: 'analyze_email', raw_email: rawEmail },
      (response) => {
        if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
        if (response && response.ok) return resolve(response.data);
        reject(new Error(response ? response.error : 'Unknown error'));
      }
    );
  });
}

// ─────────────────────────────────────────────
// FEATURE 1 — Inbox list badges
// ─────────────────────────────────────────────

async function scanInboxList() {
  const rows = document.querySelectorAll('tr.zA');
  if (rows.length === 0) return;

  const rowsToScan = Array.from(rows).slice(0, 20);

  for (const row of rowsToScan) {
    try {
      if (row.querySelector('.sih-badge')) continue;

      const senderEl  = row.querySelector('.yP, .zF');
      const subjectEl = row.querySelector('.bog');
      const snippetEl = row.querySelector('.y2');
      // The time cell — Gmail uses .xW.xY or .xW .x4
      const timeCell  = row.querySelector('.xW') || row.querySelector('.x4');

      if (!senderEl || !subjectEl || !timeCell) continue;

      const senderName  = senderEl.innerText.trim();
      const senderEmail = senderEl.getAttribute('email') || senderName;
      const subject     = subjectEl.innerText.trim();
      const body        = snippetEl ? snippetEl.innerText.trim() : '';

      // ── inject placeholder badge ──────────────────────
      const badge = document.createElement('span');
      badge.className = 'sih-badge';
      badge.setAttribute('title', 'SIH26106 Threat Scanner — analyzing…');
      badge.style.cssText = [
        'display:inline-block',
        'font-size:10px',
        'font-weight:700',
        'padding:1px 7px',
        'border-radius:10px',
        'margin-right:6px',
        'vertical-align:middle',
        'border:1px solid #d1d5db',
        'background:#f3f4f6',
        'color:#6b7280',
        'cursor:default',
        'white-space:nowrap'
      ].join(';');
      badge.textContent = '⏳';
      timeCell.insertAdjacentElement('beforebegin', badge);

      // ── call API via background relay ─────────────────
      const raw = buildRawEmail({ senderName, senderEmail, subject, body });
      analyzeEmail(raw)
        .then(data => {
          const c = riskColors(data.risk_level);
          badge.style.background   = c.bg;
          badge.style.color        = c.text;
          badge.style.borderColor  = c.border;
          badge.textContent        = `${riskEmoji(data.risk_level)} ${data.fraud_score}`;
          badge.title              = `Risk: ${data.risk_level.toUpperCase()} — Score: ${data.fraud_score}/100`;
        })
        .catch(() => {
          badge.textContent = '⚠';
          badge.title = 'Could not reach the backend. Is it running on port 8000?';
        });

    } catch (e) {
      console.error('[SIH26106] inbox scan row error', e);
    }
  }
}

// ─────────────────────────────────────────────
// FEATURE 2 — Open email threat banner
// ─────────────────────────────────────────────

let lastOpenEmailSubject = '';

async function scanOpenEmail() {
  // Gmail reading pane selectors
  const subjectEl = document.querySelector('h2[data-thread-perm-id], .hP');
  const senderEl  = document.querySelector('.gD');
  const bodyEl    = document.querySelector('.a3s.aiL, .ii.gt');

  if (!senderEl || !bodyEl) return;

  const subject     = subjectEl  ? subjectEl.innerText.trim()             : 'Unknown Subject';
  const senderName  = senderEl.innerText.trim();
  const senderEmail = senderEl.getAttribute('email') || senderName;
  const body        = bodyEl.innerText.trim();

  // Don't re-scan the same email
  if (subject === lastOpenEmailSubject) return;
  lastOpenEmailSubject = subject;

  // Remove old banner if present
  const old = document.getElementById('sih-open-banner');
  if (old) old.remove();

  // ── create a "Scanning…" banner ───────────────────────────────────────
  const banner = document.createElement('div');
  banner.id = 'sih-open-banner';
  banner.style.cssText = [
    'position:relative',
    'z-index:9999',
    'display:flex',
    'align-items:center',
    'gap:10px',
    'padding:8px 14px',
    'margin:0 0 8px 0',
    'border-radius:8px',
    'font-size:13px',
    'font-weight:600',
    'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif',
    'border:1px solid #d1d5db',
    'background:#f3f4f6',
    'color:#374151'
  ].join(';');
  banner.innerHTML = '⏳ &nbsp;SIH26106 — analyzing threat indicators…';

  // Inject banner just above the email body
  bodyEl.parentElement.insertAdjacentElement('beforebegin', banner);

  const raw = buildRawEmail({ senderName, senderEmail, subject, body });
  try {
    const data = await analyzeEmail(raw);
    const c    = riskColors(data.risk_level);
    const score = data.fraud_score;
    const risk  = data.risk_level.toUpperCase();

    let details = [];
    if (data.sender && data.sender.claims_gov && !data.sender.is_gov) {
      details.push('⚠️ GOVERNMENT IMPERSONATION');
    }
    if (data.relay_analysis && data.relay_analysis.anomalies && data.relay_analysis.anomalies.length) {
      details.push('🌐 RELAY ANOMALY');
    }
    if (data.attachments && data.attachments.some(a => a.risk === 'dangerous')) {
      details.push('📎 DANGEROUS ATTACHMENT');
    }

    const detailStr = details.length ? `&nbsp;&nbsp;|&nbsp;&nbsp;${details.join('&nbsp;&nbsp;')}` : '';

    banner.style.background  = c.bg;
    banner.style.color       = c.text;
    banner.style.borderColor = c.border;

    // Build a deep-link URL so the web app auto-loads this exact analysis
    // Uses live GitHub Pages so it works on any device without local server!
    const dashboardUrl = `https://kis0nn.github.io/SIH26106-Email-Threat-Detection/?load=${data.id}&raw=${encodeURIComponent(raw)}`;

    banner.innerHTML = `
      ${riskEmoji(data.risk_level)} &nbsp;
      <strong>SIH26106:</strong> &nbsp;
      ${risk} RISK &nbsp;—&nbsp; Score: ${score}/100
      ${detailStr}
      &nbsp;&nbsp;
      <a href="${dashboardUrl}"
         target="_blank"
         style="font-size:11px;font-weight:600;padding:2px 8px;border-radius:6px;
                text-decoration:none;border:1px solid ${c.border};color:${c.text};background:white;">
        Full Report ↗
      </a>
    `;
  } catch (err) {
    banner.style.background = '#fff7ed';
    banner.style.color = '#92400e';
    banner.style.borderColor = '#fcd34d';
    banner.innerHTML = `⚠️ SIH26106 Threat Engine: ${err.message || 'Connecting to server…'}`;
  }
}

// ─────────────────────────────────────────────
// Message listener (from popup)
// ─────────────────────────────────────────────

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scan_inbox') {
    scanInboxList();
    sendResponse({ ok: true });
  }
  if (request.action === 'scan_open_email') {
    scanOpenEmail().then(() => sendResponse({ ok: true }));
    return true;
  }
});

// ─────────────────────────────────────────────
// Auto-detect when user opens an email
// Uses a MutationObserver to watch the Gmail DOM for reading-pane changes
// ─────────────────────────────────────────────

const observer = new MutationObserver(() => {
  // Gmail shows the reading pane when .a3s.aiL appears
  const bodyEl = document.querySelector('.a3s.aiL, .ii.gt');
  if (bodyEl) {
    scanOpenEmail();
  }
});

observer.observe(document.body, { childList: true, subtree: true });
