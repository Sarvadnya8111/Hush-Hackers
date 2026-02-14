import React, { useState, useEffect } from 'react';
import { X, Key, Save, CheckCircle, ExternalLink, ShieldAlert } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const storedKey = localStorage.getItem('fraudguard_custom_api_key');
    if (storedKey) setApiKey(storedKey);
  }, []);

  const handleSave = () => {
    if (!apiKey.trim()) {
      localStorage.removeItem('fraudguard_custom_api_key');
    } else {
      localStorage.setItem('fraudguard_custom_api_key', apiKey.trim());
    }
    setIsSaved(true);
    setTimeout(() => {
        setIsSaved(false);
        onClose();
    }, 1000);
  };

  const handleClear = () => {
      setApiKey('');
      localStorage.removeItem('fraudguard_custom_api_key');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]">
      <div className="w-full max-w-md bg-white dark:bg-[#0A0A0B] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02]">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Key className="w-5 h-5 text-indigo-500" /> API Configuration
          </h3>
          <button 
            onClick={onClose}
            className="p-2 bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-500/20 p-4 rounded-xl flex gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                    <strong>Hitting Rate Limits?</strong><br/>
                    The default shared key has strict usage limits. To get unlimited* executions, generate your own free API key from Google.
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    Custom Gemini API Key
                </label>
                <input 
                    type="password" 
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                />
                <div className="flex justify-between mt-2">
                    <a 
                        href="https://aistudio.google.com/app/apikey" 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                        Get a key here <ExternalLink className="w-3 h-3" />
                    </a>
                    {apiKey && (
                        <button onClick={handleClear} className="text-xs text-rose-500 hover:underline">
                            Clear Key
                        </button>
                    )}
                </div>
            </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] flex justify-end">
            <button 
                onClick={handleSave}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold text-white transition-all ${isSaved ? 'bg-emerald-500' : 'bg-slate-900 dark:bg-white dark:text-black hover:opacity-90'}`}
            >
                {isSaved ? (
                    <>Saved <CheckCircle className="w-4 h-4" /></>
                ) : (
                    <>Save Configuration <Save className="w-4 h-4" /></>
                )}
            </button>
        </div>
      </div>
    </div>
  );
}