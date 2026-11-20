import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    const legacyToken = params.get('token');
    const legacyUserStr = params.get('user');

    // Strip sensitive parameters immediately from browser address bar & history
    if (window.history.replaceState) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    // 1. Modern PKCE-style secure code exchange
    if (code) {
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

            const redirectUrl = localStorage.getItem('loginRedirectUrl') || '/dashboard';
            localStorage.removeItem('loginRedirectUrl');
            navigate(redirectUrl, { replace: true });
          } else {
            navigate('/login?error=auth_failed', { replace: true });
          }
        } catch (err) {
          navigate('/login?error=network_error', { replace: true });
        }
      };

      exchangeCode();
      return;
    }

    // 2. Fallback backward compatibility handler
    if (legacyToken && legacyUserStr) {
      try {
        const user = JSON.parse(decodeURIComponent(legacyUserStr));
        localStorage.setItem('authToken', legacyToken);
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('userInfo', JSON.stringify({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role || 'user',
          plan: user.plan || 'Basic'
        }));
        
        window.dispatchEvent(new CustomEvent('userLogin', { detail: user }));
        const redirectUrl = localStorage.getItem('loginRedirectUrl') || '/dashboard';
        localStorage.removeItem('loginRedirectUrl');
        navigate(redirectUrl, { replace: true });
      } catch (error) {
        navigate('/login', { replace: true });
      }
    } else {
      navigate('/login', { replace: true });
    }
  }, [navigate, location]);
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="text-center p-8 bg-white shadow-xl rounded-2xl max-w-sm w-full mx-4">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-600 mb-4"></div>
        <h3 className="text-lg font-semibold text-gray-800">Completing Sign-In</h3>
        <p className="text-sm text-gray-500 mt-1">Securing your session token...</p>
      </div>
    </div>
  );
};

export default AuthSuccess;
