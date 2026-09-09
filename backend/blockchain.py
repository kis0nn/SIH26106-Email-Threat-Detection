"""
Blockchain-Style Tamper-Evident Audit Chain — Tier 2
SHA-256 hash chaining for forensic audit trail.
"""

import hashlib
import json
import datetime
import logging

from database import (
    save_block, get_latest_block, get_all_blocks, get_block_by_analysis_id,
)

logger = logging.getLogger(__name__)


def _canonical_json(data: dict) -> str:
    """Produce a deterministic JSON string for hashing."""
    return json.dumps(data, sort_keys=True, ensure_ascii=True, default=str)


def _sha256(text: str) -> str:
    """Compute SHA-256 hex digest of a string."""
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def create_block(analysis_result: dict) -> dict:
    """
    Create a new block in the audit chain for the given analysis result.

    Returns:
        {
            "block_index": int,
            "analysis_hash": str,
            "previous_block_hash": str,
            "block_hash": str,
            "timestamp": str (ISO 8601)
        }
    """
    # 1. Hash the analysis result
    analysis_hash = _sha256(_canonical_json(analysis_result))

    # 2. Get the previous block
    latest = get_latest_block()
    if latest:
        previous_block_hash = latest["block_hash"]
        block_index = latest["block_index"] + 1
    else:
        # Genesis block
        previous_block_hash = "0"
        block_index = 1

    # 3. Compute block hash
    timestamp = datetime.datetime.utcnow().isoformat() + "Z"
    block_hash = _sha256(previous_block_hash + analysis_hash + timestamp)

    # 4. Build the block
    block = {
        "block_index": block_index,
        "analysis_id": analysis_result.get("id", ""),
        "analysis_hash": analysis_hash,
        "previous_block_hash": previous_block_hash,
        "block_hash": block_hash,
        "timestamp": timestamp,
    }

    # 5. Persist
    save_block(block)

    # Return the receipt (without analysis_id, that's internal)
    return {
        "block_index": block_index,
        "analysis_hash": analysis_hash,
        "previous_block_hash": previous_block_hash,
        "block_hash": block_hash,
        "timestamp": timestamp,
    }


def verify_chain(analysis_id: str) -> dict:
    """
    Recompute the chain from genesis to the target analysis and verify integrity.

    Returns:
        {
            "verified": bool,
            "block_index": int | None,
            "chain_length": int
        }
    """
    all_blocks = get_all_blocks()  # ordered by block_index ASC

    if not all_blocks:
        return {"verified": False, "block_index": None, "chain_length": 0}

    target_block_index = None
    verified = True
    expected_prev_hash = "0"  # genesis

    for block in all_blocks:
        # Verify that previous_block_hash matches what we expect
        if block["previous_block_hash"] != expected_prev_hash:
            verified = False
            break

        # Verify the block_hash is correctly computed
        recomputed = _sha256(
            block["previous_block_hash"] + block["analysis_hash"] + block["timestamp"]
        )
        if recomputed != block["block_hash"]:
            verified = False
            break

        expected_prev_hash = block["block_hash"]

        if block["analysis_id"] == analysis_id:
            target_block_index = block["block_index"]

    return {
        "verified": verified,
        "block_index": target_block_index,
        "chain_length": len(all_blocks),
    }
