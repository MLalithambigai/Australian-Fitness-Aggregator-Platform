import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Home } from './pages/Home';
import { GymDetail } from './pages/GymDetail';
import { UserDashboard } from './pages/UserDashboard';
import { Pricing } from './pages/Pricing';
import { OwnerDashboard } from './pages/OwnerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { ScannerSimulator } from './pages/ScannerSimulator';

const ProtectedRoute: React.FC<{ children: React.ReactNode; roles?: string[] }> = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neonCyan"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col justify-between">
          <div>
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/gym/:id" element={<GymDetail />} />
                
                {/* Protected Member Routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute roles={['member', 'admin']}>
                    <UserDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/pricing" element={
                  <ProtectedRoute roles={['member', 'admin']}>
                    <Pricing />
                  </ProtectedRoute>
                } />

                {/* Protected Owner Routes */}
                <Route path="/owner-dashboard" element={
                  <ProtectedRoute roles={['owner', 'admin']}>
                    <OwnerDashboard />
                  </ProtectedRoute>
                } />

                {/* Protected Admin Routes */}
                <Route path="/admin-dashboard" element={
                  <ProtectedRoute roles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />

                {/* Open to all logged-in for ease of simulator testing */}
                <Route path="/scanner-simulator" element={
                  <ProtectedRoute>
                    <ScannerSimulator />
                  </ProtectedRoute>
                } />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>

          <footer className="glass-panel mt-12 py-6 border-t border-white/5 text-center text-xs text-gray-500 font-medium">
            <div className="max-w-7xl mx-auto px-4">
              &copy; {new Date().getFullYear()} Australian Fitness Aggregator Platform. All Rights Reserved. Built under the Trainee Developer Assessment guidelines.
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
