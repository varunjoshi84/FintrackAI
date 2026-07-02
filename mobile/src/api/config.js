import AsyncStorage from '@react-native-async-storage/async-storage';
export const API_BASE_URL = 'https://fintrackai.onrender.com/api';

export const API_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  VERIFY_TOKEN: '/auth/verify',
  USER_PROFILE: '/user/profile',
  UPLOAD_FILE: '/upload/file',
  DASHBOARD_STATS: '/dashboard',
  TRANSACTIONS: '/transactions',
  INSIGHTS: '/dashboard/insights',
};

// localStorage -> AsyncStorage is async, so headers must be built with await
export const getDefaultHeaders = async (includeAuth = true) => {
  const headers = { 'Content-Type': 'application/json' };
  if (includeAuth) {
    const token = await AsyncStorage.getItem('authToken');
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

export const getFileUploadHeaders = async (includeAuth = true) => {
  const headers = {};
  if (includeAuth) {
    const token = await AsyncStorage.getItem('authToken');
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

// Generic request helper — mirrors your web apiRequest()
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = await getDefaultHeaders(options.includeAuth !== false);

  try {
    const response = await fetch(url, { headers, ...options });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      let errorData = null;
      try {
        errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (_) {}

      if (response.status === 401) {
        await AsyncStorage.multiRemove(['authToken', 'userInfo']);
        throw new Error('Authentication required');
      }
      return { success: false, message: errorMessage, status: response.status, error: errorData };
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    return await response.text();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};
