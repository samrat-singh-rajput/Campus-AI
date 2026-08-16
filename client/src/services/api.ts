import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Axios Request Interceptor: Automatically attach Authorization token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('campusmate_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export interface HealthResponse {
  status: string;
  app: string;
  version: string;
  environment: string;
  database: {
    mongodb_atlas: {
      connected: boolean;
      status: string;
      database_name: string;
    };
    chromadb_vectorstore: {
      initialized: boolean;
      status: string;
      path: string;
      collection_name: string;
      total_documents: number;
    };
  };
}

export const checkHealth = async (): Promise<HealthResponse> => {
  const response = await apiClient.get<HealthResponse>('/health');
  return response.data;
};
