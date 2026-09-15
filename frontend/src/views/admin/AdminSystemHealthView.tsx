import React, { useEffect, useState } from 'react';
import { 
  Activity, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Database, 
  Layers, 
  Cpu, 
  ShieldCheck, 
  FileText, 
  Bot, 
  Mic, 
  Key, 
  Server, 
  Clock, 
  X, 
  Info 
} from 'lucide-react';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { 
  fetchAdminSystemHealth 
} from '../../services/adminAuthService';
import type { 
  AdminUser, 
  AdminSystemHealthResponse, 
  AdminServiceHealthItem 
} from '../../services/adminAuthService';
import { getErrorMessage } from '../../services/api';

interface AdminSystemHealthViewProps {
  admin: AdminUser;
  onLogout: () => void;
  onNavigateTab: (tab: string) => void;
}

export const AdminSystemHealthView: React.FC<AdminSystemHealthViewProps> = ({ admin, onLogout, onNavigateTab }) => {
  const [healthData, setHealthData] = useState<AdminSystemHealthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  // Selected Service Detail Modal
  const [selectedService, setSelectedService] = useState<AdminServiceHealthItem | null>(null);

  const loadSystemHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAdminSystemHealth();
      setHealthData(res);
    } catch (err: any) {
      setError(getErrorMessage(err) || 'Unable to load system health checks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSystemHealth();
  }, []);

  const getStatusIcon = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'operational') return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    if (s === 'degraded') return <AlertTriangle className="w-4 h-4 text-amber-400" />;
    return <XCircle className="w-4 h-4 text-rose-400" />;
  };

  const getStatusBadgeClass = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'operational') return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
    if (s === 'degraded') return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
    return 'bg-rose-500/10 border-rose-500/30 text-rose-400';
  };

  const getServiceIcon = (id: string) => {
    switch (id) {
      case 'fastapi_backend': return <Server className="w-5 h-5 text-indigo-400" />;
      case 'mongodb_atlas': return <Database className="w-5 h-5 text-emerald-400" />;
      case 'chromadb_vectorstore': return <Layers className="w-5 h-5 text-purple-400" />;
      case 'auth_jwt_service': return <ShieldCheck className="w-5 h-5 text-blue-400" />;
      case 'resume_parser_pypdf': return <FileText className="w-5 h-5 text-teal-400" />;
      case 'random_forest_ml': return <Cpu className="w-5 h-5 text-amber-400" />;
      case 'langgraph_agent': return <Bot className="w-5 h-5 text-indigo-400" />;
      case 'mock_interview_engine': return <Mic className="w-5 h-5 text-rose-400" />;
      case 'llm_provider_config': return <Key className="w-5 h-5 text-cyan-400" />;
      default: return <Activity className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Sidebar */}
      <AdminSidebar
        admin={admin}
        activeTab="health"
        onSelectTab={onNavigateTab}
        onLogout={onLogout}
        isOpenMobile={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Container */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        
        {/* Header */}
        <AdminHeader
          admin={admin}
          onLogout={onLogout}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
        />

        {/* System Health Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl w-full mx-auto">
          
          {/* Title Banner */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 glow-border">
            <div>
              <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                <Activity className="w-3.5 h-3.5" />
                <span>Infrastructure Operations</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                System Health & Monitoring
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Real-time operational status for MongoDB Atlas, ChromaDB, Random Forest ML, LangGraph Agent, and API routers.
              </p>
            </div>

            <button
              onClick={loadSystemHealth}
              disabled={loading}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white rounded-xl transition-colors flex items-center space-x-2 self-start sm:self-auto cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Health</span>
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-between text-rose-300 text-xs">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                <span>{error}</span>
              </div>
              <button
                onClick={loadSystemHealth}
                className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 rounded-xl font-bold transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Overall Platform Status Banner */}
          <div className="glass-card rounded-3xl p-6 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 glow-border">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${
                healthData?.overall_status === 'Operational' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                healthData?.overall_status === 'Degraded' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}>
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Overall Infrastructure Status</span>
                <div className="flex items-center space-x-2 mt-0.5">
                  <h3 className="text-xl font-black text-white">{healthData?.overall_status || 'Checking...'}</h3>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase border ${getStatusBadgeClass(healthData?.overall_status || 'Operational')}`}>
                    {healthData?.overall_status || 'Checking'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400">
              <div className="flex items-center space-x-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>{healthData?.server_timestamp ? new Date(healthData.server_timestamp).toLocaleTimeString() : 'Recent'}</span>
              </div>
              <div className="bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                Env: <strong className="text-slate-200">{healthData?.environment || 'development'}</strong>
              </div>
              <div className="bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                Version: <strong className="text-slate-200">v{healthData?.app_version || '1.0.0'}</strong>
              </div>
            </div>
          </div>

          {/* Real Platform Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            
            <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-1 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Students</span>
              <p className="text-xl sm:text-2xl font-black text-white">{healthData?.total_students ?? 0}</p>
            </div>

            <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-1 text-center">
              <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider block">Resumes</span>
              <p className="text-xl sm:text-2xl font-black text-teal-300">{healthData?.total_resumes ?? 0}</p>
            </div>

            <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-1 text-center">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Jobs</span>
              <p className="text-xl sm:text-2xl font-black text-indigo-300">{healthData?.total_jobs ?? 0}</p>
            </div>

            <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-1 text-center">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">Applications</span>
              <p className="text-xl sm:text-2xl font-black text-purple-300">{healthData?.total_applications ?? 0}</p>
            </div>

            <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-1 text-center">
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">Interviews</span>
              <p className="text-xl sm:text-2xl font-black text-rose-300">{healthData?.total_interviews ?? 0}</p>
            </div>

            <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-1 text-center">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Vectors</span>
              <p className="text-xl sm:text-2xl font-black text-amber-300">{healthData?.chroma_document_count ?? 0}</p>
            </div>

          </div>

          {/* Service Health Cards Grid */}
          <div className="space-y-4">
            <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
              <Server className="w-4 h-4 text-indigo-400" />
              <span>Microservices & Component Health</span>
            </h3>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((idx) => (
                  <div key={idx} className="glass-card rounded-3xl p-6 border border-slate-800 animate-pulse space-y-3">
                    <div className="h-4 bg-slate-900 rounded w-1/2" />
                    <div className="h-3 bg-slate-900 rounded w-3/4" />
                    <div className="h-8 bg-slate-900 rounded" />
                  </div>
                ))}
              </div>
            ) : healthData?.services && healthData.services.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {healthData.services.map((svc) => (
                  <div
                    key={svc.id}
                    onClick={() => setSelectedService(svc)}
                    className="glass-card rounded-3xl p-5 border border-slate-800 hover:border-indigo-500/40 transition-all duration-300 space-y-4 glow-border cursor-pointer flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-2xl">
                            {getServiceIcon(svc.id)}
                          </div>
                          <div>
                            <h4 className="text-sm font-extrabold text-white leading-snug">{svc.name}</h4>
                            <span className="text-[10px] text-slate-500 font-mono">Ping: {svc.response_time_ms} ms</span>
                          </div>
                        </div>

                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase border flex items-center space-x-1 ${getStatusBadgeClass(svc.status)}`}>
                          {getStatusIcon(svc.status)}
                          <span>{svc.status}</span>
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {svc.purpose}
                      </p>
                    </div>

                    {/* Safe Details Preview Pill */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-indigo-400 font-semibold">
                      <span>Click to view details</span>
                      <Info className="w-3.5 h-3.5" />
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center text-xs text-slate-500 font-semibold">
                No service health checks available.
              </div>
            )}
          </div>

        </main>

        {/* Service Health Detail Modal */}
        {selectedService && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="glass-card max-w-xl w-full rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative space-y-6 glow-border">
              
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl">
                    {getServiceIcon(selectedService.id)}
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white">{selectedService.name}</h3>
                    <span className="text-xs text-slate-400 font-mono">Service ID: {selectedService.id}</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedService(null)}
                  className="p-1.5 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Header */}
              <div className="glass-card rounded-2xl p-4 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Operational Status</span>
                  <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase border inline-flex items-center space-x-1.5 mt-1 ${getStatusBadgeClass(selectedService.status)}`}>
                    {getStatusIcon(selectedService.status)}
                    <span>{selectedService.status}</span>
                  </span>
                </div>

                <div className="text-right font-mono text-xs text-slate-400">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Check Latency</span>
                  <strong className="text-indigo-400 text-sm">{selectedService.response_time_ms} ms</strong>
                </div>
              </div>

              {/* Purpose */}
              <div className="space-y-1 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Service Purpose & Responsibility</span>
                <p className="text-slate-300 bg-slate-900/80 border border-slate-800 rounded-xl p-3 leading-relaxed">
                  {selectedService.purpose}
                </p>
              </div>

              {/* Technical Details JSON/Pills */}
              <div className="space-y-2 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Diagnostic & Safe Technical Metrics</span>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 font-mono text-[11px]">
                  {Object.entries(selectedService.details).map(([k, v]) => (
                    <div key={k} className="flex justify-between items-center border-b border-slate-900 pb-1.5 last:border-0 last:pb-0">
                      <span className="text-slate-400">{k}:</span>
                      <span className="text-indigo-300 font-bold max-w-[250px] truncate">
                        {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
