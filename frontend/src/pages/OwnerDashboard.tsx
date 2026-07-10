import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts';
import { BarChart2, Calendar, TrendingUp, Users, DollarSign, Plus, Eye, CheckCircle2, ShieldAlert, Sparkles, MapPin } from 'lucide-react';

interface OwnerAnalytics {
  hasGyms: boolean;
  totalGyms: number;
  totalBookings: number;
  totalCheckIns: number;
  revenue: number;
  visitorLog: any[];
  gymCapacityStats: any[];
  charts: {
    checkinsOverTime: { day: string; count: number }[];
    classPopularity: { name: string; bookings: number }[];
  };
}

export const OwnerDashboard: React.FC = () => {
  const { apiUrl } = useAuth();
  const [data, setData] = useState<OwnerAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Create Gym Form States
  const [showAddGymModal, setShowAddGymModal] = useState(false);
  const [gymName, setGymName] = useState('');
  const [gymDesc, setGymDesc] = useState('');
  const [gymAddress, setGymAddress] = useState('');
  const [gymCity, setGymCity] = useState('Sydney');
  const [gymLat, setGymLat] = useState(-33.8688);
  const [gymLng, setGymLng] = useState(151.2093);
  const [gymCapacity, setGymCapacity] = useState(100);
  const [gymFacilities, setGymFacilities] = useState<string[]>([]);
  const [gymImage, setGymImage] = useState('');
  
  // Create Class Form States
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [targetGymId, setTargetGymId] = useState('');
  const [className, setClassName] = useState('');
  const [classInstructor, setClassInstructor] = useState('');
  const [classTime, setClassTime] = useState('');
  const [classCapacity, setClassCapacity] = useState(20);

  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get(`${apiUrl}/analytics/owner`);
      setData(res.data);
      if (res.data.gymCapacityStats?.length > 0) {
        setTargetGymId(res.data.gymCapacityStats[0].id);
      }
    } catch (err) {
      console.error('Error fetching owner analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleFacilityChange = (f: string) => {
    if (gymFacilities.includes(f)) {
      setGymFacilities(gymFacilities.filter(item => item !== f));
    } else {
      setGymFacilities([...gymFacilities, f]);
    }
  };

  const handleAddGym = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    try {
      const payload = {
        name: gymName,
        description: gymDesc,
        address: gymAddress,
        city: gymCity,
        lat: gymLat,
        lng: gymLng,
        capacity: gymCapacity,
        facilities: gymFacilities,
        images: gymImage ? [gymImage] : ['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80']
      };

      await axios.post(`${apiUrl}/gyms`, payload);
      setFormSuccess('Gym registered successfully!');
      
      // Reset
      setGymName('');
      setGymDesc('');
      setGymAddress('');
      setGymFacilities([]);
      setGymImage('');
      
      await fetchAnalytics();
      setTimeout(() => setShowAddGymModal(false), 2000);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to register gym.');
    }
  };

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!targetGymId) {
      setFormError('Please select a gym to add the class to.');
      return;
    }

    try {
      const payload = {
        name: className,
        instructor: classInstructor,
        time: classTime,
        capacity: classCapacity
      };

      await axios.post(`${apiUrl}/gyms/${targetGymId}/classes`, payload);
      setFormSuccess('Class scheduled successfully!');
      
      // Reset
      setClassName('');
      setClassInstructor('');
      setClassTime('');
      
      await fetchAnalytics();
      setTimeout(() => setShowAddClassModal(false), 2000);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to add class.');
    }
  };

  const availableFacilities = ['Cardio Area', 'Free Weights', 'Sauna', 'Pool', 'Yoga Studio', 'Steam Room', 'Spin Studio', '24/7 Access'];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neonCyan mx-auto"></div>
        <p className="text-gray-400 mt-4">Loading owner dashboard metrics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <BarChart2 className="h-8 w-8 text-neonCyan" /> Partner Gym Manager Portal
          </h1>
          <p className="text-xs text-gray-400">
            Australian Fitness Aggregator Network • Manage Locations & Scheduled Workouts
          </p>
        </div>

        <div className="flex gap-2.5">
          <button
            onClick={() => {
              setFormError('');
              setFormSuccess('');
              setShowAddGymModal(true);
            }}
            className="py-2 px-3 bg-neonCyan hover:bg-neonCyan/90 text-black rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
          >
            <Plus className="h-4 w-4" /> Register Gym
          </button>
          {data?.hasGyms && (
            <button
              onClick={() => {
                setFormError('');
                setFormSuccess('');
                setShowAddClassModal(true);
              }}
              className="py-2 px-3 bg-neonPurple hover:bg-neonPurple/90 text-white rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
            >
              <Plus className="h-4 w-4" /> Schedule Class
            </button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center gap-4">
          <div className="p-3 bg-neonCyan/10 border border-neonCyan/20 text-neonCyan rounded-xl">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider block">Managed Gyms</span>
            <span className="text-xl font-black text-white">{data?.totalGyms || 0} Locations</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center gap-4">
          <div className="p-3 bg-neonPurple/10 border border-neonPurple/20 text-neonPurple rounded-xl">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider block">Total Bookings</span>
            <span className="text-xl font-black text-white">{data?.totalBookings || 0} Class RSVPs</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center gap-4">
          <div className="p-3 bg-neonOrange/10 border border-neonOrange/20 text-neonOrange rounded-xl">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider block">Total Visitors</span>
            <span className="text-xl font-black text-white">{data?.totalCheckIns || 0} Check-Ins</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center gap-4">
          <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider block">Aggregator Payout</span>
            <span className="text-xl font-black text-white">${data?.revenue.toFixed(2) || '0.00'} AUD</span>
          </div>
        </div>
      </div>

      {/* No Gym Warning */}
      {data && !data.hasGyms && (
        <div className="glass-panel text-center p-12 rounded-2xl border border-white/5 space-y-4">
          <ShieldAlert className="h-12 w-12 text-neonOrange mx-auto" />
          <h2 className="text-xl font-bold text-white">No Gym Locations Registered Yet</h2>
          <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
            As a partner gym owner, register your physical location to allow aggregator members to browse your features, check-in with passes, and schedule classes.
          </p>
          <button
            onClick={() => setShowAddGymModal(true)}
            className="py-2 px-4 bg-neonCyan text-black font-semibold rounded-lg text-xs"
          >
            Create Your First Gym
          </button>
        </div>
      )}

      {/* Charts & Analytics Row */}
      {data && data.hasGyms && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkins Area Chart */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
            <h3 className="text-base font-bold text-white">Check-In Attendance (Last 7 Days)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.charts.checkinsOverTime} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCheckins" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 11 }} />
                  <Area type="monotone" dataKey="count" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorCheckins)" name="Check-ins" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Class Popularity Bar Chart */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
            <h3 className="text-base font-bold text-white">Popular Scheduled Classes</h3>
            {data.charts.classPopularity.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-20">Awaiting class booking RSVPs.</p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.charts.classPopularity} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 11 }} />
                    <Bar dataKey="bookings" fill="#a855f7" radius={[4, 4, 0, 0]} name="Bookings" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Gym capacity and Recent visitor tables */}
      {data && data.hasGyms && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Gym Capacity Stats */}
          <div className="lg:col-span-1 glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
            <h3 className="text-base font-bold text-white">Capacity Utilization</h3>
            <div className="space-y-4">
              {data.gymCapacityStats.map((gymStat) => {
                const ratio = gymStat.activeVisitors / gymStat.capacity;
                const percent = Math.round(ratio * 100);
                return (
                  <div key={gymStat.id} className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-white truncate">{gymStat.name}</span>
                      <span className="text-neonCyan font-mono">{gymStat.activeVisitors} / {gymStat.capacity} ({percent}%)</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          percent > 85 ? 'bg-red-500' : percent > 50 ? 'bg-neonOrange' : 'bg-neonCyan'
                        }`} 
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Visitor Log Table */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-1.5">
              <Eye className="h-5 w-5 text-neonCyan" /> Recent Visitor Entry Log
            </h3>
            
            {data.visitorLog.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-6">No visitor entries recorded yet today.</p>
            ) : (
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5 text-gray-400 font-semibold">
                      <th className="pb-3">Athlete</th>
                      <th className="pb-3">Gym</th>
                      <th className="pb-3">Time</th>
                      <th className="pb-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {data.visitorLog.map((log) => (
                      <tr key={log._id} className="text-gray-300">
                        <td className="py-2.5">
                          <span className="font-bold text-white block">{log.user?.name}</span>
                          <span className="text-[10px] text-gray-500 block">{log.user?.email}</span>
                        </td>
                        <td className="py-2.5">{log.gym?.name}</td>
                        <td className="py-2.5 font-mono text-[10px] text-gray-400">
                          {new Date(log.timestamp).toLocaleTimeString('en-AU')}
                        </td>
                        <td className="py-2.5 text-right">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider ${
                            log.status === 'valid'
                              ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}>
                            {log.status}
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
      )}

      {/* Add Gym Modal */}
      {showAddGymModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="max-w-lg w-full glass-panel p-6 rounded-2xl border border-neonCyan/30 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white flex items-center gap-1.5">
              <Sparkles className="h-5 w-5 text-neonCyan" /> Partner Location Registration
            </h3>

            {formError && <p className="text-xs text-red-400 font-semibold">{formError}</p>}
            {formSuccess && <p className="text-xs text-green-400 font-semibold">{formSuccess}</p>}

            <form onSubmit={handleAddGym} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Gym Name</label>
                  <input
                    type="text"
                    required
                    value={gymName}
                    onChange={(e) => setGymName(e.target.value)}
                    placeholder="Bondi Fitness Elite"
                    className="w-full bg-gray-900/60 border border-white/10 rounded-lg px-3 py-2 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">City Location</label>
                  <select
                    value={gymCity}
                    onChange={(e) => setGymCity(e.target.value)}
                    className="w-full bg-gray-900/60 border border-white/10 rounded-lg px-3 py-2 text-white text-xs"
                  >
                    <option value="Sydney">Sydney</option>
                    <option value="Melbourne">Melbourne</option>
                    <option value="Brisbane">Brisbane</option>
                    <option value="Adelaide">Adelaide</option>
                    <option value="Perth">Perth</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Physical Address</label>
                <input
                  type="text"
                  required
                  value={gymAddress}
                  onChange={(e) => setGymAddress(e.target.value)}
                  placeholder="e.g. 100 George St, Sydney NSW 2000"
                  className="w-full bg-gray-900/60 border border-white/10 rounded-lg px-3 py-2 text-white text-xs"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Gym Description</label>
                <textarea
                  required
                  value={gymDesc}
                  onChange={(e) => setGymDesc(e.target.value)}
                  placeholder="State the core details, equipment quality and unique features of the gym location..."
                  className="w-full bg-gray-900/60 border border-white/10 rounded-lg px-3 py-2 text-white text-xs h-16 resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={gymLat}
                    onChange={(e) => setGymLat(parseFloat(e.target.value))}
                    className="w-full bg-gray-900/60 border border-white/10 rounded-lg px-3 py-2 text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={gymLng}
                    onChange={(e) => setGymLng(parseFloat(e.target.value))}
                    className="w-full bg-gray-900/60 border border-white/10 rounded-lg px-3 py-2 text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Max Capacity</label>
                  <input
                    type="number"
                    required
                    value={gymCapacity}
                    onChange={(e) => setGymCapacity(parseInt(e.target.value))}
                    className="w-full bg-gray-900/60 border border-white/10 rounded-lg px-3 py-2 text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Feature Image (URL)</label>
                <input
                  type="text"
                  value={gymImage}
                  onChange={(e) => setGymImage(e.target.value)}
                  placeholder="https://images.unsplash.com/... (optional)"
                  className="w-full bg-gray-900/60 border border-white/10 rounded-lg px-3 py-2 text-white text-xs"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1.5">Facilities Checklist</label>
                <div className="grid grid-cols-3 gap-2">
                  {availableFacilities.map((fac) => (
                    <button
                      type="button"
                      key={fac}
                      onClick={() => handleFacilityChange(fac)}
                      className={`py-1 px-2 border rounded text-[10px] font-semibold transition-all ${
                        gymFacilities.includes(fac)
                          ? 'bg-neonCyan/20 text-neonCyan border-neonCyan/40'
                          : 'bg-gray-900/40 text-gray-400 border-white/5 hover:border-white/15'
                      }`}
                    >
                      {fac}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setShowAddGymModal(false)}
                  className="py-2 border border-white/10 hover:border-white/20 text-white rounded-lg text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 bg-neonCyan hover:bg-neonCyan/90 text-black rounded-lg text-xs font-bold shadow-lg"
                >
                  Save Partner Gym
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Class Modal */}
      {showAddClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="max-w-md w-full glass-panel p-6 rounded-2xl border border-neonPurple/30 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
              <Calendar className="h-5 w-5 text-neonPurple" /> Class Scheduler
            </h3>

            {formError && <p className="text-xs text-red-400 font-semibold">{formError}</p>}
            {formSuccess && <p className="text-xs text-green-400 font-semibold">{formSuccess}</p>}

            <form onSubmit={handleAddClass} className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Select Gym Location</label>
                <select
                  value={targetGymId}
                  onChange={(e) => setTargetGymId(e.target.value)}
                  className="w-full bg-gray-900/60 border border-white/10 rounded-lg px-3 py-2 text-white text-xs"
                >
                  {data?.gymCapacityStats.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Class Name</label>
                <input
                  type="text"
                  required
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="Spin Out / Power Lifting"
                  className="w-full bg-gray-900/60 border border-white/10 rounded-lg px-3 py-2 text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Instructor / Coach</label>
                  <input
                    type="text"
                    required
                    value={classInstructor}
                    onChange={(e) => setClassInstructor(e.target.value)}
                    placeholder="Dan Peterson"
                    className="w-full bg-gray-900/60 border border-white/10 rounded-lg px-3 py-2 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Class Capacity</label>
                  <input
                    type="number"
                    required
                    value={classCapacity}
                    onChange={(e) => setClassCapacity(parseInt(e.target.value))}
                    className="w-full bg-gray-900/60 border border-white/10 rounded-lg px-3 py-2 text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Schedule Time Slot</label>
                <input
                  type="text"
                  required
                  value={classTime}
                  onChange={(e) => setClassTime(e.target.value)}
                  placeholder="08:00 AM - 09:00 AM"
                  className="w-full bg-gray-900/60 border border-white/10 rounded-lg px-3 py-2 text-white text-xs"
                />
              </div>

              <div className="pt-2 grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setShowAddClassModal(false)}
                  className="py-2 border border-white/10 hover:border-white/20 text-white rounded-lg text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 bg-neonPurple hover:bg-neonPurple/90 text-white rounded-lg text-xs font-bold shadow-lg"
                >
                  Schedule Workout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
