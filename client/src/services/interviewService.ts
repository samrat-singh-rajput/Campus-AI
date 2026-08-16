import { apiClient } from './api';

export interface QuestionItem {
  question_id: string;
  category: string;
  question_text: string;
  key_concepts: string[];
}

export interface InterviewSessionResponse {
  session_id: string;
  user_id: string;
  domain: string;
  difficulty: string;
  questions: QuestionItem[];
  status: string;
  created_at: string;
}

export interface AnswerFeedbackResult {
  question_id: string;
  score: number;
  rating: string;
  clarity_score: number;
  technical_accuracy_score: number;
  strengths: string[];
  missing_concepts: string[];
  improvement_feedback: string;
  ideal_sample_response: string;
}

export interface SessionSummaryResponse {
  session_id: string;
  user_id: string;
  domain: string;
  total_questions: number;
  average_score: number;
  overall_rating: string;
  feedback_summary: string;
  created_at: string;
}

export const startInterviewSession = async (domain: string, difficulty: string = 'Medium', count: number = 3): Promise<InterviewSessionResponse> => {
  const response = await apiClient.post<InterviewSessionResponse>('/interview/start', {
    domain: domain,
    difficulty: difficulty,
    question_count: count,
  });
  return response.data;
};

export const submitQuestionAnswer = async (sessionId: string, questionId: string, answer: string): Promise<AnswerFeedbackResult> => {
  const response = await apiClient.post<AnswerFeedbackResult>('/interview/answer', {
    session_id: sessionId,
    question_id: questionId,
    candidate_answer: answer,
  });
  return response.data;
};

export const finishInterviewSession = async (sessionId: string, evaluations: AnswerFeedbackResult[]): Promise<SessionSummaryResponse> => {
  const response = await apiClient.post<SessionSummaryResponse>(`/interview/finish/${sessionId}`, evaluations);
  return response.data;
};

export const fetchMyInterviewHistory = async (): Promise<SessionSummaryResponse[]> => {
  const response = await apiClient.get<SessionSummaryResponse[]>('/interview/history/me');
  return response.data;
};
