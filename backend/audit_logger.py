"""
Audit Logger — Tier 3
Records key lifecycle events for chain-of-custody compliance.
Events: analysis_started, analysis_completed, report_generated, verification_requested
"""

import logging
from database import save_audit_log

logger = logging.getLogger(__name__)


def log_event(event_type: str, analysis_id: str = None, details: str = ""):
    """
    Log an audit event.
    
    Args:
        event_type: One of 'analysis_started', 'analysis_completed',
                    'report_generated', 'verification_requested'
        analysis_id: Related analysis UUID (if applicable)
        details: Additional context string
    """
    try:
        save_audit_log(event_type, analysis_id, details)
        logger.info("AUDIT [%s] analysis=%s %s", event_type, analysis_id or "N/A", details)
    except Exception as e:
        logger.warning("Failed to write audit log: %s", e)
