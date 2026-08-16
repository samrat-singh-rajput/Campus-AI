from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class SearchQueryRequest(BaseModel):
    collection_name: str = Field("campusmate_knowledge", description="Target ChromaDB collection")
    query_text: str = Field(..., min_length=2, description="Search query string")
    n_results: int = Field(5, ge=1, le=20, description="Max result count")
    filter_metadata: Optional[Dict[str, Any]] = None

class SearchResultItem(BaseModel):
    id: str
    document: str
    metadata: Dict[str, Any]
    distance: float
    similarity_score: float

class SearchQueryResponse(BaseModel):
    query_text: str
    collection_name: str
    total_results: int
    results: List[SearchResultItem]

class KnowledgeDocumentRequest(BaseModel):
    doc_id: str
    title: str
    category: str  # Interview, Resume, Career, Skill, Salary
    content: str
    metadata: Optional[Dict[str, Any]] = None

class CollectionStats(BaseModel):
    collection_name: str
    document_count: int

class RAGStatsResponse(BaseModel):
    status: str
    is_initialized: bool
    storage_path: str
    collections: List[CollectionStats]
