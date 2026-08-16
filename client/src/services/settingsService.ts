import { apiClient } from './api';

export interface ProfileUpdateRequest {
  name?: string;
  college?: string;
  degree?: string;
  graduationYear?: number;
  target_role?: string;
  skills?: string[];
}

export const updateUserProfile = async (updates: ProfileUpdateRequest): Promise<any> => {
  const response = await apiClient.put('/settings/profile', updates);
  return response.data;
};
