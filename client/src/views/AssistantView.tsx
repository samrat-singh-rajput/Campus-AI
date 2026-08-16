import React, { useEffect, useState, useRef } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  ArrowLeft, 
  RefreshCw, 
  Wrench, 
  Database, 
  FileText, 
  Target, 
  Kanban,
  User,
  Trash2
} from 'lucide-react';
import { sendAgentChat } from '../services/agentService';
import type { ChatMessage } from '../services/agentService';
import { VectorSearchWidget } from '../components/dashboard/VectorSearchWidget';

interface AssistantViewProps {
  user: any;
  onBackToDashboard: () => void;
  onSelectTab: (tabId: string) => void;
}

const QUICK_PROMPTS = [
  { label: 'Analyze Resume & ATS Score', text: 'Analyze my uploaded resume, extracted skills, and ATS score.', icon: FileText },
  { label: 'ML Job Recommendations', text: 'Recommend the top jobs matching my skill vector using Random Forest ML.', icon: Target },
  { label: 'Application Status Check', text: 'What is the status of my active job applications in the pipeline?', icon: Kanban },
  { label: 'Interview Preparation Tips', text: 'Give me full stack developer technical interview preparation advice.', icon: Sparkles }
];

export const AssistantView: React.FC<AssistantViewProps> = ({ user, onBackToDashboard, onSelectTab: _onSelectTab }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [activeSubTab, setActiveSubTab] = useState<'chat' | 'vector'>('chat');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Initial welcome message
  useEffect(() => {
    setMessages([
      {
        sender: 'agent',
        text: `### 👋 Hi ${user?.name || 'Student'}!\nI am your **LangGraph Autonomous AI Agent & RAG Career Assistant**.\n\nI can execute real backend tools from **Steps 5–8** to analyze your resume, recommend jobs using **Scikit-Learn Random Forest**, retrieve semantic vector knowledge from **ChromaDB**, and track your active application pipeline.\n\nHow can I assist your career today?`
      }
    ]);
  }, [user]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: ChatMessage = {
      sender: 'user',
      text: query,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const response = await sendAgentChat(query, conversationId);
      setConversationId(response.conversation_id);

      const agentMsg: ChatMessage = {
        sender: 'agent',
        text: response.reply,
        tools_used: response.tools_used,
        timestamp: response.created_at
      };

      setMessages((prev) => [...prev, agentMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'agent',
          text: '⚠️ Sorry, I encountered an error while executing the LangGraph Agent workflow. Please try again.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBackToDashboard}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-indigo-400 transition-colors bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center space-x-2 bg-slate-950 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveSubTab('chat')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              activeSubTab === 'chat'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>LangGraph Agent Chat</span>
          </button>

          <button
            onClick={() => setActiveSubTab('vector')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              activeSubTab === 'vector'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>ChromaDB Vector RAG</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'vector' ? (
        <VectorSearchWidget />
      ) : (
        <div className="glass-card rounded-3xl border border-slate-800 shadow-2xl flex flex-col h-[650px] overflow-hidden glow-border">
          
          {/* Agent Header Banner */}
          <div className="px-6 py-4 bg-slate-950/90 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-0.5 shadow-lg shadow-indigo-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-indigo-400">
                  <Bot className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <span>LangGraph Agent & RAG Assistant</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-mono font-bold">
                    STEP 9 Active
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">Multi-Tool Autonomous StateGraph Engine</p>
              </div>
            </div>

            <button
              onClick={() => {
                setMessages([messages[0]]);
                setConversationId(undefined);
              }}
              className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
              title="Clear Conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Messages Window */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 max-w-3xl ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-md ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white'
                    : 'bg-slate-900 border border-slate-800 text-indigo-400'
                }`}>
                  {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div className="space-y-2 max-w-xl">
                  
                  {/* Tool Executions Badges */}
                  {msg.tools_used && msg.tools_used.length > 0 && (
                    <div className="space-y-1">
                      {msg.tools_used.map((tool, tIdx) => (
                        <div
                          key={tIdx}
                          className="bg-slate-950 border border-indigo-500/30 rounded-xl p-2 text-[10px] flex items-center space-x-2 text-indigo-300 font-mono"
                        >
                          <Wrench className="w-3 h-3 text-indigo-400 flex-shrink-0" />
                          <span>Tool Executed: <strong>{tool.tool_name}</strong></span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-md'
                      : 'bg-slate-900/90 border border-slate-800 text-slate-200 shadow-sm whitespace-pre-wrap'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 mr-auto items-center text-xs text-slate-400">
                <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400">
                  <Bot className="w-4 h-4 animate-bounce" />
                </div>
                <div className="bg-slate-900 border border-slate-800 px-4 py-3 rounded-2xl flex items-center space-x-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                  <span>LangGraph Agent executing multi-tool workflow...</span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/60 overflow-x-auto flex items-center space-x-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex-shrink-0">Quick Prompts:</span>
            {QUICK_PROMPTS.map((p, idx) => {
              const Icon = p.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(p.text)}
                  className="px-3 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-[11px] font-medium text-slate-300 hover:text-white transition-colors flex items-center space-x-1.5 flex-shrink-0"
                >
                  <Icon className="w-3 h-3 text-indigo-400" />
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>

          {/* Input Form Bar */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            className="p-4 bg-slate-950 border-t border-slate-800/80 flex items-center space-x-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask LangGraph Agent about your resume, ML job recommendations, or career tips..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            />

            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-bold text-xs shadow-lg shadow-indigo-500/20 flex items-center justify-center space-x-1.5 transition-all disabled:opacity-50"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>
      )}

    </div>
  );
};
