import { apiClient } from './api';

export interface JobSnapshot {
  title: string;
  company: string;
  location: string;
  salary_range?: string;
  required_skills: string[];
}

export interface ApplicationResponse {
  id: string;
  user_id: string;
  job_id: string;
  status: string;
  applied_at: string;
  ats_score_at_apply: number;
  ml_eligibility_score: number;
  vector_similarity_score: number;
  combined_match_score: number;
  notes?: string;
  job_snapshot: JobSnapshot;
}

export const submitApplication = async (jobId: string, notes?: string): Promise<ApplicationResponse> => {
  const response = await apiClient.post<ApplicationResponse>('/applications', {
    job_id: jobId,
    notes: notes,
  });
  return response.data;
};

export const fetchMyApplications = async (): Promise<ApplicationResponse[]> => {
  const response = await apiClient.get<ApplicationResponse[]>('/applications/me');
  return response.data;
};

export const updateApplicationStatus = async (appId: string, status: string): Promise<ApplicationResponse> => {
  const response = await apiClient.patch<ApplicationResponse>(`/applications/${appId}/status`, {
    status: status,
  });
  return response.data;
};

export const withdrawApplication = async (appId: string): Promise<void> => {
  await apiClient.delete(`/applications/${appId}`);
};
