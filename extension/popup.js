document.addEventListener('DOMContentLoaded', () => {
  const scanBtn = document.getElementById('scanBtn');
  const statusEl = document.getElementById('status');
  const resultCard = document.getElementById('resultCard');
  const riskLevelEl = document.getElementById('riskLevel');
  const fraudScoreEl = document.getElementById('fraudScore');
  const govWarningEl = document.getElementById('govWarning');
  const dashboardLink = document.getElementById('dashboardLink');

  const API_URL = 'http://localhost:8000/analyze'; 
  const DASHBOARD_URL = 'http://localhost:5173'; // Or hosted frontend URL

  scanBtn.addEventListener('click', async () => {
    try {
      scanBtn.disabled = true;
      statusEl.textContent = 'Extracting email from Gmail...';
      resultCard.style.display = 'none';

      // 1. Get active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.url.includes('mail.google.com')) {
        throw new Error('Please open an email in Gmail to scan.');
      }

      // 2. Execute script in tab to extract DOM content (Subject, Sender, Body)
      // For a real production app, we would use Gmail API or "Show Original" extraction.
      // Here we simulate extraction by grabbing visible DOM elements as a raw string approximation.
      const injectionResults = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: extractGmailContent
      });

      const extractedText = injectionResults[0].result;
      if (!extractedText) {
        throw new Error('Could not extract email content. Make sure an email is open.');
      }

      statusEl.textContent = 'Analyzing threat indicators...';

      // 3. Send to our unified FastAPI backend
      const formData = new FormData();
      formData.append('raw_email', extractedText);

      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      // 4. Update UI
      statusEl.textContent = '';
      resultCard.style.display = 'block';
      
      riskLevelEl.textContent = data.risk_level.toUpperCase();
      riskLevelEl.className = `score-${data.risk_level}`;
      
      fraudScoreEl.textContent = `${data.fraud_score} / 100`;
      fraudScoreEl.className = `score-${data.risk_level}`;

      if (data.sender && data.sender.claims_gov && !data.sender.is_gov) {
        govWarningEl.style.display = 'block';
      } else {
        govWarningEl.style.display = 'none';
      }

      // Store analysis ID for the dashboard
      // In a real app, the dashboard would fetch this ID. For now, we link to the dashboard.
      dashboardLink.href = `${DASHBOARD_URL}`;

    } catch (error) {
      statusEl.textContent = `Error: ${error.message}`;
      statusEl.style.color = '#e11d48';
    } finally {
      scanBtn.disabled = false;
    }
  });
});

// This runs in the context of the Gmail tab
function extractGmailContent() {
  try {
    // Very rudimentary extraction from Gmail DOM
    const subjectEl = document.querySelector('h2[data-thread-perm-id]');
    const senderEl = document.querySelector('.gD');
    const bodyEl = document.querySelector('.a3s.aiL');

    const subject = subjectEl ? subjectEl.innerText : 'Unknown Subject';
    const senderName = senderEl ? senderEl.innerText : '';
    const senderEmail = senderEl ? senderEl.getAttribute('email') : 'unknown@example.com';
    const body = bodyEl ? bodyEl.innerText : '';

    // Reconstruct a pseudo-RFC822 string so our parser can read it
    const rawEmail = `From: "${senderName}" <${senderEmail}>\nSubject: ${subject}\n\n${body}`;
    return rawEmail;
  } catch (e) {
    return null;
  }
}
