import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const GoogleAuthTest = () => {
  const location = useLocation();
  const [tokenInfo, setTokenInfo] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');
      const userStr = params.get('user');
      
      setTokenInfo({
        token: token,
        tokenLength: token ? token.length : 0,
        tokenPreview: token ? `${token.substring(0, 20)}...` : 'None'
      });
      
      if (userStr) {
        try {
          const decodedStr = decodeURIComponent(userStr);
          setUserInfo({
            raw: userStr,
            decoded: decodedStr,
            parsed: JSON.parse(decodedStr)
          });
        } catch (parseError) {
          setError(`Error parsing user data: ${parseError.message}`);
        }
      } else {
        setUserInfo({ raw: 'None', decoded: 'None', parsed: null });
      }
    } catch (err) {
      setError(`Error processing URL parameters: ${err.message}`);
    }
  }, [location]);
  
  const handleManualLogin = () => {
    if (tokenInfo?.token && userInfo?.parsed) {
      // Store auth token
      localStorage.setItem('authToken', tokenInfo.token);
      localStorage.setItem('userEmail', userInfo.parsed.email);
      localStorage.setItem('userInfo', JSON.stringify(userInfo.parsed));
      
      // Dispatch custom event to notify Header component
      window.dispatchEvent(new CustomEvent('userLogin'));
      
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } else {
      setError('Missing token or user data for manual login');
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 bg-blue-600 text-white">
          <h2 className="text-xl font-bold">Google Authentication Test</h2>
          <p className="mt-1 text-sm">Debugging the authentication flow</p>
        </div>
        
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">URL Parameters</h3>
          <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-xs">
            {location.search}
          </pre>
          
          {error && (
            <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <strong>Error:</strong> {error}
            </div>
          )}
          
          <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-2">Token Information</h4>
              {tokenInfo ? (
                <div className="bg-gray-100 p-4 rounded-md">
                  <p><strong>Length:</strong> {tokenInfo.tokenLength}</p>
                  <p><strong>Preview:</strong> {tokenInfo.tokenPreview}</p>
                </div>
              ) : (
                <p className="text-gray-500">Loading token information...</p>
              )}
            </div>
            
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-2">User Information</h4>
              {userInfo ? (
                <div className="bg-gray-100 p-4 rounded-md">
                  <p><strong>Raw:</strong> {userInfo.raw.length > 30 ? `${userInfo.raw.substring(0, 30)}...` : userInfo.raw}</p>
                  <p><strong>Decoded:</strong> {userInfo.decoded.length > 30 ? `${userInfo.decoded.substring(0, 30)}...` : userInfo.decoded}</p>
                  {userInfo.parsed && (
                    <div className="mt-2">
                      <p><strong>Name:</strong> {userInfo.parsed.name}</p>
                      <p><strong>Email:</strong> {userInfo.parsed.email}</p>
                      <p><strong>Role:</strong> {userInfo.parsed.role}</p>
                      <p><strong>Verified:</strong> {userInfo.parsed.isVerified ? 'Yes' : 'No'}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">Loading user information...</p>
              )}
            </div>
          </div>
          
          <div className="mt-8 border-t border-gray-200 pt-5">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleManualLogin}
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Complete Login Manually
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleAuthTest;