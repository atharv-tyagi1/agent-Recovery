import re
import os

RULES = [
    {
        "type": "SQL Injection",
        "severity": "critical",
        "description": "User input directly concatenated into SQL query.",
        "impact": "Attackers can manipulate the query to bypass authentication, read unauthorized data, or modify/drop tables.",
        "owasp": "A03:2021-Injection",
        "cwe": "CWE-89",
        "patterns": [
            re.compile(r"f['\"]SELECT\s+.*\{.*\}.*['\"]", re.IGNORECASE),
            re.compile(r"execute\(\s*['\"]SELECT\s+.*\s*\+\s*.*['\"]\s*\)", re.IGNORECASE),
            re.compile(r"query\(\s*`.+?\$\{.+?\}.+?`\s*\)", re.IGNORECASE)
        ]
    },
    {
        "type": "Cross-Site Scripting (XSS)",
        "severity": "high",
        "description": "Unsanitized user input is rendered directly in the DOM.",
        "impact": "Attackers can execute malicious JavaScript in victims' browsers to steal session tokens or perform actions on their behalf.",
        "owasp": "A03:2021-Injection",
        "cwe": "CWE-79",
        "patterns": [
            re.compile(r"dangerouslySetInnerHTML\s*=\s*\{\{.*\}\}"),
            re.compile(r"\.innerHTML\s*=\s*"),
            re.compile(r"res\.send\(\s*`.*?\$\{.*?\}.*?`\s*\)"),
            re.compile(r"\{\{.*\|\s*safe\s*\}\}"),
            re.compile(r"Markup\("),
            re.compile(r"render_template_string\(")
        ]
    },
    {
        "type": "Hardcoded Secret",
        "severity": "critical",
        "description": "Sensitive credentials or secrets are hardcoded in source code.",
        "impact": "Anyone with access to the source code can extract these credentials and access sensitive systems or APIs.",
        "owasp": "A07:2021-Identification and Authentication Failures",
        "cwe": "CWE-798",
        "patterns": [
            re.compile(r"(API_KEY|SECRET_KEY|TOKEN|PASSWORD|PRIVATE_KEY)\s*=\s*['\"][A-Za-z0-9\-_]{16,}['\"]", re.IGNORECASE),
            re.compile(r"AKIA[0-9A-Z]{16}") # AWS Key
        ]
    },
    {
        "type": "Weak Authentication",
        "severity": "high",
        "description": "Insecure cryptographic hash or plaintext password comparison.",
        "impact": "Passwords can be easily cracked or reverse-engineered if the database is breached.",
        "owasp": "A02:2021-Cryptographic Failures",
        "cwe": "CWE-327",
        "patterns": [
            re.compile(r"hashlib\.md5\("),
            re.compile(r"hashlib\.sha1\("),
            re.compile(r"password\s*==\s*user\.password"),
            re.compile(r"password\s*=\s*['\"]\{password\}['\"]", re.IGNORECASE)
        ]
    },
    {
        "type": "Missing Authorization",
        "severity": "high",
        "description": "Protected route or action missing role or permission validation.",
        "impact": "Lower-privileged users or unauthenticated attackers can access admin features.",
        "owasp": "A01:2021-Broken Access Control",
        "cwe": "CWE-862",
        "patterns": [
            re.compile(r"@(app|router)\.(get|post|put|delete)\(['\"]/(admin|dashboard).*?['\"].*?\)", re.IGNORECASE),
            re.compile(r"router\.(get|post|put|delete)\(['\"]/(admin|dashboard).*?['\"].*?\)", re.IGNORECASE)
        ]
    }
]

def scan_file_for_vulnerabilities(filepath: str, root_dir: str):
    vulns = []
    rel_path = os.path.relpath(filepath, root_dir).replace('\\', '/')
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            content = "".join(lines)
            
            # Line-by-line matching
            for i, line in enumerate(lines):
                for rule in RULES:
                    for pattern in rule['patterns']:
                        if pattern.search(line):
                            vulns.append({
                                "type": rule["type"],
                                "severity": rule["severity"],
                                "file_path": rel_path,
                                "line_number": i + 1,
                                "description": rule["description"],
                                "impact": rule["impact"],
                                "owasp": rule["owasp"],
                                "cwe": rule["cwe"],
                                "confidence": 85, # Base confidence for regex matching
                                "matched_code": line.strip()
                            })
                            
            # Multi-line matching (e.g. for Missing Auth)
            for rule in RULES:
                for pattern in rule['patterns']:
                    if pattern.pattern.count(r'\n') > 0:
                        for match in pattern.finditer(content):
                            # Calculate line number from offset
                            line_no = content.count('\n', 0, match.start()) + 1
                            vulns.append({
                                "type": rule["type"],
                                "severity": rule["severity"],
                                "file_path": rel_path,
                                "line_number": line_no,
                                "description": rule["description"],
                                "impact": rule["impact"],
                                "owasp": rule["owasp"],
                                "cwe": rule["cwe"],
                                "confidence": 75,
                                "matched_code": match.group(0)[:100] + "..."
                            })
    except UnicodeDecodeError:
        pass # Ignore binary files
        
    return vulns

def run_detection(root_dir: str):
    all_vulns = []
    for root, dirs, files in os.walk(root_dir):
        # Skip node_modules etc
        dirs[:] = [d for d in dirs if d not in ['.git', 'node_modules', '__pycache__', 'venv']]
        for file in files:
            filepath = os.path.join(root, file)
            vulns = scan_file_for_vulnerabilities(filepath, root_dir)
            all_vulns.extend(vulns)
            
    # Deduplicate by type and line number
    unique_vulns = []
    seen = set()
    for v in all_vulns:
        key = f"{v['file_path']}:{v['line_number']}:{v['type']}"
        if key not in seen:
            seen.add(key)
            unique_vulns.append(v)
            
    return unique_vulns
