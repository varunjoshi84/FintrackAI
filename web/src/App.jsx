import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Pricing from './components/Pricing';
import Footer from './components/Footer';
import FeaturesPage from './components/FeaturesPage';
import ScrollToTop from './components/ScrollToTop';
import BackToTopButton from './components/BackToTopButton';
import AuthSuccessHandler from './components/AuthSuccessHandler';

// Pages
import About from './pages/About';
import Contact from './pages/Contact';
import Help from './pages/Help';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import PricingPage from './pages/Pricing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminLogin from './pages/AdminLogin';
import AuthSuccess from './pages/AuthSuccess';

// Dashboard Pages
import Dashboard from './pages/dashboard/Dashboard';
import Transactions from './pages/dashboard/Transactions';
import Upload from './pages/dashboard/Upload';
import Insights from './pages/dashboard/Insights';
import Reports from './pages/dashboard/Reports';
import UserDashboard from './pages/dashboard/UserDashboard';
import AdminDashboard from './pages/dashboard/admin/AdminDashboard';

import { checkNetworkStatus } from './api';

// ProtectedRoute — UX gate only. Real auth enforcement is server-side via JWT middleware.
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('authToken');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

// AdminRoute — UX gate: requires token + role === 'admin' in localStorage.
// Real admin enforcement is server-side via requireAdmin middleware on all /api/admin/* routes.
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('authToken');
  const userInfo = (() => { try { return JSON.parse(localStorage.getItem('userInfo') || '{}'); } catch { return {}; } })();
  if (!token || userInfo.role !== 'admin') return <Navigate to="/login" replace />;
  return children;
};

const HomePage = () => (
  <>
    <Header />
    <Hero />
    <Features />
    <Pricing />
    <Footer />
  </>
);

function App() {
  useEffect(() => {
    const runHealthCheck = () => {
      void checkNetworkStatus();
    };

    runHealthCheck();
    // Reduced to 10-minute interval to reduce load on free-tier backend
    const intervalId = window.setInterval(runHealthCheck, 10 * 60 * 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* ── Public Routes ── */}
        <Route path="/" element={<HomePage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/help" element={<Help />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/auth/success" element={<AuthSuccess />} />

        {/* ── Protected Routes — all require login ── */}
        <Route path="/dashboard" element={
          <AuthSuccessHandler>
            <Dashboard />
          </AuthSuccessHandler>
        } />
        <Route path="/transaction" element={
          <ProtectedRoute>
            <Transactions />
          </ProtectedRoute>
        } />
        <Route path="/upload" element={
          <ProtectedRoute>
            <Upload />
          </ProtectedRoute>
        } />
        <Route path="/insights" element={
          <ProtectedRoute>
            <Insights />
          </ProtectedRoute>
        } />
        <Route path="/reports" element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        } />
        <Route path="/userdashboard" element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin-dashboard" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
      </Routes>
      <BackToTopButton />
    </Router>
  );
}

export default App;
