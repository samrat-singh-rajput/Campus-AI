import React, { useState } from 'react';
import { Play, Sparkles, Check, AlertCircle } from 'lucide-react';

interface JobRole {
  id: string;
  title: string;
  requiredSkills: string[];
}

const ROLES: JobRole[] = [
  {
    id: 'fs',
    title: 'Full Stack Engineer',
    requiredSkills: ['Python', 'FastAPI', 'React', 'TypeScript', 'MongoDB', 'Docker', 'REST APIs']
  },
  {
    id: 'ai',
    title: 'AI / ML Engineer',
    requiredSkills: ['Python', 'PyTorch', 'LangChain', 'ChromaDB', 'Scikit-Learn', 'FastAPI', 'Vector Embeddings']
  },
  {
    id: 'de',
    title: 'Data Engineer',
    requiredSkills: ['Python', 'SQL', 'MongoDB', 'Apache Spark', 'Docker', 'FastAPI', 'Data Pipelines']
  }
];

export const LiveDemo: React.FC = () => {
  const [selectedRoleId, setSelectedRoleId] = useState<string>('fs');
  const [userSkills, setUserSkills] = useState<string[]>(['Python', 'FastAPI', 'React', 'TypeScript']);
  const [customSkillInput, setCustomSkillInput] = useState<string>('');

  const currentRole = ROLES.find(r => r.id === selectedRoleId) || ROLES[0];

  const toggleSkill = (skill: string) => {
    if (userSkills.includes(skill)) {
      setUserSkills(userSkills.filter(s => s !== skill));
    } else {
      setUserSkills([...userSkills, skill]);
    }
  };

  const handleAddCustomSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (customSkillInput.trim() && !userSkills.includes(customSkillInput.trim())) {
      setUserSkills([...userSkills, customSkillInput.trim()]);
      setCustomSkillInput('');
    }
  };

  const matchedSkills = currentRole.requiredSkills.filter(skill => userSkills.includes(skill));
  const missingSkills = currentRole.requiredSkills.filter(skill => !userSkills.includes(skill));
  
  // Simulated ML Match calculation percentage
  const matchPercentage = Math.round((matchedSkills.length / currentRole.requiredSkills.length) * 100);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 50) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  };

  return (
    <section id="demo" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
            <Play className="w-3.5 h-3.5 fill-blue-400" />
            <span>Interactive Simulator</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Try the Interactive <span className="gradient-text">ATS & Job Matcher</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed font-normal">
            Select a target role and check off your skills to test the Random Forest match algorithm logic in real time!
          </p>
        </div>

        {/* Demo Widget Box */}
        <div className="glass-card rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl max-w-4xl mx-auto relative overflow-hidden">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* Left Column: Role Selector & Skills Checkbox */}
            <div className="md:col-span-7 space-y-6">
              
              {/* Role Select Buttons */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">1. Choose Target Role</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {ROLES.map(role => (
                    <button
                      key={role.id}
                      onClick={() => setSelectedRoleId(role.id)}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all text-left flex flex-col justify-between ${
                        selectedRoleId === role.id
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-lg shadow-indigo-500/10'
                          : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <span>{role.title}</span>
                      <span className="text-[10px] text-slate-500 mt-2">{role.requiredSkills.length} Required Skills</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Skills Toggle Grid */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">2. Select Your Current Skills</label>
                <div className="flex flex-wrap gap-2">
                  {currentRole.requiredSkills.map(skill => {
                    const isSelected = userSkills.includes(skill);
                    return (
                      <button
                        key={skill}
                        onClick={() => toggleSkill(skill)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                          isSelected
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {isSelected ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <div className="w-3.5 h-3.5 border border-slate-600 rounded-full"></div>}
                        <span>{skill}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Skill Add Form */}
              <form onSubmit={handleAddCustomSkill} className="flex items-center space-x-2 pt-2">
                <input
                  type="text"
                  placeholder="Add another skill (e.g. AWS, GraphQL)..."
                  value={customSkillInput}
                  onChange={(e) => setCustomSkillInput(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
                >
                  Add Skill
                </button>
              </form>

            </div>

            {/* Right Column: Live Match Results Panel */}
            <div className="md:col-span-5 bg-slate-950/80 rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
              
              <div className="space-y-6">
                
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Match Results</span>
                  <span className={`text-xs px-3 py-1 rounded-full font-extrabold border ${getScoreColor(matchPercentage)}`}>
                    {matchPercentage}% ATS Fit
                  </span>
                </div>

                {/* Score Progress Gauge */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-300 font-semibold">
                    <span>Eligibility Confidence</span>
                    <span className="text-indigo-400">{matchPercentage}%</span>
                  </div>
                  <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${matchPercentage}%` }}
                    ></div>
                  </div>
                </div>

                {/* Matched vs Missing Skills */}
                <div className="space-y-3">
                  <div>
                    <span className="text-[11px] font-semibold text-emerald-400 flex items-center space-x-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Matched ({matchedSkills.length}):</span>
                    </span>
                    <p className="text-xs text-slate-300 mt-1 font-mono">
                      {matchedSkills.length > 0 ? matchedSkills.join(', ') : 'None selected yet'}
                    </p>
                  </div>

                  {missingSkills.length > 0 && (
                    <div>
                      <span className="text-[11px] font-semibold text-amber-400 flex items-center space-x-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Recommended to Add ({missingSkills.length}):</span>
                      </span>
                      <p className="text-xs text-slate-400 mt-1 font-mono">
                        {missingSkills.join(', ')}
                      </p>
                    </div>
                  )}
                </div>

              </div>

              {/* Bottom Action Note */}
              <div className="pt-6 border-t border-slate-800/80 mt-6">
                <a
                  href="#health"
                  className="w-full py-2.5 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Full Engine Connected to API</span>
                </a>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
