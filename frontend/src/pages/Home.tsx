import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Search, MapPin, Star, Flame, Dumbbell, Award, ArrowRight, Bookmark, BookmarkCheck } from 'lucide-react';

interface Gym {
  _id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  rating: number;
  facilities: string[];
  images: string[];
  capacity: number;
}

export const Home: React.FC = () => {
  const { user, refreshUser, apiUrl } = useAuth();
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [facility, setFacility] = useState('');

  const fetchGyms = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (city) params.city = city;
      if (facility) params.facility = facility;

      const res = await axios.get(`${apiUrl}/gyms`, { params });
      setGyms(res.data);
    } catch (err) {
      console.error('Error fetching gyms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGyms();
  }, [search, city, facility]);

  const handleFavorite = async (gymId: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await axios.post(`${apiUrl}/gyms/${gymId}/favorite`);
      refreshUser();
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  const isFavorite = (gymId: string) => user?.favoriteGyms?.includes(gymId);

  const availableFacilities = ['Cardio Area', 'Free Weights', 'Sauna', 'Pool', 'Yoga Studio', 'Steam Room', 'Spin Studio', '24/7 Access'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Section */}
      <div className="relative glass-panel rounded-3xl p-8 sm:p-12 overflow-hidden text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8 border border-white/10 shadow-[0_0_50px_rgba(6,182,212,0.05)]">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-neonCyan/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-neonPurple/10 rounded-full blur-3xl -z-10"></div>

        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neonCyan/10 text-neonCyan text-xs font-semibold uppercase tracking-wider">
            <Flame className="h-3.5 w-3.5" /> Australian Aggregator Network
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            One Pass. <br className="sm:hidden" />
            <span className="bg-gradient-to-r from-neonCyan via-neonPurple to-neonOrange bg-clip-text text-transparent">
              Unlimited Workouts.
            </span>
          </h1>
          <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
            Gain access to hundreds of elite gyms across Australia. Experience yoga in Sydney, spin in Melbourne, or strength conditioning in Bondi, all with a single subscription.
          </p>
          <div className="pt-2 flex flex-wrap gap-3 justify-center sm:justify-start">
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Award className="h-4 w-4 text-neonOrange" /> Real-time Capacity Check
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Dumbbell className="h-4 w-4 text-neonPurple" /> Dynamic QR Passes
            </div>
          </div>
        </div>

        <div className="shrink-0 flex items-center justify-center bg-gradient-to-tr from-neonCyan/20 to-neonPurple/20 p-4 rounded-2xl border border-white/10 shadow-lg">
          <Dumbbell className="h-28 w-28 text-white animate-bounce" />
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Search className="h-5 w-5 text-neonCyan" /> Find Your Gym
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by gym name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-900/40 border border-white/10 rounded-lg px-4 py-2.5 pl-10 text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-neonCyan"
            />
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
          </div>

          {/* City Selector */}
          <div className="relative">
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-gray-900/40 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-neonCyan appearance-none"
            >
              <option value="">All Cities (Australia)</option>
              <option value="Sydney">Sydney</option>
              <option value="Melbourne">Melbourne</option>
              <option value="Brisbane">Brisbane</option>
              <option value="Adelaide">Adelaide</option>
              <option value="Perth">Perth</option>
            </select>
            <MapPin className="absolute right-3.5 top-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Facility filter */}
          <div className="relative">
            <select
              value={facility}
              onChange={(e) => setFacility(e.target.value)}
              className="w-full bg-gray-900/40 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-neonCyan appearance-none"
            >
              <option value="">All Facilities</option>
              {availableFacilities.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
            <Dumbbell className="absolute right-3.5 top-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Gym Listings Grid */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white">Featured Gym Partners ({gyms.length})</h3>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass-panel h-80 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : gyms.length === 0 ? (
          <div className="glass-panel text-center p-12 rounded-2xl border border-white/5 space-y-2">
            <Dumbbell className="h-10 w-10 text-gray-500 mx-auto" />
            <p className="text-gray-300 font-semibold">No gyms matching your filters were found.</p>
            <p className="text-xs text-gray-500">Try adjusting your search criteria or select another city.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gyms.map(gym => (
              <Link 
                key={gym._id} 
                to={`/gym/${gym._id}`}
                className="group glass-panel glass-panel-hover flex flex-col rounded-2xl overflow-hidden border border-white/5 transition-all duration-300"
              >
                {/* Gym Image */}
                <div className="relative h-48 overflow-hidden bg-gray-800">
                  <img
                    src={gym.images[0] || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80'}
                    alt={gym.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 flex gap-2">
                    {user?.role === 'member' && (
                      <button
                        onClick={(e) => handleFavorite(gym._id, e)}
                        className="p-2 rounded-full bg-black/60 hover:bg-black/80 border border-white/10 text-white transition-colors"
                      >
                        {isFavorite(gym._id) ? (
                          <BookmarkCheck className="h-4 w-4 text-neonCyan fill-neonCyan" />
                        ) : (
                          <Bookmark className="h-4 w-4 text-gray-300 hover:text-white" />
                        )}
                      </button>
                    )}
                    <span className="px-2.5 py-1 rounded-full bg-black/60 border border-white/10 text-white text-[10px] font-semibold flex items-center gap-1 font-mono">
                      <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" /> {gym.rating.toFixed(1)}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 bg-neonCyan/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-black uppercase tracking-wider">
                    {gym.city}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-lg font-bold text-white group-hover:text-neonCyan transition-colors">
                      {gym.name}
                    </h4>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-neonOrange shrink-0" /> {gym.address}
                    </p>
                    <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">
                      {gym.description}
                    </p>
                  </div>

                  {/* Facilities & CTA */}
                  <div className="space-y-3 pt-3 border-t border-white/5">
                    <div className="flex flex-wrap gap-1">
                      {gym.facilities.slice(0, 3).map((f, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-white/5 border border-white/5 text-[9px] text-gray-300 rounded font-semibold">
                          {f}
                        </span>
                      ))}
                      {gym.facilities.length > 3 && (
                        <span className="px-2 py-0.5 bg-white/5 border border-white/5 text-[9px] text-neonCyan rounded font-semibold">
                          +{gym.facilities.length - 3} more
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between text-xs font-semibold text-neonCyan group-hover:text-white transition-colors">
                      <span>View Gym & Schedule</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
