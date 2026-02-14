
import React, { useState, useEffect } from 'react';
import { FraudDNA } from '../types';
import RiskGauge from './RiskGauge';
import { 
  AlertTriangle, CheckCircle, ShieldAlert, ShieldCheck,
  ThumbsUp, ThumbsDown, Megaphone, Lock, PhoneOff, Mail, Globe, AlertOctagon,
  X, Shield, Activity, Search, Info, ChevronRight, ArrowRight, Verified
} from 'lucide-react';

interface AnalysisResultProps {
  data: FraudDNA;
}

type DetailType = 'verdict' | 'trust' | 'flags' | null;

const AnalysisResult: React.FC<AnalysisResultProps> = ({ data }) => {
  const [selectedMetric, setSelectedMetric] = useState<DetailType>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = data.risk_score || 0;
    if (start === end) {
      setCount(end);
      return;
    }

    const totalDuration = 1000;
    const increment = end / (totalDuration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [data.risk_score]);

  const isSafe = data.risk_level === 'LOW' || data.risk_score <= 20;
  const isMedium = data.risk_level === 'MEDIUM' || (data.risk_score > 20 && data.risk_score <= 60);
  const isDanger = data.risk_score > 60;

  let themeColor = 'bg-emerald-500';
  let themeText = 'text-emerald-500';
  let borderColor = 'border-emerald-500/30';
  let statusText = "VERIFIED SAFE";
  let Icon = Verified;

  if (isMedium) {
    themeColor = 'bg-amber-500';
    themeText = 'text-amber-500';
    borderColor = 'border-amber-500/30';
    statusText = "SUSPICIOUS";
    Icon = AlertTriangle;
  }

  if (isDanger) {
    themeColor = 'bg-rose-600';
    themeText = 'text-rose-500';
    borderColor = 'border-rose-500/30';
    statusText = "SCAM DETECTED";
    Icon = ShieldAlert;
  }

  const renderDetailModal = () => {
    if (!selectedMetric || !data.email_metadata) return null;
    const metadata = data.email_metadata;

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]">
        <div className="w-full max-w-2xl bg-white dark:bg-[#0A0A0B] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02]">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {selectedMetric === 'verdict' && <><Shield className="w-5 h-5 text-indigo-500" /> Identity Engine</>}
              {selectedMetric === 'trust' && <><Activity className="w-5 h-5 text-indigo-500" /> Confidence Analysis</>}
              {selectedMetric === 'flags' && <><Search className="w-5 h-5 text-indigo-500" /> Protocol Log</>}
            </h3>
            <button onClick={() => setSelectedMetric(null)} className="p-2 bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-full transition-colors"><X className="w-5 h-5" /></button>
          </div>
          <div className="p-8 overflow-y-auto custom-scrollbar">
            {selectedMetric === 'verdict' && (
              <div className="space-y-6">
                <div className={`p-6 rounded-2xl border ${metadata.sender_verdict === 'TRUSTED' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
                   <div className="text-sm font-bold uppercase tracking-widest mb-1 opacity-70">Behavioral Verdict</div>
                   <div className={`text-4xl font-bold ${metadata.sender_verdict === 'TRUSTED' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>{metadata.sender_verdict || 'UNKNOWN'}</div>
                </div>
                <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4 space-y-3 font-mono text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex justify-between border-b border-white/5 pb-2"><span>Domain Rep:</span><span>{metadata.sender_domain || 'Verified'}</span></div>
                    <div className="flex justify-between border-b border-white/5 pb-2"><span>Auth Headers:</span><span className="text-emerald-500">Secure</span></div>
                    <div className="flex justify-between"><span>DMARC:</span><span className={metadata.is_trusted_sender ? "text-emerald-500" : "text-rose-500"}>{metadata.is_trusted_sender ? "PASS" : "N/A"}</span></div>
                </div>
              </div>
            )}
            {selectedMetric === 'trust' && (
              <div className="space-y-8">
                 <div className="flex items-center justify-center"><RiskGauge score={metadata.sender_trust_score || (100 - count)} /></div>
                 <p className="text-sm text-slate-500 text-center">Identity confidence score based on lexical analysis and metadata alignment.</p>
              </div>
            )}
            {selectedMetric === 'flags' && (
               <div className="space-y-4">
                  <div className={`p-4 rounded-xl border ${metadata.domain_spoofing_detected ? 'bg-rose-500/5 border-rose-500/20' : 'bg-emerald-500/5 border-emerald-500/20'}`}>
                    <h5 className="font-bold mb-1 text-slate-900 dark:text-white">Lexical Spoofing Check</h5>
                    <p className="text-xs text-slate-500">{metadata.domain_spoofing_detected ? 'Danger: Look-alike characters detected.' : 'Safe: Characters match official domain registries.'}</p>
                  </div>
               </div>
            )}
          </div>
          <div className="p-4 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] flex justify-end">
            <button onClick={() => setSelectedMetric(null)} className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-black rounded-lg text-sm font-bold">Done</button>
          </div>
        </div>
      </div>
    );
  };

  const scamFamily = (data.scam_family || 'Safe Correspondence').toUpperCase();
  const scamType = data.scam_type || 'Routine Communication';

  return (
    <div className="space-y-6 md:space-y-8 animate-[fadeIn_0.6s_ease-out]">
      {renderDetailModal()}

      <div className={`relative overflow-hidden rounded-[32px] p-8 md:p-14 border border-white/5 ${isSafe ? 'bg-emerald-950/20' : 'bg-[#0D1117]'} shadow-2xl group transition-colors duration-700`}>
        <div className={`absolute top-0 right-0 w-[500px] h-[500px] ${themeColor} opacity-10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 transition-opacity duration-1000`}></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
          <div className="flex-1 space-y-6">
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 border ${borderColor} shadow-inner`}>
               <span className={`font-mono font-bold tracking-tighter text-xs ${themeText} uppercase`}>
                 {isSafe ? 'INTELLIGENCE VERIFIED' : `DNA RISK SCORE: ${count}/100`}
               </span>
            </div>
            
            <h2 className={`text-6xl md:text-8xl font-black ${isSafe ? 'text-emerald-500' : 'text-white'} tracking-tighter leading-none`}>
              {statusText}
            </h2>
            
            <p className="text-xl md:text-2xl text-slate-400 font-medium">
              Behavioral analysis classifies this as <span className={`border-b-2 ${borderColor} pb-1 italic`}>{scamType}</span>.
            </p>
          </div>
          
          <div className="relative shrink-0 flex items-center justify-center">
             <div className={`absolute inset-0 ${themeColor} opacity-20 blur-3xl rounded-full scale-150`}></div>
             <div className="w-32 h-32 md:w-48 md:h-48 rounded-[40px] bg-white/[0.03] border border-white/10 flex items-center justify-center backdrop-blur-md shadow-2xl transition-transform group-hover:rotate-3 duration-700">
                <Icon className={`w-16 h-16 md:w-24 md:h-24 ${themeText}`} />
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl p-8 flex flex-col items-center justify-center shadow-sm">
           <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 w-full text-center">Threat Amplitude</h4>
           <RiskGauge score={data.risk_score || 0} />
           <div className="mt-4 text-center">
              <span className={`text-sm font-bold ${themeText}`}>{(data.risk_level || 'UNKNOWN').toUpperCase()} THREAT</span>
              <p className="text-xs text-slate-400 mt-1">Classification: {scamFamily}</p>
           </div>
        </div>

        <div className="lg:col-span-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl p-8 flex flex-col shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
               <Shield className="w-5 h-5 text-indigo-500" /> Forensic Metadata
            </h3>
            <div className={`px-3 py-1 ${themeColor} bg-opacity-10 border ${borderColor} rounded-full text-[10px] font-bold ${themeText} tracking-widest`}>SCAN COMPLETE</div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 flex-1">
            <button onClick={() => setSelectedMetric('verdict')} className="p-4 bg-white dark:bg-black rounded-2xl border border-slate-200 dark:border-white/10 hover:border-indigo-500 transition-all text-left">
              <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Verdict</div>
              <div className={`text-lg font-bold ${isSafe ? 'text-emerald-500' : 'text-rose-500'}`}>{isSafe ? 'SECURE' : 'SUSPECT'}</div>
            </button>
            <button onClick={() => setSelectedMetric('trust')} className="p-4 bg-white dark:bg-black rounded-2xl border border-slate-200 dark:border-white/10 hover:border-indigo-500 transition-all text-left">
              <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Confidence</div>
              <div className="text-lg font-bold text-slate-900 dark:text-white">{isSafe ? 'HIGH' : 'LOW'}</div>
            </button>
            <button onClick={() => setSelectedMetric('flags')} className="p-4 bg-white dark:bg-black rounded-2xl border border-slate-200 dark:border-white/10 hover:border-indigo-500 transition-all text-left flex flex-col justify-center">
              <div className="flex gap-1.5">
                 <div className={`w-2 h-2 rounded-full ${isSafe ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                 <div className={`w-2 h-2 rounded-full ${isSafe ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                 <div className={`w-2 h-2 rounded-full ${isSafe ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
              </div>
              <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tight">Pattern Alignment</div>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl p-8 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
            <Info className="w-5 h-5 text-indigo-500" /> Intelligence Insights
          </h3>
          <ul className="space-y-3">
             {(data.threat_indicators || []).slice(0, 5).map((indicator, idx) => (
               <li key={idx} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400 p-3 bg-slate-50 dark:bg-white/[0.02] rounded-xl">
                 <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${isSafe ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                 {indicator}
               </li>
             ))}
             {(!data.threat_indicators || data.threat_indicators.length === 0) && (
               <li className="text-sm text-slate-400 italic">No specific risk markers detected. Transaction appears routine.</li>
             )}
          </ul>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl p-8 shadow-sm">
           <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
             <Activity className="w-5 h-5 text-indigo-500" /> Behavioral Fingerprint
           </h3>
           <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                 <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-1">Emotion</div>
                 <div className="text-lg font-bold text-slate-900 dark:text-white">{data.primary_emotion || 'Neutral'}</div>
              </div>
              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                 <div className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1">Urgency</div>
                 <div className="text-lg font-bold text-slate-900 dark:text-white">{data.urgency_level || 'Normal'}</div>
              </div>
           </div>
           <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-white/5">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Tactics Identified</div>
              <div className="flex flex-wrap gap-2">
                 {(data.manipulation_tactics || []).map((t, i) => (
                   <span key={i} className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${isSafe ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' : 'bg-white dark:bg-black border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300'}`}>{t}</span>
                 ))}
                 {(!data.manipulation_tactics || data.manipulation_tactics.length === 0) && (
                   <span className="text-[10px] text-slate-400 italic">None Detected</span>
                 )}
              </div>
           </div>
        </div>
      </div>

      <div className={`border border-white/5 rounded-[32px] p-8 md:p-12 shadow-2xl relative overflow-hidden ${isSafe ? 'bg-emerald-900/10' : 'bg-slate-900 dark:bg-[#0A0A0B]'}`}>
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Shield className="w-64 h-64 text-white" />
        </div>
        <div className="relative z-10">
          <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
             <ShieldCheck className={`w-6 h-6 ${isSafe ? 'text-emerald-500' : 'text-rose-500'}`} /> Security Recommendations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-4">
                <div className={`p-6 rounded-2xl border ${isSafe ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
                   <h4 className={`font-bold ${isSafe ? 'text-emerald-400' : 'text-rose-400'} mb-2 flex items-center gap-2`}>
                     {isSafe ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />} Verdict Guide
                   </h4>
                   <p className="text-sm text-slate-300 leading-relaxed">{data.recommended_action || 'Proceed with normal verification protocols.'}</p>
                </div>
             </div>
             <div className="space-y-4">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                   <h4 className="font-bold text-indigo-400 mb-2">Prevention Strategy</h4>
                   <p className="text-sm text-slate-400">{data.prevention_tip || 'Verify any unexpected requests via a separate official channel.'}</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResult;
