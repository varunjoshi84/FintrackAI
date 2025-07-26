import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthSuccessHandler = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const userStr = params.get('user');
    
    console.log('AuthSuccessHandler - URL params:', {
      hasToken: !!token,
      hasUser: !!userStr,
      currentPath: location.pathname,
      search: location.search
    });
    
    // If we have auth parameters, handle the authentication
    if (token && userStr) {
      console.log('Processing auth parameters...');
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        
        console.log('Parsed user data:', user);
        
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
        
        console.log('Stored auth data in localStorage');
        
        // Dispatch custom event to notify Header component
        window.dispatchEvent(new CustomEvent('userLogin'));
        
        // Get redirect URL or default to dashboard
        const redirectUrl = localStorage.getItem('loginRedirectUrl') || '/dashboard';
        localStorage.removeItem('loginRedirectUrl');
        
        console.log('Redirecting to:', redirectUrl);
        
        // Redirect to the saved URL or dashboard
        setTimeout(() => {
          console.log('Executing navigation to:', redirectUrl);
          navigate(redirectUrl, { replace: true });
        }, 500);
        return;
      } catch (error) {
        console.error('Error parsing user data:', error);
        navigate('/login');
        return;
      }
    } else {
      console.log('No auth parameters found, showing normal homepage');
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