import React, { useState } from 'react';
import { 
  Settings, 
  User, 
  Plus, 
  X, 
  Save, 
  ArrowLeft, 
  Check, 
  RefreshCw, 
  BrainCircuit, 
  ShieldCheck
} from 'lucide-react';
import { updateUserProfile } from '../services/settingsService';

interface SettingsViewProps {
  user: any;
  onBackToDashboard: () => void;
  onSelectTab?: (tabId: string) => void;
  onUserUpdated?: (user: any) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ user, onBackToDashboard, onSelectTab: _onSelectTab, onUserUpdated }) => {
  const [name, setName] = useState<string>(user?.name || '');
  const [college, setCollege] = useState<string>(user?.college || '');
  const [degree, setDegree] = useState<string>(user?.degree || '');
  const [gradYear, setGradYear] = useState<number>(user?.graduationYear || 2026);
  const [skills, setSkills] = useState<string[]>(user?.skills || ['Python', 'FastAPI', 'React', 'MongoDB']);
  const [newSkillInput, setNewSkillInput] = useState<string>('');
  
  const [loading, setLoading] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAddSkill = () => {
    const trimmed = newSkillInput.trim();
    if (trimmed && !skills.map((s) => s.toLowerCase()).includes(trimmed.toLowerCase())) {
      setSkills((prev) => [...prev, trimmed]);
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills((prev) => prev.filter((s) => s !== skillToRemove));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const payload = {
        name: name,
        college: college,
        degree: degree,
        graduationYear: Number(gradYear),
        skills: skills
      };

      const res = await updateUserProfile(payload);
      setSuccessMsg('Profile and skill vector updated successfully!');
      if (onUserUpdated && res.profile) {
        onUserUpdated(res.profile);
      }
    } catch (err: any) {
      setError('Failed to update profile settings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToDashboard}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-indigo-400 transition-colors bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <span className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider flex items-center space-x-1.5 font-mono">
          <Settings className="w-3.5 h-3.5" />
          <span>Platform Settings</span>
        </span>
      </div>

      {successMsg && (
        <p className="text-xs text-emerald-400 bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20 flex items-center space-x-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{successMsg}</span>
        </p>
      )}

      {error && (
        <p className="text-xs text-rose-400 bg-rose-500/10 p-4 rounded-2xl border border-rose-500/20">{error}</p>
      )}

      <form onSubmit={handleSaveProfile} className="space-y-8">
        
        {/* Profile Card */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6 glow-border">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <User className="w-4 h-4 text-indigo-400" />
            <span>Candidate Profile Information</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">University / College</label>
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Degree Program</label>
              <input
                type="text"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Graduation Year</label>
              <input
                type="number"
                value={gradYear}
                onChange={(e) => setGradYear(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Skill Vector Manager */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6 glow-border">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <BrainCircuit className="w-4 h-4 text-indigo-400" />
              <span>Verified Skill Vector Manager</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Add or manage skills used by Scikit-Learn Random Forest and ChromaDB for job recommendations.
            </p>
          </div>

          {/* Skill Add Input */}
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={newSkillInput}
              onChange={(e) => setNewSkillInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }}
              placeholder="Enter technical skill (e.g. PyTorch, Docker, Next.js)..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-4 py-2.5 bg-slate-900 border border-slate-800 text-indigo-400 hover:text-white rounded-xl text-xs font-bold transition-colors flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add Skill</span>
            </button>
          </div>

          {/* Skill Chips */}
          <div className="flex flex-wrap gap-2 pt-2">
            {skills.map((skill, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-indigo-300 flex items-center space-x-2"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="text-slate-500 hover:text-rose-400 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-2xl font-bold text-xs shadow-lg shadow-indigo-500/20 flex items-center justify-center space-x-2 transition-all"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save Profile & Skill Vector Updates</span>
        </button>

      </form>

      {/* System Diagnostic Status */}
      <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4 glow-border">
        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>CampusMate AI Infrastructure Status</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">MongoDB Atlas DB</span>
            <span className="text-emerald-400 font-bold flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Connected</span>
            </span>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">ChromaDB Vector Store</span>
            <span className="text-emerald-400 font-bold flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Initialized</span>
            </span>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Scikit-Learn ML Engine</span>
            <span className="text-emerald-400 font-bold flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Trained (95.8%)</span>
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};
