import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { QrCode, ScanLine, ShieldAlert, CheckCircle, RefreshCw, AlertTriangle, Play, Flame, MapPin } from 'lucide-react';

interface Gym {
  _id: string;
  name: string;
  city: string;
}

export const ScannerSimulator: React.FC = () => {
  const { apiUrl } = useAuth();
  
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [selectedGymId, setSelectedGymId] = useState('');
  const [qrTokenInput, setQrTokenInput] = useState('');
  
  // Validation Results
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState<{
    status: 'success' | 'expired' | 'rule_violation' | 'invalid' | 'error' | null;
    message: string;
  }>({ status: null, message: '' });

  // Simulator Logs
  const [recentScans, setRecentScans] = useState<any[]>([]);

  const fetchGyms = async () => {
    try {
      const res = await axios.get(`${apiUrl}/gyms`);
      setGyms(res.data);
      if (res.data.length > 0) {
        setSelectedGymId(res.data[0]._id);
      }
    } catch (err) {
      console.error('Error fetching gyms:', err);
    }
  };

  const fetchRecentScans = async () => {
    try {
      // Just fetch all checkins to display in simulator audit logs
      const res = await axios.get(`${apiUrl}/checkin/history`);
      setRecentScans(res.data.slice(0, 5));
    } catch (err) {
      // This might fail if user is not logged in, but we can catch it silently
      console.error('Error fetching history:', err);
    }
  };

  useEffect(() => {
    fetchGyms();
    fetchRecentScans();
  }, []);

  const handleScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrTokenInput) return;
    
    setLoading(true);
    setScanResult({ status: null, message: '' });

    try {
      const res = await axios.post(`${apiUrl}/checkin/validate`, {
        qrToken: qrTokenInput
      });
      
      setScanResult({
        status: 'success',
        message: res.data.message
      });
      setQrTokenInput('');
      fetchRecentScans();
    } catch (err: any) {
      const status = err.response?.data?.status || 'error';
      const message = err.response?.data?.message || 'Check-in validation failed.';
      setScanResult({ status, message });
    } finally {
      setLoading(false);
    }
  };

  const selectedGym = gyms.find(g => g._id === selectedGymId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Gym Entrance{' '}
          <span className="bg-gradient-to-r from-neonCyan via-neonPurple to-neonOrange bg-clip-text text-transparent">
            Scanner Simulator
          </span>
        </h1>
        <p className="text-gray-400 text-sm">
          Simulate a physical gym check-in terminal. Generate a QR code from a Gym Details page, paste the token below, and test aggregator access rules.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Scanner Device Simulator */}
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="relative w-full max-w-md glass-panel border border-white/10 rounded-[32px] p-6 shadow-[0_0_50px_rgba(6,182,212,0.05)] overflow-hidden">
            {/* Camera bezel look */}
            <div className="w-16 h-4 bg-gray-900 mx-auto rounded-full mb-6 border border-white/5 flex items-center justify-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            </div>

            {/* Scanner screen */}
            <div className={`relative h-64 rounded-2xl flex flex-col items-center justify-center p-4 text-center transition-all duration-500 border ${
              scanResult.status === 'success'
                ? 'bg-green-500/10 border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.2)]'
                : scanResult.status === 'rule_violation'
                ? 'bg-red-500/10 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)]'
                : scanResult.status === 'expired'
                ? 'bg-orange-500/10 border-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.2)]'
                : scanResult.status === 'invalid' || scanResult.status === 'error'
                ? 'bg-yellow-500/10 border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.2)]'
                : 'bg-black/60 border-white/10'
            }`}>
              {/* Scanline decoration when idle */}
              {!scanResult.status && !loading && (
                <div className="absolute inset-x-0 h-1 bg-neonCyan/60 blur-[1px] animate-[pulse_1.5s_infinite]" style={{ top: '35%' }}></div>
              )}

              {loading ? (
                <div className="space-y-3">
                  <RefreshCw className="h-10 w-10 text-neonCyan animate-spin mx-auto" />
                  <p className="text-sm font-semibold text-white font-mono uppercase tracking-wider">Verifying Cryptographic Pass...</p>
                </div>
              ) : scanResult.status === 'success' ? (
                <div className="space-y-3 animate-[scale_0.2s_ease-out]">
                  <CheckCircle className="h-14 w-14 text-green-400 mx-auto" />
                  <h3 className="text-xl font-extrabold text-white">ACCESS GRANTED</h3>
                  <p className="text-xs text-green-300 font-medium px-4 leading-normal">
                    {scanResult.message}
                  </p>
                </div>
              ) : scanResult.status === 'rule_violation' ? (
                <div className="space-y-3 animate-[bounce_0.5s_ease-in-out]">
                  <ShieldAlert className="h-14 w-14 text-red-500 mx-auto" />
                  <h3 className="text-xl font-extrabold text-red-400">ACCESS DENIED</h3>
                  <p className="text-xs text-red-300 font-semibold px-4 leading-normal">
                    {scanResult.message}
                  </p>
                  <span className="inline-block text-[9px] bg-red-900/40 text-red-300 border border-red-500/20 px-2 py-0.5 rounded font-mono uppercase tracking-wider font-extrabold">
                    One Gym Per Day Rule
                  </span>
                </div>
              ) : scanResult.status === 'expired' ? (
                <div className="space-y-3">
                  <AlertTriangle className="h-14 w-14 text-orange-500 mx-auto" />
                  <h3 className="text-xl font-extrabold text-orange-400">PASS EXPIRED</h3>
                  <p className="text-xs text-orange-300 font-medium px-4 leading-normal">
                    {scanResult.message}
                  </p>
                </div>
              ) : scanResult.status === 'invalid' || scanResult.status === 'error' ? (
                <div className="space-y-3">
                  <ShieldAlert className="h-14 w-14 text-yellow-500 mx-auto" />
                  <h3 className="text-xl font-extrabold text-yellow-400">SCAN FAILURE</h3>
                  <p className="text-xs text-yellow-300 font-medium px-4 leading-normal">
                    {scanResult.message}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <ScanLine className="h-14 w-14 text-gray-500 mx-auto animate-pulse" />
                  <div>
                    <h3 className="text-base font-bold text-white uppercase tracking-wider">Terminal Ready</h3>
                    <p className="text-xs text-gray-400 mt-1 max-w-[280px]">
                      Awaiting QR Pass Scan at <br />
                      <span className="text-neonCyan font-semibold">{selectedGym ? selectedGym.name : 'Gym Terminal'}</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Status Reset Button */}
              {scanResult.status && (
                <button
                  onClick={() => setScanResult({ status: null, message: '' })}
                  className="absolute bottom-4 text-[10px] text-gray-400 hover:text-white font-semibold flex items-center gap-1 bg-white/5 border border-white/5 hover:border-white/10 px-2 py-1 rounded transition-colors"
                >
                  Reset Terminal
                </button>
              )}
            </div>

            {/* Input scan form */}
            <form onSubmit={handleScanSubmit} className="mt-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">Terminal Scanner Selection</label>
                <select
                  value={selectedGymId}
                  onChange={(e) => setSelectedGymId(e.target.value)}
                  className="w-full bg-gray-900/60 border border-white/10 rounded-lg px-3 py-2 text-white text-xs"
                >
                  {gyms.map(g => (
                    <option key={g._id} value={g._id}>{g.name} ({g.city})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 block mb-1">Paste Scanned QR Code Token</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={qrTokenInput}
                    onChange={(e) => setQrTokenInput(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="flex-1 bg-gray-900/60 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-[10px] placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-neonCyan"
                  />
                  <button
                    type="submit"
                    disabled={loading || !qrTokenInput}
                    className="px-4 bg-neonCyan hover:bg-neonCyan/90 disabled:bg-gray-800 text-black disabled:text-gray-500 rounded-lg text-xs font-bold transition-colors shrink-0"
                  >
                    Scan Pass
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Simulator Explanation & Realtime Logs */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Flame className="h-5 w-5 text-neonOrange" /> How to Test QR Rules
            </h3>
            
            <div className="space-y-3 text-xs text-gray-300 leading-relaxed">
              <div className="flex gap-2.5">
                <span className="w-5 h-5 shrink-0 rounded-full bg-neonCyan/10 border border-neonCyan/30 text-neonCyan font-bold flex items-center justify-center font-mono">1</span>
                <p>Login to a member account (e.g. <code>member@fitagg.com.au</code>) and open any gym profile.</p>
              </div>
              <div className="flex gap-2.5">
                <span className="w-5 h-5 shrink-0 rounded-full bg-neonCyan/10 border border-neonCyan/30 text-neonCyan font-bold flex items-center justify-center font-mono">2</span>
                <p>Click **Generate QR Pass**. A popup containing a dynamic secure token will appear.</p>
              </div>
              <div className="flex gap-2.5">
                <span className="w-5 h-5 shrink-0 rounded-full bg-neonCyan/10 border border-neonCyan/30 text-neonCyan font-bold flex items-center justify-center font-mono">3</span>
                <p>Open this Entry Simulator, select the matching gym terminal, paste the token, and click **Scan Pass**.</p>
              </div>
              <div className="flex gap-2.5">
                <span className="w-5 h-5 shrink-0 rounded-full bg-neonCyan/10 border border-neonCyan/30 text-neonCyan font-bold flex items-center justify-center font-mono">4</span>
                <p>
                  <strong>Test 60s expiration limit:</strong> Wait 60 seconds before scanning. The simulator will decline entry with a **Pass Expired** error.
                </p>
              </div>
              <div className="flex gap-2.5">
                <span className="w-5 h-5 shrink-0 rounded-full bg-neonCyan/10 border border-neonCyan/30 text-neonCyan font-bold flex items-center justify-center font-mono">5</span>
                <p>
                  <strong>Test One Gym Per Day Rule:</strong> Perform a successful check-in at Gym A. Then generate a pass for Gym B and scan it. The terminal will reject entry with a **One Gym Per Day rule violation**!
                </p>
              </div>
            </div>
          </div>

          {/* Audit Logs */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MapPin className="h-5 w-5 text-neonPurple" /> Platform Entry Audit Logs
            </h3>

            {recentScans.length === 0 ? (
              <p className="text-xs text-gray-500">No scanned entries recorded on your profile yet.</p>
            ) : (
              <div className="space-y-2 text-xs">
                {recentScans.map((scan) => (
                  <div key={scan._id} className="p-2.5 bg-gray-900/40 border border-white/5 rounded-lg flex justify-between items-center">
                    <div>
                      <span className="font-bold text-white block">{scan.gym?.name}</span>
                      <span className="text-[10px] text-gray-500 block font-mono">
                        {new Date(scan.timestamp).toLocaleTimeString('en-AU')}
                      </span>
                    </div>
                    <div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        scan.status === 'valid'
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {scan.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
