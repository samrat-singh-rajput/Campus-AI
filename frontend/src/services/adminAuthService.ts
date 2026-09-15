import axios from 'axios';

const API_BASE = '/api';

export interface AdminUser {
  id: string;
  username: string;
  name: string;
  role: 'admin';
}

export interface AdminLoginResponse {
  access_token: string;
  token_type: string;
  admin: AdminUser;
}

export interface RecentUserItem {
  id: string;
  name: string;
  email: string;
  college?: string;
  degree?: string;
  createdAt?: string;
}

export interface RecentApplicationItem {
  id: string;
  student_name: string;
  job_title: string;
  company: string;
  match_score: number;
  status: string;
  applied_at?: string;
}

export interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
}

export interface AdminDashboardData {
  total_students: number;
  total_resumes: number;
  total_jobs: number;
  total_applications: number;
  active_applications: number;
  completed_interviews: number;
  average_ats_score: number;
  average_interview_score: number;
  average_career_readiness: number;
  recent_users: RecentUserItem[];
  recent_applications: RecentApplicationItem[];
  recent_activity: ActivityItem[];
}

export interface AdminUserListItem {
  id: string;
  name: string;
  email: string;
  college?: string;
  degree?: string;
  graduationYear?: number;
  skills_count: number;
  has_resume: boolean;
  ats_score?: number;
  applications_count: number;
  career_readiness_score: number;
  createdAt?: string;
  status: string;
}

export interface AdminUsersListResponse {
  total_users: number;
  total_active: number;
  total_with_resume: number;
  total_with_apps: number;
  page: number;
  limit: number;
  total_pages: number;
  users: AdminUserListItem[];
}

export interface UserResumeSummary {
  has_resume: boolean;
  filename?: string;
  file_size_bytes?: number;
  ats_score?: number;
  extracted_skills: string[];
  missing_keywords: string[];
  upload_date?: string;
}

export interface UserApplicationSummaryItem {
  id: string;
  job_title: string;
  company: string;
  match_score: number;
  status: string;
  applied_at?: string;
}

export interface UserApplicationsSummary {
  total_applications: number;
  applied_count: number;
  interviewing_count: number;
  offered_count: number;
  saved_count: number;
  recent_applications: UserApplicationSummaryItem[];
}

export interface UserInterviewSummaryItem {
  session_id: string;
  domain: string;
  score: number;
  rating: string;
  date?: string;
}

export interface UserInterviewSummary {
  total_sessions: number;
  completed_sessions: number;
  average_score: number;
  best_score: number;
  latest_score?: number;
  recent_sessions: UserInterviewSummaryItem[];
}

export interface AdminUserDetailResponse {
  id: string;
  name: string;
  email: string;
  college?: string;
  degree?: string;
  graduationYear?: number;
  skills: string[];
  skills_count: number;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  resume: UserResumeSummary;
  applications: UserApplicationsSummary;
  interviews: UserInterviewSummary;
  insights: any;
}

// Step 4 Job & Application Interfaces
export interface AdminJobListItem {
  id: string;
  title: string;
  company: string;
  location: string;
  job_type: string;
  description: string;
  required_skills: string[];
  preferred_degree?: string;
  salary_range?: string;
  status: string;
  applications_count: number;
  created_at?: string;
}

export interface AdminJobsListResponse {
  total_jobs: number;
  active_jobs: number;
  closed_jobs: number;
  total_job_applications: number;
  page: number;
  limit: number;
  total_pages: number;
  jobs: AdminJobListItem[];
}

export interface CreateJobInput {
  title: string;
  company: string;
  location: string;
  job_type: string;
  description: string;
  required_skills: string[];
  preferred_degree?: string;
  salary_range?: string;
}

export interface UpdateJobInput {
  title: string;
  company: string;
  location: string;
  job_type: string;
  description: string;
  required_skills: string[];
  preferred_degree?: string;
  salary_range?: string;
  status: string;
}

