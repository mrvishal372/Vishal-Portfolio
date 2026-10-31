import React, { useState } from 'react';
import { Shield, Lock, User, Eye, EyeOff, AlertTriangle, ArrowLeft, Loader2 } from 'lucide-react';
import { adminLogin } from '../../lib/adminAuth';

interface AdminLoginProps {
  onLoginSuccess: (identifier: string) => void;
  onBackToPublic?: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onLoginSuccess,
  onBackToPublic
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername || !trimmedPassword) {
      setErrorMessage('Please enter both username and password.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await adminLogin(trimmedUsername, trimmedPassword);
      if (result.success && (result.phone || result.username)) {
        onLoginSuccess(result.username || result.phone || trimmedUsername);
      } else {
        setErrorMessage(result.error || 'Access Denied: Invalid credentials.');
      }
    } catch {
      setErrorMessage('Authentication request failed. Please check connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-8 sm:py-12 relative overflow-hidden select-none cursor-default"
      onClick={(e) => {
        // If clicking anywhere on the background (outside the card), navigate back
        if (e.target === e.currentTarget && onBackToPublic) {
          onBackToPublic();
        }
      }}
    >
      {/* Ambient background glows for rich glass refraction */}
      <div 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" 
      />
      <div 
        className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" 
      />

      {/* Return to Home Website link */}
      <div className="w-full max-w-sm mb-4 z-10 flex justify-between items-center px-1">
        {onBackToPublic ? (
          <button
            type="button"
            onClick={onBackToPublic}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-all bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 px-3.5 py-2 rounded-xl cursor-pointer shadow-xs active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </button>
        ) : (
          <div />
        )}
      </div>

      {/* Glassy Login Card */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-slate-900/65 backdrop-blur-2xl border border-white/15 dark:border-white/10 rounded-3xl p-6 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.55)] relative z-10 transition-all cursor-default"
      >
        {/* Specular top sheen */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 mb-3 shadow-inner text-amber-400">
            <Shield className="w-6 h-6" />
          </div>
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-[11px] font-medium mb-2">
            <Lock className="w-3 h-3 text-amber-400" />
            <span>Admin Portal</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Admin Login</h1>
          <p className="text-xs text-slate-400 mt-1">Sign in to your dashboard</p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 flex items-center gap-2.5 text-xs animate-in fade-in duration-200">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                id="admin-username-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                autoComplete="username"
                required
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-950/60 backdrop-blur-md border border-white/10 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-400/80 focus:ring-2 focus:ring-amber-400/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                id="admin-password-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
                required
                className="w-full pl-10 pr-11 py-2.5 sm:py-3 bg-slate-950/60 backdrop-blur-md border border-white/10 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-400/80 focus:ring-2 focus:ring-amber-400/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-3 py-3 px-4 bg-gradient-to-r from-amber-500 hover:from-amber-400 to-amber-600 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        {/* Security Notice */}
        <div className="mt-5 pt-4 border-t border-white/10 text-center">
          <p className="text-[11px] text-slate-400 font-medium">
            Secured owner authentication
          </p>
        </div>
      </div>
    </div>
  );
};
