import { apiClient } from './api';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  college?: string;
  degree?: string;
  graduationYear?: number;
  skills: string[];
  createdAt: string;
}

export interface AuthTokenResponse {
  access_token: string;
  token_type: string;
  user: UserProfile;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  college?: string;
  degree?: string;
  graduationYear?: number;
  skills?: string[];
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const registerUser = async (payload: RegisterPayload): Promise<AuthTokenResponse> => {
  const response = await apiClient.post<AuthTokenResponse>('/auth/register', payload);
  if (response.data.access_token) {
    localStorage.setItem('campusmate_token', response.data.access_token);
  }
  return response.data;
};

export const loginUser = async (payload: LoginPayload): Promise<AuthTokenResponse> => {
  const response = await apiClient.post<AuthTokenResponse>('/auth/login', payload);
  if (response.data.access_token) {
    localStorage.setItem('campusmate_token', response.data.access_token);
  }
  return response.data;
};

export const fetchMyProfile = async (): Promise<UserProfile> => {
  const response = await apiClient.get<UserProfile>('/auth/me');
  return response.data;
};

export const logoutUser = (): void => {
  localStorage.removeItem('campusmate_token');
};

export const getStoredToken = (): string | null => {
  return localStorage.getItem('campusmate_token');
};
