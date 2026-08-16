import re
import uuid
import logging
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from bson import ObjectId
from app.database.mongodb import get_database

logger = logging.getLogger("campusmate.services.interview_service")

# Comprehensive Interview Question Bank
QUESTION_BANK: Dict[str, List[Dict[str, Any]]] = {
    "Full Stack Engineering": [
        {
            "question_id": "fs_q1",
            "category": "Frontend & APIs",
            "question_text": "Explain how Client-Side Rendering (CSR) differs from Server-Side Rendering (SSR) in React/Next.js, and how REST APIs communicate between them.",
            "key_concepts": ["csr", "client-side", "ssr", "server-side", "next.js", "react", "rest", "api"],
            "ideal_response": "CSR renders HTML in the browser via JavaScript, offering fast page transitions but slower initial loads and weak SEO. SSR generates HTML on the server per request, optimizing SEO and first contentful paint. REST APIs act as data bridges sending JSON between React components and FastAPI backends."
        },
        {
            "question_id": "fs_q2",
            "category": "State & Security",
            "question_text": "How do JWT tokens handle authentication in full-stack web applications, and how do you protect against XSS and CSRF security vulnerabilities?",
            "key_concepts": ["jwt", "token", "authentication", "xss", "csrf", "cookie", "httponly", "header"],
            "ideal_response": "JWTs encapsulate user identity digitally signed with a secret. To prevent XSS, tokens shouldn't be stored in localStorage; instead, HttpOnly secure cookies or in-memory state with Authorization Bearer headers are preferred alongside CSRF token validation."
        },
        {
            "question_id": "fs_q3",
            "category": "Database Architecture",
            "question_text": "When would you choose MongoDB NoSQL over a relational SQL database like PostgreSQL for a campus placement platform?",
            "key_concepts": ["mongodb", "nosql", "postgresql", "sql", "schema", "document", "json", "scaling"],
            "ideal_response": "MongoDB is ideal for flexible, evolving document schemas like candidate resumes, skill vectors, and unstructured JSON data. PostgreSQL is preferred when strict ACID transactions, complex foreign key relations, and structured financial data are required."
        }
    ],
    "AI & Machine Learning": [
        {
            "question_id": "ml_q1",
            "category": "Vector DB & RAG",
            "question_text": "Describe the architecture of Retrieval-Augmented Generation (RAG) using ChromaDB vector embeddings and how cosine similarity ranks relevant context.",
            "key_concepts": ["rag", "chromadb", "vector embeddings", "cosine similarity", "llm", "context", "semantic search"],
            "ideal_response": "RAG chunks text documents, converts them into dense vector embeddings, and stores them in ChromaDB. When a user queries, the query is embedded and ranked via cosine similarity distance to retrieve exact relevant grounded context for LLM generation."
        },
        {
            "question_id": "ml_q2",
            "category": "Classification Models",
            "question_text": "How does a Random Forest Classifier prevent overfitting compared to a single decision tree when evaluating candidate job eligibility?",
            "key_concepts": ["random forest", "decision tree", "overfitting", "ensemble", "bagging", "bootstrap", "variance"],
            "ideal_response": "Random Forest is an ensemble method combining multiple decision trees trained on bootstrap samples with random feature subsets. Averaging predictions across trees reduces model variance and prevents individual decision trees from overfitting."
        }
    ],
    "Backend Engineering": [
        {
            "question_id": "be_q1",
            "category": "Async & REST",
            "question_text": "Explain Python asyncio execution and async def endpoints in FastAPI. How do they handle concurrent HTTP requests efficiently?",
            "key_concepts": ["asyncio", "fastapi", "event loop", "non-blocking", "concurrency", "await", "performance"],
            "ideal_response": "FastAPI leverages Python's asyncio event loop. When an async endpoint awaits I/O operations like database calls or external APIs, the event loop pauses execution and handles other incoming HTTP requests concurrently without blocking main threads."
        }
    ]
}

def get_questions_for_domain(domain: str, count: int = 3) -> List[Dict[str, Any]]:
    """Retrieves interview questions for target domain."""
    questions = QUESTION_BANK.get(domain, QUESTION_BANK["Full Stack Engineering"])
    return questions[:count]

