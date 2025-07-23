// Simple script to test Google authentication setup
require('dotenv').config();

console.log('Google Authentication Test');
console.log('=========================');
console.log('');

// Check if Google credentials are set
const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!clientId || clientId.trim() === '') {
  console.error('❌ GOOGLE_CLIENT_ID is not set in .env file');
} else {
  console.log('✅ GOOGLE_CLIENT_ID is set:', clientId.substring(0, 10) + '...');
}

if (!clientSecret || clientSecret.trim() === '') {
  console.error('❌ GOOGLE_CLIENT_SECRET is not set in .env file');
} else {
  console.log('✅ GOOGLE_CLIENT_SECRET is set:', clientSecret.substring(0, 5) + '...');
}

// Check other required environment variables
const frontendUrl = process.env.FRONTEND_URL;
const sessionSecret = process.env.SESSION_SECRET;
const jwtSecret = process.env.JWT_SECRET;

if (!frontendUrl) {
  console.error('❌ FRONTEND_URL is not set in .env file');
} else {
  console.log('✅ FRONTEND_URL is set:', frontendUrl);
}

if (!sessionSecret) {
  console.error('❌ SESSION_SECRET is not set in .env file');
} else {
  console.log('✅ SESSION_SECRET is set');
}

if (!jwtSecret) {
  console.error('❌ JWT_SECRET is not set in .env file');
} else {
  console.log('✅ JWT_SECRET is set');
}

console.log('');
console.log('Google Authentication URLs:');
console.log('- Login URL: http://localhost:8000/api/auth/google');
console.log('- Callback URL: http://localhost:8000/api/auth/google/callback');
console.log('');
console.log('Make sure these URLs are configured in your Google Cloud Console');
console.log('');
console.log('To test the authentication:');
console.log('1. Start the backend server: npm run dev');
console.log('2. Start the frontend server: cd ../frontendpart && npm run dev');
console.log('3. Open the login page and click "Continue with Google"');
console.log('');