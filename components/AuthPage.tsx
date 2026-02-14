import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, User, Phone, ArrowRight, Check, AlertCircle, ArrowLeft, Sun, Moon, Globe, Zap, Key } from 'lucide-react';
import { AuthService } from '../services/authService';
import { UserProfile } from '../types';

interface AuthPageProps {
  onLogin: (user: UserProfile) => void;
  toggleTheme: () => void;
  currentTheme: 'light' | 'dark';
}

type AuthView = 'login' | 'register' | 'forgot';

export default function AuthPage({ onLogin, toggleTheme, currentTheme }: AuthPageProps) {
  const [view, setView] = useState<AuthView>('login');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: '',
    dob: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    setTimeout(() => {
      try {
        if (view === 'login') {
          const user = AuthService.login(formData.email, formData.password);
          onLogin(user);
        } else if (view === 'register') {
          if (formData.password.length < 6) {
             throw new Error("Password must be at least 6 characters.");
          }
          if (formData.password !== formData.confirmPassword) {
             throw new Error("Passwords do not match.");
          }
          const user = AuthService.register(formData);
          onLogin(user);
        } else if (view === 'forgot') {
          if (formData.password.length < 6) {
            throw new Error("New password must be at least 6 characters.");
          }
          if (formData.password !== formData.confirmPassword) {
            throw new Error("Passwords do not match.");
          }
          
          AuthService.resetPassword(formData.email, formData.password);
          setSuccessMessage("Password reset successful.");
          setLoading(false);
          setTimeout(() => {
            setView('login');
            setSuccessMessage(null);
            setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
          }, 1500);
          return;
        }
      } catch (err: any) {
        setError(err.message || "Authentication failed.");
        setLoading(false);
      }
    }, 800);
  };

  const switchView = (newView: AuthView) => {
    setView(newView);
    setError(null);
    setSuccessMessage(null);
  };

  return (
    <div className="min-h-screen w-full bg-[#FAFAFA] dark:bg-[#0A0A0B] flex items-center justify-center p-4 md:p-8 relative overflow-hidden transition-colors duration-500 font-sans selection:bg-indigo-500/30">
      
      {/* Abstract Background Elements */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Theme Toggle */}
      <button 
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-3 rounded-full bg-white/50 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-all hover:scale-105 z-20"
      >
        {currentTheme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      <div className="w-full max-w-[1200px] grid grid-cols-1 lg:grid-cols-5 bg-white dark:bg-[#121214] rounded-[32px] shadow-2xl shadow-slate-200/50 dark:shadow-black/50 overflow-hidden relative z-10 border border-slate-100 dark:border-white/5">
        
        {/* Left: Brand / Hero */}
        <div className="lg:col-span-2 p-12 bg-slate-900 dark:bg-black text-white flex flex-col justify-between relative overflow-hidden">
           {/* Gradient Mesh */}
           <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-transparent to-emerald-600/20 opacity-50" />
           <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>

           <div className="relative z-10">
             <div className="flex items-center gap-3 mb-12">
               <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                 <ShieldCheck className="w-6 h-6 text-white" />
               </div>
               <span className="text-xl font-bold tracking-tight">FraudGuard</span>
             </div>
             
             <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight mb-6">
               Intelligence,<br />
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">
                 Illuminated.
               </span>
             </h1>
             
             <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
               Next-generation behavioral analysis engine designed to detect anomalies before they become threats.
             </p>
           </div>

           <div className="relative z-10 space-y-6 mt-12">
              <div className="flex items-center gap-4 group">
                 <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-indigo-500/20 group-hover:border-indigo-500/30 transition-all">
                    <Globe className="w-5 h-5 text-indigo-300" />
                 </div>
                 <div>
                    <div className="font-semibold text-white">Global Threat Intel</div>
                    <div className="text-xs text-slate-500">Real-time database updates</div>
                 </div>
              </div>
              <div className="flex items-center gap-4 group">
                 <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-emerald-500/20 group-hover:border-emerald-500/30 transition-all">
                    <Zap className="w-5 h-5 text-emerald-300" />
                 </div>
                 <div>
                    <div className="font-semibold text-white">Instant Analysis</div>
                    <div className="text-xs text-slate-500">Processing under 200ms</div>
                 </div>
              </div>
           </div>
           
           <div className="relative z-10 mt-12 pt-8 border-t border-white/10 flex justify-between items-center text-xs text-slate-500 font-mono">
             <span>v3.5.0 STABLE</span>
             <span>ENCRYPTED</span>
           </div>
        </div>

        {/* Right: Forms */}
        <div className="lg:col-span-3 p-8 md:p-16 flex flex-col justify-center">
           <div className="max-w-md mx-auto w-full">
              <div className="flex justify-between items-end mb-10">
                 <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
                      {view === 'login' && 'Welcome back'}
                      {view === 'register' && 'Create account'}
                      {view === 'forgot' && 'Reset password'}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400">
                      {view === 'login' && 'Enter your credentials to access the dashboard.'}
                      {view === 'register' && 'Start your 30-day secure trial.'}
                      {view === 'forgot' && 'We’ll send you instructions to reset.'}
                    </p>
                 </div>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-600 dark:text-rose-400 text-sm animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    {error}
                </div>
              )}
              
              {successMessage && (
                <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl flex items-center gap-3 text-emerald-600 dark:text-emerald-400 text-sm animate-in fade-in slide-in-from-top-2">
                    <Check className="w-5 h-5 shrink-0" />
                    {successMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                
                {view === 'register' && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Full Name</label>
                        <input 
                          name="fullName"
                          required
                          type="text" 
                          placeholder="John Doe"
                          className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 block p-3.5 transition-all outline-none"
                          onChange={handleChange}
                          value={formData.fullName}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Phone</label>
                        <input 
                          name="phone"
                          type="tel" 
                          placeholder="+1 555 000 0000"
                          className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 block p-3.5 transition-all outline-none"
                          onChange={handleChange}
                          value={formData.phone}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input 
                      name="email"
                      required
                      type="email" 
                      placeholder="name@company.com"
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 block pl-11 p-3.5 transition-all outline-none placeholder:text-slate-400"
                      onChange={handleChange}
                      value={formData.email}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                      {view === 'forgot' ? 'New Password' : 'Password'}
                    </label>
                    {view === 'login' && (
                      <button type="button" onClick={() => switchView('forgot')} className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                        Forgot?
                      </button>
                    )}
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input 
                      name="password"
                      required
                      type="password" 
                      placeholder="••••••••"
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 block pl-11 p-3.5 transition-all outline-none placeholder:text-slate-400"
                      onChange={handleChange}
                      value={formData.password}
                    />
                  </div>
                </div>
                
                {(view === 'register' || view === 'forgot') && (
                  <div className="space-y-1.5 animate-in fade-in slide-in-from-bottom-2">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Confirm Password</label>
                    <div className="relative group">
                       <Key className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                       <input 
                        name="confirmPassword"
                        required
                        type="password" 
                        placeholder="••••••••"
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 block pl-11 p-3.5 transition-all outline-none placeholder:text-slate-400"
                        onChange={handleChange}
                        value={formData.confirmPassword}
                      />
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-black font-bold py-3.5 rounded-xl shadow-lg shadow-slate-900/10 dark:shadow-white/5 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <span className="animate-pulse">Processing...</span>
                    ) : (
                      <>
                        {view === 'login' && 'Sign In'}
                        {view === 'register' && 'Create Account'}
                        {view === 'forgot' && 'Reset Password'}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-slate-200 dark:border-white/10"></div>
                    <span className="flex-shrink-0 mx-4 text-slate-400 text-xs uppercase tracking-widest">Or</span>
                    <div className="flex-grow border-t border-slate-200 dark:border-white/10"></div>
                </div>

                <div className="text-center">
                   {view === 'login' ? (
                      <p className="text-sm text-slate-500">
                        Don't have an account?{' '}
                        <button type="button" onClick={() => switchView('register')} className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                          Sign up
                        </button>
                      </p>
                   ) : (
                      <p className="text-sm text-slate-500">
                        Already have an account?{' '}
                        <button type="button" onClick={() => switchView('login')} className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                          Log in
                        </button>
                      </p>
                   )}
                </div>
              </form>
           </div>
        </div>
      </div>
    </div>
  );
}