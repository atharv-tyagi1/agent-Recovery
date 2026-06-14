# 👻 Agent Phantom

> AI-Powered Vulnerability Detection & Remediation Platform

Agent Phantom is an intelligent security analysis platform that automatically scans source code repositories, identifies security vulnerabilities, investigates their impact, generates remediation suggestions, and produces professional security reports.

Built as a hackathon MVP, Agent Phantom combines static analysis, AI-powered reasoning, repository exploration, automated fix generation, and security reporting into a single workflow.

---

## 🚀 Problem Statement

Modern software teams move fast, but security reviews often lag behind.

Common challenges include:

- Hidden vulnerabilities inside large codebases
- Time-consuming manual code reviews
- Lack of dedicated security engineers
- Delayed vulnerability remediation
- Poor visibility into security risks

Developers frequently discover security issues late in the development lifecycle, increasing both risk and remediation cost.

---

## 💡 Solution

Agent Phantom automates the security review process.

Instead of manually searching through thousands of lines of code, developers can upload a repository and receive:

- Security findings
- Vulnerability explanations
- Repository insights
- AI-generated remediation suggestions
- Security scoring
- Executive reports

All from a single platform.

---

## ✨ Features

### 🔍 Repository Scanning

Analyze uploaded source code repositories and automatically inspect project files.

### 🛡 Vulnerability Detection

Detect common security vulnerabilities such as:

- SQL Injection
- Cross-Site Scripting (XSS)
- Hardcoded Secrets
- Weak Authentication
- Missing Authorization

### 🧠 AI-Powered Analysis

Uses Large Language Models to:

- Validate findings
- Explain security risks
- Provide developer-friendly reasoning
- Generate remediation guidance

### 📂 Repository Explorer

Browse the scanned repository through an interactive explorer.

Features:

- File tree visualization
- Vulnerability highlighting
- File inspection

### 🔬 Investigation Timeline

Track how Agent Phantom reached its conclusions.

Shows:

- Analysis stages
- Security reasoning
- Investigation flow
- Detection confidence

### 🔧 AI Fix Recommendations

For every vulnerability Agent Phantom can provide:

- Vulnerable code
- Secure replacement
- Risk explanation
- Security best practices

### 📊 Security Scoring

Generate security scores based on:

- Vulnerability severity
- Risk exposure
- Potential impact

### 📄 Report Generation

Generate downloadable security reports containing:

- Executive summary
- Findings
- Severity breakdown
- Remediation recommendations

---

## 🏗 Architecture

```text
User Uploads Repository
            │
            ▼
     Repository Parser
            │
            ▼
  Vulnerability Detector
            │
            ▼
  AI Validation
            │
            ▼
     Fix Generation
            │
            ▼
  Security Score Engine
            │
            ▼
     Report Generator
            │
            ▼
         Dashboard
```

---

## 🛠 Technology Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Framer Motion
- Recharts

### Backend

- FastAPI
- Python
- SQLite
- HTTPX

### AI Layer

- Google Gemini API

### Reporting

- ReportLab

---

## 📸 Core Modules

- Dashboard
- Investigation
- Repository Explorer
- Fixes
- Reports
- Scan Complete

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/your-repository/agent-phantom.git
cd agent-phantom
```

### Backend Setup

```bash
cd backend

python -m venv venv
venv\Scripts\activate

pip install -r requirements.txt
```

Create a `.env` file:

```env
GEMINI_API_KEY=YOUR_API_KEY
DEMO_MODE=false
```

Start backend:

```bash
uvicorn main:app --reload
```

Backend runs on:

```text
http://localhost:8000
```

### Frontend Setup

```bash
cd frontend

npm install
npm run dev
```

Frontend runs on:

```text
http://localhost:3000
```

---

## 🧪 Demo Workflow

### Step 1
Upload a ZIP file containing source code.

### Step 2
Agent Phantom analyzes the repository.

### Step 3
Review vulnerabilities discovered.

### Step 4
Inspect findings in Repository Explorer.

### Step 5
Review AI-generated fixes.

### Step 6
Generate and download the security report.

---

## 🔮 Future Vision — Agent Phantom Recovery

Agent Phantom is the MVP.

The long-term vision is **Agent Phantom Recovery**, an autonomous security investigation and remediation agent.

### Future capabilities include:

#### 🤖 Multi-Agent Architecture

- Planner Agent
- Reasoner Agent
- Verifier Agent

#### 🔧 Tool Usage System

- File System Tool
- Terminal Tool
- Git Integration
- Browser Capabilities

#### 🕵️ Autonomous Investigation Workflow

```text
Goal
 ↓
Plan
 ↓
Analyze
 ↓
Investigate
 ↓
Generate Fix
 ↓
Verify
 ↓
Complete
```

Unlike traditional chatbots, Agent Phantom Recovery follows structured investigation workflows.

#### 🔄 Continuous Security Loop

```text
Goal
 ↓
Plan
 ↓
Act
 ↓
Observe
 ↓
Update Plan
 ↓
Act Again
 ↓
Repeat
```

The system continuously adapts until the objective is achieved.

#### ⚔ Exploit Chain Discovery

Future versions will be capable of:

```text
Vulnerability A
        +
Vulnerability B
        +
Vulnerability C
        ↓
Exploit Chain
        ↓
Validation
        ↓
Automated Fix
```

This allows deeper analysis than isolated vulnerability detection.

---

## 🎯 Hackathon Vision

Our goal is to make security analysis faster, more accessible, and more intelligent by combining static analysis, AI reasoning, and automated remediation into a unified developer experience.


**Project:** Agent Phantom  
**Future Platform:** Agent Phantom Recovery

Built for innovation, cybersecurity, and autonomous software security research.
