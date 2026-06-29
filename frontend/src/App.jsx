import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import { LangProvider } from './components/useTranslation';
import CitizenShell from './components/CitizenShell';
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import CitizenHome from './pages/CitizenHome';
import SubmitComplaint from './pages/SubmitComplaint';
import TrackComplaints from './pages/TrackComplaints';
import ComplaintDetail from './pages/ComplaintDetail';
import OfficerDashboard from './pages/OfficerDashboard';
import RouteOptimization from './pages/RouteOptimization';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import Leaderboard from './pages/Leaderboard';
import AdminPanel from './pages/AdminPanel';
import Rewards from './pages/Rewards';
import HelpSupport from './pages/HelpSupport';
import NearMe from './pages/NearMe';
import ComingSoon from './components/ComingSoon';

function PrivateRoute({ children, role }) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (!token) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

function HomeRedirect() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (!localStorage.getItem('token')) return <Navigate to="/login" replace />;
  if (user.role === 'officer') return <Navigate to="/officer" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  return <Navigate to="/home" replace />;
}

function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const citizenPages = ['/home', '/track', '/leaderboard', '/profile'];
  if (!citizenPages.some(p => location.pathname.startsWith(p))) return null;
  const tabs = [
    { path: '/home', icon: '🏠', label: 'Home' },
    { path: '/track', icon: '📋', label: 'Reports' },
    { path: '/leaderboard', icon: '🏆', label: 'Ranks' },
    { path: '/profile', icon: '👤', label: 'Profile' },
  ];
  return (
    <nav className="app-bottom-nav" style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--white)',
      borderTop: '1px solid var(--sand-100)', display: 'flex', zIndex: 100,
      paddingBottom: 'env(safe-area-inset-bottom)'
    }}>
      {tabs.map(t => {
        const active = location.pathname === t.path;
        return (
          <button key={t.path} className="bottom-nav-btn" onClick={() => navigate(t.path)}
            style={{
              flex: 1, padding: '10px 0 8px', background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, fontFamily: 'var(--font)'
            }}>
            <span className="nav-icon" style={{
              fontSize: 20, lineHeight: 1,
              filter: active ? 'none' : 'grayscale(0.3)', transition: 'transform 0.2s ease'
            }}>{t.icon}</span>
            <span style={{
              fontSize: 10, fontWeight: active ? 700 : 600,
              color: active ? 'var(--green-600)' : 'var(--sand-400)', letterSpacing: 0.3
            }}>{t.label}</span>
            {active && <div className="nav-dot" style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--green-500)' }} />}
          </button>
        );
      })}
    </nav>
  );
}

function AppLayout() {
  useEffect(() => {
    const theme = localStorage.getItem('theme') || 'light';
    document.body.classList.toggle('dark-theme', theme === 'dark');
  }, []);

  return (
    <>
      <ToastProvider />
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/home" element={<PrivateRoute><CitizenShell><CitizenHome /></CitizenShell></PrivateRoute>} />
        <Route path="/submit" element={<PrivateRoute><CitizenShell><SubmitComplaint /></CitizenShell></PrivateRoute>} />
        <Route path="/track" element={<PrivateRoute><CitizenShell><TrackComplaints /></CitizenShell></PrivateRoute>} />
        <Route path="/complaint/:id" element={<PrivateRoute><CitizenShell><ComplaintDetail /></CitizenShell></PrivateRoute>} />
        <Route path="/leaderboard" element={<PrivateRoute><CitizenShell><Leaderboard /></CitizenShell></PrivateRoute>} />
        <Route path="/rewards" element={<PrivateRoute><CitizenShell><Rewards /></CitizenShell></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><CitizenShell><Profile /></CitizenShell></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><CitizenShell><Settings /></CitizenShell></PrivateRoute>} />
        <Route path="/help" element={<PrivateRoute><CitizenShell><HelpSupport /></CitizenShell></PrivateRoute>} />
        <Route path="/near-me" element={<PrivateRoute><CitizenShell><NearMe /></CitizenShell></PrivateRoute>} />

        <Route path="/officer" element={<PrivateRoute role="officer"><OfficerDashboard /></PrivateRoute>} />
        <Route path="/officer/route" element={<Navigate to="/officer" replace />} />
        <Route path="/admin" element={<PrivateRoute role="admin"><AdminPanel /></PrivateRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <BottomNav />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <LangProvider>
        <AppLayout />
      </LangProvider>
    </BrowserRouter>
  );
}