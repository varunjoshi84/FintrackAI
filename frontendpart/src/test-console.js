// Simple test to verify console logging works
console.log('🚀 TEST: JavaScript is loading correctly!');
console.log('🔍 Current URL:', window.location.href);
console.log('📍 Search params:', window.location.search);

// Test if we have auth parameters
const params = new URLSearchParams(window.location.search);
if (params.get('token')) {
  console.log('✅ TOKEN FOUND!');
} else {
  console.log('❌ NO TOKEN');
}

if (params.get('user')) {
  console.log('✅ USER FOUND!');
} else {
  console.log('❌ NO USER');
}