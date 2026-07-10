import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Check, ShieldAlert, Sparkles, CreditCard, RefreshCw, XCircle } from 'lucide-react';

interface Transaction {
  _id: string;
  amount: number;
  planName: string;
  status: string;
  createdAt: string;
}

export const Pricing: React.FC = () => {
  const { user, refreshUser, apiUrl } = useAuth();
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const fetchTransactions = async () => {
    try {
      const res = await axios.get(`${apiUrl}/memberships/transactions`);
      setTransactions(res.data);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  const handleSubscribe = async (planName: string) => {
    setLoading(true);
    setActionMessage('');
    setActionError('');

    try {
      const endpoint = user?.membership?.plan && user.membership.plan !== 'none' 
        ? `${apiUrl}/memberships/upgrade` 
        : `${apiUrl}/memberships/subscribe`;

      const res = await axios.post(endpoint, { planName });
      setActionMessage(res.data.message);
      await refreshUser();
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Membership action failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to cancel your membership auto-renewal?')) return;
    setLoading(true);
    setActionMessage('');
    setActionError('');

    try {
      const res = await axios.post(`${apiUrl}/memberships/cancel`);
      setActionMessage(res.data.message);
      await refreshUser();
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Cancellation failed.');
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    {
      name: 'basic',
      price: '49.99',
      features: [
        'Access to 2 Gym locations',
        'Standard equipment entry',
        '1 booked fitness class per week',
        'Dynamic secure QR Pass entry',
        'Rule-based re-entry support'
      ],
      color: 'border-white/10 hover:border-neonCyan/40 bg-gray-900/40',
      tagColor: 'bg-gray-800 text-gray-300',
      btnStyle: 'bg-white/5 border border-white/10 hover:bg-white/10 text-white'
    },
    {
      name: 'premium',
      price: '79.99',
      features: [
        'Access to ALL Gym locations (Australia-wide)',
        'Free Weights, Sauna & Pools access',
        'Unlimited class bookings',
        'Dynamic QR Pass entry with 60s security',
        'Fast-track re-entry check-ins',
        'Coaching workshop access'
      ],
      color: 'border-neonCyan/30 bg-gradient-to-b from-neonCyan/5 to-transparent relative shadow-[0_0_30px_rgba(6,182,212,0.08)]',
      tagColor: 'bg-neonCyan/20 text-neonCyan',
      btnStyle: 'bg-neonCyan hover:bg-neonCyan/90 text-black shadow-[0_0_15px_rgba(6,182,212,0.2)]',
      popular: true
    },
    {
      name: 'vip',
      price: '129.99',
      features: [
        'Access to ALL Gym locations (VIP areas included)',
        'Access to Steam Rooms, Spas & Recovery Zones',
        'Priority class bookings & reserves',
        'Unlimited QR check-ins',
        'Free 1-on-1 personal training (1 session/week)',
        'Custom nutrition planner'
      ],
      color: 'border-neonPurple/30 bg-gradient-to-b from-neonPurple/5 to-transparent relative shadow-[0_0_30px_rgba(168,85,247,0.08)]',
      tagColor: 'bg-neonPurple/20 text-neonPurple',
      btnStyle: 'bg-neonPurple hover:bg-neonPurple/90 text-white shadow-[0_0_15px_rgba(168,85,247,0.2)]'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Flexible{' '}
          <span className="bg-gradient-to-r from-neonCyan via-neonPurple to-neonOrange bg-clip-text text-transparent">
            Membership Plans
          </span>
        </h1>
        <p className="text-gray-400 text-sm">
          Simple subscription. No lock-in contracts. Upgrade, downgrade, or cancel auto-renewal at any time.
        </p>

        {actionMessage && (
          <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold rounded-lg">
            {actionMessage}
          </div>
        )}
        {actionError && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5">
            <ShieldAlert className="h-4 w-4" /> {actionError}
          </div>
        )}
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((p) => {
          const isCurrent = user?.membership?.plan === p.name && user?.membership?.status !== 'inactive';
          return (
            <div 
              key={p.name}
              className={`glass-panel border p-6 rounded-2xl flex flex-col justify-between space-y-6 transition-all duration-300 ${p.color}`}
            >
              {p.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-neonCyan text-black font-extrabold text-[10px] uppercase tracking-wider rounded-full shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                  Most Popular
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${p.tagColor}`}>
                    {p.name}
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] text-green-400 font-bold uppercase tracking-wider flex items-center gap-0.5">
                      <Check className="h-3.5 w-3.5" /> Current Plan
                    </span>
                  )}
                </div>

                <div className="flex items-baseline text-white">
                  <span className="text-3xl sm:text-4xl font-extrabold">$</span>
                  <span className="text-4xl sm:text-5xl font-extrabold tracking-tight">{p.price}</span>
                  <span className="ml-1 text-xs text-gray-400 font-semibold">/ month (AUD)</span>
                </div>

                <ul className="space-y-3 pt-3 border-t border-white/5">
                  {p.features.map((f, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-gray-300 leading-normal">
                      <Check className="h-4 w-4 text-neonCyan shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                {user ? (
                  user.role === 'member' ? (
                    <button
                      onClick={() => handleSubscribe(p.name)}
                      disabled={loading || isCurrent}
                      className={`w-full py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                        isCurrent 
                          ? 'bg-green-500/10 text-green-400 border border-green-500/30 cursor-not-allowed'
                          : p.btnStyle
                      }`}
                    >
                      {loading ? 'Processing...' : isCurrent ? 'Active Plan' : user.membership?.plan && user.membership.plan !== 'none' ? 'Upgrade Plan' : 'Select Plan'}
                    </button>
                  ) : (
                    <div className="text-center text-xs text-gray-500 font-semibold p-2">
                      Athletes Account Only
                    </div>
                  )
                ) : (
                  <button
                    onClick={() => window.location.href = '/login'}
                    className="w-full py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-semibold uppercase tracking-wider"
                  >
                    Login to Subscribe
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Subscription Settings & Billing History */}
      {user && user.role === 'member' && user.membership && user.membership.status === 'active' && (
        <div className="max-w-4xl mx-auto glass-panel p-6 rounded-2xl border border-red-500/20 bg-gradient-to-b from-red-500/5 to-transparent flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-base font-bold text-white flex items-center gap-1.5 justify-center sm:justify-start">
              <CreditCard className="h-5 w-5 text-neonOrange animate-pulse" /> Active Plan Management
            </h4>
            <p className="text-xs text-gray-400">
              Your billing renewal occurs automatically on <span className="text-white font-semibold font-mono">{new Date(user.membership.endDate!).toLocaleDateString('en-AU')}</span>. 
            </p>
          </div>

          <button
            onClick={handleCancelSubscription}
            disabled={loading}
            className="px-4 py-2 border border-red-500/20 hover:border-red-500/40 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1"
          >
            <XCircle className="h-4 w-4" /> Cancel Auto-Renewal
          </button>
        </div>
      )}

      {/* Billing Logs */}
      {user && user.role === 'member' && (
        <div className="max-w-4xl mx-auto glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-neonCyan" /> Billing & Payment Log
          </h3>

          {transactions.length === 0 ? (
            <p className="text-xs text-gray-500">No payment transaction records found.</p>
          ) : (
            <div className="divide-y divide-white/5 text-xs">
              {transactions.map((t) => (
                <div key={t._id} className="py-3 flex justify-between items-center">
                  <div className="space-y-0.5">
                    <span className="font-bold text-white uppercase tracking-wider text-[10px]">AustFit {t.planName} Plan</span>
                    <span className="text-[10px] text-gray-500 block font-mono">
                      Date: {new Date(t.createdAt).toLocaleString('en-AU')}
                    </span>
                  </div>
                  <div className="text-right space-y-1">
                    <span className="font-extrabold text-white block">${t.amount.toFixed(2)} AUD</span>
                    <span className="px-2 py-0.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded text-[9px] font-semibold uppercase">
                      {t.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
