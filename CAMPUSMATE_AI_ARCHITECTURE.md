# CAMPUSMATE AI — SYSTEM ARCHITECTURE & COMPONENT SPECIFICATION

> **Author**: Anuj Singh Rajput  
> **Project**: CampusMate AI  
> **Target Audience**: Software Engineers, System Architects, Technical Interviewers  

---

## 📌 OVERVIEW

This document outlines the software architecture, data flow patterns, module responsibilities, and system design specifications for **CampusMate AI**.

---

## 🎨 1. HIGH-LEVEL SYSTEM ARCHITECTURE

```
                                  ┌───────────────────────────────────────────────────┐
                                  │          React 19 + TypeScript Frontend           │
                                  │             (Vite + Tailwind CSS v4)              │
                                  └─────────┬───────────────────────┬─────────────────┘
                                            │                       │
                              Student HTTP  │                       │ Admin HTTP
                              Bearer JWT    │                       │ Bearer JWT
                                            ▼                       ▼
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

## 🏢 2. FRONTEND ARCHITECTURE LAYERS

The client is a single-page application (SPA) built with React 19, TypeScript, and Vite.

```
frontend/src/
├── App.tsx                        # Root Router & View State Controller
├── main.tsx                       # React DOM Entrypoint
├── App.css / index.css            # Tailwind CSS v4 Styles & Custom Utilities
├── services/                      # Modular Axios REST API Clients
│   ├── api.ts                     # Base Axios Client & Health Check
│   ├── authService.ts             # Student Registration & Login Client
│   ├── adminAuthService.ts        # Admin Login & Profile Client
│   ├── jobService.ts              # Job Matches & Recommendations Client
│   ├── applicationService.ts      # Application Kanban Pipeline Client
│   ├── resumeService.ts           # PDF Upload & ATS Parsing Client
│   ├── interviewService.ts        # Mock Interview Evaluation Client
│   ├── insightsService.ts         # Career Readiness Analytics Client
│   └── agentService.ts            # LangGraph Assistant Chat Client
├── layouts/
│   └── DashboardLayout.tsx        # Student View Frame (Header + Sidebar)
├── views/                         # Student Content Views
│   ├── DashboardView.tsx
│   ├── ResumeView.tsx
│   ├── JobsView.tsx
│   ├── ApplicationsView.tsx
│   ├── InterviewView.tsx
│   ├── InsightsView.tsx
│   ├── AssistantView.tsx
│   └── SettingsView.tsx
└── views/admin/                   # Admin Portal Views
    ├── AdminLoginPage.tsx
    ├── AdminDashboardView.tsx
    ├── AdminUsersView.tsx
    ├── AdminJobsView.tsx
    ├── AdminApplicationsView.tsx
    ├── AdminResumesView.tsx
    ├── AdminInterviewsView.tsx
    ├── AdminAnalyticsView.tsx
    ├── AdminSystemHealthView.tsx
    ├── AdminAuditLogsView.tsx
    └── AdminSettingsView.tsx
