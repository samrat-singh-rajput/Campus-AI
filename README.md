<p align="center">
  <img src="frontend/public/logo.png" alt="CampusMate AI Logo" width="220"/>
</p>

<h1 align="center">CampusMate AI</h1>

<p align="center">
  <b>Production-Grade AI-Powered Campus Career, Placement & Student Success Platform</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React"/>
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS"/>
  <img src="https://img.shields.io/badge/FastAPI-0.109-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI"/>
  <img src="https://img.shields.io/badge/Python-3.13-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python"/>
  <img src="https://img.shields.io/badge/MongoDB_Atlas-4.0-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB Atlas"/>
  <img src="https://img.shields.io/badge/ChromaDB-Vector_DB-FF6F61?style=for-the-badge&logo=database&logoColor=white" alt="ChromaDB"/>
  <img src="https://img.shields.io/badge/Scikit--Learn-Random_Forest-F7931E?style=for-the-badge&logo=scikitlearn&logoColor=white" alt="Scikit-Learn"/>
  <img src="https://img.shields.io/badge/License-Copyright-blue?style=for-the-badge" alt="License"/>
</p>

---

## 📌 Overview

**CampusMate AI** is an enterprise-level, full-stack campus career management and placement intelligence platform. Designed to bridge the gap between students, recruiters, and placement officers, CampusMate AI combines automated resume parsing, ATS scoring, intelligent job matching, interactive mock interviews, and autonomous career guidance with a comprehensive administrative analytics suite.

