import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { KeyRound, Mail, User, AlertTriangle } from 'lucide-react';

export const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'member' | 'owner'>('member');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(name, email, password, role);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Email might already be taken.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 glass-panel p-8 rounded-2xl relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-neonPurple/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-neonCyan/20 rounded-full blur-3xl"></div>

        <div className="text-center">
          <h2 className="mt-2 text-3xl font-extrabold text-white tracking-tight">
            Create Account
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-neonCyan hover:text-neonCyan/80 transition-colors">
              Sign In
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
              <label className="text-sm font-medium text-gray-300 block mb-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 bg-gray-900/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-neonCyan focus:border-transparent transition-all text-sm"
                  placeholder="John Doe"
                />
              </div>
            </div>

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
              <label className="text-sm font-medium text-gray-300 block mb-1">Password</label>
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
                  placeholder="Minimum 6 characters"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 block mb-2">Account Role</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole('member')}
                  className={`py-2 px-4 rounded-lg border text-sm font-semibold transition-all ${
                    role === 'member'
                      ? 'bg-neonCyan/20 text-neonCyan border-neonCyan/60 shadow-[0_0_10px_rgba(6,182,212,0.15)] text-glow-cyan'
                      : 'bg-gray-900/40 text-gray-400 border-white/5 hover:border-white/15'
                  }`}
                >
                  Member / Athlete
                </button>
                <button
                  type="button"
                  onClick={() => setRole('owner')}
                  className={`py-2 px-4 rounded-lg border text-sm font-semibold transition-all ${
                    role === 'owner'
                      ? 'bg-neonOrange/20 text-neonOrange border-neonOrange/60 shadow-[0_0_10px_rgba(249,115,22,0.15)] text-glow-orange'
                      : 'bg-gray-900/40 text-gray-400 border-white/5 hover:border-white/15'
                  }`}
                >
                  Gym Owner / Partner
                </button>
              </div>
              <p className="text-[10px] text-gray-500 mt-2">
                {role === 'member' 
                  ? 'Members can subscribe to membership plans, search for gyms, check-in using dynamic QR codes, and book classes.' 
                  : 'Owners can register their gym locations, schedule custom fitness classes, and view visitor analytics/revenue splits.'}
              </p>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2.5 px-4 bg-gradient-to-r from-neonCyan to-neonPurple text-white rounded-lg text-sm font-semibold transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neonCyan disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
