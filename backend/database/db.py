import sqlite3
import os

DB_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(DB_DIR, "phantom.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Create Scans table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS scans (
            id TEXT PRIMARY KEY,
            repository_name TEXT,
            status TEXT,
            score_before INTEGER,
            score_after INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Create Vulnerabilities table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS vulnerabilities (
            id TEXT PRIMARY KEY,
            scan_id TEXT,
            type TEXT,
            severity TEXT,
            file_path TEXT,
            line_number INTEGER,
            description TEXT,
            impact TEXT,
            confidence INTEGER,
            FOREIGN KEY(scan_id) REFERENCES scans(id)
        )
    ''')

    # Create Fixes table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS fixes (
            id TEXT PRIMARY KEY,
            vulnerability_id TEXT,
            before_code TEXT,
            after_code TEXT,
            explanation TEXT,
            owasp TEXT,
            cwe TEXT,
            FOREIGN KEY(vulnerability_id) REFERENCES vulnerabilities(id)
        )
    ''')

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print(f"Database initialized at {DB_PATH}")
