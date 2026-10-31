import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Mail, CheckCircle2, AlertCircle, ArrowRight, X, User, Eye, EyeOff } from 'lucide-react';
import { auth } from '../lib/firebaseSync';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  EmailAuthProvider,
  linkWithCredential,
  updatePassword
} from 'firebase/auth';

declare global {
  interface Window {
    recaptchaVerifier: any;
    confirmationResult: any;
  }
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'verify' | 'forgot_password' | 'forgot_password_verify' | 'reset_password'>('login');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (isOpen && !window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  if (!isOpen) return null;

  const isFormValid = () => {
    if (mode === 'login') {
      return mobile.length === 10 && password.length > 0;
    }
    if (mode === 'register') {
      return mobile.length === 10 && name.trim().length > 0 && password.length > 0 && password === confirmPassword;
    }
    if (mode === 'verify' || mode === 'forgot_password_verify') {
      return otp.length > 0; 
    }
    if (mode === 'forgot_password') {
      return mobile.length === 10;
    }
    if (mode === 'reset_password') {
      return password.length > 0 && password === confirmPassword;
    }
    return true;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const authEmail = `${mobile}@vyron.app`;
      if (mode === 'login') {
        if (mobile.length !== 10) throw new Error('Please enter a valid 10-digit mobile number.');
        try { await signInWithEmailAndPassword(auth, authEmail, password); } catch (e: any) { throw new Error(`[Email/Password Provider Error]: ${e.code || e.message}`); }
        onLoginSuccess();
        onClose();
      } else if (mode === 'register') {
        if (mobile.length !== 10) throw new Error('Please enter a valid 10-digit mobile number.');
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match.');
        }
        
        try {
          // Send real SMS OTP
          const appVerifier = window.recaptchaVerifier;
          const confirmationResult = await signInWithPhoneNumber(auth, `+91${mobile}`, appVerifier);
          window.confirmationResult = confirmationResult;
          setMode('verify');
          setCountdown(60);
        } catch (phoneErr: any) {
          console.warn("Phone Auth Error:", phoneErr.code || phoneErr.message);
          if (false) {
            throw new Error('Phone Authentication is disabled. Please enable it in the Firebase Console under Authentication -> Sign-in method.');
          }
          throw new Error(`[Phone Auth Provider Error]: ${phoneErr.code || phoneErr.message}`);
        }
      } else if (mode === 'verify') {
        if (otp.length !== 6) throw new Error('Please enter a valid 6-digit OTP.');
        
        // Confirm real OTP
        const result = await window.confirmationResult.confirm(otp);
        
        // Link with Email/Password so user can login with Number+Password next time
        try {
          const credential = EmailAuthProvider.credential(authEmail, password);
          await linkWithCredential(result.user, credential);
        } catch (linkErr: any) {
          console.warn("Credential link warning:", linkErr);
          // If already linked or already registered, it might fail, but user is logged in.
        }

        const { saveProfileToFirestore } = await import('../lib/firebaseSync');
        await saveProfileToFirestore(result.user.uid, {
          name: name.trim(),
          mobile: `+91 ${mobile}`,
          email: ''
        });
        onLoginSuccess();
        onClose();
      } else if (mode === 'forgot_password') {
        if (mobile.length !== 10) throw new Error('Please enter a valid 10-digit mobile number.');
        try {
          const appVerifier = window.recaptchaVerifier;
          const confirmationResult = await signInWithPhoneNumber(auth, `+91${mobile}`, appVerifier);
          window.confirmationResult = confirmationResult;
          setMode('forgot_password_verify');
          setCountdown(60);
        } catch (phoneErr: any) {
          console.warn("Phone Auth Error:", phoneErr.code || phoneErr.message);
          if (false) {
            throw new Error('Phone Authentication is disabled. Please enable it in the Firebase Console under Authentication -> Sign-in method.');
          }
          throw new Error(`[Phone Auth Provider Error]: ${phoneErr.code || phoneErr.message}`);
        }
      } else if (mode === 'forgot_password_verify') {
        if (otp.length !== 6) throw new Error('Please enter a valid 6-digit OTP.');
        await window.confirmationResult.confirm(otp);
        setMode('reset_password');
      } else if (mode === 'reset_password') {
        if (password !== confirmPassword) throw new Error('Passwords do not match.');
        if (!auth.currentUser) throw new Error('Not authenticated.');
        
        await updatePassword(auth.currentUser, password);
        onLoginSuccess();
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    setErrorMsg(null);
    setLoading(true);
    try {
      const appVerifier = window.recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(auth, `+91${mobile}`, appVerifier);
      window.confirmationResult = confirmationResult;
      setCountdown(60);
    } catch (phoneErr: any) {
      console.warn("Phone Auth Error:", phoneErr.code || phoneErr.message);
      if (false) {
        setErrorMsg('Phone Authentication is disabled in Firebase Console.');
      } else {
        setErrorMsg(`[Phone Auth Provider Error]: ${phoneErr.code || phoneErr.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-4 right-4">
            <button onClick={onClose} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="text-center mb-8 mt-4">
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 mb-2">
              Admin Login
            </h2>
            <p className="text-sm font-semibold text-slate-400 tracking-wide">
              Only the owner can access this panel
            </p>
          </div>

          <div id="recaptcha-container"></div>

          <form onSubmit={handleAuth} className="space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start space-x-3 text-red-400">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-sm leading-relaxed">{errorMsg}</p>
                </div>
              )}

              {(mode === 'verify' || mode === 'forgot_password_verify') ? (
                <div>
                  <label className="block text-sm font-semibold text-slate-400 mb-2">Enter Verification Code</label>
                  <p className="text-xs text-slate-500 mb-4">We sent an OTP to +91 {mobile}.</p>
                  <div className="relative">
                    <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full pl-12 pr-4 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 tracking-widest text-lg"
                      placeholder="XXXXXX"
                    />
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      disabled={countdown > 0 || loading}
                      onClick={handleResendOTP}
                      className="text-sm font-semibold text-amber-500 hover:text-amber-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {mode === 'register' && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-400 mb-2">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full pl-12 pr-4 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20"
                          placeholder="Vishal Yadav"
                        />
                      </div>
                    </div>
                  )}

                  {(mode === 'login' || mode === 'register' || mode === 'forgot_password') && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-400 mb-2">Mobile Number</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">+91</span>
                        <input
                          type="tel"
                          required
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          className="w-full pl-14 pr-4 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 tracking-wider"
                          placeholder="9999999999"
                        />
                      </div>
                    </div>
                  )}

                  {(mode === 'login' || mode === 'register' || mode === 'reset_password') && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-semibold text-slate-400">
                          {mode === 'reset_password' ? 'New Password' : 'Password'}
                        </label>
                        {mode === 'login' && (
                          <button
                            type="button"
                            onClick={() => {
                              setMode('forgot_password');
                              setErrorMsg(null);
                            }}
                            className="text-sm font-semibold text-amber-500 hover:text-amber-400"
                          >
                            Forgot Password?
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-12 pr-12 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20"
                          placeholder={mode === 'reset_password' ? 'Enter new password' : 'Enter password'}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {(mode === 'register' || mode === 'reset_password') && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-400 mb-2">
                        Confirm {mode === 'reset_password' ? 'New ' : ''}Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full pl-12 pr-4 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20"
                          placeholder="Confirm password"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              <button
                type="submit"
                disabled={loading || !isFormValid()}
                className="w-full flex items-center justify-center space-x-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 py-4 rounded-2xl font-bold transition-all mt-6"
              >
                {loading ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <span>
                      {mode === 'login' ? 'Secure Sign In' 
                       : mode === 'forgot_password' ? 'Send OTP'
                       : mode === 'forgot_password_verify' ? 'Verify OTP'
                       : mode === 'reset_password' ? 'Update Password'
                       : 'Sign In'}
                    </span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              {mode === 'forgot_password' && (
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setErrorMsg(null);
                    }}
                    className="text-sm font-semibold text-slate-400 hover:text-white"
                  >
                    Back to Login
                  </button>
                </div>
              )}
            </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
