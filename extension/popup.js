document.addEventListener('DOMContentLoaded', () => {
  const scanBtn      = document.getElementById('scanBtn');
  const scanListBtn  = document.getElementById('scanListBtn');
  const statusEl     = document.getElementById('status');
  const resultCard   = document.getElementById('resultCard');
  const riskLevelEl  = document.getElementById('riskLevel');
  const fraudScoreEl = document.getElementById('fraudScore');
  const govWarningEl = document.getElementById('govWarn');
  const dashboardLink = document.getElementById('dashboardLink');

  const DASHBOARD_URL = 'https://kis0nn.github.io/SIH26106-Email-Threat-Detection';

  function setStatus(msg, color = '#4b5563') {
    statusEl.textContent = msg;
    statusEl.style.color = color;
  }

  async function getActiveTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab.url.includes('mail.google.com')) {
      throw new Error('Please open Gmail first.');
    }
    return tab;
  }

  // ── Scan open email ─────────────────────────────────────────────────────
  scanBtn.addEventListener('click', async () => {
    try {
      scanBtn.disabled = true;
      resultCard.style.display = 'none';
      setStatus('Scanning open email…');

      const tab = await getActiveTab();

      // Ask content script to scan and inject the banner, then extract data
      const response = await new Promise((resolve, reject) => {
        chrome.tabs.sendMessage(tab.id, { action: 'scan_open_email' }, (res) => {
          if (chrome.runtime.lastError) return reject(new Error('Refresh the Gmail tab then try again.'));
          resolve(res);
        });
      });

      // Also get the result so we can show it in the popup
      const injectionResult = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const senderEl  = document.querySelector('.gD');
          const subjectEl = document.querySelector('h2[data-thread-perm-id], .hP');
          const bodyEl    = document.querySelector('.a3s.aiL, .ii.gt');
          if (!senderEl || !bodyEl) return null;
          return {
            senderName:  senderEl.innerText.trim(),
            senderEmail: senderEl.getAttribute('email') || senderEl.innerText.trim(),
            subject:     subjectEl ? subjectEl.innerText.trim() : 'Unknown Subject',
            body:        bodyEl.innerText.trim()
          };
        }
      });

      const fields = injectionResult[0].result;
      if (!fields) throw new Error('Open an email in Gmail first, then click Scan.');

      setStatus('Analyzing…');
      const raw = `From: "${fields.senderName}" <${fields.senderEmail}>\nSubject: ${fields.subject}\n\n${fields.body}`;

      const bgResp = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ action: 'analyze_email', raw_email: raw }, (res) => {
          if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
          if (res && res.ok) return resolve(res.data);
          reject(new Error(res ? res.error : 'Backend error'));
        });
      });

      setStatus('');
      resultCard.style.display = 'block';

      riskLevelEl.textContent = bgResp.risk_level.toUpperCase();
      riskLevelEl.className   = `score-${bgResp.risk_level}`;
      fraudScoreEl.textContent = `${bgResp.fraud_score} / 100`;
      fraudScoreEl.className   = `score-${bgResp.risk_level}`;

      if (bgResp.sender && bgResp.sender.claims_gov && !bgResp.sender.is_gov) {
        govWarningEl.style.display = 'block';
      } else {
        govWarningEl.style.display = 'none';
      }

      // Deep-link: open the dashboard with this specific analysis pre-loaded
      dashboardLink.href = `${DASHBOARD_URL}/?load=${bgResp.id}`;

    } catch (err) {
      setStatus(`Error: ${err.message}`, '#e11d48');
    } finally {
      scanBtn.disabled = false;
    }
  });

  // ── Scan inbox list ─────────────────────────────────────────────────────
  scanListBtn.addEventListener('click', async () => {
    try {
      setStatus('Scanning inbox list…');
      const tab = await getActiveTab();
      chrome.tabs.sendMessage(tab.id, { action: 'scan_inbox' }, (res) => {
        if (chrome.runtime.lastError) {
          setStatus('Refresh the Gmail tab then try again.', '#e11d48');
        } else {
          setStatus('Badges injected! Check your inbox list ✓', '#047857');
          setTimeout(() => setStatus(''), 3000);
        }
      });
    } catch (err) {
      setStatus(`Error: ${err.message}`, '#e11d48');
    }
  });
});
