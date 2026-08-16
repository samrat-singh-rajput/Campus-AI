import React from 'react';
import { Database, Cpu, CheckCircle2, AlertCircle, RefreshCw, Rocket, Shield } from 'lucide-react';
import type { HealthResponse } from '../services/api';

interface HealthStatusProps {
  health: HealthResponse | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export const HealthStatus: React.FC<HealthStatusProps> = ({ health, loading, error, onRefresh }) => {
  return (
    <section id="health" className="py-20 relative bg-slate-950/80">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider inline-flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Live Architecture Verification</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Backend & Database System Status
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time status monitor verifying REST API server, MongoDB Atlas primary storage, and persistent ChromaDB vector engine.
          </p>
        </div>

        {/* System Health Card */}
        <div className="glass-card border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden glow-border">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-indigo-400">
                <Rocket className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Full-Stack System Health</h3>
                <p className="text-xs text-slate-400">Environment: {health?.environment || 'development'} • Version: {health?.version || 'v1.0'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {health?.status === 'online' ? (
                <span className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3.5 py-1.5 rounded-full text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Backend Online</span>
                </span>
              ) : (
                <span className="flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3.5 py-1.5 rounded-full text-xs font-bold">
                  <AlertCircle className="w-4 h-4" />
                  <span>{loading ? 'Connecting...' : 'Connecting / Standby'}</span>
                </span>
              )}

              <button
                onClick={onRefresh}
                disabled={loading}
                className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl transition-all disabled:opacity-50"
                title="Refresh Status"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start space-x-3 text-rose-300 text-xs">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
              <div>
                <p className="font-bold text-sm">Backend Connection Notice</p>
                <p className="text-rose-300 mt-1">{error}</p>
                <p className="text-slate-400 text-[11px] mt-2">
                  Ensure FastAPI backend server is running on <code className="bg-slate-900 px-1.5 py-0.5 rounded text-indigo-300">http://127.0.0.1:8000</code>
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* MongoDB Atlas Status */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Database className="w-5 h-5 text-emerald-400" />
                  <h4 className="font-bold text-white text-sm">MongoDB Atlas</h4>
                </div>
                <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${
                  health?.database?.mongodb_atlas?.connected
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}>
                  {health?.database?.mongodb_atlas?.connected ? 'Connected' : 'Configured / Pending'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-3">Primary Document Store for Users, Resumes & Jobs</p>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300">
                <div><span className="text-slate-500">Database Name:</span> {health?.database?.mongodb_atlas?.database_name || 'campusmate_db'}</div>
                <div className="mt-1"><span className="text-slate-500">Status:</span> {health?.database?.mongodb_atlas?.status || 'Initial Connection Configured'}</div>
              </div>
            </div>

            {/* ChromaDB Status */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Cpu className="w-5 h-5 text-blue-400" />
                  <h4 className="font-bold text-white text-sm">ChromaDB Vector Store</h4>
                </div>
                <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${
                  health?.database?.chromadb_vectorstore?.initialized
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                }`}>
                  {health?.database?.chromadb_vectorstore?.initialized ? 'Persistent Ready' : 'Initializing'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-3">RAG Embeddings Store for Resume Chunks & Knowledge</p>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300">
                <div><span className="text-slate-500">Collection:</span> {health?.database?.chromadb_vectorstore?.collection_name || 'campusmate_docs'}</div>
                <div className="mt-1"><span className="text-slate-500">Total Vectors:</span> {health?.database?.chromadb_vectorstore?.total_documents ?? 0} docs stored</div>
              </div>
            </div>

          </div>

          <div className="mt-6 pt-5 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2 font-medium">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-indigo-400" />
              <span>JWT Authentication & CORS Security Enabled</span>
            </div>
            <span>FastAPI Port: <code className="text-indigo-400 font-mono">8000</code></span>
          </div>

        </div>

      </div>
    </section>
  );
};
