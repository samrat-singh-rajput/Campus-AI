import React, { useEffect, useState } from 'react';
import { 
  Sparkles, 
  ArrowLeft, 
  RefreshCw, 
  Mic, 
  MicOff, 
  ChevronRight, 
  BrainCircuit, 
  Play, 
  Award, 
  Lightbulb
} from 'lucide-react';
import { 
  startInterviewSession, 
  submitQuestionAnswer, 
  finishInterviewSession, 
  fetchMyInterviewHistory 
} from '../services/interviewService';
import type { 
  InterviewSessionResponse, 
  AnswerFeedbackResult, 
  SessionSummaryResponse 
} from '../services/interviewService';

interface InterviewViewProps {
  user: any;
  onBackToDashboard: () => void;
  onSelectTab?: (tabId: string) => void;
}

const DOMAINS = [
  { id: 'Full Stack Engineering', title: 'Full Stack Engineering', desc: 'React, FastAPI, REST APIs, Security & Databases' },
  { id: 'AI & Machine Learning', title: 'AI & Machine Learning', desc: 'RAG, Vector DBs, Random Forest & Neural Nets' },
  { id: 'Backend Engineering', title: 'Backend Engineering', desc: 'Python Asyncio, System Concurrency & Scalability' }
];

export const InterviewView: React.FC<InterviewViewProps> = ({ user: _user, onBackToDashboard, onSelectTab: _onSelectTab }) => {
  const [history, setHistory] = useState<SessionSummaryResponse[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>('Full Stack Engineering');
  const [session, setSession] = useState<InterviewSessionResponse | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answerInput, setAnswerInput] = useState<string>('');
  const [evaluations, setEvaluations] = useState<AnswerFeedbackResult[]>([]);
  const [currentEval, setCurrentEval] = useState<AnswerFeedbackResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [summary, setSummary] = useState<SessionSummaryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = async () => {
    try {
      const data = await fetchMyInterviewHistory();
      setHistory(data);
    } catch (err: any) {
      console.warn('Could not load interview history.');
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleStartSession = async () => {
    setLoading(true);
    setError(null);
    setSummary(null);
    setEvaluations([]);
    setCurrentIndex(0);
    setAnswerInput('');
    setCurrentEval(null);

    try {
      const data = await startInterviewSession(selectedDomain, 'Medium', 3);
      setSession(data);
    } catch (err: any) {
      setError('Failed to initialize mock interview session.');
    } finally {
      setLoading(false);
    }
  };

  const handleSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser window. Please type your response.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
      return;
    }

    setIsRecording(true);
    recognition.start();

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setAnswerInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      setIsRecording(false);
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };
  };

  const handleSubmitAnswer = async () => {
    if (!session || !answerInput.trim() || loading) return;
    const currentQ = session.questions[currentIndex];
    setLoading(true);
    setError(null);

    try {
      const evalRes = await submitQuestionAnswer(session.session_id, currentQ.question_id, answerInput);
      setCurrentEval(evalRes);
      setEvaluations((prev) => [...prev, evalRes]);
    } catch (err: any) {
      setError('Failed to evaluate candidate answer.');
    } finally {
      setLoading(false);
    }
  };

  const handleNextQuestion = async () => {
    if (!session) return;
    setCurrentEval(null);
    setAnswerInput('');

    if (currentIndex + 1 < session.questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Session Completed!
      setLoading(true);
      try {
        const sumRes = await finishInterviewSession(session.session_id, evaluations);
        setSummary(sumRes);
        setSession(null);
        loadHistory();
      } catch (err: any) {
        setError('Failed to finalize session summary.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Top Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToDashboard}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-indigo-400 transition-colors bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <span className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider flex items-center space-x-1.5 font-mono">
          <BrainCircuit className="w-3.5 h-3.5" />
          <span>AI Mock Interview Coach</span>
        </span>
      </div>

      {error && (
        <p className="text-xs text-rose-400 bg-rose-500/10 p-4 rounded-2xl border border-rose-500/20">{error}</p>
      )}

      {/* Screen 1: Domain Selection & Setup */}
      {!session && !summary && (
        <div className="space-y-8">
          
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 glow-border space-y-4">
            <div>
              <h2 className="text-2xl font-extrabold text-white flex items-center space-x-2">
                <span>Select Interview Practice Domain</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Real-time AI technical question bank with voice dictation & instant concept coverage scoring.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {DOMAINS.map((d) => (
                <div
                  key={d.id}
                  onClick={() => setSelectedDomain(d.id)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                    selectedDomain === d.id
                      ? 'bg-gradient-to-br from-blue-600/20 via-indigo-600/10 to-purple-600/20 border-indigo-500 shadow-lg shadow-indigo-500/10'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <h4 className="text-sm font-bold text-white">{d.title}</h4>
                  <p className="text-xs text-slate-400">{d.desc}</p>
                </div>
              ))}
            </div>

            <button
              onClick={handleStartSession}
              disabled={loading}
              className="px-6 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-2xl font-bold text-xs shadow-lg shadow-indigo-500/20 flex items-center space-x-2 transition-all"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              <span>Start AI Mock Interview Session</span>
            </button>
          </div>

          {/* Past History Table */}
          {history.length > 0 && (
            <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4 glow-border">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Award className="w-4 h-4 text-indigo-400" />
                <span>Past Interview Session Scorecard History</span>
              </h3>

              <div className="space-y-3">
                {history.map((h, idx) => (
                  <div key={idx} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white">{h.domain}</span>
                      <p className="text-slate-400 mt-0.5">{h.feedback_summary}</p>
                    </div>
                    <span className="px-3.5 py-1 rounded-full font-extrabold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                      {h.average_score}% • {h.overall_rating}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Screen 2: Active Interview Question Practice */}
      {session && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6 glow-border">
          
          {/* Header Progress */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-mono">
                {session.questions[currentIndex].category}
              </span>
              <h3 className="text-base font-bold text-white mt-1">
                Question {currentIndex + 1} of {session.questions.length}
              </h3>
            </div>

            <div className="w-24 bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all"
                style={{ width: `${((currentIndex + 1) / session.questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Question Text */}
          <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-2">
            <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-wider">Target Technical Scenario:</span>
            <p className="text-sm font-semibold text-white leading-relaxed">
              {session.questions[currentIndex].question_text}
            </p>
          </div>

          {/* Response Box with Speech Dictation */}
          {!currentEval ? (
            <div className="space-y-4">
              <div className="relative">
                <textarea
                  value={answerInput}
                  onChange={(e) => setAnswerInput(e.target.value)}
                  placeholder="Type your technical response here or click the microphone for voice dictation..."
                  rows={5}
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 leading-relaxed"
                />

                <button
                  onClick={handleSpeechRecognition}
                  className={`absolute bottom-4 right-4 p-2.5 rounded-xl border transition-all ${
                    isRecording
                      ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                      : 'bg-slate-950 text-slate-400 hover:text-white border-slate-800'
                  }`}
                  title="Voice Speech-to-Text Dictation"
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              </div>

              <button
                onClick={handleSubmitAnswer}
                disabled={loading || !answerInput.trim()}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-2xl font-bold text-xs shadow-lg shadow-indigo-500/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Submit Answer for AI Evaluation</span>
              </button>
            </div>
          ) : (
            /* Instant Feedback Card */
            <div className="space-y-6 animate-fadeIn">
              
              <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-white gradient-text">
                    Score: {currentEval.score} / 100
                  </span>
                  <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    {currentEval.rating}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-300">
                  <p className="font-semibold text-white">Feedback Summary:</p>
                  <p className="leading-relaxed">{currentEval.improvement_feedback}</p>
                </div>

                {/* Missing Concepts */}
                {currentEval.missing_concepts.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">Concepts to include:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {currentEval.missing_concepts.map((c, idx) => (
                        <span key={idx} className="text-xs px-2.5 py-0.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 font-medium">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ideal Response Sample */}
                <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
                  <span className="font-bold text-white flex items-center space-x-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                    <span>Ideal Technical Response Sample:</span>
                  </span>
                  <p className="leading-relaxed text-slate-300">{currentEval.ideal_sample_response}</p>
                </div>

              </div>

              <button
                onClick={handleNextQuestion}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-xs shadow-lg shadow-indigo-500/20 flex items-center justify-center space-x-1.5"
              >
                <span>{currentIndex + 1 < session.questions.length ? 'Next Question' : 'View Session Scorecard'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>

            </div>
          )}

        </div>
      )}

      {/* Screen 3: Session Completion Scorecard */}
      {summary && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 text-center space-y-6 glow-border">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-0.5 mx-auto shadow-xl shadow-indigo-500/20 flex items-center justify-center text-white">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 uppercase tracking-wider font-mono">
              Session Completed
            </span>
            <h3 className="text-2xl font-extrabold text-white mt-2">{summary.domain} Mock Interview</h3>
            <p className="text-xs text-slate-400 mt-1">{summary.feedback_summary}</p>
          </div>

          <div className="py-6 bg-slate-950 rounded-2xl border border-slate-800 max-w-sm mx-auto">
            <div className="text-5xl font-black text-white gradient-text">{summary.average_score}%</div>
            <p className="text-xs font-bold text-indigo-400 mt-1 uppercase tracking-wider">{summary.overall_rating}</p>
          </div>

          <button
            onClick={() => setSummary(null)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-xs shadow-lg shadow-indigo-500/20"
          >
            Start Another Mock Session
          </button>
        </div>
      )}

    </div>
  );
};
