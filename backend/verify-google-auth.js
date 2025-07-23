// Script to verify Google authentication configuration
require('dotenv').config();
const fs = require('fs');
const path = require('path');

console.log('Google Authentication Verification');
console.log('=================================');

// Check environment variables
const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const frontendUrl = process.env.FRONTEND_URL;

console.log('Environment Variables:');
console.log(`- GOOGLE_CLIENT_ID: ${clientId ? '✅ Set' : '❌ Not set'}`);
console.log(`- GOOGLE_CLIENT_SECRET: ${clientSecret ? '✅ Set' : '❌ Not set'}`);
console.log(`- FRONTEND_URL: ${frontendUrl || 'Not set, using default'}`);

// Check googleAuth.js
try {
  const googleAuthPath = path.join(__dirname, 'googleAuth.js');
  const googleAuthContent = fs.readFileSync(googleAuthPath, 'utf8');
  
  console.log('\nChecking googleAuth.js:');
  
  // Check callbackURL
  const callbackUrlMatch = googleAuthContent.match(/callbackURL:\s*["']([^"']+)["']/);
  if (callbackUrlMatch) {
    const callbackUrl = callbackUrlMatch[1];
    console.log(`- callbackURL: ${callbackUrl}`);
    
    if (callbackUrl === 'http://localhost:8000/api/auth/google/callback') {
      console.log('  ✅ Correct callback URL');
    } else if (callbackUrl === '/api/auth/google/callback') {
      console.log('  ⚠️ Relative URL - should be absolute: http://localhost:8000/api/auth/google/callback');
    } else {
      console.log('  ❌ Incorrect callback URL - should be: http://localhost:8000/api/auth/google/callback');
    }
  } else {
    console.log('❌ Could not find callbackURL in googleAuth.js');
  }
  
  // Check User model
  const userModelMatch = googleAuthContent.match(/const\s+User\s*=\s*require\(['"]([^'"]+)['"]\)/);
  if (userModelMatch) {
    const userModelPath = userModelMatch[1];
    console.log(`- User model: ${userModelPath}`);
    
    try {
      const userModel = require(userModelPath);
      console.log('  ✅ User model loaded successfully');
    } catch (error) {
      console.log(`  ❌ Error loading User model: ${error.message}`);
    }
  }
} catch (error) {
  console.log(`❌ Error reading googleAuth.js: ${error.message}`);
}

// Check authRoutes.js
try {
  const authRoutesPath = path.join(__dirname, 'routes', 'authRoutes.js');
  const authRoutesContent = fs.readFileSync(authRoutesPath, 'utf8');
  
  console.log('\nChecking authRoutes.js:');
  
  // Check redirect URL
  const redirectMatch = authRoutesContent.match(/res\.redirect\(`([^`]+)/);
  if (redirectMatch) {
    const redirectUrl = redirectMatch[1];
    console.log(`- Redirect URL: ${redirectUrl}`);
    
    if (redirectUrl.includes('/auth/success')) {
      console.log('  ✅ Correct redirect path: /auth/success');
    } else {
      console.log('  ⚠️ Unexpected redirect path');
    }
  } else {
    console.log('❌ Could not find redirect URL in authRoutes.js');
  }
} catch (error) {
  console.log(`❌ Error reading authRoutes.js: ${error.message}`);
}

console.log('\nNext Steps:');
console.log('1. Make sure your Google Cloud Console has the correct redirect URI:');
console.log('   http://localhost:8000/api/auth/google/callback');
console.log('2. Run the test server: node test-server.js');
console.log('3. Open http://localhost:8000/test-login.html to test Google login');
console.log('4. Check server logs for any errors');