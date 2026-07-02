import { apiRequest } from './config';

export const getUserProfile = async () => {
  try {
    const result = await apiRequest('/user/profile', { method: 'GET' });
    return { success: true, data: result.data };
  } catch (error) {
    return { success: false, error: error.message, message: 'Failed to fetch profile' };
  }
};

export const updateUserProfile = async (profileData) => {
  try {
    const result = await apiRequest('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
    return { success: true, data: result.data, message: result.message || 'Profile updated' };
  } catch (error) {
    return { success: false, error: error.message, message: 'Failed to update profile' };
  }
};
