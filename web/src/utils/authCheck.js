/**
 * Authentication and Session Monitor
 * Replaced aggressive 30s background polling with event-driven session management.
 * Dispatches 401 interception and only performs lightweight status check when user switches tabs or regains focus.
 */

export const checkUserStatus = async () => {
  const token = localStorage.getItem('authToken');
  if (!token) return false;

  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    const response = await fetch(`${apiUrl}/user/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('userEmail');
      
      alert('Session Expired or Account Deactivated\n\nPlease sign in again to continue.');
      window.location.href = '/login';
      return false;
    }

    return response.ok;
  } catch (error) {
    // Non-fatal network hiccup — do not disrupt user session
    return true;
  }
};

let isMonitoringStarted = false;

/**
 * Event-driven monitoring: checks session validity on tab focus (window focus)
 * instead of generating constant background polling requests on the free-tier backend.
 */
export const startAuthMonitoring = () => {
  if (isMonitoringStarted) return;
  isMonitoringStarted = true;

  // Lightweight check only when tab gains focus
  window.addEventListener('focus', () => {
    checkUserStatus();
  });
};
