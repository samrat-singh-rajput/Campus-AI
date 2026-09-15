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

/**
 * Transforms raw Axios error objects, HTTP status codes, or backend exception details
 * into clean, user-friendly, human-readable messages.
 */
export const getErrorMessage = (error: any, context?: 'login' | 'register' | 'admin_login'): string => {
  if (!error) return 'An unexpected error occurred. Please try again.';

  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const detail = error.response?.data?.detail;

    // 1. Explicit backend string detail
    if (typeof detail === 'string' && detail.trim()) {
      const lowerDetail = detail.toLowerCase();
      if (lowerDetail.includes('administrator account not found') || lowerDetail.includes('account not found')) {
        return context === 'admin_login'
          ? 'Administrator account not found.'
          : 'No account found with this email address. Please register first.';
      }
      if (lowerDetail.includes('incorrect admin password') || lowerDetail.includes('incorrect password')) {
        return context === 'admin_login'
          ? 'Incorrect admin password. Please try again.'
          : 'Incorrect email address or password. Please check your credentials and try again.';
      }
      if (lowerDetail.includes('administrator privileges are required')) {
        return 'Administrator privileges are required.';
      }
      if (lowerDetail.includes('please log in as an administrator')) {
        return 'Please log in as an administrator to continue.';
      }
      if (lowerDetail.includes('already exists') || lowerDetail.includes('duplicate')) {
        return 'An account with this email address already exists. Please log in instead.';
      }
      return detail;
    }

    // 2. Pydantic validation error array (HTTP 422)
    if (Array.isArray(detail) && detail.length > 0) {
      const firstErr = detail[0];
      if (firstErr.msg) {
        const field = firstErr.loc ? firstErr.loc[firstErr.loc.length - 1] : '';
        return field
          ? `Please check the '${field}' field: ${firstErr.msg}`
          : `Validation error: ${firstErr.msg}`;
      }
      return 'Please check the entered information.';
    }

    // 3. Status code fallbacks
    switch (status) {
      case 400:
        if (context === 'admin_login') return 'Please check the entered information.';
        if (context === 'register') return 'An account with this email address already exists. Please log in instead.';
        return 'Invalid request. Please check your information and try again.';
      case 401:
        if (context === 'admin_login') return 'Incorrect admin password. Please try again.';
        if (context === 'login') return 'Incorrect email address or password. Please check your credentials and try again.';
        return 'Please log in as an administrator to continue.';
      case 403:
        return 'Administrator privileges are required.';
      case 404:
        if (context === 'admin_login') return 'Administrator account not found.';
        if (context === 'login') return 'No account found with this email address. Please register first.';
        return 'The requested resource was not found.';
      case 409:
        return 'An account with this email address already exists. Please log in instead.';
      case 422:
        return 'Please check the entered information.';
      case 500:
      case 502:
      case 503:
      case 504:
        if (context === 'admin_login') return 'Unable to log in as administrator right now. Please try again later.';
        return 'Something went wrong on our server. Please try again in a moment.';
      default:
        if (error.code === 'ECONNABORTED') {
          return 'Request timed out. Please check your internet connection and try again.';
        }
        if (error.message && error.message.includes('Network Error')) {
          return 'Unable to connect to the server. Please check your connection and try again.';
        }
    }
  }

  if (error instanceof Error) {
    if (error.message.includes('Network Error') || error.message.includes('ECONNREFUSED')) {
      return 'Unable to connect to the server. Please check your internet connection.';
    }
    if (error.message.startsWith('Request failed with status code')) {
      const code = error.message.split(' ').pop();
      if (code === '401') return context === 'admin_login' ? 'Incorrect admin password. Please try again.' : 'Authentication required. Please log in.';
      if (code === '403') return 'Administrator privileges are required.';
      if (code === '404') return context === 'admin_login' ? 'Administrator account not found.' : 'No account found.';
      return 'Unable to complete your request right now. Please try again.';
    }
    return error.message;
  }

  return context === 'admin_login'
    ? 'Unable to log in as administrator right now. Please try again later.'
    : 'Unable to complete request right now. Please try again in a moment.';
};
