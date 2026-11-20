// Shared application constants — import from here instead of repeating inline

/** localStorage key for the auth JWT token */
export const AUTH_TOKEN_KEY = 'authToken';

/** localStorage key for the signed-in user's profile object */
export const USER_INFO_KEY = 'userInfo';

/** Backend API base URL — overridden by VITE_API_URL in production */
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/** Subscription plan names */
export const PLANS = {
  BASIC: 'Basic',
  PRO: 'Pro',
  ENTERPRISE: 'Enterprise',
};
