// background.js — Service Worker
// Relays analyze requests to local backend (localhost:8000) or Render cloud backend
// without triggering Mixed Content or CORS blocks in the page context.

const LOCAL_API = 'http://localhost:8000';
const CLOUD_API = 'https://sih26106-backend-t9r0.onrender.com';

async function analyzeWithFallback(rawEmail) {
  const payload = JSON.stringify({ raw_email: rawEmail });
  const headers = { 'Content-Type': 'application/json' };

  // 1. Try local server first (2.5s quick probe)
  try {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 2500);
    const res = await fetch(`${LOCAL_API}/analyze`, {
      method: 'POST',
      headers: headers,
      body: payload,
      signal: ctrl.signal
    });
    clearTimeout(tid);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // Local server not running or timed out — fallback to Render cloud
  }

  // 2. Fallback to live Render cloud backend
  try {
    const resCloud = await fetch(`${CLOUD_API}/analyze`, {
      method: 'POST',
      headers: headers,
      body: payload
    });
    if (resCloud.ok) {
      return await resCloud.json();
    }
    throw new Error(`Cloud API returned HTTP ${resCloud.status}`);
  } catch (cloudErr) {
    throw new Error(`Could not reach local backend or cloud backend: ${cloudErr.message}`);
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyze_email') {
    analyzeWithFallback(request.raw_email)
      .then(data => sendResponse({ ok: true, data }))
      .catch(err => sendResponse({ ok: false, error: err.message }));

    return true; // keep message channel open for async response
  }
});
