import logging
from typing import Dict, Any
from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.rag import (
    SearchQueryRequest, 
    SearchQueryResponse, 
    KnowledgeDocumentRequest, 
    RAGStatsResponse
)
from app.routes.auth import get_current_user
from app.database.chromadb import chroma_instance
from app.config.settings import settings
from app.services.rag_service import (
    query_similar_documents, 
    index_document, 
    seed_default_career_knowledge, 
    get_all_collection_stats,
    COLLECTION_KNOWLEDGE
)

logger = logging.getLogger("campusmate.routes.rag")
router = APIRouter(prefix="/api/rag", tags=["Vector Embeddings & RAG Service"])

@router.post("/search", response_model=SearchQueryResponse, status_code=status.HTTP_200_OK)
async def search_vector_store(
    req: SearchQueryRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Performs semantic vector similarity search on persistent ChromaDB collection."""
    res = query_similar_documents(
        collection_name=req.collection_name,
        query_text=req.query_text,
        n_results=req.n_results,
        filter_metadata=req.filter_metadata
    )
    return SearchQueryResponse(**res)

@router.post("/index-knowledge", status_code=status.HTTP_201_CREATED)
async def add_knowledge_document(
    doc: KnowledgeDocumentRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Indexes a career knowledge document into ChromaDB vector store."""
    meta = doc.metadata or {}
    meta["title"] = doc.title
    meta["category"] = doc.category
    meta["created_by"] = current_user.get("email", "system")

    full_text = f"Title: {doc.title}\nCategory: {doc.category}\n\nContent:\n{doc.content}"
    success = index_document(
        collection_name=COLLECTION_KNOWLEDGE,
        doc_id=doc.doc_id,
        text=full_text,
        metadata=meta
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to index knowledge document into ChromaDB."
        )

    return {
        "status": "success",
        "doc_id": doc.doc_id,
        "message": f"Document '{doc.title}' successfully indexed into ChromaDB."
    }

@router.post("/seed", status_code=status.HTTP_200_OK)
async def seed_knowledge_base(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Seeds default career knowledge base articles into ChromaDB vector store."""
    count = seed_default_career_knowledge()
    return {
        "status": "success",
        "message": f"Seeded {count} career knowledge items into ChromaDB vector store."
    }

@router.get("/stats", response_model=RAGStatsResponse, status_code=status.HTTP_200_OK)
async def get_rag_stats(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Retrieves status and document counts for all persistent ChromaDB vector collections."""
    collections_stats = get_all_collection_stats()
    return RAGStatsResponse(
        status=chroma_instance.status,
        is_initialized=chroma_instance.is_initialized,
        storage_path=settings.CHROMA_PATH,
        collections=collections_stats
    )
