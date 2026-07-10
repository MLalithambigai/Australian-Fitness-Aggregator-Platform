import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Dumbbell, LogOut, User, BarChart2, ShieldAlert, Bookmark, QrCode, Menu, X, CreditCard } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const linkClass = (path: string) => 
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
      isActive(path) 
        ? 'bg-gradient-to-r from-neonCyan/20 to-neonPurple/20 text-neonCyan border border-neonCyan/30 text-glow-cyan' 
        : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
    }`;

  return (
    <nav className="glass-panel sticky top-0 z-50 px-4 sm:px-6 py-3 border-b border-white/5 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-wider text-white">
          <Dumbbell className="h-6 w-6 text-neonCyan animate-pulse" />
          <span className="bg-gradient-to-r from-neonCyan via-neonPurple to-neonOrange bg-clip-text text-transparent">
            AUST FIT
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-4">
          <Link to="/" className={linkClass('/')}>Explore Gyms</Link>

          {user && (
            <>
              {/* Member Links */}
              {user.role === 'member' && (
                <>
                  <Link to="/dashboard" className={linkClass('/dashboard')}>
                    <User className="h-4 w-4" /> Dashboard
                  </Link>
                  <Link to="/pricing" className={linkClass('/pricing')}>
                    <CreditCard className="h-4 w-4" /> Plans
                  </Link>
                </>
              )}

              {/* Owner Links */}
              {user.role === 'owner' && (
                <Link to="/owner-dashboard" className={linkClass('/owner-dashboard')}>
                  <BarChart2 className="h-4 w-4" /> Owner Portal
                </Link>
              )}

              {/* Admin Links */}
              {user.role === 'admin' && (
                <Link to="/admin-dashboard" className={linkClass('/admin-dashboard')}>
                  <ShieldAlert className="h-4 w-4" /> Admin Console
                </Link>
              )}

              {/* Entrance Simulator Link for easy testing of QR & rules */}
              <Link to="/scanner-simulator" className={linkClass('/scanner-simulator')}>
                <QrCode className="h-4 w-4" /> Entry Simulator
              </Link>
            </>
          )}
        </div>

        {/* User Actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex flex-col text-right">
                <span className="text-sm font-semibold text-white">{user.name}</span>
                <span className="text-xs text-neonCyan font-mono uppercase tracking-wide">{user.role}</span>
              </div>
              <button 
                onClick={handleLogout} 
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500/10 to-pink-500/10 hover:from-red-500/20 hover:to-pink-500/20 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 rounded-lg text-sm font-medium transition-all"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link 
                to="/login" 
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-all"
              >
                Log In
              </Link>
              <Link 
                to="/register" 
                className="px-4 py-2 bg-gradient-to-r from-neonCyan to-neonPurple hover:from-neonCyan/90 hover:to-neonPurple/90 text-white rounded-lg text-sm font-medium transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.5)]"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Links */}
      {isOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-white/5 flex flex-col gap-2">
          <Link to="/" onClick={() => setIsOpen(false)} className={linkClass('/')}>Explore Gyms</Link>

          {user && (
            <>
              {user.role === 'member' && (
                <>
                  <Link to="/dashboard" onClick={() => setIsOpen(false)} className={linkClass('/dashboard')}>
                    Dashboard
                  </Link>
                  <Link to="/pricing" onClick={() => setIsOpen(false)} className={linkClass('/pricing')}>
                    Plans
                  </Link>
                </>
              )}
              {user.role === 'owner' && (
                <Link to="/owner-dashboard" onClick={() => setIsOpen(false)} className={linkClass('/owner-dashboard')}>
                  Owner Portal
                </Link>
              )}
              {user.role === 'admin' && (
                <Link to="/admin-dashboard" onClick={() => setIsOpen(false)} className={linkClass('/admin-dashboard')}>
                  Admin Console
                </Link>
              )}
              <Link to="/scanner-simulator" onClick={() => setIsOpen(false)} className={linkClass('/scanner-simulator')}>
                Entry Simulator
              </Link>
            </>
          )}

          {user ? (
            <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-white">{user.name}</div>
                <div className="text-xs text-neonCyan font-mono uppercase tracking-wide">{user.role}</div>
              </div>
              <button 
                onClick={() => { setIsOpen(false); handleLogout(); }} 
                className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-md text-xs font-medium"
              >
                <LogOut className="h-3.5 w-3.5" /> Logout
              </button>
            </div>
          ) : (
            <div className="mt-2 pt-2 border-t border-white/5 flex flex-col gap-2">
              <Link 
                to="/login" 
                onClick={() => setIsOpen(false)} 
                className="w-full text-center py-2 text-sm font-medium text-gray-300 hover:text-white"
              >
                Log In
              </Link>
              <Link 
                to="/register" 
                onClick={() => setIsOpen(false)} 
                className="w-full text-center py-2 bg-gradient-to-r from-neonCyan to-neonPurple text-white rounded-lg text-sm font-medium"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
