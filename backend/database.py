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
    conn.commit()
    conn.close()

def save_analysis(analysis_dict):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO analyses (id, created_at, sender_email, sender_domain, subject, fraud_score, risk_level, result_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        analysis_dict["id"],
        analysis_dict["created_at"],
        analysis_dict["sender"]["email"],
        analysis_dict["sender"]["domain"],
        analysis_dict["subject"],
        analysis_dict["fraud_score"],
        analysis_dict["risk_level"],
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
