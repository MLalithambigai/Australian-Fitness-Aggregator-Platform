import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { MapPin, Star, Calendar, Clock, User, Check, RefreshCw, QrCode, ArrowLeft, ShieldAlert, Sparkles, Navigation } from 'lucide-react';

interface ClassObj {
  _id: string;
  name: string;
  instructor: string;
  time: string;
  capacity: number;
  bookedUsers: string[];
}

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
  classes: ClassObj[];
}

export const GymDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, apiUrl } = useAuth();

  const [gym, setGym] = useState<Gym | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Class Booking States
  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingLoadingId, setBookingLoadingId] = useState<string | null>(null);
  const [bookingMessage, setBookingMessage] = useState('');

  // QR Pass States
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrToken, setQrToken] = useState('');
  const [qrCountdown, setQrCountdown] = useState(60);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState('');

  const fetchGymDetail = async () => {
    try {
      const res = await axios.get(`${apiUrl}/gyms/${id}`);
      setGym(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error loading gym details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyBookings = async () => {
    if (!user || user.role !== 'member') return;
    try {
      const res = await axios.get(`${apiUrl}/bookings/my`);
      setBookings(res.data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    }
  };

  useEffect(() => {
    fetchGymDetail();
    fetchMyBookings();
  }, [id, user]);

  // QR Countdown Effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showQRModal && qrCountdown > 0) {
      timer = setTimeout(() => setQrCountdown(qrCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [showQRModal, qrCountdown]);

  const generateQRPass = async () => {
    setQrLoading(true);
    setQrError('');
    setQrToken('');
    setQrCountdown(60);

    try {
      const res = await axios.post(`${apiUrl}/checkin/generate-qr`, { gymId: id });
      setQrToken(res.data.qrToken);
      setQrCountdown(res.data.expiresIn || 60);
    } catch (err: any) {
      setQrError(err.response?.data?.message || 'Failed to generate QR Pass.');
    } finally {
      setQrLoading(false);
    }
  };

  const handleBookClass = async (classId: string) => {
    if (!user) return;
    setBookingLoadingId(classId);
    setBookingMessage('');

    try {
      // Check if already booked
      const userBooking = bookings.find(b => b.classId === classId && b.status === 'booked');
      if (userBooking) {
        // Cancel booking
        await axios.post(`${apiUrl}/bookings/cancel/${userBooking._id}`);
        setBookingMessage('Booking cancelled successfully.');
      } else {
        // Book class
        const today = new Date().toISOString().split('T')[0]; // simple today
        await axios.post(`${apiUrl}/bookings/book`, { gymId: id, classId, date: today });
        setBookingMessage('Class booked successfully!');
      }
      await fetchGymDetail();
      await fetchMyBookings();
    } catch (err: any) {
      setBookingMessage(err.response?.data?.message || 'Booking operation failed.');
    } finally {
      setBookingLoadingId(null);
    }
  };

  const isClassBooked = (classId: string) => {
    return bookings.some(b => b.classId === classId && b.status === 'booked');
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neonCyan mx-auto"></div>
        <p className="text-gray-400 mt-4">Loading partner gym profile...</p>
      </div>
    );
  }

  if (error || !gym) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center space-y-4">
        <ShieldAlert className="h-16 w-16 text-neonOrange mx-auto" />
        <h2 className="text-2xl font-bold text-white">Oops! Gym Profile Unavailable</h2>
        <p className="text-gray-400">{error || 'The requested gym could not be found.'}</p>
        <Link to="/" className="inline-flex items-center gap-2 text-neonCyan hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to Listings
        </Link>
      </div>
    );
  }

  // Calculate coordinates mock representation
  const lat = gym.coordinates?.lat || -33.8688;
  const lng = gym.coordinates?.lng || 151.2093;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header breadcrumb */}
      <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
        <ArrowLeft className="h-4 w-4" /> Back to Explore
      </Link>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Gym details and Classes */}
        <div className="lg:col-span-2 space-y-8">
          {/* Gallery Carousel */}
          <div className="relative h-64 sm:h-96 rounded-2xl overflow-hidden glass-panel border border-white/10">
            <img
              src={gym.images[0] || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80'}
              alt={gym.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{gym.name}</h1>
                <p className="text-xs sm:text-sm text-gray-300 flex items-center gap-1 mt-1">
                  <MapPin className="h-4 w-4 text-neonOrange" /> {gym.address}, {gym.city}
                </p>
              </div>
              <div className="flex items-center gap-1 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-white font-semibold text-sm">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" /> {gym.rating.toFixed(1)}
              </div>
            </div>
          </div>

          {/* Description & Facilities */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white mb-2">About the Gym</h3>
              <p className="text-gray-300 text-sm leading-relaxed">{gym.description}</p>
            </div>

            <div className="border-t border-white/5 pt-6">
              <h3 className="text-lg font-bold text-white mb-3">Premium Facilities</h3>
              <div className="flex flex-wrap gap-2">
                {gym.facilities.map((facility, idx) => (
                  <span key={idx} className="px-3.5 py-1.5 bg-white/5 border border-white/5 text-xs text-gray-300 rounded-lg font-semibold flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-neonCyan" /> {facility}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Classes Timetable */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Calendar className="h-5 w-5 text-neonCyan" /> Today's Fitness Classes
              </h3>
              {bookingMessage && (
                <span className="text-xs text-neonCyan bg-neonCyan/10 px-2.5 py-1 rounded border border-neonCyan/20">
                  {bookingMessage}
                </span>
              )}
            </div>

            {gym.classes.length === 0 ? (
              <p className="text-xs text-gray-500">No scheduled classes today.</p>
            ) : (
              <div className="divide-y divide-white/5">
                {gym.classes.map((cls) => {
                  const booked = isClassBooked(cls._id);
                  const isFull = cls.bookedUsers.length >= cls.capacity;
                  return (
                    <div key={cls._id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="space-y-1">
                        <h4 className="font-bold text-white">{cls.name}</h4>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-neonPurple" /> {cls.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5 text-neonOrange" /> Coach: {cls.instructor}
                          </span>
                          <span className={`font-semibold ${isFull ? 'text-red-400' : 'text-neonCyan'}`}>
                            Slots: {cls.bookedUsers.length} / {cls.capacity}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleBookClass(cls._id)}
                        disabled={bookingLoadingId === cls._id || (!user) || (user.role !== 'member') || (isFull && !booked)}
                        className={`w-full sm:w-auto px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                          booked
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : isFull
                            ? 'bg-gray-800 text-gray-500 border border-white/5 cursor-not-allowed'
                            : !user
                            ? 'bg-gray-900 text-gray-400 border border-white/5'
                            : 'bg-neonCyan hover:bg-neonCyan/90 text-black shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                        }`}
                      >
                        {bookingLoadingId === cls._id ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : !user ? (
                          'Login to Book'
                        ) : user.role !== 'member' ? (
                          'Members Only'
                        ) : booked ? (
                          <span className="flex items-center gap-1 justify-center"><Check className="h-3.5 w-3.5" /> Booked</span>
                        ) : isFull ? (
                          'Fully Booked'
                        ) : (
                          'Book Class'
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Actions Box (QR Pass & Map) */}
        <div className="space-y-8">
          {/* QR Pass Trigger Box */}
          <div className="glass-panel p-6 rounded-2xl border border-neonCyan/20 bg-gradient-to-b from-neonCyan/5 to-transparent text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-neonCyan/10 border border-neonCyan/20 flex items-center justify-center">
              <QrCode className="h-6 w-6 text-neonCyan" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">Ready to Check In?</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Generate a dynamic entry QR code. Scan this code at the gym entrance terminal to check-in. Passes expire in 60 seconds.
              </p>
            </div>

            {user ? (
              user.membership && user.membership.status === 'active' ? (
                <button
                  onClick={() => {
                    setShowQRModal(true);
                    generateQRPass();
                  }}
                  className="w-full py-2.5 px-4 bg-neonCyan hover:bg-neonCyan/90 text-black rounded-lg text-sm font-semibold transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                >
                  Generate QR Pass
                </button>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-neonOrange font-medium">Inactive Membership</p>
                  <Link
                    to="/pricing"
                    className="block w-full py-2 bg-gradient-to-r from-neonCyan to-neonPurple text-white rounded-lg text-xs font-semibold hover:shadow-lg transition-all"
                  >
                    Subscribe to Active Plan
                  </Link>
                </div>
              )
            ) : (
              <Link
                to="/login"
                className="block w-full py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Log In to Check In
              </Link>
            )}

            <div className="text-[10px] text-gray-500 border-t border-white/5 pt-3 flex items-center gap-1.5 justify-center">
              <ShieldAlert className="h-3.5 w-3.5 shrink-0" /> One Gym Per Day Rule Applies
            </div>
          </div>

          {/* Map Location Box */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Navigation className="h-4.5 w-4.5 text-neonOrange" /> Location Details
            </h3>

            {/* Mock Map Representation */}
            <div className="relative h-44 rounded-xl overflow-hidden bg-gray-900 border border-white/10 flex flex-col items-center justify-center p-4 text-center">
              {/* Dynamic decorative map grid */}
              <div className="absolute inset-0 opacity-15 pointer-events-none" style={{
                backgroundImage: 'radial-gradient(circle, #06b6d4 1.5px, transparent 1.5px)',
                backgroundSize: '16px 16px'
              }}></div>
              
              <div className="z-10 space-y-2">
                <MapPin className="h-8 w-8 text-neonOrange mx-auto animate-bounce" />
                <div className="text-xs">
                  <span className="font-mono text-[10px] text-gray-400 block">Coordinates:</span>
                  <span className="font-semibold text-white">{lat.toFixed(4)}° S, {lng.toFixed(4)}° E</span>
                </div>
                <div className="text-[10px] text-gray-400 font-medium">Located in {gym.city}, Australia</div>
              </div>
            </div>

            <button
              onClick={() => alert(`Directions to ${gym.name} in ${gym.city} (${gym.address}) initialized.`)}
              className="w-full py-2 border border-white/10 hover:border-white/20 hover:bg-white/5 text-white rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
            >
              Get GPS Directions
            </button>
          </div>
        </div>
      </div>

      {/* QR Pass Drawer Overlay Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="max-w-sm w-full glass-panel border border-neonCyan/30 p-6 rounded-2xl relative space-y-6 text-center shadow-[0_0_50px_rgba(6,182,212,0.2)]">
            
            {/* Header */}
            <div>
              <h3 className="text-lg font-bold text-white">{gym.name} Check-In</h3>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">Australian Fitness Aggregator</p>
            </div>

            {/* QR Scanner Display Area */}
            <div className="relative mx-auto w-56 h-56 bg-white p-4 rounded-xl flex flex-col items-center justify-center border-4 border-neonCyan">
              {qrLoading ? (
                <div className="text-black space-y-2">
                  <RefreshCw className="h-8 w-8 animate-spin text-neonCyan mx-auto" />
                  <p className="text-xs font-semibold">Signing pass...</p>
                </div>
              ) : qrError ? (
                <div className="text-red-500 space-y-2 p-2">
                  <ShieldAlert className="h-8 w-8 mx-auto" />
                  <p className="text-xs font-bold leading-tight">{qrError}</p>
                </div>
              ) : qrCountdown === 0 ? (
                <div className="text-red-500 space-y-2 p-2">
                  <ShieldAlert className="h-8 w-8 mx-auto" />
                  <p className="text-xs font-bold uppercase tracking-wider">Pass Expired</p>
                  <p className="text-[10px] text-gray-500">Security limit reached.</p>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center relative bg-gray-50 rounded">
                  {/* Decorative Scan Lines inside Scanner Screen */}
                  <div className="absolute inset-x-0 h-0.5 bg-red-500 animate-pulse" style={{ top: '50%' }}></div>
                  
                  {/* Pseudo QR Blocks */}
                  <div className="w-36 h-36 border-4 border-black relative" style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, #000 0px, #000 2px, transparent 2px, transparent 10px), repeating-linear-gradient(-45deg, #000 0px, #000 2px, #fff 2px, #fff 10px)'
                  }}>
                    <div className="absolute top-0 left-0 w-8 h-8 bg-black border-2 border-white"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 bg-black border-2 border-white"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 bg-black border-2 border-white"></div>
                  </div>

                  <p className="mt-2 text-[9px] font-mono text-black font-semibold truncate max-w-[150px]">{qrToken.slice(0, 24)}...</p>
                </div>
              )}
            </div>

            {/* Countdown / Status Text */}
            <div className="space-y-1">
              {qrCountdown > 0 && !qrLoading && !qrError ? (
                <>
                  <div className="text-sm font-semibold text-white">
                    Pass Expires in: <span className="text-neonCyan font-mono text-glow-cyan text-base">{qrCountdown}s</span>
                  </div>
                  <p className="text-[10px] text-gray-500">The counter updates dynamically in real-time.</p>
                </>
              ) : (
                <button
                  onClick={generateQRPass}
                  className="py-1.5 px-3 bg-neonCyan/20 hover:bg-neonCyan/30 text-neonCyan border border-neonCyan/30 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1.5"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Regenerate Pass
                </button>
              )}
            </div>

            {/* Simulated Scanning helper warning */}
            <div className="p-3 bg-gray-900/60 border border-white/5 rounded-lg text-left">
              <span className="text-[10px] text-neonOrange font-semibold uppercase tracking-wider block">Scanning Instructions:</span>
              <p className="text-[10px] text-gray-400 leading-normal mt-1">
                To test check-in validation, go to the <strong>Entry Simulator</strong> via the navigation menu. Copy the token above or check the simulator.
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowQRModal(false)}
              className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              Close
            </button>

          </div>
        </div>
      )}

    </div>
  );
};
