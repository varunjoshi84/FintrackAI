// Script to check Google OAuth configuration
require('dotenv').config();

console.log('Google OAuth Configuration Check');
console.log('===============================');

// Check client ID and secret
const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

console.log('Client ID:', clientId ? `${clientId.substring(0, 10)}...` : 'NOT SET');
console.log('Client Secret:', clientSecret ? `${clientSecret.substring(0, 5)}...` : 'NOT SET');

// Check redirect URI
console.log('\nRedirect URI Configuration:');
console.log('- Your code is using: http://localhost:8000/api/auth/google/callback');
console.log('- Make sure this EXACT URL is added to your Google Cloud Console');
console.log('  under "Authorized redirect URIs"');

// Check JavaScript origins
console.log('\nJavaScript Origins:');
console.log('- Your frontend is at: http://localhost:5173');
console.log('- Make sure this is added to your Google Cloud Console');
console.log('  under "Authorized JavaScript origins"');

console.log('\nCommon Issues:');
console.log('1. Redirect URI mismatch - The URI must match EXACTLY (including http/https, no trailing slash)');
console.log('2. JavaScript origin not authorized - Add your frontend URL to authorized origins');
console.log('3. Wrong credentials - Double-check your client ID and secret');
console.log('4. Project not published - If your app is in testing, add your email as a test user');

console.log('\nTo fix in Google Cloud Console:');
console.log('1. Go to https://console.cloud.google.com/apis/credentials');
console.log('2. Find your OAuth 2.0 Client ID and click "Edit"');
console.log('3. Update the Authorized redirect URIs and JavaScript origins');
console.log('4. Click "Save"');

console.log('\nTo test:');
console.log('1. Run the test server: node test-server.js');
console.log('2. Open http://localhost:8000/test-login.html in your browser');
console.log('3. Click "Continue with Google"');