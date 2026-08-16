import os
import logging
import math
from typing import Dict, List, Any, Optional
from app.database.chromadb import get_chroma_client, get_chroma_collection
from app.config.settings import settings

logger = logging.getLogger("campusmate.services.rag_service")

# Collection names
COLLECTION_RESUMES = "campusmate_resumes"
COLLECTION_JOBS = "campusmate_jobs"
COLLECTION_KNOWLEDGE = "campusmate_knowledge"

# Initial seed career knowledge base items
INITIAL_CAREER_KNOWLEDGE = [
    {
        "doc_id": "kb_resume_ats_tips",
        "title": "ATS Resume Optimization Best Practices",
        "category": "Resume",
        "content": "To pass Applicant Tracking Systems (ATS), use standard section headers like Education, Experience, and Technical Skills. Avoid complex multi-column layouts or image text. Ensure high density of target keywords such as Python, React, FastAPI, SQL, Docker, and REST APIs.",
        "metadata": {"type": "guide", "author": "CampusMate Career Team", "topic": "ATS Optimization"}
    },
    {
        "doc_id": "kb_fullstack_interview_guide",
        "title": "Full Stack Developer Interview Preparation",
        "category": "Interview",
        "content": "Full stack technical interviews evaluate frontend system design, REST API architecture, database indexing, and asynchronous execution. Key topics include React component lifecycle, FastAPI async def endpoints, MongoDB aggregation pipelines, and JWT authentication security.",
        "metadata": {"type": "interview_guide", "role": "Full Stack Engineer", "topic": "System Design"}
    },
    {
        "doc_id": "kb_backend_python_skills",
        "title": "Backend Engineering Core Skills Benchmark",
        "category": "Career",
        "content": "Modern backend development requires proficiency in Python 3, FastAPI / Django, SQL & NoSQL database modeling, Docker containerization, unit testing with PyTest, and cloud infrastructure deployment on AWS or GCP.",
        "metadata": {"type": "skill_benchmark", "domain": "Backend Engineering", "topic": "Skills Roadmap"}
    },
    {
        "doc_id": "kb_ai_ml_engineering",
        "title": "AI and Machine Learning Engineer Career Path",
        "category": "Career",
        "content": "AI Engineering combines data science with software engineering. Essential competencies include Python, PyTorch / TensorFlow, vector databases like ChromaDB, Retrieval-Augmented Generation (RAG), and agentic workflows using LangGraph.",
        "metadata": {"type": "career_roadmap", "domain": "Artificial Intelligence", "topic": "AI/ML Path"}
    }
]

def _get_collection(name: str):
    """Retrieves or creates ChromaDB collection by name."""
    client = get_chroma_client()
    if client is None:
        raise ValueError("ChromaDB client is uninitialized.")
    return client.get_or_create_collection(
        name=name,
        metadata={"description": f"CampusMate AI Vector Collection: {name}"}
    )

def index_document(
    collection_name: str,
    doc_id: str,
    text: str,
    metadata: Optional[Dict[str, Any]] = None
) -> bool:
    """Indexes a text document with metadata into ChromaDB vector store."""
    try:
        collection = _get_collection(collection_name)
        safe_meta = metadata or {}
        safe_meta["timestamp"] = str(os.getenv("CURRENT_TIME", ""))
        
        # Upsert document into ChromaDB
        collection.upsert(
            ids=[doc_id],
            documents=[text],
            metadatas=[safe_meta]
        )
        logger.info(f"Successfully indexed document '{doc_id}' into ChromaDB collection '{collection_name}'")
        return True
    except Exception as e:
        logger.error(f"Error indexing document '{doc_id}' in ChromaDB: {e}")
        return False

