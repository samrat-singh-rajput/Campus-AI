import { apiClient } from './api';

export interface SectionCheck {
  name: string;
  present: boolean;
  score: number;
  feedback: string;
}

export interface ATSBreakdown {
  overall_score: number;
  rating: string;
  section_checks: SectionCheck[];
  matched_skills_count: number;
  suggestions: string[];
  missing_recommended_keywords: string[];
}

export interface ParsedResumeData {
  email?: string;
  phone?: string;
  links: string[];
  extracted_skills: string[];
  skill_categories: Record<string, string[]>;
  education: string[];
  experience_highlights: string[];
  detected_sections: string[];
  word_count: number;
  ats_analysis: ATSBreakdown;
}

export interface ResumeResponse {
  id: string;
  user_id: string;
  filename: string;
  file_size_bytes: number;
  created_at: string;
  parsed_data: ParsedResumeData;
}

export const uploadResume = async (file: File): Promise<ResumeResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<ResumeResponse>('/resume/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const fetchMyResume = async (): Promise<ResumeResponse> => {
  const response = await apiClient.get<ResumeResponse>('/resume/me');
  return response.data;
};

export const deleteResume = async (resumeId: string): Promise<void> => {
  await apiClient.delete(`/resume/${resumeId}`);
};
