import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { User, QrCode, Calendar, History, Bookmark, Sparkles, LogOut, CheckCircle, ShieldAlert, Clock, RefreshCw } from 'lucide-react';

interface Booking {
  _id: string;
  gym: { _id: string; name: string; city: string; address: string };
  className: string;
  classTime: string;
  date: string;
  status: 'booked' | 'cancelled';
}

interface Visit {
  _id: string;
  gym: { name: string; city: string; address: string };
  timestamp: string;
  status: 'valid' | 'invalid' | 'expired';
}

export const UserDashboard: React.FC = () => {
  const { user, logout, apiUrl, refreshUser } = useAuth();
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [favoriteGyms, setFavoriteGyms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelLoadingId, setCancelLoadingId] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      const bookingsRes = await axios.get(`${apiUrl}/bookings/my`);
      setBookings(bookingsRes.data);

      const visitsRes = await axios.get(`${apiUrl}/checkin/history`);
      setVisits(visitsRes.data);

      // Refresh auth context user details to fetch favorites
      await refreshUser();
      const userRes = await axios.get(`${apiUrl}/auth/me`);
      setFavoriteGyms(userRes.data.favoriteGyms || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCancelBooking = async (bookingId: string) => {
    setCancelLoadingId(bookingId);
    try {
      await axios.post(`${apiUrl}/bookings/cancel/${bookingId}`);
      await fetchDashboardData();
    } catch (err) {
      console.error('Error cancelling booking:', err);
    } finally {
      setCancelLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neonCyan mx-auto"></div>
        <p className="text-gray-400 mt-4">Loading your athlete dashboard...</p>
      </div>
    );
  }

  // Calculate some simple metrics
  const activeBookings = bookings.filter(b => b.status === 'booked');
  const validVisits = visits.filter(v => v.status === 'valid');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="relative glass-panel rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border border-white/5 overflow-hidden">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-neonCyan/10 rounded-full blur-3xl"></div>
        
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Welcome, {user?.name}!</h1>
          <p className="text-xs text-gray-400 font-medium">Platform Role: Member Athlete • Member ID: {user?.id.slice(-8).toUpperCase()}</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/pricing"
            className="px-4 py-2 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-semibold transition-all"
          >
            Manage Membership
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Membership Card */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-neonPurple/10 border border-neonPurple/20 text-neonPurple">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider block">Membership Plan</span>
            <span className="text-lg font-bold text-white uppercase tracking-wide">
              {user?.membership?.plan || 'None'}
            </span>
            <span className="text-[10px] text-gray-400 block mt-0.5">
              {user?.membership?.status === 'active' 
                ? `Expires: ${new Date(user.membership.endDate!).toLocaleDateString('en-AU')}` 
                : 'No active subscription'}
            </span>
          </div>
        </div>

        {/* Classes Booked Card */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-neonCyan/10 border border-neonCyan/20 text-neonCyan">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider block">Scheduled Classes</span>
            <span className="text-lg font-bold text-white">{activeBookings.length} Active Bookings</span>
            <span className="text-[10px] text-gray-400 block mt-0.5">Book classes at any gym</span>
          </div>
        </div>

        {/* Visits Card */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-neonOrange/10 border border-neonOrange/20 text-neonOrange">
            <History className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider block">Gym Check-Ins</span>
            <span className="text-lg font-bold text-white">{validVisits.length} Visits Today/Month</span>
            <span className="text-[10px] text-gray-400 block mt-0.5">One gym per day limit</span>
          </div>
        </div>
      </div>

      {/* Bookings & History Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Classes Booked & Visits History */}
        <div className="lg:col-span-2 space-y-8">
          {/* Class Bookings */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-neonCyan" /> Upcoming Booked Classes
            </h3>

            {activeBookings.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-white/5 rounded-xl">
                <p className="text-xs text-gray-400">You have no upcoming fitness classes booked.</p>
                <Link to="/" className="text-xs text-neonCyan font-semibold hover:underline mt-2 inline-block">
                  Browse Gyms to Schedule →
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {activeBookings.map((b) => (
                  <div key={b._id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h4 className="font-bold text-white">{b.className}</h4>
                      <p className="text-xs text-neonCyan font-medium">{b.gym?.name} ({b.gym?.city})</p>
                      <div className="flex items-center gap-4 text-[10px] text-gray-500 mt-1 font-mono">
                        <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" /> {b.classTime}</span>
                        <span>Date: {b.date}</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleCancelBooking(b._id)}
                      disabled={cancelLoadingId === b._id}
                      className="px-3 py-1.5 border border-red-500/20 hover:border-red-500/40 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                    >
                      {cancelLoadingId === b._id ? (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        'Cancel Booking'
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Visits Check-In Log */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <History className="h-5 w-5 text-neonOrange" /> Check-In Logs & History
            </h3>

            {visits.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-6">No previous check-in records found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-gray-400 font-semibold">
                      <th className="pb-3">Gym</th>
                      <th className="pb-3">Location</th>
                      <th className="pb-3">Time & Date</th>
                      <th className="pb-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {visits.map((v) => (
                      <tr key={v._id} className="text-gray-300">
                        <td className="py-3 font-semibold text-white">{v.gym?.name || 'Partner Gym'}</td>
                        <td className="py-3 text-gray-400">{v.gym?.city || 'Australia'}</td>
                        <td className="py-3 font-mono text-[10px]">
                          {new Date(v.timestamp).toLocaleString('en-AU', {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          })}
                        </td>
                        <td className="py-3 text-right">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                            v.status === 'valid' 
                              ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}>
                            {v.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Favorited Gyms list */}
        <div className="space-y-8">
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Bookmark className="h-4.5 w-4.5 text-neonCyan" /> Favorite Bookmarks
            </h3>

            {favoriteGyms.length === 0 ? (
              <p className="text-xs text-gray-500">Bookmarked gyms will appear here for fast shortcut access.</p>
            ) : (
              <div className="space-y-3">
                {favoriteGyms.map((gym) => (
                  <Link
                    key={gym._id}
                    to={`/gym/${gym._id}`}
                    className="block p-3 bg-gray-900/50 hover:bg-gray-900 border border-white/5 hover:border-neonCyan/30 rounded-xl transition-all"
                  >
                    <span className="font-bold text-white text-xs block truncate hover:text-neonCyan">{gym.name}</span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">{gym.address}, {gym.city}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