```

---

## ⚙️ 3. BACKEND SERVICE ARCHITECTURE

Built using FastAPI asynchronously with a 3-tier separation of concerns:

```
[HTTP Request] ──> [FastAPI Router (routes/*.py)] ──> [Service Layer (services/*.py)] ──> [Database Layer (database/*.py)]
```

### Key Service Modules

1. **`user_service.py`**: Handles student user account creation, profile lookup, and status updating in MongoDB Atlas.
2. **`security.py`**: Provides Bcrypt password hashing (`get_password_hash`), password verification, JWT access token generation, and FastAPI auth dependencies (`get_current_user`, `get_current_admin`).
3. **`resume_parser.py`**: Extracts text from PDF bytes via `pypdf`, categorizes skills across 6 technical domains using regex boundary checks, evaluates section headers, and computes the 0-100 ATS score.
4. **`resume_service.py`**: Manages candidate resume document persistence in MongoDB Atlas.
5. **`ml_engine.py`**: Loads the pre-trained Scikit-Learn `RandomForestClassifier` (`job_eligibility_model.joblib`), extracts 5-feature candidate vectors, predicts job eligibility probability, and outputs eligibility classifications (`High Fit`, `Moderate Fit`, `Unlikely Fit`).
6. **`rag_service.py`**: Manages persistent ChromaDB collections, generates 384-d dense vector embeddings (`all-MiniLM-L6-v2`), and executes semantic vector similarity queries.
7. **`job_service.py`**: Manages job drive postings in MongoDB Atlas and runs ML eligibility predictions across all campus drives.
8. **`application_service.py`**: Processes candidate job applications, computes the **Dual Match Score** ($60\% \text{ ML Score} + 40\% \text{ Vector Similarity}$), and handles application Kanban status updates.
9. **`interview_service.py`**: Manages technical mock interview question selection by domain, scores candidate answers based on concept coverage (70%) and length clarity (30%), and updates interview session summaries in MongoDB.
10. **`insights_service.py`**: Computes the candidate **Career Readiness Score (0-100%)** aggregating ATS score (35%), verified skills (20%), high fit jobs (20%), mock interview performance (15%), and application activity (10%).
11. **`agent_engine.py`**: Orchestrates stateful multi-tool agent execution using LangGraph (`StateGraph`), evaluating intent and executing underlying backend services before synthesizing Markdown responses.
12. **`admin_analytics_service.py`**: Executes MongoDB aggregation queries to generate executive admin metrics, candidate score distributions, and hiring funnel reports.
13. **`audit_service.py`**: Records immutable administrative security event logs (`admin_username`, `action`, `details`, `ip_address`, `timestamp`).

---

## 🗄️ 4. DATA TIER SPECIFICATION

```
                                  ┌───────────────────────────┐
                                  │      CampusMate AI        │
                                  │        Data Tier          │
                                  └─────────────┬─────────────┘
                                                │
                       ┌────────────────────────┴────────────────────────┐
                       ▼                                                 ▼
             ┌──────────────────┐                              ┌──────────────────┐
             │  MongoDB Atlas   │                              │     ChromaDB     │
             │   (Document DB)  │                              │   (Vector DB)    │
             └─────────┬────────┘                              └─────────┬────────┘
                       │                                                 │
      ┌────────────────┼────────────────┐              ┌─────────────────┼────────────────┐
      ▼                ▼                ▼              ▼                 ▼                ▼
┌───────────┐    ┌───────────┐    ┌───────────┐  ┌───────────┐     ┌───────────┐    ┌───────────┐
│   users   │    │  resumes  │    │   jobs    │  │knowledge  │     │  resumes  │    │   jobs    │
└───────────┘    └───────────┘    └───────────┘  └───────────┘     └───────────┘    └───────────┘
      │                │                │
      ▼                ▼                ▼
┌───────────┐    ┌───────────┐    ┌───────────┐
│admin_users│    │apps/interv│    │audit_logs │
└───────────┘    └───────────┘    └───────────┘
```

---

## 🔒 5. SECURITY & ROLE-BASED ACCESS CONTROL (RBAC) FLOW

```
                  ┌──────────────────────────────────────────────┐
                  │    Incoming HTTP Request to /api/admin/*     │
                  └──────────────────────┬───────────────────────┘
                                         │
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │   FastAPI Dependency: get_current_admin      │
                  └──────────────────────┬───────────────────────┘
                                         │
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │        Extract & Verify JWT Bearer           │
                  └──────────────────────┬───────────────────────┘
                                         │ Valid Signature?
                         ┌───────────────┴───────────────┐
                         │ YES                           │ NO
                         ▼                               ▼
          ┌─────────────────────────────┐  ┌──────────────────────────┐
          │  Check User Role in Payload │  │ Return HTTP 401          │
          └──────────────┬──────────────┘  │ Unauthorized             │
                         │                 └──────────────────────────┘
             ┌───────────┴───────────┐
             │ role == "admin"?      │
             ▼                       ▼
     ┌───────────────┐       ┌─────────────────┐
     │ YES: Proceed  │       │ NO: Return      │
     │ to Route      │       │ HTTP 403        │
     └───────────────┘       │ Forbidden       │
                             └─────────────────┘
```

---

## 📜 COPYRIGHT & AUTHORSHIP

<div align="center">

### **CampusMate AI — Architecture & System Design Specification**

**© 2026 Anuj Singh Rajput. All Rights Reserved.**

</div>