def evaluate_candidate_answer(
    question_id: str,
    candidate_answer: str,
    domain: str = "Full Stack Engineering"
) -> Dict[str, Any]:
    """Evaluates candidate response text against key technical concepts and answer clarity."""
    clean_ans = candidate_answer.strip()
    ans_lower = clean_ans.lower()
    words = re.findall(r'\w+', ans_lower)
    word_count = len(words)

    # Locate question details
    target_q = None
    all_qs = []
    for q_list in QUESTION_BANK.values():
        all_qs.extend(q_list)
    for q in all_qs:
        if q["question_id"] == question_id:
            target_q = q
            break

    if not target_q:
        target_q = QUESTION_BANK["Full Stack Engineering"][0]

    key_concepts = target_q["key_concepts"]
    matched_concepts = [c for c in key_concepts if c.lower() in ans_lower]
    missing_concepts = [c for c in key_concepts if c.lower() not in ans_lower]

    concept_match_ratio = len(matched_concepts) / len(key_concepts) if key_concepts else 1.0

    # Score calculation (0-100)
    tech_score = int(concept_match_ratio * 70)
    length_score = 30 if word_count >= 30 else int((word_count / 30) * 30)
    overall_score = min(100, tech_score + length_score)

    if overall_score >= 85:
        rating = "Mastered"
    elif overall_score >= 70:
        rating = "Proficient"
    elif overall_score >= 50:
        rating = "Developing"
    else:
        rating = "Needs Practice"

    strengths = []
    if concept_match_ratio >= 0.5:
        strengths.append(f"Successfully covered core concepts: {', '.join(matched_concepts[:3])}.")
    if word_count >= 30:
        strengths.append("Provided a detailed explanation with sufficient technical length.")

    feedback = []
    if missing_concepts:
        feedback.append(f"To improve, explicitly mention {', '.join(missing_concepts[:3])}.")
    if word_count < 30:
        feedback.append("Elaborate further on architectural trade-offs and real-world implementation details.")

    return {
        "question_id": question_id,
        "score": overall_score,
        "rating": rating,
        "clarity_score": length_score * 3 + 10,
        "technical_accuracy_score": tech_score,
        "strengths": strengths if strengths else ["Attempted question structure."],
        "missing_concepts": missing_concepts,
        "improvement_feedback": " ".join(feedback) if feedback else "Excellent answer!",
        "ideal_sample_response": target_q["ideal_response"]
    }

async def create_interview_session(
    user_id: str,
    domain: str,
    difficulty: str,
    question_count: int
) -> Dict[str, Any]:
    """Creates a new mock interview session."""
    session_id = f"int_sess_{uuid.uuid4().hex[:8]}"
    questions = get_questions_for_domain(domain, question_count)

    session_doc = {
        "session_id": session_id,
        "user_id": user_id,
        "domain": domain,
        "difficulty": difficulty,
        "questions": [
            {
                "question_id": q["question_id"],
                "category": q["category"],
                "question_text": q["question_text"],
                "key_concepts": q["key_concepts"]
            }
            for q in questions
        ],
        "status": "In Progress",
        "created_at": datetime.now(timezone.utc)
    }

    db = get_database()
    if db is not None:
        await db.interviews.insert_one(session_doc)
        logger.info(f"Created interview session in MongoDB Atlas for user {user_id} (Session: {session_id})")

    return session_doc

async def complete_interview_session(
    session_id: str,
    user_id: str,
    evaluations: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """Computes aggregate scores for a completed interview session and updates MongoDB Atlas."""
    db = get_database()
    domain = "Full Stack Engineering"
    if db is not None:
        sess = await db.interviews.find_one({"session_id": session_id, "user_id": user_id})
        if sess and "domain" in sess:
            domain = sess["domain"]

    scores = [e["score"] for e in evaluations]
    avg_score = round(sum(scores) / len(scores), 1) if scores else 0.0

    if avg_score >= 85:
        overall_rating = "Mastered"
    elif avg_score >= 70:
        overall_rating = "Proficient"
    else:
        overall_rating = "Developing"

    summary_doc = {
        "session_id": session_id,
        "user_id": user_id,
        "domain": domain,
        "total_questions": len(evaluations),
        "average_score": avg_score,
        "overall_rating": overall_rating,
        "feedback_summary": f"Completed mock interview with average score of {avg_score}%. Rating: {overall_rating}.",
        "created_at": datetime.now(timezone.utc)
    }

    db = get_database()
    if db is not None:
        await db.interviews.update_one(
            {"session_id": session_id, "user_id": user_id},
            {"$set": {"status": "Completed", "summary": summary_doc, "evaluations": evaluations}}
        )

    return summary_doc

async def get_user_interview_history(user_id: str) -> List[Dict[str, Any]]:
    """Retrieves past interview session summaries for the authenticated user."""
    db = get_database()
    if db is None:
        return []

    cursor = db.interviews.find({"user_id": user_id, "status": "Completed"}).sort("created_at", -1)
    docs = await cursor.to_list(length=50)
    
    summaries = []
    for d in docs:
        if "summary" in d:
            summaries.append(d["summary"])
    return summaries
