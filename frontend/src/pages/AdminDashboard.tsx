import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { ShieldAlert, Users, Dumbbell, Calendar, CheckSquare, DollarSign, Trash2, Edit2, Check, RefreshCw } from 'lucide-react';

interface AdminAnalytics {
  metrics: {
    totalUsers: number;
    totalMembers: number;
    totalOwners: number;
    totalGyms: number;
    totalBookings: number;
    totalCheckIns: number;
    totalRevenue: number;
  };
  gymsList: any[];
  usersList: any[];
  paymentsList: any[];
  charts: {
    revenueOverTime: { day: string; revenue: number }[];
  };
}

export const AdminDashboard: React.FC = () => {
  const { apiUrl } = useAuth();
  
  const [data, setData] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Role Edit States
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<'member' | 'owner' | 'admin'>('member');
  const [roleLoadingId, setRoleLoadingId] = useState<string | null>(null);

  const fetchAdminData = async () => {
    try {
      const res = await axios.get(`${apiUrl}/analytics/admin`);
      setData(res.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleDeleteGym = async (gymId: string, gymName: string) => {
    if (!window.confirm(`Are you sure you want to remove gym "${gymName}" from the platform?`)) return;
    setActionError('');
    setActionSuccess('');

    try {
      await axios.delete(`${apiUrl}/gyms/${gymId}`);
      setActionSuccess(`Gym "${gymName}" removed successfully.`);
      fetchAdminData();
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to delete gym.');
    }
  };

  const handleUpdateRole = async (userId: string) => {
    setRoleLoadingId(userId);
    setActionError('');
    setActionSuccess('');

    try {
      await axios.post(`${apiUrl}/analytics/admin/users/${userId}/role`, { role: selectedRole });
      setActionSuccess('User role updated successfully.');
      setEditingUserId(null);
      fetchAdminData();
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to update user role.');
    } finally {
      setRoleLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neonCyan mx-auto"></div>
        <p className="text-gray-400 mt-4">Loading system administrator metrics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <ShieldAlert className="h-8 w-8 text-neonPurple" /> Platform Administration Console
        </h1>
        <p className="text-xs text-gray-400">
          Australian Fitness Aggregator Platform Network • Global Performance & Operations
        </p>

        {actionSuccess && (
          <p className="mt-3 p-2 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold rounded-lg">
            {actionSuccess}
          </p>
        )}
        {actionError && (
          <p className="mt-3 p-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold rounded-lg">
            {actionError}
          </p>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center gap-4">
          <div className="p-3 bg-neonCyan/10 border border-neonCyan/20 text-neonCyan rounded-xl">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider block">Registered Athletes</span>
            <span className="text-xl font-black text-white">{data?.metrics.totalMembers || 0} Members</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center gap-4">
          <div className="p-3 bg-neonPurple/10 border border-neonPurple/20 text-neonPurple rounded-xl">
            <Dumbbell className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider block">Gym partners</span>
            <span className="text-xl font-black text-white">{data?.metrics.totalGyms || 0} Gyms</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center gap-4">
          <div className="p-3 bg-neonOrange/10 border border-neonOrange/20 text-neonOrange rounded-xl">
            <CheckSquare className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider block">Total Bookings & Entries</span>
            <span className="text-xl font-black text-white">{data?.metrics.totalBookings || 0} RSVPs</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center gap-4">
          <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider block">Gross Billing Revenue</span>
            <span className="text-xl font-black text-white">${data?.metrics.totalRevenue.toFixed(2) || '0.00'} AUD</span>
          </div>
        </div>
      </div>

      {/* Chart Row */}
      {data && (
        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
          <h3 className="text-base font-bold text-white">Daily Billing Revenue (Last 7 Days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.charts.revenueOverTime} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="day" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 11 }} />
                <Area type="monotone" dataKey="revenue" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue ($)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Lists Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Users Management */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-neonCyan" /> Platform Accounts Administration
          </h3>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 text-gray-400 font-semibold">
                  <th className="pb-3">Name & Email</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data?.usersList.map((usr) => (
                  <tr key={usr._id} className="text-gray-300">
                    <td className="py-2.5">
                      <span className="font-bold text-white block">{usr.name}</span>
                      <span className="text-[10px] text-gray-500 block font-mono">{usr.email}</span>
                    </td>
                    <td className="py-2.5">
                      {editingUserId === usr._id ? (
                        <select
                          value={selectedRole}
                          onChange={(e) => setSelectedRole(e.target.value as any)}
                          className="bg-gray-900 border border-white/20 rounded px-1.5 py-0.5 text-white text-[10px]"
                        >
                          <option value="member">member</option>
                          <option value="owner">owner</option>
                          <option value="admin">admin</option>
                        </select>
                      ) : (
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                          usr.role === 'admin'
                            ? 'bg-neonPurple/15 text-neonPurple border border-neonPurple/20'
                            : usr.role === 'owner'
                            ? 'bg-neonOrange/15 text-neonOrange border border-neonOrange/20'
                            : 'bg-neonCyan/15 text-neonCyan border border-neonCyan/20'
                        }`}>
                          {usr.role}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 text-right">
                      {editingUserId === usr._id ? (
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleUpdateRole(usr._id)}
                            disabled={roleLoadingId === usr._id}
                            className="p-1 bg-green-500/20 text-green-400 border border-green-500/20 rounded hover:bg-green-500/30"
                          >
                            {roleLoadingId === usr._id ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                          </button>
                          <button
                            onClick={() => setEditingUserId(null)}
                            className="p-1 bg-gray-800 text-gray-400 border border-white/5 rounded hover:bg-gray-700 text-[10px] font-bold"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingUserId(usr._id);
                            setSelectedRole(usr.role);
                          }}
                          className="p-1.5 border border-white/5 hover:border-white/10 hover:bg-white/5 rounded text-gray-400 hover:text-white transition-colors"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Gyms Management */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-neonOrange" /> Active Gym Portfolios
          </h3>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 text-gray-400 font-semibold">
                  <th className="pb-3">Gym</th>
                  <th className="pb-3">Owner Contact</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data?.gymsList.map((gym) => (
                  <tr key={gym._id} className="text-gray-300">
                    <td className="py-2.5">
                      <span className="font-bold text-white block">{gym.name}</span>
                      <span className="text-[10px] text-gray-400 block">{gym.address}, {gym.city}</span>
                    </td>
                    <td className="py-2.5">
                      <span className="font-semibold block">{gym.owner?.name || 'Platform Admin'}</span>
                      <span className="text-[10px] text-gray-500 block font-mono">{gym.owner?.email || 'N/A'}</span>
                    </td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => handleDeleteGym(gym._id, gym.name)}
                        className="p-1.5 border border-red-500/10 hover:border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Payments Logs List */}
      <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-400" /> Platform Transaction ledger (Recent 10)
        </h3>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-gray-400 font-semibold">
                <th className="pb-3">Txn Hash ID</th>
                <th className="pb-3">User Account</th>
                <th className="pb-3">Subscribed Plan</th>
                <th className="pb-3">Date</th>
                <th className="pb-3 text-right">Settled Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data?.paymentsList.map((payment) => (
                <tr key={payment._id} className="text-gray-300">
                  <td className="py-2.5 font-mono text-[10px] text-gray-400">{payment._id.toUpperCase()}</td>
                  <td className="py-2.5">
                    <span className="font-semibold block">{payment.user?.name || 'N/A'}</span>
                    <span className="text-[10px] text-gray-500 block font-mono">{payment.user?.email || 'N/A'}</span>
                  </td>
                  <td className="py-2.5 uppercase font-semibold text-neonCyan">{payment.planName}</td>
                  <td className="py-2.5 font-mono text-[10px] text-gray-500">
                    {new Date(payment.createdAt).toLocaleString('en-AU')}
                  </td>
                  <td className="py-2.5 text-right font-extrabold text-white">${payment.amount.toFixed(2)} AUD</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