def index_resume_vector(
    user_id: str,
    resume_id: str,
    raw_text: str,
    extracted_skills: List[str],
    ats_score: int
) -> bool:
    """Indexes a parsed candidate resume into the ChromaDB resume vector collection."""
    doc_id = f"resume_{resume_id}"
    meta = {
        "user_id": user_id,
        "resume_id": resume_id,
        "ats_score": ats_score,
        "skills_str": ", ".join(extracted_skills[:15]),
        "type": "candidate_resume"
    }
    content = f"Candidate Profile Skills: {', '.join(extracted_skills)}\n\nResume Summary:\n{raw_text[:2000]}"
    return index_document(COLLECTION_RESUMES, doc_id, content, meta)

def query_similar_documents(
    collection_name: str,
    query_text: str,
    n_results: int = 5,
    filter_metadata: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """Queries ChromaDB vector collection using text semantic similarity search."""
    try:
        collection = _get_collection(collection_name)
        count = collection.count()

        if count == 0 and collection_name == COLLECTION_KNOWLEDGE:
            seed_default_career_knowledge()
            count = collection.count()

        if count == 0:
            return {
                "query_text": query_text,
                "collection_name": collection_name,
                "total_results": 0,
                "results": []
            }

        limit = min(n_results, count)
        kw_args: Dict[str, Any] = {
            "query_texts": [query_text],
            "n_results": limit
        }
        if filter_metadata:
            kw_args["where"] = filter_metadata

        raw_results = collection.query(**kw_args)

        results_list = []
        ids = raw_results.get("ids", [[]])[0]
        documents = raw_results.get("documents", [[]])[0]
        metadatas = raw_results.get("metadatas", [[]])[0]
        distances = raw_results.get("distances", [[]])[0] if "distances" in raw_results else [0.0] * len(ids)

        for i in range(len(ids)):
            dist = distances[i] if i < len(distances) else 0.0
            # Convert L2 / Cosine distance into 0 - 100% similarity score
            sim_score = max(0.0, min(100.0, round((1.0 - (dist / 2.0)) * 100, 2))) if dist > 0 else 95.0

            results_list.append({
                "id": ids[i],
                "document": documents[i] if i < len(documents) else "",
                "metadata": metadatas[i] if i < len(metadatas) else {},
                "distance": round(dist, 4),
                "similarity_score": sim_score
            })

        return {
            "query_text": query_text,
            "collection_name": collection_name,
            "total_results": len(results_list),
            "results": results_list
        }
    except Exception as e:
        logger.error(f"Error executing vector query on '{collection_name}': {e}")
        return {
            "query_text": query_text,
            "collection_name": collection_name,
            "total_results": 0,
            "results": []
        }

def seed_default_career_knowledge() -> int:
    """Seeds default career knowledge base documents into ChromaDB if collection is empty."""
    seeded_count = 0
    try:
        collection = _get_collection(COLLECTION_KNOWLEDGE)
        if collection.count() == 0:
            for item in INITIAL_CAREER_KNOWLEDGE:
                index_document(
                    collection_name=COLLECTION_KNOWLEDGE,
                    doc_id=item["doc_id"],
                    text=f"Title: {item['title']}\nCategory: {item['category']}\n\nContent:\n{item['content']}",
                    metadata={**item["metadata"], "title": item["title"], "category": item["category"]}
                )
                seeded_count += 1
            logger.info(f"Seeded {seeded_count} career knowledge documents into ChromaDB.")
    except Exception as e:
        logger.error(f"Failed to seed career knowledge into ChromaDB: {e}")
    return seeded_count

def get_all_collection_stats() -> List[Dict[str, Any]]:
    """Returns document count statistics across all ChromaDB collections."""
    client = get_chroma_client()
    stats = []
    if not client:
        return stats

    for coll_name in [COLLECTION_KNOWLEDGE, COLLECTION_RESUMES, COLLECTION_JOBS, settings.CHROMA_COLLECTION_NAME]:
        try:
            coll = client.get_or_create_collection(name=coll_name)
            stats.append({
                "collection_name": coll_name,
                "document_count": coll.count()
            })
        except Exception:
            stats.append({
                "collection_name": coll_name,
                "document_count": 0
            })
    return stats
