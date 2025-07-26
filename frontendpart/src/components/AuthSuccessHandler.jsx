import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthSuccessHandler = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const userStr = params.get('user');
    
    // If we have auth parameters, handle the authentication
    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        
        // Store auth token with proper user data
        localStorage.setItem('authToken', token);
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('userInfo', JSON.stringify({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role || 'user',
          plan: user.plan || 'Basic'
        }));
        
        console.log('Google auth success - stored data:', {
          token: !!token,
          user: user
        });
        
        // Dispatch custom event to notify Header component
        window.dispatchEvent(new CustomEvent('userLogin'));
        
        // Get redirect URL or default to dashboard
        const redirectUrl = localStorage.getItem('loginRedirectUrl') || '/dashboard';
        localStorage.removeItem('loginRedirectUrl');
        
        // Redirect to the saved URL or dashboard
        setTimeout(() => {
          navigate(redirectUrl, { replace: true });
        }, 100);
        return;
      } catch (error) {
        console.error('Error parsing user data:', error);
        navigate('/login');
        return;
      }
    }
  }, [navigate, location]);
  
  const params = new URLSearchParams(location.search);
  const hasAuthParams = params.get('token') && params.get('user');
  
  // If we have auth parameters, show loading instead of children
  if (hasAuthParams) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Logging you in...</p>
        </div>
      </div>
    );
  }
  
  // If no auth parameters, render children (normal homepage)
  return children;
};

export default AuthSuccessHandler;