import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_ENDPOINTS, getDefaultHeaders } from './config';

export const login = async (email, password) => {
  try {
    const headers = await getDefaultHeaders(false);
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.LOGIN}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Login failed');

    if (result.token) {
      await AsyncStorage.setItem('authToken', result.token);
      await AsyncStorage.setItem('userInfo', JSON.stringify(result.user || {}));
    }

    return { success: true, token: result.token, user: result.user, message: result.message };
  } catch (error) {
    return { success: false, error: error.message, message: error.message || 'Failed to login' };
  }
};

export const register = async (userData) => {
  try {
    const headers = await getDefaultHeaders(false);
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.REGISTER}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(userData),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Registration failed');

    if (result.token) {
      await AsyncStorage.setItem('authToken', result.token);
      await AsyncStorage.setItem('userInfo', JSON.stringify(result.user || {}));
    }

    return { success: true, token: result.token, user: result.user, message: result.message };
  } catch (error) {
    return { success: false, error: error.message, message: error.message || 'Failed to register' };
  }
};

export const logout = async () => {
  try {
    const headers = await getDefaultHeaders();
    await fetch(`${API_BASE_URL}${API_ENDPOINTS.LOGOUT}`, { method: 'POST', headers });
  } finally {
    await AsyncStorage.multiRemove(['authToken', 'userInfo']);
  }
  return { success: true, message: 'Logged out successfully' };
};

export const isAuthenticated = async () => {
  const token = await AsyncStorage.getItem('authToken');
  return !!token;
};

export const getCurrentUser = async () => {
  const userInfo = await AsyncStorage.getItem('userInfo');
  return userInfo ? JSON.parse(userInfo) : null;
};
