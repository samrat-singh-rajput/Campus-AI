import { apiClient } from './api';

export interface SkillGapItem {
  skill: string;
  importance: string;
  associated_job_count: number;
}

export interface CareerInsightsResponse {
  user_id: string;
  user_name: string;
  college: string;
  degree: string;
  career_readiness_score: number;
  ats_score?: number;
  skills_count: number;
  job_matches_count: number;
  high_fit_jobs_count: number;
  applications_count: number;
  interviews_count: number;
  average_interview_score: number;
  top_strengths: string[];
  recommended_skill_gaps: SkillGapItem[];
  growth_advice: string[];
  updated_at: string;
}

export const fetchMyCareerInsights = async (): Promise<CareerInsightsResponse> => {
  const response = await apiClient.get<CareerInsightsResponse>('/insights/me');
  return response.data;
};
