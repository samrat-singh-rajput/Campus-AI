# 🚀 CampusMate AI — Production AI Career & Placement Platform

CampusMate AI is a modern, responsive, full-stack AI career and placement platform designed to help students analyze resumes, match placement opportunities with machine learning, practice voice technical mock interviews, track job applications, and receive autonomous career coaching.

---

## 📂 Monorepo Project Structure

```
Campus-AI/
│
├── frontend/                     # React + TypeScript + Vite Client
│   ├── public/
│   ├── src/
│   │   ├── components/           # UI components (Header, Sidebar, StatCards, etc.)
│   │   ├── layouts/              # Dashboard and Navigation layouts
│   │   ├── views/                # Full views (Jobs, Applications, Resume, Assistant, etc.)
│   │   └── services/             # Axios REST API client modules
│   ├── package.json
│   └── vite.config.ts            # Vite config with /api proxy to http://127.0.0.1:8000
│
├── backend/                      # FastAPI + Python 3.13 Backend
│   ├── app/
│   │   ├── config/               # Settings & environment configuration
│   │   ├── database/             # MongoDB Atlas & ChromaDB connectors
│   │   ├── routes/               # FastAPI REST endpoints
│   │   ├── schemas/              # Pydantic data schemas
│   │   ├── services/             # Core business logic, ML engine, & RAG agent
│   │   └── main.py               # FastAPI application entrypoint
│   ├── models/                   # Trained Random Forest Scikit-Learn model (.joblib)
│   ├── chroma_data/              # Persistent ChromaDB vector database storage
│   ├── requirements.txt
│   ├── .env
│   └── .env.example
│
├── package.json                  # Root package.json with single-command runner (concurrently)
├── .gitignore
└── README.md
```

---

## 🎨 System Architecture

```
                                  ┌───────────────────────────────────────────────────┐
                                  │          React 19 + TypeScript Frontend           │
                                  │                 (Vite + Tailwind CSS)             │
                                  └─────────────────────────┬─────────────────────────┘
                                                            │ HTTP / REST API (JWT)
                                                            ▼
                                  ┌───────────────────────────────────────────────────┐
                                  │              FastAPI Backend Server               │
                                  │           (Python 3.13, Pydantic, Motor)          │
                                  └─────────┬───────────────────┬───────────────────┬─┘
                                            │                   │                   │
                     MongoDB Protocol       │                   │ Vector DB Client  │ Model Inference
                                            ▼                   ▼                   ▼
                                   ┌─────────────────┐ ┌─────────────────┐ ┌──────────────────┐
                                   │  MongoDB Atlas  │ │ Persistent      │ │ Scikit-Learn     │
                                   │  (Primary DB)   │ │ ChromaDB        │ │ RandomForest     │
                                   │  - Users        │ │ (Vector DB)     │ │ Classifier       │
                                   │  - Resumes      │ │ - Knowledge     │ │ - 95.8% Accuracy │
                                   │  - Jobs         │ │ - Resumes       │ │ - 5-Feature      │
                                   │  - Applications │ │ - Jobs          │ │   Vector Pipeline│
                                   │  - Interviews   │ └─────────────────┘ └──────────────────┘
                                   └─────────────────┘
                                            ▲
                                            │ LangGraph StateGraph Orchestration
                                            └──────────────────────────────────────┐
                                                                                   │
                                                                         ┌──────────────────┐
                                                                         │ LangGraph Agent  │
                                                                         │ (Multi-Tool RAG) │
                                                                         └──────────────────┘
```

---

## ⚡ Single Command Development

You can launch both the **Frontend UI** (`http://localhost:5173`) and **Backend Server** (`http://127.0.0.1:8000`) with a single command from the root directory:

```bash
npm run dev
```

This runs both servers concurrently:
- **Frontend:** React 19 + Vite (`http://localhost:5173`)
- **Backend:** FastAPI + Uvicorn (`http://127.0.0.1:8000`) via `backend/.venv/Scripts/python.exe`

### Individual Command Fallbacks
If you prefer running services separately:

```bash
# Frontend only
npm run dev:frontend

# Backend only
npm run dev:backend

# Production Frontend Build
npm run build
```

---

## 🛠️ Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Axios
- **Backend Framework:** Python 3.13, FastAPI, Pydantic v2, Uvicorn, PyJWT, Bcrypt
- **Primary Database:** MongoDB Atlas (handled via `motor` async driver)
- **Vector Store & RAG:** Persistent ChromaDB (`backend/chroma_data`) with dense embeddings (`all-MiniLM-L6-v2`)
- **Machine Learning Engine:** Scikit-Learn `RandomForestClassifier` (100 estimators, 95.83% classification accuracy)
- **Autonomous Agent:** LangGraph `StateGraph` multi-tool autonomous state orchestration
- **Resume Parsing:** PyPDF text extraction + 6-category technical skill taxonomy parser
- **Speech-to-Text:** Web Speech API voice dictation for mock interviews

---

## ✨ Key Platform Features

1. **JWT Authentication & Security:**
   - User registration and login with Bcrypt password hashing and UTF-8 72-byte password length validation.
   - Protected API routes with token authentication and data isolation.

2. **PyPDF Resume Parsing & ATS Scoring:**
   - Extracts contact details, 6-category technical skills taxonomy with canonical casing, and computes ATS compatibility score (0-100).
   - Automatically indexes parsed candidate resumes into ChromaDB collection `campusmate_resumes`.

3. **ChromaDB Vector Store & RAG Engine:**
   - Stores dense 384-dimensional vector embeddings for campus knowledge, candidate resumes, and job postings.
   - Provides REST APIs and semantic vector similarity search explorer.

4. **Scikit-Learn Random Forest ML Job Recommendation:**
   - Evaluates candidate skill vectors against job postings using a 5-feature Random Forest model (*Skill Match Ratio, Matched Skill Count, Degree Fit Score, Normalized ATS Score, Missing Skill Count*).
   - Ranks placement opportunities and classifies candidates into *High Fit*, *Moderate Fit*, and *Unlikely Fit*.

5. **Dual Matching Engine & Application Kanban Tracker:**
   - Combines Random Forest ML score (60% weight) with ChromaDB Vector Similarity score (40% weight) to calculate a unified Dual Match Score.
   - Visual 4-column application pipeline tracker (*Applied, Interviewing, Offered, Saved*) with status lifecycle management.

6. **LangGraph Autonomous AI Agent & RAG Assistant:**
   - Stateful `StateGraph` agent executing real backend tools (*resume analysis, ML job recommendations, application tracker, vector similarity search*).

7. **AI Mock Interview Coach:**
   - Technical & behavioral question banks by domain (*Full Stack, AI/ML, Backend, System Design*).
   - Hands-free voice speech-to-text dictation and instant AI response evaluation (score, strengths, missing concepts, ideal sample answer).

8. **AI Career Insights & Analytics Hub:**
   - Calculates a unified **Career Readiness Score (0-100%)** combining ATS rating, skills count, job fit, interview scores, and application pipeline activity.
   - User profile settings editor and verified skill vector chip manager.

---

## 🔒 Security & Environment Guardrails

- Secrets and `.env` files are excluded via `.gitignore`.
- Passwords are validated for UTF-8 length (72 bytes max) prior to Bcrypt hashing.
- All candidate API endpoints require valid JWT Authorization Bearer headers.
- User data isolation is strictly enforced across MongoDB Atlas collections.
