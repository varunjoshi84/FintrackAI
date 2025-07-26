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
        navigate(redirectUrl);
        return;
      } catch (error) {
        console.error('Error parsing user data:', error);
        navigate('/login');
        return;
      }
    }
  }, [navigate, location]);
  
  // If no auth parameters, render children (normal homepage)
  return children;
};

export default AuthSuccessHandler;