export interface AdminApplicationListItem {
  id: string;
  user_id: string;
  student_name: string;
  student_email: string;
  student_college?: string;
  job_id: string;
  job_title: string;
  company: string;
  combined_match_score: number;
  status: string;
  applied_at?: string;
}

export interface AdminApplicationsListResponse {
  total_applications: number;
  applied_count: number;
  interviewing_count: number;
  offered_count: number;
  saved_count: number;
  page: number;
  limit: number;
  total_pages: number;
  applications: AdminApplicationListItem[];
}

export interface AdminApplicationDetailResponse {
  id: string;
  user_id: string;
  student: any;
  job: any;
  combined_match_score: number;
  ml_eligibility_score: number;
  vector_similarity_score: number;
  ats_score_at_apply?: number;
  status: string;
  notes?: string;
  applied_at?: string;
}

export const loginAdmin = async (credentials: { username: string; password: string }): Promise<AdminLoginResponse> => {
  const response = await axios.post<AdminLoginResponse>(`${API_BASE}/admin/login`, credentials);
  if (response.data.access_token) {
    localStorage.setItem('campusmate_admin_token', response.data.access_token);
  }
  return response.data;
};

export const fetchAdminProfile = async (): Promise<AdminUser> => {
  const token = localStorage.getItem('campusmate_admin_token');
  if (!token) {
    throw new Error('No admin token found');
  }
  const response = await axios.get<AdminUser>(`${API_BASE}/admin/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const fetchAdminDashboardStats = async (): Promise<AdminDashboardData> => {
  const token = localStorage.getItem('campusmate_admin_token');
  if (!token) {
    throw new Error('No admin token found');
  }
  const response = await axios.get<AdminDashboardData>(`${API_BASE}/admin/dashboard`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const fetchAdminUsersList = async (params: {
  q?: string;
  status_filter?: string;
  resume_filter?: string;
  app_filter?: string;
  sort_by?: string;
  page?: number;
  limit?: number;
}): Promise<AdminUsersListResponse> => {
  const token = localStorage.getItem('campusmate_admin_token');
  if (!token) {
    throw new Error('No admin token found');
  }
  const response = await axios.get<AdminUsersListResponse>(`${API_BASE}/admin/users`, {
    headers: { Authorization: `Bearer ${token}` },
    params
  });
  return response.data;
};

export const fetchAdminUserDetail = async (userId: string): Promise<AdminUserDetailResponse> => {
  const token = localStorage.getItem('campusmate_admin_token');
  if (!token) {
    throw new Error('No admin token found');
  }
  const response = await axios.get<AdminUserDetailResponse>(`${API_BASE}/admin/users/${userId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const updateAdminUserStatus = async (userId: string, status: 'Active' | 'Disabled'): Promise<{ status: string; new_status: string }> => {
  const token = localStorage.getItem('campusmate_admin_token');
  if (!token) {
    throw new Error('No admin token found');
  }
  const response = await axios.patch<{ status: string; new_status: string }>(
    `${API_BASE}/admin/users/${userId}/status`,
    { status },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

// Jobs APIs
export const fetchAdminJobsList = async (params: {
  q?: string;
  status_filter?: string;
  location_filter?: string;
  job_type_filter?: string;
  sort_by?: string;
  page?: number;
  limit?: number;
}): Promise<AdminJobsListResponse> => {
  const token = localStorage.getItem('campusmate_admin_token');
  if (!token) {
    throw new Error('No admin token found');
  }
  const response = await axios.get<AdminJobsListResponse>(`${API_BASE}/admin/jobs`, {
    headers: { Authorization: `Bearer ${token}` },
    params
  });
  return response.data;
};

export const fetchAdminJobDetail = async (jobId: string): Promise<AdminJobListItem> => {
  const token = localStorage.getItem('campusmate_admin_token');
  if (!token) {
    throw new Error('No admin token found');
  }
  const response = await axios.get<AdminJobListItem>(`${API_BASE}/admin/jobs/${jobId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const createAdminJob = async (input: CreateJobInput): Promise<AdminJobListItem> => {
  const token = localStorage.getItem('campusmate_admin_token');
  if (!token) {
    throw new Error('No admin token found');
  }
  const response = await axios.post<AdminJobListItem>(`${API_BASE}/admin/jobs`, input, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const updateAdminJob = async (jobId: string, input: UpdateJobInput): Promise<AdminJobListItem> => {
  const token = localStorage.getItem('campusmate_admin_token');
  if (!token) {
    throw new Error('No admin token found');
  }
  const response = await axios.put<AdminJobListItem>(`${API_BASE}/admin/jobs/${jobId}`, input, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const updateAdminJobStatus = async (jobId: string, status: 'Active' | 'Closed'): Promise<{ status: string; new_status: string }> => {
  const token = localStorage.getItem('campusmate_admin_token');
  if (!token) {
    throw new Error('No admin token found');
  }
  const response = await axios.patch<{ status: string; new_status: string }>(
    `${API_BASE}/admin/jobs/${jobId}/status`,
    { status },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const deleteAdminJob = async (jobId: string): Promise<{ status: string; message: string }> => {
  const token = localStorage.getItem('campusmate_admin_token');
  if (!token) {
    throw new Error('No admin token found');
  }
  const response = await axios.delete<{ status: string; message: string }>(`${API_BASE}/admin/jobs/${jobId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Applications APIs
export const fetchAdminApplicationsList = async (params: {
  q?: string;
  status_filter?: string;
  match_filter?: string;
  job_filter?: string;
  sort_by?: string;
  page?: number;
  limit?: number;
}): Promise<AdminApplicationsListResponse> => {
  const token = localStorage.getItem('campusmate_admin_token');
  if (!token) {
    throw new Error('No admin token found');
  }
  const response = await axios.get<AdminApplicationsListResponse>(`${API_BASE}/admin/applications`, {
    headers: { Authorization: `Bearer ${token}` },
    params
  });
  return response.data;
};

export const fetchAdminApplicationDetail = async (applicationId: string): Promise<AdminApplicationDetailResponse> => {
  const token = localStorage.getItem('campusmate_admin_token');
  if (!token) {
    throw new Error('No admin token found');
  }
  const response = await axios.get<AdminApplicationDetailResponse>(`${API_BASE}/admin/applications/${applicationId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const updateAdminApplicationStatus = async (applicationId: string, status: string): Promise<{ status: string; new_status: string }> => {
  const token = localStorage.getItem('campusmate_admin_token');
  if (!token) {
    throw new Error('No admin token found');
  }
  const response = await axios.patch<{ status: string; new_status: string }>(
    `${API_BASE}/admin/applications/${applicationId}/status`,
    { status },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

// Resumes & ATS Analytics Interfaces
export interface AdminResumeListItem {
  id: string;
  user_id: string;
  student_name: string;
  student_email: string;
  student_college?: string;
  student_degree?: string;
  filename?: string;
  file_size_bytes?: number;
  ats_score: number;
  ats_rating: string;
  skills_count: number;
  created_at?: string;
}

export interface AdminAtsScoreDistribution {
  category: string;
  label: string;
  count: number;
  percentage: number;
}

export interface AdminSkillAnalyticsItem {
  skill: string;
  count: number;
}

export interface AdminCollegeAnalyticsItem {
  college: string;
  count: number;
}

export interface AdminDegreeAnalyticsItem {
  degree: string;
  count: number;
}

export interface AdminResumesListResponse {
  total_resumes: number;
  average_ats_score: number;
  excellent_count: number;
  needs_improvement_count: number;
  score_distribution: AdminAtsScoreDistribution[];
  most_common_skills: AdminSkillAnalyticsItem[];
  top_colleges: AdminCollegeAnalyticsItem[];
  top_degrees: AdminDegreeAnalyticsItem[];
  page: number;
  limit: number;
  total_pages: number;
  resumes: AdminResumeListItem[];
}

export interface AdminResumeDetailResponse {
  id: string;
  user_id: string;
  student_name: string;
  student_email: string;
  student_college?: string;
  student_degree?: string;
  filename?: string;
  file_size_bytes?: number;
  created_at?: string;
  ats_score: number;
  ats_rating: string;
  detected_sections: string[];
  section_checks: Array<{
    name: string;
    present: boolean;
    score: number;
    feedback: string;
  }>;
  extracted_skills: string[];
  skill_categories: Record<string, string[]>;
  missing_keywords: string[];
  suggestions: string[];
  word_count?: number;
  email_on_resume?: string;
  phone_on_resume?: string;
}

// Resumes & ATS Analytics APIs
export const fetchAdminResumesList = async (params: {
  q?: string;
  ats_filter?: string;
  college_filter?: string;
  degree_filter?: string;
  sort_by?: string;
  page?: number;
  limit?: number;
}): Promise<AdminResumesListResponse> => {
  const token = localStorage.getItem('campusmate_admin_token');
  if (!token) {
    throw new Error('No admin token found');
  }
  const response = await axios.get<AdminResumesListResponse>(`${API_BASE}/admin/resumes`, {
    headers: { Authorization: `Bearer ${token}` },
    params
  });
  return response.data;
};

export const fetchAdminResumeDetail = async (resumeId: string): Promise<AdminResumeDetailResponse> => {
  const token = localStorage.getItem('campusmate_admin_token');
  if (!token) {
    throw new Error('No admin token found');
  }
  const response = await axios.get<AdminResumeDetailResponse>(`${API_BASE}/admin/resumes/${resumeId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const fetchAdminResumeAnalytics = async (): Promise<any> => {
  const token = localStorage.getItem('campusmate_admin_token');
  if (!token) {
    throw new Error('No admin token found');
  }
  const response = await axios.get<any>(`${API_BASE}/admin/resume-analytics`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Interviews & AI Analytics Interfaces
export interface AdminInterviewListItem {
  session_id: string;
  user_id: string;
  student_name: string;
  student_email: string;
  student_college?: string;
  student_degree?: string;
  domain: string;
  difficulty: string;
  status: string;
  total_questions: number;
  average_score: number;
  overall_rating: string;
  created_at?: string;
}

export interface AdminInterviewScoreDistribution {
  category: string;
  label: string;
  count: number;
  percentage: number;
}

export interface AdminDomainAnalyticsItem {
  domain: string;
  sessions_count: number;
  average_score: number;
}

export interface AdminConceptAnalyticsItem {
  concept: string;
  count: number;
}

export interface AdminInterviewsListResponse {
  total_interviews: number;
  completed_interviews: number;
  in_progress_interviews: number;
  average_score: number;
  highest_score: number;
  lowest_score: number;
  unique_candidates_count: number;
  score_distribution: AdminInterviewScoreDistribution[];
  domain_analytics: AdminDomainAnalyticsItem[];
  top_mastered_concepts: AdminConceptAnalyticsItem[];
  top_missing_concepts: AdminConceptAnalyticsItem[];
  page: number;
  limit: number;
  total_pages: number;
  interviews: AdminInterviewListItem[];
}

export interface AdminInterviewQuestionEvaluation {
  question_id: string;
  question_text?: string;
  category?: string;
  candidate_answer?: string;
  score: number;
  rating: string;
  clarity_score?: number;
  technical_accuracy_score?: number;
  strengths: string[];
  missing_concepts: string[];
  improvement_feedback?: string;
  ideal_sample_response?: string;
}

export interface AdminInterviewDetailResponse {
  session_id: string;
  user_id: string;
  student_name: string;
  student_email: string;
  student_college?: string;
  student_degree?: string;
  domain: string;
  difficulty: string;
  status: string;
  total_questions: number;
  average_score: number;
  overall_rating: string;
  feedback_summary?: string;
  created_at?: string;
  questions: any[];
  evaluations: AdminInterviewQuestionEvaluation[];
}

// Interviews & AI Analytics APIs
export const fetchAdminInterviewsList = async (params: {
  q?: string;
  status_filter?: string;
  domain_filter?: string;
  rating_filter?: string;
  sort_by?: string;
  page?: number;
  limit?: number;
}): Promise<AdminInterviewsListResponse> => {
  const token = localStorage.getItem('campusmate_admin_token');
  if (!token) {
    throw new Error('No admin token found');
  }
  const response = await axios.get<AdminInterviewsListResponse>(`${API_BASE}/admin/interviews`, {
    headers: { Authorization: `Bearer ${token}` },
    params
  });
  return response.data;
};

export const fetchAdminInterviewDetail = async (sessionId: string): Promise<AdminInterviewDetailResponse> => {
  const token = localStorage.getItem('campusmate_admin_token');
  if (!token) {
    throw new Error('No admin token found');
  }
  const response = await axios.get<AdminInterviewDetailResponse>(`${API_BASE}/admin/interviews/${sessionId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const fetchAdminInterviewAnalytics = async (): Promise<any> => {
  const token = localStorage.getItem('campusmate_admin_token');
  if (!token) {
    throw new Error('No admin token found');
  }
  const response = await axios.get<any>(`${API_BASE}/admin/interview-analytics`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// System Health Interfaces
export interface AdminServiceHealthItem {
  id: string;
  name: string;
  status: string; // "Operational" | "Degraded" | "Unavailable"
  response_time_ms: number;
  last_checked: string;
  purpose: string;
  details: Record<string, any>;
}

export interface AdminSystemHealthResponse {
  overall_status: string;
  server_timestamp: string;
  app_version: string;
  environment: string;
  total_students: number;
  total_resumes: number;
  total_jobs: number;
  total_applications: number;
  total_interviews: number;
  active_applications: number;
  completed_interviews: number;
  chroma_document_count: number;
  services: AdminServiceHealthItem[];
}

export interface AdminDatabaseHealthResponse {
  mongodb: Record<string, any>;
  chromadb: Record<string, any>;
}

// System Health APIs
export const fetchAdminSystemHealth = async (): Promise<AdminSystemHealthResponse> => {
  const token = localStorage.getItem('campusmate_admin_token');
  if (!token) {
    throw new Error('No admin token found');
  }
  const response = await axios.get<AdminSystemHealthResponse>(`${API_BASE}/admin/system-health`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const fetchAdminSystemHealthDatabase = async (): Promise<AdminDatabaseHealthResponse> => {
  const token = localStorage.getItem('campusmate_admin_token');
  if (!token) {
    throw new Error('No admin token found');
  }
  const response = await axios.get<AdminDatabaseHealthResponse>(`${API_BASE}/admin/system-health/database`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const fetchAdminSystemHealthServices = async (): Promise<AdminServiceHealthItem[]> => {
  const token = localStorage.getItem('campusmate_admin_token');
  if (!token) {
    throw new Error('No admin token found');
  }
  const response = await axios.get<AdminServiceHealthItem[]>(`${API_BASE}/admin/system-health/services`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Analytics & Reports APIs
export const fetchAdminAnalyticsOverview = async (timeRange: string = 'all'): Promise<any> => {
  const token = localStorage.getItem('campusmate_admin_token');
  if (!token) throw new Error('No admin token found');
  const response = await axios.get<any>(`${API_BASE}/admin/analytics/overview`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { time_range: timeRange }
  });
  return response.data;
};

export const fetchAdminAnalyticsStudents = async (timeRange: string = 'all'): Promise<any> => {
  const token = localStorage.getItem('campusmate_admin_token');
  if (!token) throw new Error('No admin token found');
  const response = await axios.get<any>(`${API_BASE}/admin/analytics/students`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { time_range: timeRange }
  });
  return response.data;
};

export const fetchAdminAnalyticsJobs = async (timeRange: string = 'all'): Promise<any> => {
  const token = localStorage.getItem('campusmate_admin_token');
  if (!token) throw new Error('No admin token found');
  const response = await axios.get<any>(`${API_BASE}/admin/analytics/jobs`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { time_range: timeRange }
  });
  return response.data;
};

export const fetchAdminAnalyticsApplications = async (timeRange: string = 'all'): Promise<any> => {
  const token = localStorage.getItem('campusmate_admin_token');
  if (!token) throw new Error('No admin token found');
  const response = await axios.get<any>(`${API_BASE}/admin/analytics/applications`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { time_range: timeRange }
  });
  return response.data;
};

export const fetchAdminAnalyticsResumes = async (timeRange: string = 'all'): Promise<any> => {
  const token = localStorage.getItem('campusmate_admin_token');
  if (!token) throw new Error('No admin token found');
  const response = await axios.get<any>(`${API_BASE}/admin/analytics/resumes`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { time_range: timeRange }
  });
  return response.data;
};

export const fetchAdminAnalyticsInterviews = async (timeRange: string = 'all'): Promise<any> => {
  const token = localStorage.getItem('campusmate_admin_token');
  if (!token) throw new Error('No admin token found');
  const response = await axios.get<any>(`${API_BASE}/admin/analytics/interviews`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { time_range: timeRange }
  });
  return response.data;
};

export const fetchAdminAnalyticsReadiness = async (timeRange: string = 'all'): Promise<any> => {
  const token = localStorage.getItem('campusmate_admin_token');
  if (!token) throw new Error('No admin token found');
  const response = await axios.get<any>(`${API_BASE}/admin/analytics/readiness`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { time_range: timeRange }
  });
  return response.data;
};

export const fetchAdminAnalyticsInsights = async (timeRange: string = 'all'): Promise<any[]> => {
  const token = localStorage.getItem('campusmate_admin_token');
  if (!token) throw new Error('No admin token found');
  const response = await axios.get<any[]>(`${API_BASE}/admin/analytics/insights`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { time_range: timeRange }
  });
  return response.data;
};

// Audit Logs & Activity Tracking APIs
export const fetchAdminAuditLogs = async (params: {
  q?: string;
  action_filter?: string;
  resource_type_filter?: string;
  admin_filter?: string;
  time_range?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
}): Promise<any> => {
  const token = localStorage.getItem('campusmate_admin_token');
  if (!token) throw new Error('No admin token found');
  const response = await axios.get<any>(`${API_BASE}/admin/audit-logs`, {
    headers: { Authorization: `Bearer ${token}` },
    params
  });
  return response.data;
};

export const fetchAdminAuditAnalytics = async (): Promise<any> => {
  const token = localStorage.getItem('campusmate_admin_token');
  if (!token) throw new Error('No admin token found');
  const response = await axios.get<any>(`${API_BASE}/admin/audit-logs/analytics`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const fetchAdminAuditLogDetail = async (logId: string): Promise<any> => {
  const token = localStorage.getItem('campusmate_admin_token');
  if (!token) throw new Error('No admin token found');
  const response = await axios.get<any>(`${API_BASE}/admin/audit-logs/${logId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Admin Settings & Platform Configuration APIs
export const fetchAdminSettings = async (): Promise<any> => {
  const token = localStorage.getItem('campusmate_admin_token');
  if (!token) throw new Error('No admin token found');
  const response = await axios.get<any>(`${API_BASE}/admin/settings`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const fetchAdminSettingsProfile = async (): Promise<any> => {
  const token = localStorage.getItem('campusmate_admin_token');
  if (!token) throw new Error('No admin token found');
  const response = await axios.get<any>(`${API_BASE}/admin/settings/profile`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const updateAdminProfile = async (data: any): Promise<any> => {
  const token = localStorage.getItem('campusmate_admin_token');
  if (!token) throw new Error('No admin token found');
  const response = await axios.put<any>(`${API_BASE}/admin/settings/profile`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const changeAdminPassword = async (data: { current_password: string; new_password: string; confirm_password: string }): Promise<any> => {
  const token = localStorage.getItem('campusmate_admin_token');
  if (!token) throw new Error('No admin token found');
  const response = await axios.post<any>(`${API_BASE}/admin/settings/change-password`, data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const logoutAdmin = () => {
  localStorage.removeItem('campusmate_admin_token');
};
