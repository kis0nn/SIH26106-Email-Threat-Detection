"""
NLP Scoring Module — Tier 2
Uses cybersectony/phishing-email-detection-distilbert_v2.4.1 (HuggingFace)
to classify emails as phishing/legitimate and contribute up to +25 points.

Model is loaded once at module level. If loading fails (no internet, missing
dependencies), the module logs a warning and all calls return None — the rest
of the pipeline continues with rule-based scoring only.
"""

import logging

logger = logging.getLogger(__name__)

# ── Model loading (module-level, once) ──────────────────────────────────────
_MODEL_NAME = "cybersectony/phishing-email-detection-distilbert_v2.4.1"
_classifier = None
_nlp_available = False

try:
    from transformers import pipeline as hf_pipeline
    _classifier = hf_pipeline(
        "text-classification",
        model=_MODEL_NAME,
        top_k=None,          # return all class probabilities
        truncation=True,
        max_length=512,
    )
    _nlp_available = True
    logger.info("✅ NLP model loaded successfully: %s", _MODEL_NAME)
except Exception as e:
    logger.warning(
        "⚠️  NLP model failed to load (%s). Falling back to rule-based-only mode. Error: %s",
        _MODEL_NAME, e,
    )


def is_available() -> bool:
    """Return True if the NLP model is loaded and ready."""
    return _nlp_available


def run_nlp_scoring(text: str) -> dict | None:
    """
    Run the phishing classifier on the given text (subject + body).

    Returns a dict with keys:
        score_contribution  (int, 0-25)
        probability         (float, 0-1)
        detail              (str)
    or None if the model is unavailable or inference fails.
    """
    if not _nlp_available or not _classifier:
        return None

    if not text or not text.strip():
        return None

    try:
        # Truncate input to avoid tokenizer issues with very long emails
        truncated = text[:2000]
        results = _classifier(truncated)

        if not results or not isinstance(results, list):
            return None

        # results is a list of lists: [[{label, score}, ...]]
        predictions = results[0] if isinstance(results[0], list) else results

        # Find the highest phishing-related probability
        phishing_prob = 0.0

        for pred in predictions:
            label = pred.get("label", "").lower().strip()
            score = pred.get("score", 0.0)

            # The model's phishing-positive labels
            if label in {"phishing", "spam", "malicious", "phishing url"}:
                phishing_prob = max(phishing_prob, score)

            # If the model uses "legitimate" label, phishing prob = 1 - legitimate
            if label in {"legitimate", "legitimate url", "safe"}:
                inverse_prob = 1.0 - score
                phishing_prob = max(phishing_prob, inverse_prob)

        # Convert probability to score contribution (capped at 25)
        score_contribution = min(25, round(phishing_prob * 25))

        # Only add a finding if probability > 0.5 (meaningful)
        if phishing_prob <= 0.5:
            return None

        confidence_pct = round(phishing_prob * 100)
        severity = "high" if phishing_prob > 0.75 else "medium"

        return {
            "score_contribution": score_contribution,
            "probability": round(phishing_prob, 4),
            "severity": severity,
            "detail": f"AI language model flagged this email as likely phishing with {confidence_pct}% confidence.",
        }

    except Exception as e:
        logger.warning("NLP inference failed: %s", e)
        return None
