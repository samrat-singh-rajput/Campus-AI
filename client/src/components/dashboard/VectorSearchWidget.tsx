import React, { useEffect, useState } from 'react';
import { Search, Database, Sparkles, RefreshCw } from 'lucide-react';
import { searchVectorStore, fetchRAGStats, seedKnowledgeBase } from '../../services/ragService';
import type { SearchResultItem, RAGStatsResponse } from '../../services/ragService';

export const VectorSearchWidget: React.FC = () => {
  const [queryText, setQueryText] = useState<string>('FastAPI React full stack resume ATS keywords');
  const [collection, setCollection] = useState<string>('campusmate_knowledge');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [stats, setStats] = useState<RAGStatsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    try {
      const data = await fetchRAGStats();
      setStats(data);
    } catch (e) {
      // stats error fallback
    }
  };

  const handleSearch = async () => {
    if (!queryText.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await searchVectorStore(queryText, collection, 4);
      setResults(res.results);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Vector search failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    setLoading(true);
    try {
      await seedKnowledgeBase();
      await loadStats();
      await handleSearch();
    } catch (e) {
      setError('Failed to seed career knowledge base.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    handleSearch();
  }, []);

  return (
    <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-6 glow-border">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <span>ChromaDB Vector RAG Explorer</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-bold">
                Step 6 Active
              </span>
            </h3>
            <p className="text-xs text-slate-400">Persistent Vector Database • 384-Dim Semantic Embeddings</p>
          </div>
        </div>

        <button
          onClick={handleSeed}
          className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 rounded-xl flex items-center space-x-1.5 transition-colors self-start sm:self-auto"
          title="Seed Default Career Knowledge"
        >
          <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
          <span>Seed Knowledge Base</span>
        </button>
      </div>

      {/* Stats Summary Chips */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.collections.map((c) => (
            <div key={c.collection_name} className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-2.5 text-xs">
              <span className="text-[10px] text-slate-500 block truncate font-mono">{c.collection_name}</span>
              <span className="text-sm font-extrabold text-indigo-300 mt-0.5 block">{c.document_count} Vectors</span>
            </div>
          ))}
        </div>
      )}

      {/* Search Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Enter query to test semantic vector similarity..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <select
          value={collection}
          onChange={(e) => setCollection(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
        >
          <option value="campusmate_knowledge">campusmate_knowledge</option>
          <option value="campusmate_resumes">campusmate_resumes</option>
          <option value="campusmate_jobs">campusmate_jobs</option>
        </select>

        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center space-x-1.5 transition-all disabled:opacity-50"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span>Vector Search</span>
        </button>
      </div>

      {error && (
        <p className="text-xs text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">{error}</p>
      )}

      {/* Vector Results List */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>Vector Search Matches ({results.length}):</span>
          <span className="text-[10px] text-slate-500 font-mono">Ranked by Cosine Similarity</span>
        </h4>

        {results.length > 0 ? (
          <div className="space-y-3">
            {results.map((res) => (
              <div key={res.id} className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-300 font-mono text-[11px]">ID: {res.id}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-extrabold text-[10px]">
                    {res.similarity_score}% Match Score
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed font-sans">{res.document}</p>
                {res.metadata && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {Object.entries(res.metadata).map(([k, v]) => (
                      <span key={k} className="text-[9px] px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-400 font-mono">
                        {k}: {String(v)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl">
            No vector matches found for this query in collection '{collection}'. Try seeding the knowledge base or uploading a PDF resume.
          </div>
        )}
      </div>

    </div>
  );
};
