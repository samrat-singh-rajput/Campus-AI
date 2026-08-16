import React, { useEffect, useState } from 'react';
import { checkHealth } from './services/api';
import type { HealthResponse } from './services/api';
import { Database, Cpu, CheckCircle2, AlertCircle, RefreshCw, Sparkles, Shield, Rocket } from 'lucide-react';

export const App: React.FC = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await checkHealth();
      setHealth(data);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to CampusMate AI backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Navbar */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src="/logo.png" 
              alt="CampusMate AI Logo" 
              className="h-12 w-auto object-contain drop-shadow-md"
            />
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  CampusMate AI
                </span>
                <span className="bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs px-2 py-0.5 rounded-full font-semibold">
                  v1.0 Foundation
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Your AI Career Companion</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={fetchStatus}
              disabled={loading}
              className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border border-slate-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-400' : ''}`} />
              <span>Refresh Status</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-12 flex flex-col justify-center">
        {/* Banner */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            <span>Step 1: System Foundation Active</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-4">
            Welcome to <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">CampusMate AI</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Full-Stack AI Career Platform with FastAPI backend, MongoDB Atlas primary database, and persistent ChromaDB RAG vector store.
          </p>
        </div>

        {/* Foundation Health Card */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

          <div className="flex items-center justify-between pb-6 border-b border-slate-800 mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <Rocket className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Platform System Health</h2>
                <p className="text-xs text-slate-400">Verifying REST API, MongoDB Atlas & Vector Store connections</p>
              </div>
            </div>
            {health?.status === 'online' ? (
              <span className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Backend Online</span>
              </span>
            ) : (
              <span className="flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1 rounded-full text-xs font-semibold">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{loading ? 'Connecting...' : 'Connecting / Standby'}</span>
              </span>
            )}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start space-x-3 text-rose-300 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
              <div>
                <p className="font-semibold">Backend Connection Notice</p>
                <p className="text-rose-400/90 text-xs mt-0.5">{error}</p>
                <p className="text-slate-400 text-xs mt-2">Ensure FastAPI backend server is running on <code className="bg-slate-900 px-1 py-0.5 rounded text-slate-300">http://127.0.0.1:8000</code></p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* MongoDB Atlas Box */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Database className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-white">MongoDB Atlas</h3>
                </div>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                  health?.database?.mongodb_atlas?.connected
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}>
                  {health?.database?.mongodb_atlas?.connected ? 'Connected' : 'Configured / Pending'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-2">Primary Application Database</p>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 text-xs font-mono text-slate-300">
                <div><span className="text-slate-500">Database:</span> {health?.database?.mongodb_atlas?.database_name || 'campusmate_db'}</div>
                <div className="mt-1 text-slate-400"><span className="text-slate-500">Status:</span> {health?.database?.mongodb_atlas?.status || 'Initial Connection Configured'}</div>
              </div>
            </div>

            {/* ChromaDB Box */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Cpu className="w-5 h-5 text-blue-400" />
                  <h3 className="font-bold text-white">ChromaDB Vector Store</h3>
                </div>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                  health?.database?.chromadb_vectorstore?.initialized
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                }`}>
                  {health?.database?.chromadb_vectorstore?.initialized ? 'Persistent Ready' : 'Initializing'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-2">RAG Semantic Search Store</p>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 text-xs font-mono text-slate-300">
                <div><span className="text-slate-500">Storage Path:</span> {health?.database?.chromadb_vectorstore?.path || './chroma_data'}</div>
                <div className="mt-1"><span className="text-slate-500">Collection:</span> {health?.database?.chromadb_vectorstore?.collection_name || 'campusmate_docs'}</div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-slate-400" />
              <span>Strict Architecture: React → FastAPI → MongoDB Atlas & ChromaDB</span>
            </div>
            <div>
              <span>API Target: <code className="text-blue-400">http://127.0.0.1:8000/api</code></span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>CampusMate AI &copy; 2026 — Your AI Career Companion</span>
          <span className="text-slate-400">Step 1 — Architecture Foundation Verified</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
