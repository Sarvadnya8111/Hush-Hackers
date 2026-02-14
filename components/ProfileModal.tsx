import React, { useState } from 'react';
import { UserProfile } from '../types';
import { AuthService } from '../services/authService';
import { 
  X, User, Mail, Phone, MapPin, Calendar, 
  Edit2, Save, Activity, CheckCircle, AlertTriangle,
  CreditCard, Smartphone, Key, Lock, AlertCircle, Shield
} from 'lucide-react';

interface ProfileModalProps {
  user: UserProfile;
  onClose: () => void;
  onUpdate: (updatedUser: UserProfile) => void;
}

export default function ProfileModal({ user, onClose, onUpdate }: ProfileModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserProfile>(user);
  const [activeTab, setActiveTab] = useState<'details' | 'security' | 'activity'>('details');

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passData, setPassData] = useState({ current: '', new: '', confirm: '' });
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    onUpdate(formData);
    setIsEditing(false);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);

    if (passData.new.length < 6) {
        setPassError("New password must be at least 6 characters.");
        return;
    }
    if (passData.new !== passData.confirm) {
        setPassError("New passwords do not match.");
        return;
    }

    try {
        AuthService.changePassword(user.email, passData.current, passData.new);
        setPassSuccess("Password updated successfully.");
        setPassData({ current: '', new: '', confirm: '' });
        setTimeout(() => {
            setIsChangingPassword(false);
            setPassSuccess(null);
        }, 2000);
    } catch (err: any) {
        setPassError(err.message || "Failed to update password.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div className="w-full max-w-4xl bg-white dark:bg-[#0A0A0B] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Minimal Header */}
        <div className="relative h-28 bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/5">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white dark:bg-white/10 text-slate-400 hover:text-slate-900 dark:text-slate-500 dark:hover:text-white rounded-full transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="absolute -bottom-10 left-8 flex items-end gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 border-4 border-white dark:border-[#0A0A0B] flex items-center justify-center shadow-lg text-white">
                <span className="text-2xl font-bold">{formData.fullName.charAt(0)}</span>
            </div>
            <div className="mb-1">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{formData.fullName}</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-2">
                {formData.email}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-14 px-8 border-b border-slate-200 dark:border-white/5 flex gap-8">
          {['details', 'security', 'activity'].map((tab) => (
             <button 
               key={tab}
               onClick={() => { setActiveTab(tab as any); setIsChangingPassword(false); }}
               className={`pb-4 text-sm font-medium transition-colors relative capitalize ${activeTab === tab ? 'text-indigo-600 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              {tab}
              {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 dark:bg-white rounded-t-full" />}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-white dark:bg-[#0A0A0B]">
          
          {activeTab === 'details' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Profile Information</h3>
                {!isEditing ? (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold transition-colors border border-slate-200 dark:border-white/5"
                  >
                    Edit
                  </button>
                ) : (
                   <div className="flex gap-2">
                     <button 
                        onClick={() => { setIsEditing(false); setFormData(user); }}
                        className="px-3 py-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white text-xs font-bold"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleSave}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-colors"
                      >
                        Save
                      </button>
                   </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                 {[
                   { label: 'Full Name', name: 'fullName', type: 'text', icon: User },
                   { label: 'Phone', name: 'phone', type: 'tel', icon: Phone },
                   { label: 'City', name: 'city', type: 'text', icon: MapPin },
                   { label: 'Birth Date', name: 'dob', type: 'date', icon: Calendar },
                 ].map((field) => (
                    <div key={field.name} className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{field.label}</label>
                        <div className="relative">
                           <field.icon className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                           <input 
                             name={field.name}
                             type={field.type}
                             disabled={!isEditing}
                             value={(formData as any)[field.name]}
                             onChange={handleChange}
                             className={`w-full bg-slate-50 dark:bg-white/5 border ${isEditing ? 'border-indigo-500' : 'border-slate-200 dark:border-white/10'} rounded-xl p-2.5 pl-10 text-slate-900 dark:text-white text-sm transition-all outline-none`}
                           />
                        </div>
                    </div>
                 ))}
                 
                 {/* Email is read-only */}
                 <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Email</label>
                    <div className="relative">
                       <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                       <input 
                         value={formData.email}
                         disabled
                         className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-2.5 pl-10 text-slate-500 text-sm cursor-not-allowed"
                       />
                       <Lock className="absolute right-3 top-3 w-3 h-3 text-slate-300" />
                    </div>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="grid grid-cols-1 gap-6">
                    {/* Security Settings Card */}
                    <div className="p-6 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                         <h4 className="flex items-center gap-2 text-slate-900 dark:text-white font-bold mb-6">
                            <Shield className="w-5 h-5 text-emerald-500" />
                            Sign-in & Security
                        </h4>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 bg-white dark:bg-white/10 rounded-xl border border-slate-200 dark:border-white/5">
                                        <Smartphone className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-slate-900 dark:text-white">2-Step Verification</div>
                                        <div className="text-slate-500 text-xs mt-0.5">Add an extra layer of security</div>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" defaultChecked />
                                    <div className="w-9 h-5 bg-slate-200 dark:bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                                </label>
                            </div>
                            
                            {!isChangingPassword ? (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2.5 bg-white dark:bg-white/10 rounded-xl border border-slate-200 dark:border-white/5">
                                            <Key className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-slate-900 dark:text-white">Password</div>
                                            <div className="text-slate-500 text-xs mt-0.5">Last changed 30 days ago</div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setIsChangingPassword(true)}
                                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                                    >
                                        Change
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handlePasswordChange} className="bg-white dark:bg-black border border-slate-200 dark:border-white/10 p-5 rounded-2xl space-y-4 shadow-sm">
                                    {passError && (
                                        <div className="text-xs text-rose-500 flex items-center gap-1.5 font-medium">
                                            <AlertCircle className="w-3 h-3" /> {passError}
                                        </div>
                                    )}
                                    {passSuccess && (
                                        <div className="text-xs text-emerald-500 flex items-center gap-1.5 font-medium">
                                            <CheckCircle className="w-3 h-3" /> {passSuccess}
                                        </div>
                                    )}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Current Password</label>
                                        <input 
                                            type="password"
                                            required
                                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                                            value={passData.current}
                                            onChange={(e) => setPassData({...passData, current: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">New Password</label>
                                        <input 
                                            type="password"
                                            required
                                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                                            value={passData.new}
                                            onChange={(e) => setPassData({...passData, new: e.target.value})}
                                        />
                                    </div>
                                     <div className="space-y-1.5">
                                        <label className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Confirm</label>
                                        <input 
                                            type="password"
                                            required
                                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                                            value={passData.confirm}
                                            onChange={(e) => setPassData({...passData, confirm: e.target.value})}
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2 pt-2">
                                        <button 
                                            type="button"
                                            onClick={() => { setIsChangingPassword(false); setPassData({current:'', new:'', confirm:''}); setPassError(null); }}
                                            className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            type="submit"
                                            className="px-4 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-black text-xs font-bold rounded-lg hover:opacity-90 transition-opacity"
                                        >
                                            Update
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
             </div>
          )}

          {activeTab === 'activity' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                 <div className="border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] flex justify-between items-center">
                        <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            Devices
                        </h4>
                    </div>
                    <div className="divide-y divide-slate-200 dark:divide-white/5 bg-white dark:bg-[#0A0A0B]">
                        <div className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-slate-100 dark:bg-white/5 rounded-xl text-slate-600 dark:text-slate-300">
                                    <CreditCard className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-slate-900 dark:text-white">Chrome on Windows</div>
                                    <div className="text-xs text-slate-500">{formData.city}, India • Current Session</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs font-bold text-emerald-500">Active</div>
                            </div>
                        </div>
                         <div className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors opacity-60">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-slate-100 dark:bg-white/5 rounded-xl text-slate-600 dark:text-slate-300">
                                    <Smartphone className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-slate-900 dark:text-white">Safari on iPhone</div>
                                    <div className="text-xs text-slate-500">{formData.city}, India</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs font-bold text-slate-400">2d ago</div>
                            </div>
                        </div>
                    </div>
                 </div>

                 <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                        <h5 className="text-sm font-bold text-amber-700 dark:text-amber-500 mb-1">Security Report</h5>
                        <p className="text-xs text-amber-800/70 dark:text-amber-500/70 leading-relaxed">
                            No suspicious activity detected in the last 30 days.
                        </p>
                    </div>
                 </div>
              </div>
          )}

        </div>
      </div>
    </div>
  );
}