
import React, { useState, useEffect } from 'react';
import { analyzeFraudText, fetchRegistryDemo } from './services/gemini';
import { AnalysisState, FraudDNA, UserProfile } from './types';
import InputSection from './components/InputSection';
import AnalysisResult from './components/AnalysisResult';
import AuthPage from './components/AuthPage';
import ProfileModal from './components/ProfileModal';
import HistoryList from './components/HistoryList';
import RegistryView from './components/RegistryView';
import { AuthService } from './services/authService';
import { ShieldCheck, LayoutDashboard, Database, Sun, Moon } from 'lucide-react';

const HISTORY_KEY = 'fraudguard_analysis_history';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [history, setHistory] = useState<FraudDNA[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisState>({
    loading: false,
    data: null,
    registry: null,
    error: null,
  });

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) setCurrentUser(user);
    const savedTheme = localStorage.getItem('fraudguard_theme') as 'light' | 'dark';
    if (savedTheme) setTheme(savedTheme || 'dark');
    const savedHistory = localStorage.getItem(HISTORY_KEY);
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('fraudguard_theme', theme);
  }, [theme]);

  const handleAnalyze = async (text: string, image?: { data: string; mimeType: string }) => {
    // Crucial: Reset previous states to prevent logic collisions
    setAnalysis({ loading: true, data: null, error: null, registry: null });
    try {
      const result = await analyzeFraudText(text, image);
      if (result) {
        setAnalysis({ loading: false, data: result, error: null, registry: null });
        setHistory(prev => {
          const h = [result, ...prev].slice(0, 20);
          localStorage.setItem(HISTORY_KEY, JSON.stringify(h));
          return h;
        });
      } else {
        throw new Error("Analysis failed to produce results.");
      }
    } catch (err: any) {
      setAnalysis({ loading: false, data: null, error: err.message || "An unexpected error occurred during analysis.", registry: null });
    }
  };

  const handleShowRegistry = async () => {
    setAnalysis({ loading: true, data: null, error: null, registry: null });
    try {
      const registry = await fetchRegistryDemo();
      setAnalysis({ loading: false, data: null, error: null, registry });
    } catch (err: any) {
      setAnalysis({ loading: false, data: null, error: err.message || "Failed to fetch threat registry.", registry: null });
    }
  };

  const resetState = () => {
    setAnalysis({ loading: false, data: null, error: null, registry: null });
  };

  if (!currentUser) return <AuthPage onLogin={setCurrentUser} toggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} currentTheme={theme} />;

  const isDashboard = analysis.data || analysis.loading || analysis.error || analysis.registry;

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#050505] text-slate-900 dark:text-slate-200 transition-colors duration-500">
      {showProfile && <ProfileModal user={currentUser} onClose={() => setShowProfile(false)} onUpdate={setCurrentUser} />}

      <header className="sticky top-0 z-50 bg-white/70 dark:bg-black/70 backdrop-blur-xl border-b border-slate-200 dark:border-white/5">
        <div className="max-w-[1920px] mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={resetState}>
             <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-black shadow-lg">
               <ShieldCheck className="w-6 h-6" />
             </div>
             <span className="text-xl font-black tracking-tight uppercase hidden md:block">FraudGuard</span>
          </div>

          <div className="flex items-center gap-4">
             {isDashboard && (
               <button onClick={resetState} className="px-5 py-2.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl text-sm font-bold transition-all flex items-center gap-2">
                 <LayoutDashboard className="w-4 h-4" /> <span className="hidden sm:inline">New Scan</span>
               </button>
             )}
             <button onClick={handleShowRegistry} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2">
               <Database className="w-4 h-4" /> <span className="hidden sm:inline">Common Flag IDs</span>
             </button>
             <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
               {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
             </button>
             <div onClick={() => setShowProfile(true)} className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 border-2 border-white dark:border-black cursor-pointer shadow-md flex items-center justify-center text-white font-bold">
               {currentUser.fullName.charAt(0)}
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1920px] mx-auto px-8 py-12">
        {!isDashboard ? (
          <div className="max-w-4xl mx-auto min-h-[60vh] flex flex-col justify-center animate-in fade-in slide-in-from-bottom-8">
            <h2 className="text-7xl md:text-9xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-12">
              DECODE<br/>THE <span className="text-indigo-500">THREAT.</span>
            </h2>
            <div className="shadow-2xl rounded-[40px]">
              <InputSection onAnalyze={handleAnalyze} isLoading={analysis.loading} />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-3 space-y-8 h-fit lg:sticky lg:top-32">
               <InputSection onAnalyze={handleAnalyze} isLoading={analysis.loading} />
               <HistoryList history={history} onSelect={data => setAnalysis({ loading: false, data, error: null, registry: null })} onClear={() => { setHistory([]); localStorage.removeItem(HISTORY_KEY); }} activeId={analysis.data?.id} />
            </div>
            <div className="lg:col-span-9 min-h-[400px]">
               {analysis.loading && (
                 <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
                   <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                   <p className="text-slate-500 font-bold animate-pulse">Running Neural DNA Extraction...</p>
                 </div>
               )}
               {analysis.error && (
                 <div className="p-10 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-[32px] text-center font-bold animate-in zoom-in-95 duration-300">
                    <ShieldCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    {analysis.error}
                    <button onClick={resetState} className="block mx-auto mt-6 px-6 py-2 bg-rose-500 text-white rounded-xl text-sm font-bold">Try Again</button>
                 </div>
               )}
               {!analysis.loading && analysis.data && <AnalysisResult data={analysis.data} />}
               {!analysis.loading && analysis.registry && <RegistryView registry={analysis.registry} />}
               {!analysis.loading && !analysis.data && !analysis.registry && !analysis.error && (
                  <div className="p-20 text-center text-slate-500">
                    Preparing interface...
                  </div>
               )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
