# 🚀 CampusMate AI — Your AI Career Companion

CampusMate AI is a production-quality, modern, attractive, and responsive full-stack AI career platform designed to help students analyze resumes, match jobs, evaluate eligibility, practice AI mock interviews, and track applications.

---

## 🎨 Architecture Diagram

```
                     ┌─────────────────────────────────────────────────┐
                     │            React + TypeScript Client            │
                     │                 (Vite + Tailwind)               │
                     └────────────────────────┬────────────────────────┘
                                              │ HTTP / REST API
                                              ▼
                     ┌─────────────────────────────────────────────────┐
                     │              FastAPI Backend Server             │
                     │          (Python, Pydantic, Motor, JWT)         │
                     └────────┬───────────────────────┬────────────────┘
                              │                       │
         MongoDB Protocol     │                       │ Direct Persistent Client
                              ▼                       ▼
                     ┌─────────────────┐     ┌─────────────────┐
                     │  MongoDB Atlas  │     │ Persistent      │
                     │  (Primary DB)   │     │ ChromaDB        │
                     │  - Users        │     │ (Vector DB)     │
                     │  - Resumes      │     │ - Resume chunks │
                     │  - Jobs         │     │ - Career guides │
                     │  - Applications │     │ - Job vectors   │
                     │  - Interviews   │     └─────────────────┘
                     └─────────────────┘
```

---

## 🛠️ Technology Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Axios, React Router
- **Backend:** Python 3.13, FastAPI, Pydantic, Uvicorn, PyJWT, Passlib
- **Primary Database:** MongoDB Atlas (handled via `motor` async driver)
- **Vector Database:** Persistent ChromaDB (`./chroma_data`)
- **RAG & AI Pipeline:** Embeddings + ChromaDB + Similarity Retrieval + LLM API
- **AI Agent:** LangGraph with custom modular tools
- **Machine Learning:** Scikit-Learn Random Forest model for job match scoring

---

## 📋 Implementation Progress Checklist

- [x] **STEP 1 — Foundation Setup**
  - [x] Client structure (React + TypeScript + Vite + Tailwind CSS)
  - [x] Server structure (FastAPI + Pydantic + Motor + Persistent ChromaDB)
  - [x] Configuration (.env, settings.py)
  - [x] MongoDB Atlas connector module (`app/database/mongodb.py`)
  - [x] Persistent ChromaDB vector store module (`app/database/chromadb.py`)
  - [x] System health endpoints (`/api/health`, `/api/health/db`, `/api/health/chroma`)
  - [x] Client-Server REST API integration verified
- [ ] **STEP 2 — Authentication System (JWT)**
- [ ] **STEP 3 — Landing Page & Branding**
- [ ] **STEP 4 — Dashboard & Navigation Layout**
- [ ] **STEP 5 — Resume Parsing & Upload Service**
- [ ] **STEP 6 — RAG Vector Embedding & ChromaDB Pipeline**
- [ ] **STEP 7 — Machine Learning Job Recommendation Model**
- [ ] **STEP 8 — Job Management & Eligibility Engine**
- [ ] **STEP 9 — LangGraph AI Agent Orchestration**
- [ ] **STEP 10 — AI Mock Interview Coach**
- [ ] **STEP 11 — Application Kanban Tracker**
- [ ] **STEP 12 — User Profile & Settings**
- [ ] **STEP 13 — Production Polish & Final Acceptance Verification**

---

## 🚀 How to Run (Development)

### Backend (FastAPI)
```bash
cd server
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
FastAPI Swagger docs available at: `http://127.0.0.1:8000/docs`

### Frontend (React + Vite)
```bash
cd client
npm install
npm run dev
```
Frontend UI available at: `http://localhost:5173`
