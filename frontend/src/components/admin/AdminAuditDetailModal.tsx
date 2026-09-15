import React from 'react';
import { X, ShieldCheck, Clock, User, HardDrive, Terminal, FileText } from 'lucide-react';

interface AdminAuditDetailModalProps {
  log: any | null;
  onClose: () => void;
}

const SENSITIVE_KEYS = ['password', 'passwordhash', 'jwt_secret', 'mongodb_uri', 'openai_api_key', 'llm_api_key', 'access_token', 'authorization'];

const sanitizeMetadataForDisplay = (data: any): any => {
  if (!data) return {};
  if (typeof data !== 'object') return data;
  
  if (Array.isArray(data)) {
    return data.map(sanitizeMetadataForDisplay);
  }

  const cleanObj: Record<string, any> = {};
  for (const [key, val] of Object.entries(data)) {
    if (SENSITIVE_KEYS.includes(key.toLowerCase())) {
      cleanObj[key] = '[REDACTED_SECRET]';
    } else if (typeof val === 'object' && val !== null) {
      cleanObj[key] = sanitizeMetadataForDisplay(val);
    } else {
      cleanObj[key] = val;
    }
  }
  return cleanObj;
};

export const AdminAuditDetailModal: React.FC<AdminAuditDetailModalProps> = ({ log, onClose }) => {
  if (!log) return null;

  const safeMetadata = sanitizeMetadataForDisplay(log.metadata || {});

  const getActionColor = (act: string) => {
    if (act.includes('LOGIN_SUCCESS') || act.includes('CREATED') || act.includes('ENABLED')) {
      return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
    }
    if (act.includes('FAILED') || act.includes('DISABLED') || act.includes('DELETED')) {
      return 'bg-rose-500/10 text-rose-300 border-rose-500/30';
    }
    if (act.includes('UPDATED') || act.includes('CLOSED')) {
      return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
    }
    return 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      
      <div className="glass-card w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-2xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Audit Record Detail</span>
              <h3 className="text-lg font-black text-white">Event Log #{log.id?.slice(-8)}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Badge & Description */}
        <div className="p-4 bg-slate-950/50 border border-slate-800/80 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className={`px-3 py-1 text-xs font-mono font-bold rounded-lg border ${getActionColor(log.action)}`}>
              {log.action}
            </span>
            <div className="flex items-center space-x-1.5 text-xs text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{log.created_at ? new Date(log.created_at).toLocaleString() : 'N/A'}</span>
            </div>
          </div>
          <p className="text-sm font-semibold text-white">{log.description}</p>
        </div>

        {/* Audit Log Data Grid */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          
          <div className="p-3.5 bg-slate-950/40 border border-slate-800/60 rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center space-x-1">
              <User className="w-3 h-3 text-indigo-400" />
              <span>Administrator</span>
            </span>
            <p className="font-bold text-white">{log.admin_username || 'admin'}</p>
            <p className="text-[10px] text-slate-500 font-mono">ID: {log.admin_id}</p>
          </div>

          <div className="p-3.5 bg-slate-950/40 border border-slate-800/60 rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center space-x-1">
              <HardDrive className="w-3 h-3 text-purple-400" />
              <span>Resource Category</span>
            </span>
            <p className="font-bold text-white capitalize">{log.resource_type}</p>
            <p className="text-[10px] text-slate-500 font-mono">ID: {log.resource_id || 'N/A'}</p>
          </div>

          <div className="p-3.5 bg-slate-950/40 border border-slate-800/60 rounded-xl space-y-1 col-span-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center space-x-1">
              <FileText className="w-3 h-3 text-cyan-400" />
              <span>Target Resource Name</span>
            </span>
            <p className="font-bold text-slate-200">{log.target_name || 'N/A'}</p>
          </div>

        </div>

        {/* Safe Metadata JSON Inspector */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center space-x-1">
            <Terminal className="w-3 h-3 text-teal-400" />
            <span>Safe Metadata Payload</span>
          </span>
          <pre className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl font-mono text-[11px] text-teal-300 overflow-x-auto max-h-40">
            {JSON.stringify(safeMetadata, null, 2)}
          </pre>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white rounded-xl transition-colors cursor-pointer"
          >
            Close Detail Record
          </button>
        </div>

      </div>

    </div>
  );
};
