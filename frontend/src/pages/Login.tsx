import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { KeyRound, Mail, AlertTriangle, ArrowRight, CheckCircle } from 'lucide-react';
import axios from 'axios';

export const Login: React.FC = () => {
  const { login, apiUrl } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot Password States
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [simulatedToken, setSimulatedToken] = useState('');

  // Reset Password States
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetError, setResetError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    setSimulatedToken('');

    try {
      const res = await axios.post(`${apiUrl}/auth/forgot-password`, { email: forgotEmail });
      setForgotSuccess(res.data.message);
      if (res.data.resetToken) {
        setSimulatedToken(res.data.resetToken);
      }
    } catch (err: any) {
      setForgotError(err.response?.data?.message || 'Error executing forgot password.');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');

    try {
      const res = await axios.post(`${apiUrl}/auth/reset-password`, {
        resetToken,
        newPassword
      });
      setResetSuccess(res.data.message);
      // Automatically close reset modal and clear login states after a few seconds
      setTimeout(() => {
        setShowResetModal(false);
        setResetSuccess('');
        setResetToken('');
        setNewPassword('');
      }, 3000);
    } catch (err: any) {
      setResetError(err.response?.data?.message || 'Password reset failed.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 glass-panel p-8 rounded-2xl relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-neonCyan/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-neonPurple/20 rounded-full blur-3xl"></div>

        <div className="text-center">
          <h2 className="mt-2 text-3xl font-extrabold text-white tracking-tight">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Or{' '}
            <Link to="/register" className="font-medium text-neonCyan hover:text-neonCyan/80 transition-colors">
              create a new account
            </Link>
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-300 block mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 bg-gray-900/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neonCyan focus:border-transparent transition-all text-sm"
                  placeholder="name@domain.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-gray-300 block">Password</label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs text-neonCyan hover:text-neonCyan/80 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 bg-gray-900/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neonCyan focus:border-transparent transition-all text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2.5 px-4 bg-gradient-to-r from-neonCyan to-neonPurple text-white rounded-lg text-sm font-semibold transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neonCyan disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </div>
        </form>

        {/* Demo Credentials Section */}
        <div className="mt-6 pt-6 border-t border-white/5 text-center">
          <p className="text-xs text-gray-400 font-medium">Demo Accounts (Password: password123)</p>
          <div className="mt-2 grid grid-cols-3 gap-2 text-[10px] font-mono">
            <button 
              onClick={() => { setEmail('member@fitagg.com.au'); setPassword('password123'); }}
              className="p-1.5 bg-gray-900/60 hover:bg-gray-900 border border-white/5 rounded text-neonCyan hover:border-neonCyan/30 transition-all"
            >
              Member
            </button>
            <button 
              onClick={() => { setEmail('owner1@fitagg.com.au'); setPassword('password123'); }}
              className="p-1.5 bg-gray-900/60 hover:bg-gray-900 border border-white/5 rounded text-neonOrange hover:border-neonOrange/30 transition-all"
            >
              Owner
            </button>
            <button 
              onClick={() => { setEmail('admin@fitagg.com.au'); setPassword('password123'); }}
              className="p-1.5 bg-gray-900/60 hover:bg-gray-900 border border-white/5 rounded text-neonPurple hover:border-neonPurple/30 transition-all"
            >
              Admin
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="max-w-md w-full glass-panel p-6 rounded-xl space-y-4">
            <h3 className="text-xl font-bold text-white">Reset Password</h3>
            <p className="text-xs text-gray-400">
              Enter your email address. We will simulate sending a password reset token below, which you can use to reset your password.
            </p>

            {forgotError && <p className="text-xs text-red-400 font-medium">{forgotError}</p>}
            {forgotSuccess && <p className="text-xs text-green-400 font-medium">{forgotSuccess}</p>}

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full px-3 py-2 bg-gray-900/50 border border-white/10 rounded-lg text-white text-sm"
              />
              <button
                type="submit"
                className="w-full py-2 bg-neonCyan hover:bg-neonCyan/90 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                Send Reset Link (Simulated)
              </button>
            </form>

            {simulatedToken && (
              <div className="mt-4 p-3 bg-gray-900 rounded border border-neonCyan/20">
                <span className="text-[10px] text-neonCyan font-mono block uppercase">Simulated Recovery Token:</span>
                <textarea 
                  readOnly 
                  value={simulatedToken} 
                  className="w-full text-[10px] font-mono bg-transparent text-gray-300 resize-none h-16 border-none focus:outline-none focus:ring-0" 
                />
                <button
                  onClick={() => {
                    setResetToken(simulatedToken);
                    setShowForgotModal(false);
                    setShowResetModal(true);
                  }}
                  className="mt-2 w-full flex items-center justify-center gap-1 text-xs text-neonCyan font-semibold hover:underline"
                >
                  Proceed to Reset Screen <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            )}

            <button
              onClick={() => {
                setShowForgotModal(false);
                setForgotEmail('');
                setForgotSuccess('');
                setForgotError('');
                setSimulatedToken('');
              }}
              className="w-full py-1 text-xs text-gray-500 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="max-w-md w-full glass-panel p-6 rounded-xl space-y-4">
            <h3 className="text-xl font-bold text-white">Create New Password</h3>

            {resetError && <p className="text-xs text-red-400 font-medium">{resetError}</p>}
            {resetSuccess && (
              <div className="flex items-center gap-2 text-green-400 text-xs font-medium">
                <CheckCircle className="h-4 w-4" />
                <span>{resetSuccess}</span>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Recovery Token</label>
                <input
                  type="text"
                  required
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  placeholder="Paste token here"
                  className="w-full px-3 py-2 bg-gray-900/50 border border-white/10 rounded-lg text-white font-mono text-[10px]"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password (e.g. password1234)"
                  className="w-full px-3 py-2 bg-gray-900/50 border border-white/10 rounded-lg text-white text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-neonPurple hover:bg-neonPurple/90 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                Reset Password
              </button>
            </form>

            <button
              onClick={() => {
                setShowResetModal(false);
                setResetToken('');
                setNewPassword('');
                setResetSuccess('');
                setResetError('');
              }}
              className="w-full py-1 text-xs text-gray-500 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
