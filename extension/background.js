// background.js — Service Worker
// Acts as a relay so content scripts can fetch from http://localhost:8000
// without triggering Mixed Content or CORS blocks in the page context.

const API_BASE = 'http://localhost:8000';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyze_email') {
    const formData = new FormData();
    formData.append('raw_email', request.raw_email);

    fetch(`${API_BASE}/analyze`, {
      method: 'POST',
      body: formData
    })
      .then(r => r.json())
      .then(data => sendResponse({ ok: true, data }))
      .catch(err => sendResponse({ ok: false, error: err.message }));

    return true; // keep message channel open for async response
  }
});
