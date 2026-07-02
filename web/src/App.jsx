import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Pricing from './components/Pricing';
import Footer from './components/Footer';
import FeaturesPage from './components/Ftre';
import Help from './components/Help';
import Privacy from './components/Privacy';
import Terms from './components/Terms';
import Contact from './components/Contact';
import About from './components/About';
import Login from './Authentication/Login';
import Signup from './Authentication/Signup';
import Admin from './Authentication/Admin';
import AuthSuccess from './Authentication/AuthSuccess';
import AuthSuccessHandler from './components/AuthSuccessHandler';
import Dashboard from './Dashboard/Dashboard';
import AdminDashboard from './Dashboard/AdminDashboard';
import Transactions from './Dashboard/Transactions';
import Upload from './Dashboard/Upload';
import Insights from './Dashboard/Insights';
import Reports from './Dashboard/Reports';
import UserDashboard from './UserDashboard/UserDashboard';
import ScrollToTop from './components/ScrollToTop';
import BackToTopButton from './components/BackToTopButton';
import MainPricing from './components/MainPricing';
import { checkNetworkStatus } from './api';

//  ProtectedRoute — checks localStorage for token, redirects to login if missing
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
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
    const intervalId = window.setInterval(runHealthCheck, 2 * 60 * 1000);

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
        <Route path="/pricing" element={<MainPricing />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin" element={<Admin />} />
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
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />
      </Routes>
      <BackToTopButton />
    </Router>
  );
}

export default App;