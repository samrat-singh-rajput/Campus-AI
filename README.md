# 🚀 CampusMate AI — Production AI Career & Placement Platform

CampusMate AI is a modern, responsive, full-stack AI career and placement platform designed to help students analyze resumes, match placement opportunities with machine learning, practice voice technical mock interviews, track job applications, and receive autonomous career coaching.

---

## 🎨 System Architecture

```
                                  ┌───────────────────────────────────────────────────┐
                                  │            React 19 + TypeScript Client           │
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

## 🛠️ Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Axios
- **Backend Framework:** Python 3.13, FastAPI, Pydantic v2, Uvicorn, PyJWT, Bcrypt
- **Primary Database:** MongoDB Atlas (handled via `motor` async driver)
- **Vector Store & RAG:** Persistent ChromaDB (`./chroma_data`) with dense embeddings (`all-MiniLM-L6-v2`)
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

## 📋 Project Status Checklist (All 13 Steps Completed)

- [x] **STEP 1 — System Foundation Setup** (FastAPI + React + MongoDB Atlas + ChromaDB)
- [x] **STEP 2 — Authentication System** (JWT + Bcrypt UTF-8 password length validation)
- [x] **STEP 3 — Landing Page & Branding** (Credible metrics & demo student personas)
- [x] **STEP 4 — Dashboard & Navigation Layout** (Responsive sidebar & top header)
- [x] **STEP 5 — Resume Parsing & Upload Service** (PyPDF text extraction & ATS scoring)
- [x] **STEP 6 — Vector Embeddings & ChromaDB RAG Pipeline** (3 persistent collections)
- [x] **STEP 7 — ML Model Training & Recommendation Engine** (Scikit-Learn RandomForestClassifier)
- [x] **STEP 8 — Job Management & Application Matching Service** (Dual ML + Vector RAG score)
- [x] **STEP 9 — LangGraph Autonomous AI Agent** (Multi-tool stateful workflow)
- [x] **STEP 10 — AI Mock Interview Coach** (Question bank, voice speech-to-text, scorecards)
- [x] **STEP 11 — Analytics, Insights & Settings** (Career Readiness Score & skill manager)
- [x] **STEP 12 — Full Platform Integration & End-to-End Workflow** (10 verified integration points)
- [x] **STEP 13 — Production Polish, Security Review & Acceptance Verification** (Final build & UI polish)

---

## 🚀 Quick Start Guide

### 1. Backend Server Setup
```bash
cd server
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```
- API Swagger Docs: `http://127.0.0.1:8000/docs`
- Health Endpoint: `http://127.0.0.1:8000/api/health`

### 2. Frontend Client Setup
```bash
cd client
npm install
npm run dev
```
- Frontend UI: `http://localhost:5173`

---

## 🔒 Security & Environment Guardrails

- Secrets and `.env` files are excluded via `.gitignore`.
- Passwords are validated for UTF-8 length (72 bytes max) prior to Bcrypt hashing.
- All candidate API endpoints require valid JWT Authorization Bearer headers.
- User data isolation is strictly enforced across MongoDB Atlas collections.