The platform provides a unified ecosystem for:
- 🎓 **Students**: Instant ATS resume feedback, skill extraction, intelligent job recommendations, Kanban application tracking, real-time voice technical mock interviews, interactive career insights, and a stateful AI career assistant.
- 🛡️ **Administrators & Placement Officers**: Real-time platform KPI monitoring, student roster management, job posting lifecycle controls, application pipeline analytics, resume distribution tracking, AI interview scorecards, system health telemetry, security audit logging, and administrative settings.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
  - [Student Portal](#-student-portal)
  - [Admin Panel](#-admin-panel)
- [Technology Stack](#-technology-stack)
- [System Architecture](#-system-architecture)
- [Complete Project Structure](#-complete-project-structure)
- [Database Architecture](#-database-architecture)
- [Environment Configuration](#-environment-configuration)
- [Installation \& Setup](#-installation--setup)
- [Running the Application](#-running-the-application)
- [How to Use CampusMate AI — User Guide](#-how-to-use-campusmate-ai--user-guide)
  - [Student Workflow](#student-workflow)
  - [Admin Workflow](#admin-workflow)
- [Admin Routes Reference](#-admin-routes-reference)
- [API Overview](#-api-overview)
- [Authentication \& Security](#-authentication--security)
- [Development \& Build Commands](#-development--build-commands)
- [Troubleshooting](#-troubleshooting)
- [Future Enhancements](#-future-enhancements)
- [License \& Copyright](#-license--copyright)

---

## ✨ Key Features

### 🎓 Student Portal

#### 🔐 Authentication & Session Control
- Secure user registration and login with bcrypt password hashing and JWT session validation.
- Sanitized authentication payloads with user data isolation across all endpoints.
- Persistent session state with seamless auto-login on browser refresh.

#### 📄 Smart Resume Parser
- Upload PDF resumes to extract structured contact info, education, and technical skills automatically.
- Identifies technical skills across key domains (Programming, Web Development, Databases, Cloud & DevOps, Machine Learning, Data Science).

#### 📊 ATS Resume Scoring & Analysis
- Computes a comprehensive **ATS Compatibility Rating (0–100%)** based on section completeness, skill density, formatting, and industry benchmarks.
- Provides actionable improvement suggestions, identified missing keywords, and section-by-section breakdown.

#### 🤖 Intelligent Job Matching
- Matches student profiles and resume skills against active campus placement opportunities.
- Ranks candidate compatibility (*High Fit*, *Moderate Fit*, *Unlikely Fit*) to highlight relevant career opportunities.

#### 💼 Job Applications & Kanban Pipeline
- One-click application submission for campus job postings.
- Visual 4-column application pipeline tracker (*Applied*, *Interviewing*, *Offered*, *Saved*) with drag-and-drop status updates and real-time backend state sync.

#### 🎤 AI Voice Mock Technical Interview
- Domain-specific mock interview sessions (*Full-Stack*, *Backend Engineering*, *AI/ML*, *System Design*).
- Hands-free speech-to-text dictation using the Web Speech API.
- Instant AI response evaluation providing score cards, strengths, missing conceptual keywords, and sample answers.

#### 🧠 AI Career Assistant (LangGraph RAG Engine)
- Stateful AI career agent capable of retrieving resume stats, querying job postings, tracking application statuses, and answering placement-related queries in real time.

#### 📈 Career Readiness & Analytics Hub
- Calculates a unified **Career Readiness Score (0–100%)** aggregating ATS score, skill coverage, application activity, and mock interview performance.
- Interactive profile manager to update verified skills, degree info, and career preferences.

---

### 🛡️ Admin Panel

#### 🔑 Protected Admin Authentication & RBAC
- Dedicated `/admin/login` portal protected by server-side Role-Based Access Control (RBAC).
- Requires administrator privileges (`role: admin`) for all administrative endpoints.

#### 📊 Admin Executive Dashboard
- Overview of key platform metrics: total students, active job postings, application throughput, average ATS score, and mock interview completion rates.
- Quick action shortcuts to user management, job creation, system health, and audit logs.

#### 👥 Student User Management
- Search, filter, and paginate through the complete student directory.
- Detailed student profile modal displaying uploaded resume details, ATS scores, skill chips, application history, and account activity.
- Account status controls to enable or disable student access.

#### 💼 Job Postings Management
- Post new campus recruitment drives with detailed requirements, salary range, location, and eligibility criteria.
- Edit existing job postings, update status (*Active*, *Closed*), or safely remove postings without breaking application integrity.

#### 📩 Applications Lifecycle Management
- Centralized view of all student job applications across all campus postings.
- Update application stages (*Applied*, *Interviewing*, *Offered*, *Rejected*) and view applicant resumes directly.

#### 📄 Resume & ATS Analytics
- Aggregate ATS score distribution charts across the candidate pool.
- Top extracted skills frequency metrics identifying campus skill trends and talent gaps.

#### 🎤 Interview & AI Analytics
- Telemetry on mock interview practice volume, domain-wise popularity, and average score distributions.
- Review student interview transcripts and AI scorecards.

#### 🖥️ System Health & Infrastructure Telemetry
- Real-time status monitoring for primary backend API, MongoDB Atlas database latency, ChromaDB vector store health, and system memory/CPU usage.

#### 📊 Reports & Advanced Analytics
- Comprehensive analytical reports covering student placement readiness, funnel conversion rates, ATS performance, and recruitment stats.

#### 🛡️ Administrative Audit Logs
- Comprehensive activity logging for all administrative actions (logins, job creation, user status changes, settings updates).
- Filterable timeline with administrative username, action type, client IP address, and timestamp.

#### ⚙️ Admin Settings & Security Credentials
- Update administrator profile details and change admin account passwords securely.
- Inspect system database metrics and deployment configurations.

---

## 🛠️ Technology Stack

| Category | Technology | Usage / Purpose |
| :--- | :--- | :--- |
| **Frontend Core** | React 19, TypeScript, Vite 6 | User interface architecture, component state, & fast HMR bundling |
| **Styling & UI** | Tailwind CSS v4, Lucide Icons | Responsive modern dark-theme styling & UI icons |
| **HTTP Client** | Axios | RESTful API communication with JWT interceptors |
| **Backend Framework** | Python 3.13, FastAPI, Uvicorn | High-performance asynchronous REST API server |
| **Schema Validation** | Pydantic v2 | Strict request/response payload validation and serialization |
| **Primary Database** | MongoDB Atlas (Motor driver) | Asynchronous cloud storage for users, jobs, applications, interviews & logs |
| **Vector Store** | ChromaDB (Persistent) | Vector database for semantic RAG search & knowledge indexing |
| **Machine Learning** | Scikit-Learn (Random Forest) | 5-feature Random Forest job fit classification model |
| **AI Orchestration** | LangGraph (StateGraph) | Stateful multi-tool agent execution for AI assistant |
| **Document Processing** | PyPDF | Server-side PDF resume text extraction and skill parsing |
| **Speech Processing** | Web Speech API | Client-side speech-to-text dictation for mock interviews |
| **Authentication** | PyJWT, Passlib (Bcrypt) | JWT token signing, verification & Bcrypt password hashing |

---

## 🏗️ System Architecture

```
                                  ┌───────────────────────────────────────────────────┐
                                  │          React 19 + TypeScript Frontend           │
                                  │             (Vite + Tailwind CSS v4)              │
                                  └─────────────────────────┬─────────────────────────┘
                                                            │ HTTP / REST API (Bearer JWT)
                                                            ▼
                                  ┌───────────────────────────────────────────────────┐
                                  │              FastAPI Backend Server               │
                                  │          (Python 3.13, Pydantic, Motor)           │
                                  └─────────┬───────────────────┬───────────────────┬─┘
                                            │                   │                   │
                     MongoDB Async Driver   │                   │ Vector DB Client  │ Model Inference
                                            ▼                   ▼                   ▼
                                   ┌─────────────────┐ ┌─────────────────┐ ┌──────────────────┐
                                   │  MongoDB Atlas  │ │ Persistent      │ │ Scikit-Learn     │
                                   │  (Primary DB)   │ │ ChromaDB        │ │ RandomForest     │
                                   │  - Users        │ │ (Vector DB)     │ │ Classifier       │
                                   │  - Resumes      │ │ - Embeddings    │ │ - Job Matching   │
                                   │  - Jobs         │ │ - Knowledge     │ │ - Feature Vector │
                                   │  - Applications │ └─────────────────┘ └──────────────────┘
                                   │  - Interviews   │
                                   │  - Audit Logs   │
                                   └─────────────────┘
                                            ▲
                                            │ LangGraph Orchestration
                                            └──────────────────────────────────────┐
                                                                                   │
                                                                         ┌──────────────────┐
                                                                         │ LangGraph Agent  │
                                                                         │ (Multi-Tool RAG) │
                                                                         └──────────────────┘
```

---

## 📂 Complete Project Structure

```
Campus-AI/
│
├── frontend/                             # React + TypeScript + Vite Client
│   ├── public/                           # Static assets (logo.png, logo-icon.png, favicon.svg, icons.svg)
│   ├── src/
│   │   ├── assets/                       # UI visual assets (hero.png, logo.png, logo-icon.png)
│   │   ├── components/                   # Student UI components
│   │   │   ├── admin/                    # Admin components (AdminSidebar, AdminHeader, Modals)
│   │   │   └── dashboard/                # Student dashboard widgets (RecommendedJobs, StatCards, etc.)
│   │   ├── layouts/                      # Layout wrappers (DashboardLayout)
│   │   ├── services/                     # Frontend API clients (api, authService, adminAuthService, etc.)
│   │   ├── views/                        # Student views (JobsView, ResumeView, ApplicationsView, etc.)
│   │   │   └── admin/                    # Admin views (AdminDashboardView, AdminUsersView, etc.)
│   │   ├── App.tsx                       # Main application router & view switcher
│   │   ├── App.css                       # Global custom CSS rules
│   │   ├── index.css                     # Tailwind CSS imports & theme tokens
│   │   └── main.tsx                      # React entrypoint
│   ├── package.json                      # Frontend dependencies & Vite scripts
│   ├── tsconfig.json                     # TypeScript project configuration
│   └── vite.config.ts                    # Vite dev server configuration & /api proxy
│
├── backend/                              # FastAPI + Python 3.13 Backend
│   ├── app/
│   │   ├── config/                       # Application settings & environment variables
│   │   │   └── settings.py
│   │   ├── database/                     # Database connectors
│   │   │   ├── mongodb.py                # MongoDB Atlas connection pool & Motor async client
│   │   │   └── chromadb.py               # ChromaDB client & vector store manager
│   │   ├── routes/                       # REST API endpoint routers
│   │   │   ├── admin.py                  # Admin authentication, users, jobs, analytics & audit routes
│   │   │   ├── agent.py                  # LangGraph AI assistant agent endpoint
│   │   │   ├── applications.py           # Job application tracking endpoints
│   │   │   ├── auth.py                   # Student authentication endpoints (register, login, me)
│   │   │   ├── health.py                 # System health telemetry endpoint
│   │   │   ├── insights.py               # Career insights endpoint
│   │   │   ├── interview.py              # Mock interview start & submission endpoints
│   │   │   ├── jobs.py                   # Student job listings & recommendation endpoints
│   │   │   ├── rag.py                    # ChromaDB semantic vector search endpoint
│   │   │   └── resume.py                 # PDF resume upload & parsing endpoints
│   │   ├── schemas/                      # Pydantic data schemas & validators
│   │   ├── services/                     # Business logic services
│   │   │   ├── admin_analytics_service.py # Admin metrics & reporting service
│   │   │   ├── agent_engine.py           # LangGraph autonomous agent engine
│   │   │   ├── application_service.py    # Application management service
│   │   │   ├── audit_service.py          # Administrative audit logging service
│   │   │   ├── ml_engine.py              # Random Forest ML model inference engine
│   │   │   ├── rag_service.py            # ChromaDB vector embedding & RAG service
│   │   │   ├── resume_parser.py          # PyPDF text extractor & skill taxonomy parser
│   │   │   └── security.py               # Password hashing & JWT token verification
│   │   └── main.py                       # FastAPI application factory & CORS configuration
│   ├── models/                           # Machine Learning model binaries
│   │   └── job_eligibility_model.joblib  # Trained Random Forest Scikit-Learn model
│   ├── chroma_data/                      # Persistent ChromaDB vector database storage
│   ├── uploads/                          # Server-side resume PDF upload directory
│   ├── requirements.txt                  # Python dependencies
│   ├── .env.example                      # Environment variable template
│   └── test_step2_verification.py        # Automated backend API verification test suite
│
├── scratch/                              # Automated integration test scripts for admin APIs
│   ├── test_admin_auth.py
│   ├── test_admin_users.py
│   ├── test_admin_jobs_apps.py
│   └── ...
├── package.json                          # Root package runner (concurrently launcher)
├── .gitignore                            # Git ignore configuration
└── README.md                             # Project documentation
```

---

## 🗄️ Database Architecture

CampusMate AI utilizes **MongoDB Atlas** for document persistence and **ChromaDB** for vector storage.

### MongoDB Collections

- **`users`**: Stores student user documents (name, email, password hash, college, degree, graduation year, verified skills, creation date, status).
- **`admin_users`**: Stores administrator account credentials, roles, and last login timestamps.
- **`resumes`**: Stores extracted resume details, candidate contact info, technical skill tags, computed ATS score, and raw text metadata.
- **`jobs`**: Stores campus recruitment postings (job title, company, description, location, required skills, salary range, status, created date).
- **`applications`**: Stores student job applications, application status (*Applied*, *Interviewing*, *Offered*, *Saved*), match scores, and application dates.
- **`interviews`**: Stores mock technical interview sessions, domain, responses, AI scores, feedback, and timestamp.
- **`audit_logs`**: Stores administrative activity logs (admin username, action type, details, client IP, timestamp).

---

## ⚙️ Environment Configuration

To configure CampusMate AI locally or in production, create a `.env` file inside the `backend/` directory:

```env
# Server Configuration
HOST=127.0.0.1
PORT=8000
ENVIRONMENT=development

# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://your_user:your_password@cluster.mongodb.net/campusmate_db?retryWrites=true&w=majority
DB_NAME=campusmate_db

# Security & Authentication
JWT_SECRET=your_super_secret_jwt_key_here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Initial Admin Credentials (for seed/bootstrap)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_admin_password

# LLM & AI Integration (Optional / RAG)
OPENAI_API_KEY=your_openai_api_key_here
```

> [!CAUTION]
> Never commit your actual `.env` file or database credentials to version control. The `.gitignore` file is configured to exclude sensitive configuration files automatically.

---

## 📥 Installation & Setup

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **Python**: `v3.11` to `v3.13`
- **MongoDB Atlas Account** (or local MongoDB v6.0+)

### 1. Clone the Repository

```bash
git clone https://github.com/samrat-singh-rajput/Campus-AI.git
cd Campus-AI
```

### 2. Frontend Setup

```bash
cd frontend
npm install
cd ..
```

### 3. Backend Setup

```bash
cd backend
# Create Python virtual environment
python -m venv .venv

# Activate virtual environment
# Windows (PowerShell):
.venv\Scripts\Activate.ps1
# macOS / Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env from template
cp .env.example .env
cd ..
```

---

## 🚀 Running the Application

### Option 1: Single Command Launcher (Recommended)

From the root directory, launch both the Frontend UI and Backend FastAPI server concurrently:

```bash
npm run dev
```

This single command starts:
- 🌐 **Frontend UI**: [http://localhost:5173](http://localhost:5173)
- ⚙️ **Backend API**: [http://127.0.0.1:8000](http://127.0.0.1:8000)

### Option 2: Run Frontend and Backend Separately

```bash
# Terminal 1 (Frontend):
npm run dev:frontend

# Terminal 2 (Backend):
npm run dev:backend
```

---

## 🧭 How to Use CampusMate AI — User Guide

### Student Workflow

1. **Sign Up / Login**: Navigate to [http://localhost:5173/](http://localhost:5173/), click **Get Started**, select **Register**, fill in your details, and log in.
2. **Dashboard Overview**: View your career readiness score, quick shortcuts, recommended placement drives, and application stats.
3. **Upload Resume**: Go to **Resume** from the sidebar, upload your PDF resume, and review your calculated **ATS Compatibility Score**, extracted skills, and keyword suggestions.
4. **Explore Jobs**: Visit **Jobs** to view available campus drives, see your personalized **Fit Score**, filter by domain, and submit applications with one click.
5. **Track Applications**: Go to **Applications** to manage your submissions on the interactive **Kanban Board** (*Applied*, *Interviewing*, *Offered*, *Saved*).
6. **Practice Technical Interviews**: Open **Mock Interview**, choose a domain (*Full-Stack*, *Backend*, *AI/ML*), enable microphone dictation, answer questions, and view instant AI scoring feedback.
7. **Ask AI Assistant**: Open **AI Assistant** to query placement guidelines, check job eligibility, or seek career advice in real time.
8. **View Career Insights**: Check **Insights** to view readiness progression, skill gap analyses, and market demand stats.

### Admin Workflow

1. **Admin Login**: Navigate to [http://localhost:5173/admin/login](http://localhost:5173/admin/login), enter your administrator credentials, and authenticate.
2. **Executive Overview**: Review total enrolled candidates, active recruitment drives, total applications, and overall ATS health.
3. **Manage Students**: Open **Users** to search candidate records, view uploaded resumes, check application history, or toggle student account access.
4. **Manage Job Drives**: Go to **Jobs** to post new campus hiring drives, update job specifications, or close completed drives.
5. **Manage Applications**: Open **Applications** to monitor student progress across hiring pipelines and update candidate application stages.
6. **Inspect System Health**: Navigate to **System Health** to inspect backend API state, MongoDB Atlas database latency, and ChromaDB vector store memory footprint.
7. **Audit Logs & Reports**: Check **Audit Logs** to view timestamped administrative security logs, and use **Analytics** to view campus placement reports.

---

## 🔗 Admin Routes Reference

| Admin Route | View Component | Description | Access |
| :--- | :--- | :--- | :--- |
| `/admin/login` | `AdminLoginPage.tsx` | Secure administrator login portal | Public |
| `/admin/dashboard` | `AdminDashboardView.tsx` | Executive KPI dashboard & platform metrics | Admin Only |
| `/admin/users` | `AdminUsersView.tsx` | Student roster management & profile inspection | Admin Only |
| `/admin/jobs` | `AdminJobsView.tsx` | Campus placement drive creation & management | Admin Only |
| `/admin/applications` | `AdminApplicationsView.tsx` | Application tracking & lifecycle management | Admin Only |
| `/admin/resumes` | `AdminResumesView.tsx` | Pool-wide ATS score analytics & skill metrics | Admin Only |
| `/admin/interviews` | `AdminInterviewsView.tsx` | Mock interview usage & candidate scorecards | Admin Only |
| `/admin/analytics` | `AdminAnalyticsView.tsx` | Comprehensive reports & placement analytics | Admin Only |
| `/admin/system-health` | `AdminSystemHealthView.tsx` | Real-time database & backend server telemetry | Admin Only |
| `/admin/audit-logs` | `AdminAuditLogsView.tsx` | Security audit timeline & action log search | Admin Only |
| `/admin/settings` | `AdminSettingsView.tsx` | Admin account profile & security settings | Admin Only |

---

## 📡 API Overview

The FastAPI backend exposes structured RESTful API endpoints:

| Endpoint Group | Base Path | Primary Purpose |
| :--- | :--- | :--- |
| **Auth** | `/api/auth` | Student registration (`/register`), login (`/login`), and profile (`/me`) |
| **Admin** | `/api/admin` | Admin authentication (`/login`), user management, jobs CRUD, audit logs, system health |
| **Jobs** | `/api/jobs` | Retrieve job listings, job details, and ML recommendation scores |
| **Applications** | `/api/applications` | Submit applications, update status stages, and fetch application history |
| **Resumes** | `/api/resume` | PDF upload (`/upload`), text parsing, ATS scoring, and skill extraction |
| **Interviews** | `/api/interview` | Start interview session (`/start`), submit responses (`/evaluate`), and get history |
| **RAG Assistant** | `/api/agent` | Stateful LangGraph AI career assistant chat endpoint |
| **Vector Search** | `/api/rag` | Semantic vector similarity search across ChromaDB collections |
| **Insights** | `/api/insights` | Career readiness score and market demand stats |
| **Health** | `/api/health` | Live backend API status and database latency check |

---

## 🔒 Authentication & Security

- **Password Security**: Passwords are validated for length prior to hashing using `bcrypt` via `passlib`.
- **JWT Session Tokens**: Authenticated routes require standard `Authorization: Bearer <token>` HTTP headers.
- **Server-Side Authorization**: Administrative routes enforce role verification (`role: admin`). Unauthorized student requests return `HTTP 403 Forbidden`.
- **Payload Sanitization**: Sensitive database fields (`password`, `passwordHash`) are excluded from JSON API responses.
- **Audit Trails**: All administrative operations generate immutable audit records capturing timestamp, action details, and client IP address.

---

## 🛠️ Development & Build Commands

```bash
# Run full development stack (Frontend + Backend concurrently)
npm run dev

# Run frontend dev server only
npm run dev:frontend

# Run backend dev server only
npm run dev:backend

# Build frontend production bundle (runs tsc type-check & vite build)
npm run build --prefix frontend

# Run backend automated API verification suite
backend\.venv\Scripts\python.exe backend\test_step2_verification.py
```

---

## ❓ Troubleshooting

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| **Backend connection error (`10061`)** | Backend server is not running on port `8000`. | Run `npm run dev` or launch backend manually via `.venv\Scripts\python.exe -m uvicorn app.main:app --port 8000` inside `backend/`. |
| **Port `8000` already in use (`10013`)** | An existing Uvicorn or Python process is occupying port 8000. | Stop existing processes using `stop-process` or `taskkill /PID <PID> /F` after finding PID with `netstat -ano \| findstr :8000`. |
| **MongoDB Atlas connection timeout** | Incorrect `MONGODB_URI` or IP address not whitelisted in Atlas. | Verify credentials in `backend/.env` and ensure your IP address is allowed under Network Access in MongoDB Atlas. |
| **Frontend build fail (`tsc` error)** | Mismatched TypeScript types or broken component imports. | Run `npm run build --prefix frontend` to view error line and verify component imports. |

---

## 🔮 Future Enhancements

- 🎥 **Video AI Mock Interview Analysis**: Add optional facial expression and posture evaluation during mock interviews.
- 🏢 **Recruiter Portal**: Dedicated third-party company dashboard to post hiring drives directly and search candidate ATS scores.
- 📱 **Mobile Application**: Native React Native mobile client for real-time application status notifications.
- 📄 **Automated Resume Builder**: WYSIWYG resume creation tool with AI bullet point optimizer.

---

## 📜 License & Copyright

<div align="center">

### **CampusMate AI — AI-Powered Campus Career & Placement Platform**

**© 2026 Anuj Singh Rajput. All Rights Reserved.**

---

</div>

This project, its source code, visual design, architecture, documentation, and original assets were created by **Anuj Singh Rajput** for academic, portfolio, and educational demonstration purposes.

Unauthorized reproduction, redistribution, commercial resale, or unauthorized deployment of this project or substantial portions of its source code without prior written consent from the author is strictly prohibited. Developers may study and inspect the code for learning and educational evaluation while respecting attribution and ownership.

<br/>

<div align="center">
  <b>Developer:</b> Anuj Singh Rajput &nbsp;|&nbsp; <b>Project:</b> CampusMate AI &nbsp;|&nbsp; <b>Year:</b> 2026<br/><br/>
  ⭐ <i>Built with passion for students, career success & artificial intelligence.</i>
</div>
