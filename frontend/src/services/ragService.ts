import { apiClient } from './api';

export interface SearchResultItem {
  id: string;
  document: string;
  metadata: Record<string, any>;
  distance: number;
  similarity_score: number;
}

export interface SearchQueryResponse {
  query_text: string;
  collection_name: string;
  total_results: number;
  results: SearchResultItem[];
}

export interface CollectionStats {
  collection_name: string;
  document_count: number;
}

export interface RAGStatsResponse {
  status: string;
  is_initialized: boolean;
  storage_path: string;
  collections: CollectionStats[];
}

export const searchVectorStore = async (
  queryText: string,
  collectionName: string = 'campusmate_knowledge',
  nResults: number = 5
): Promise<SearchQueryResponse> => {
  const response = await apiClient.post<SearchQueryResponse>('/rag/search', {
    query_text: queryText,
    collection_name: collectionName,
    n_results: nResults,
  });
  return response.data;
};

export const fetchRAGStats = async (): Promise<RAGStatsResponse> => {
  const response = await apiClient.get<RAGStatsResponse>('/rag/stats');
  return response.data;
};

export const seedKnowledgeBase = async (): Promise<{ status: string; message: string }> => {
  const response = await apiClient.post<{ status: string; message: string }>('/rag/seed');
  return response.data;
};
