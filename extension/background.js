// background.js — Service Worker
// Relays analyze requests to local backend (localhost:8000) or Render cloud backend
// without triggering Mixed Content or CORS blocks in the page context.

const LOCAL_API = 'http://localhost:8000';
const CLOUD_API = 'https://sih26106-backend-t9r0.onrender.com';

async function analyzeWithFallback(rawEmail) {
  const formData = new FormData();
  formData.append('raw_email', rawEmail);

  // 1. Try local server first (fastest)
  try {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 2500);
    const res = await fetch(`${LOCAL_API}/analyze`, {
      method: 'POST',
      body: formData,
      signal: ctrl.signal
    });
    clearTimeout(tid);
    if (res.ok) return await res.json();
  } catch (err) {
    // Local server not running or timed out — fallback to Render cloud
  }

  // 2. Fallback to live Render cloud backend
  const resCloud = await fetch(`${CLOUD_API}/analyze`, {
    method: 'POST',
    body: formData
  });
  if (!resCloud.ok) {
    throw new Error(`Cloud API error ${resCloud.status}`);
  }
  return await resCloud.json();
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyze_email') {
    analyzeWithFallback(request.raw_email)
      .then(data => sendResponse({ ok: true, data }))
      .catch(err => sendResponse({ ok: false, error: err.message }));

    return true; // keep message channel open for async response
  }
});
