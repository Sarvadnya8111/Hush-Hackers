
import React from 'react';
import { RegistryResponse, FlagEntry } from '../types';
import { ShieldAlert, Users, Mail, Phone, ExternalLink, ShieldCheck, AlertTriangle, ChevronRight, Search, Zap, Globe } from 'lucide-react';

interface RegistryViewProps {
  registry: RegistryResponse;
}

const RegistryView: React.FC<RegistryViewProps> = ({ registry }) => {
  const entries = registry.demo_entries || registry.flagged_senders || [];

  if (entries.length === 0) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
        <div className="bg-slate-900 border border-white/5 rounded-[40px] p-10 md:p-14 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4 uppercase">Threat Registry</h2>
            <p className="text-slate-400 text-lg max-w-2xl">Searching global database for confirmed fraudulent senders...</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-white/10 rounded-[32px] p-20 flex flex-col items-center justify-center text-center">
           <Search className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-4 animate-pulse" />
           <h3 className="text-xl font-bold text-slate-900 dark:text-white">Synchronizing Registry...</h3>
           <p className="text-slate-500 max-w-xs mt-2 text-sm">Connecting to the FraudGenome global flag engine. Please wait.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="bg-[#0A0D14] border border-white/5 rounded-[40px] p-10 md:p-14 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-6">
            <Globe className="w-3 h-3" /> Live Global Intelligence
          </div>
          <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-4 uppercase">Threat Registry</h2>
          <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">
            Identified <span className="text-white font-bold">Repeat Offenders</span> and consistent threat nodes flagged by the v2.0 AI engine.
          </p>
        </div>
        <div className="absolute top-0 right-0 p-10 opacity-[0.03]">
           <ShieldAlert className="w-64 h-64 text-white" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {entries.map((entry) => (
          <div key={entry.flag_id} className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[32px] overflow-hidden hover:border-indigo-500/40 transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/5">
            <div className="p-8 md:p-10 flex flex-col lg:flex-row gap-10">
              <div className="lg:w-1/3 space-y-6">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></div>
                      <span className="font-mono text-[10px] font-bold text-slate-500 uppercase">FLAG_ID: {entry.flag_id}</span>
                   </div>
                   <div className="px-3 py-1 rounded-full text-[9px] font-black tracking-[0.2em] uppercase" style={{ backgroundColor: (entry.risk_color || '#FF3B3B') + '20', color: entry.risk_color || '#FF3B3B' }}>
                    {entry.risk_badge || '🔴 CRITICAL'}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight group-hover:text-indigo-500 transition-colors">
                    {entry.impersonates || 'Anonymous Actor'}
                  </h3>
                  <p className="text-sm font-mono text-slate-500 break-all">{entry.email_address}</p>
                </div>

                <div className="flex items-center gap-6 pt-2">
                   <div className="space-y-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reports</div>
                      <div className="flex items-center gap-2">
                         <Users className="w-4 h-4 text-indigo-500" />
                         <span className="text-xl font-black">{entry.total_victims_reported}</span>
                      </div>
                   </div>
                   <div className="w-px h-8 bg-slate-200 dark:bg-white/5" />
                   <div className="space-y-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Spam Vol</div>
                      <div className="flex items-center gap-2">
                         <Mail className="w-4 h-4 text-indigo-500" />
                         <span className="text-xl font-black">{entry.total_emails_sent}</span>
                      </div>
                   </div>
                </div>
              </div>

              <div className="lg:w-2/3 space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                       <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <Zap className="w-3 h-3" /> Scam Signatures
                       </h4>
                       <div className="flex flex-wrap gap-2">
                          {(entry.scam_types_used || []).map((t, i) => (
                            <span key={i} className="px-3 py-1.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl text-[11px] font-bold text-slate-700 dark:text-slate-300">
                               {t}
                            </span>
                          ))}
                       </div>
                    </div>

                    <div className="space-y-4">
                       <h4 className="text-[10px] font-bold text-rose-500 uppercase tracking-widest flex items-center gap-2">
                          <AlertTriangle className="w-3 h-3" /> Vectors
                       </h4>
                       <div className="flex gap-4 items-center">
                          <div className={`p-2.5 rounded-xl border ${entry.linked_phone_numbers?.length ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400'}`}>
                             <Phone className="w-5 h-5" />
                          </div>
                          <div className={`p-2.5 rounded-xl border ${entry.linked_upi_ids?.length ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400'}`}>
                             <ShieldCheck className="w-5 h-5" />
                          </div>
                          <div className={`p-2.5 rounded-xl border ${entry.linked_domains?.length ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400'}`}>
                             <ExternalLink className="w-5 h-5" />
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="p-6 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-3xl relative overflow-hidden">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Threat Summary</div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium italic">
                      "{entry.threat_summary || 'Analysis indicates consistent impersonation patterns targeting high-value credentials.'}"
                    </p>
                 </div>
              </div>
            </div>
            
            <div className="px-8 py-5 bg-slate-50 dark:bg-black/20 border-t border-slate-100 dark:border-white/5 flex flex-wrap justify-between items-center gap-4">
               <div className="flex items-center gap-8">
                  <div className="flex items-center gap-2">
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Confidence</span>
                     <div className="w-24 h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${entry.confidence_score}%` }} />
                     </div>
                     <span className="text-[10px] font-mono font-bold text-indigo-500">{entry.confidence_score}%</span>
                  </div>
               </div>
               
               <button className="text-xs font-black text-indigo-500 hover:text-indigo-400 flex items-center gap-2 uppercase tracking-widest group/btn">
                 Inspect Breakdown 
                 <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RegistryView;
