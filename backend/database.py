import sqlite3
import json
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "email_threat.db")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS analyses (
            id TEXT PRIMARY KEY,
            created_at TEXT,
            sender_email TEXT,
            sender_domain TEXT,
            subject TEXT,
            fraud_score INTEGER,
            risk_level TEXT,
            result_json TEXT
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS blockchain (
            block_index INTEGER PRIMARY KEY,
            analysis_id TEXT NOT NULL,
            analysis_hash TEXT NOT NULL,
            previous_block_hash TEXT NOT NULL,
            block_hash TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            FOREIGN KEY (analysis_id) REFERENCES analyses(id)
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS audit_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            event_type TEXT NOT NULL,
            analysis_id TEXT,
            details TEXT
        )
    ''')
    conn.commit()
    conn.close()

def save_analysis(analysis_dict):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    sender = analysis_dict.get("sender") or {}
    cursor.execute('''
        INSERT OR REPLACE INTO analyses (id, created_at, sender_email, sender_domain, subject, fraud_score, risk_level, result_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        analysis_dict.get("id"),
        analysis_dict.get("created_at"),
        sender.get("email", ""),
        sender.get("domain", ""),
        analysis_dict.get("subject", ""),
        analysis_dict.get("fraud_score", 0),
        analysis_dict.get("risk_level", "low"),
        json.dumps(analysis_dict)
    ))
    conn.commit()
    conn.close()

def get_analysis(analysis_id):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT result_json FROM analyses WHERE id = ?", (analysis_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return json.loads(row[0])
    return None


# ── Blockchain CRUD ─────────────────────────────────────────────────────────

def save_block(block: dict):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO blockchain (block_index, analysis_id, analysis_hash, previous_block_hash, block_hash, timestamp)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (
        block["block_index"],
        block["analysis_id"],
        block["analysis_hash"],
        block["previous_block_hash"],
        block["block_hash"],
        block["timestamp"],
    ))
    conn.commit()
    conn.close()

def get_latest_block() -> dict | None:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT block_index, analysis_id, analysis_hash, previous_block_hash, block_hash, timestamp FROM blockchain ORDER BY block_index DESC LIMIT 1")
    row = cursor.fetchone()
    conn.close()
    if row:
        return {
            "block_index": row[0],
            "analysis_id": row[1],
            "analysis_hash": row[2],
            "previous_block_hash": row[3],
            "block_hash": row[4],
            "timestamp": row[5],
        }
    return None

def get_block_by_analysis_id(analysis_id: str) -> dict | None:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT block_index, analysis_id, analysis_hash, previous_block_hash, block_hash, timestamp FROM blockchain WHERE analysis_id = ?", (analysis_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return {
            "block_index": row[0],
            "analysis_id": row[1],
            "analysis_hash": row[2],
            "previous_block_hash": row[3],
            "block_hash": row[4],
            "timestamp": row[5],
        }
    return None

def get_all_blocks() -> list[dict]:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT block_index, analysis_id, analysis_hash, previous_block_hash, block_hash, timestamp FROM blockchain ORDER BY block_index ASC")
    rows = cursor.fetchall()
    conn.close()
    return [
        {
            "block_index": r[0],
            "analysis_id": r[1],
            "analysis_hash": r[2],
            "previous_block_hash": r[3],
            "block_hash": r[4],
            "timestamp": r[5],
        }
        for r in rows
    ]
# ── History Queries (Tier 3) ────────────────────────────────────────────────

def query_history(limit: int = 20, offset: int = 0, risk_filter: str = None, search: str = None):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    query = "SELECT id, created_at, sender_email, subject, fraud_score, risk_level FROM analyses WHERE 1=1"
    params = []
    
    if risk_filter and risk_filter.lower() != 'all':
        query += " AND risk_level = ?"
        params.append(risk_filter.lower())
        
    if search:
        search_term = f"%{search}%"
        query += " AND (sender_email LIKE ? OR sender_domain LIKE ? OR subject LIKE ?)"
        params.extend([search_term, search_term, search_term])
        
    # Get total count before pagination
    cursor.execute(f"SELECT COUNT(*) FROM ({query})", params)
    total = cursor.fetchone()[0]
    
    # Add pagination
    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
    params.extend([limit, offset])
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    
    items = []
    for r in rows:
        items.append({
            "id": r[0],
            "created_at": r[1],
            "sender_email": r[2],
            "subject": r[3],
            "fraud_score": r[4],
            "risk_level": r[5]
        })
        
    return {"total": total, "items": items}

# ── Audit Log CRUD (Tier 3) ────────────────────────────────────────────────

import datetime

def save_audit_log(event_type: str, analysis_id: str = None, details: str = ""):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO audit_log (timestamp, event_type, analysis_id, details)
        VALUES (?, ?, ?, ?)
    ''', (datetime.datetime.utcnow().isoformat() + "Z", event_type, analysis_id, details))
    conn.commit()
    conn.close()
