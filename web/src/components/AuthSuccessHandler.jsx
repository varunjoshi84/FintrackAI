import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthSuccessHandler = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    const legacyToken = params.get('token');
    const legacyUserStr = params.get('user');

    if (code) {
      // Strip code from browser URL bar immediately
      if (window.history.replaceState) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      setIsProcessing(true);
      const exchangeCode = async () => {
        try {
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
          const res = await fetch(`${apiUrl}/auth/exchange-code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code }),
          });

          const data = await res.json();
          if (data.success && data.token) {
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userEmail', data.user.email);
            localStorage.setItem('userInfo', JSON.stringify(data.user));

            window.dispatchEvent(new CustomEvent('userLogin', { detail: data.user }));

            const targetPath = location.pathname === '/' ? '/dashboard' : location.pathname;
            navigate(targetPath, { replace: true });
            setIsProcessing(false);
          } else {
            setIsProcessing(false);
            navigate('/login?error=auth_failed', { replace: true });
          }
        } catch (err) {
          setIsProcessing(false);
          navigate('/login?error=network_error', { replace: true });
        }
      };

      exchangeCode();
      return;
    }

    if (legacyToken && legacyUserStr) {
      if (window.history.replaceState) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      setIsProcessing(true);
      try {
        const user = JSON.parse(decodeURIComponent(legacyUserStr));
        localStorage.setItem('authToken', legacyToken);
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('userInfo', JSON.stringify({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role || 'user',
          plan: user.plan || 'Basic',
          isVerified: user.isVerified !== false,
        }));

        window.dispatchEvent(new CustomEvent('userLogin', { detail: user }));

        const targetPath = location.pathname === '/' ? '/dashboard' : location.pathname;
        navigate(targetPath, { replace: true });
        setIsProcessing(false);
      } catch (error) {
        setIsProcessing(false);
        navigate('/login', { replace: true });
      }
    }
  }, [location.search]);

  const params = new URLSearchParams(location.search);
  const hasAuthParams = params.get('code') || (params.get('token') && params.get('user'));

  if (hasAuthParams || isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full mx-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to FinTrackAI!</h2>
          <p className="text-gray-600 mb-4">Securing your session token...</p>
        </div>
      </div>
    );
  }

  return children;
};

export default AuthSuccessHandler;
