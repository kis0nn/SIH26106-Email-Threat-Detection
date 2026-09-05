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
