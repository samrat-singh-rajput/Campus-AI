import { apiClient } from './api';

export interface MLEligibilityResult {
  job_id: string;
  job_title: string;
  company: string;
  eligibility_score: number;
  classification: string;
  matched_skills: string[];
  missing_skills: string[];
  skill_match_ratio: number;
  ats_score_used: number;
  recommendation_note: string;
}

export interface JobResponse {
  id: string;
  title: string;
  company: string;
  location: string;
  job_type: string;
  description: string;
  required_skills: string[];
  preferred_degree?: string;
  min_experience_years: number;
  salary_range?: string;
  created_at: string;
  match_result?: MLEligibilityResult;
}

export const fetchAllJobs = async (): Promise<JobResponse[]> => {
  const response = await apiClient.get<JobResponse[]>('/jobs');
  return response.data;
};

export const fetchMyJobRecommendations = async (): Promise<JobResponse[]> => {
  const response = await apiClient.get<JobResponse[]>('/jobs/recommendations/me');
  return response.data;
};

export const evaluateSingleJobEligibility = async (jobId: string): Promise<MLEligibilityResult> => {
  const response = await apiClient.post<MLEligibilityResult>(`/jobs/evaluate/${jobId}`);
  return response.data;
};
