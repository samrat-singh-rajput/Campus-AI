import React, { useEffect, useState } from 'react';
import { 
  FileUp, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Trash2, 
  ArrowLeft, 
  Check, 
  XCircle, 
  RefreshCw,
  Cpu,
  Target
} from 'lucide-react';
import { uploadResume, fetchMyResume, deleteResume } from '../services/resumeService';
import type { ResumeResponse } from '../services/resumeService';

interface ResumeViewProps {
  user?: any;
  onBackToDashboard: () => void;
  onResumeParsed?: (score: number) => void;
}

export const ResumeView: React.FC<ResumeViewProps> = ({ user: _user, onBackToDashboard, onResumeParsed }) => {
  const [resume, setResume] = useState<ResumeResponse | null>(null);
  const [_loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<boolean>(false);

  const loadResume = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMyResume();
      setResume(data);
      if (onResumeParsed && data.parsed_data.ats_analysis.overall_score) {
        onResumeParsed(data.parsed_data.ats_analysis.overall_score);
      }
    } catch (err: any) {
      // 404 means no resume uploaded yet
      setResume(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResume();
  }, []);

  const handleFileUpload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a PDF file (.pdf).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds maximum allowed 5 MB.');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const result = await uploadResume(file);
      setResume(result);
      setSuccessMsg(`Resume '${file.name}' parsed & stored successfully! ATS Score: ${result.parsed_data.ats_analysis.overall_score}/100`);
      if (onResumeParsed) {
        onResumeParsed(result.parsed_data.ats_analysis.overall_score);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to upload and parse PDF resume.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDelete = async () => {
    if (!resume) return;
    if (!window.confirm('Are you sure you want to delete your stored resume data?')) return;
    
    setLoading(true);
    try {
      await deleteResume(resume.id);
      setResume(null);
      setSuccessMsg('Resume deleted successfully.');
    } catch (err: any) {
      setError('Failed to delete resume.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 60) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBackToDashboard}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-indigo-400 transition-colors bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center space-x-2">
          <span className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>STEP 5 Engine Active</span>
          </span>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center space-x-3 text-rose-300 text-xs">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center space-x-3 text-emerald-300 text-xs">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Upload Box & Extracted Info */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* File Drag & Drop Upload Card */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 relative glow-border overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-6">
              <div className="flex items-center space-x-2">
                <FileUp className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Upload PDF Resume</h3>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">Max 5 MB</span>
            </div>

            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                dragOver
                  ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]'
                  : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
              }`}
            >
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                className="hidden"
                id="resume-file-input"
              />

              <label htmlFor="resume-file-input" className="cursor-pointer space-y-3 block">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">
                  {uploading ? <RefreshCw className="w-7 h-7 animate-spin" /> : <FileText className="w-7 h-7" />}
                </div>

                <div>
                  <p className="text-sm font-bold text-white">
                    {uploading ? 'Parsing PDF & Extracting Skills...' : 'Click to Upload or Drag & Drop PDF'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    PyPDF extracts contact info, technical skills, and calculates ATS compatibility score
                  </p>
                </div>

                <div className="pt-2">
                  <span className="inline-flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/20">
                    <FileUp className="w-4 h-4" />
                    <span>Select Resume PDF</span>
                  </span>
                </div>
              </label>
            </div>

            {/* Currently Loaded File Indicator */}
            {resume && (
              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <div>
                    <p className="font-bold text-white">{resume.filename}</p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {(resume.file_size_bytes / 1024).toFixed(1)} KB • Uploaded {new Date(resume.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleDelete}
                  className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                  title="Delete Resume"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Parsed Skill Vector taxonomy */}
          {resume && (
            <div className="glass-card rounded-3xl p-6 border border-slate-800">
              <h4 className="text-sm font-bold text-white mb-4 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Extracted Technical Skills Vector ({resume.parsed_data.extracted_skills.length})</span>
              </h4>

              {Object.keys(resume.parsed_data.skill_categories).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(resume.parsed_data.skill_categories).map(([category, skills]) => (
                    <div key={category} className="space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{category}:</span>
                      <div className="flex flex-wrap gap-2">
                        {skills.map((s, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2.5 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-semibold flex items-center space-x-1"
                          >
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>{s}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {resume.parsed_data.extracted_skills.map((s, idx) => (
                    <span key={idx} className="text-xs px-2.5 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-semibold">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right Column: ATS Score Analysis & Recommendations */}
        <div className="lg:col-span-5 space-y-6">
          
          {resume ? (
            <>
              {/* ATS Score Card */}
              <div className="glass-card rounded-3xl p-6 border border-slate-800 glow-border space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">ATS Compatibility Score</h3>
                  <span className={`text-xs px-3 py-1 rounded-full font-extrabold border ${getScoreColor(resume.parsed_data.ats_analysis.overall_score)}`}>
                    {resume.parsed_data.ats_analysis.rating}
                  </span>
                </div>

                {/* Score Progress Ring */}
                <div className="text-center py-4 bg-slate-950/80 rounded-2xl border border-slate-800">
                  <div className="text-5xl font-black text-white gradient-text">
                    {resume.parsed_data.ats_analysis.overall_score}
                    <span className="text-xl font-normal text-slate-500"> / 100</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 font-medium">
                    {resume.parsed_data.extracted_skills.length} Technical Skills Detected • {resume.parsed_data.word_count} Words
                  </p>
                </div>

                {/* Section Completeness Checklist */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Required Resume Sections:</h4>
                  <div className="space-y-2">
                    {resume.parsed_data.ats_analysis.section_checks.map((section, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="flex items-center space-x-2">
                          {section.present ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-400" />
                          )}
                          <span className={section.present ? 'text-slate-200 font-semibold' : 'text-slate-400'}>{section.name}</span>
                        </div>
                        <span className={section.present ? 'text-emerald-400 font-bold' : 'text-rose-400 font-semibold'}>
                          {section.present ? `+${section.score} pts` : 'Missing'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Missing Keyword Alerts */}
                {resume.parsed_data.ats_analysis.missing_recommended_keywords.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1">
                      <Target className="w-3.5 h-3.5" />
                      <span>Recommended Industry Keywords to Add:</span>
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {resume.parsed_data.ats_analysis.missing_recommended_keywords.map((kw, idx) => (
                        <span key={idx} className="text-[11px] px-2.5 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 font-mono font-semibold">
                          + {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Suggestions Box */}
              <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>ATS Improvement Suggestions:</span>
                </h4>

                <ul className="space-y-2 text-xs text-slate-300">
                  {resume.parsed_data.ats_analysis.suggestions.map((sug, idx) => (
                    <li key={idx} className="flex items-start space-x-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                      <span className="text-indigo-400 font-bold">•</span>
                      <span>{sug}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <div className="glass-card rounded-3xl p-8 border border-slate-800 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                <Cpu className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white">No Resume Uploaded Yet</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Upload your PDF resume on the left to generate a real-time ATS compatibility score, section checks, and missing keyword alerts.
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
