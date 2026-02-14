
import React from 'react';
import { FraudDNA } from '../types';
import { Clock, Trash2, ChevronRight, AlertCircle, CheckCircle, ShieldAlert } from 'lucide-react';

interface HistoryListProps {
  history: FraudDNA[];
  onSelect: (data: FraudDNA) => void;
  onClear: () => void;
  activeId?: string;
}

const HistoryList: React.FC<HistoryListProps> = ({ history, onSelect, onClear, activeId }) => {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-white/[0.02] border border-dashed border-slate-200 dark:border-white/10 rounded-3xl">
        <Clock className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-2" />
        <p className="text-sm text-slate-400 font-medium">No scan history yet.</p>
      </div>
    );
  }

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'LOW': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'MEDIUM': return <AlertCircle className="w-4 h-4 text-amber-500" />;
      case 'HIGH':
      case 'CRITICAL': return <ShieldAlert className="w-4 h-4 text-rose-500" />;
      default: return null;
    }
  };

  const getRiskBg = (level: string, isActive: boolean) => {
    if (isActive) return 'bg-indigo-500/10 border-indigo-500/30';
    switch (level) {
      case 'LOW': return 'hover:bg-emerald-500/5 hover:border-emerald-500/20';
      case 'MEDIUM': return 'hover:bg-amber-500/5 hover:border-amber-500/20';
      case 'HIGH':
      case 'CRITICAL': return 'hover:bg-rose-500/5 hover:border-rose-500/20';
      default: return 'hover:bg-slate-50 dark:hover:bg-white/5';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Clock className="w-3.5 h-3.5" />
          Scan History
        </h4>
        <button 
          onClick={onClear}
          className="text-[10px] font-bold text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-1"
        >
          <Trash2 className="w-3 h-3" />
          Clear
        </button>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
        {history.map((item) => {
          const isActive = activeId === item.id;
          const date = new Date(item.timestamp);
          const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          return (
            <button
              key={item.id}
              onClick={() => onSelect(item)}
              className={`w-full group text-left p-4 rounded-2xl border transition-all duration-200 ${
                isActive 
                ? 'bg-white dark:bg-slate-900 border-indigo-500 shadow-lg shadow-indigo-500/10' 
                : 'bg-white dark:bg-[#0A0A0B] border-slate-200 dark:border-white/5 ' + getRiskBg(item.risk_level, isActive)
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-2">
                  {getRiskIcon(item.risk_level)}
                  <span className={`text-xs font-bold uppercase tracking-tight ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}>
                    {item.risk_level} Risk
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">{timeStr}</span>
              </div>
              
              <div className="flex items-end justify-between gap-2">
                <div className="overflow-hidden">
                   <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {item.scam_type || 'Unknown Threat'}
                   </div>
                   <div className="text-[11px] text-slate-500 truncate mt-0.5">
                      {item.impersonation_entity || item.analysis_type}
                   </div>
                </div>
                <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isActive ? 'translate-x-0.5 text-indigo-500' : 'text-slate-300 group-hover:translate-x-0.5'}`} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default HistoryList;
