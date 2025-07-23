# Google Authentication Troubleshooting

## Fix for "redirect_uri_mismatch" Error

If you're seeing the error "Access blocked: This app's request is invalid" with "Error 400: redirect_uri_mismatch", follow these steps:

1. **Update Google Cloud Console Settings**:
   - Go to https://console.cloud.google.com/apis/credentials
   - Find your OAuth 2.0 Client ID and click "Edit"
   - Under "Authorized redirect URIs", add exactly: `http://localhost:8000/api/auth/google/callback`
   - Under "Authorized JavaScript origins", add:
     - `http://localhost:8000`
     - `http://localhost:5173`
   - Click "Save"

2. **Verify Your Code Configuration**:
   - Make sure the `callbackURL` in `googleAuth.js` is set to: `http://localhost:8000/api/auth/google/callback`
   - This must match EXACTLY what you set in Google Cloud Console (including http/https, no trailing slash)

3. **Test with the Test Server**:
   - Run: `node test-server.js`
   - Open: http://localhost:8000/test-login.html
   - Click "Continue with Google"
   - You should be redirected to Google's login page and then back to the test page

4. **Common Issues**:
   - **Exact URL Matching**: The redirect URI must match exactly, including protocol (http vs https)
   - **Trailing Slashes**: Make sure there are no trailing slashes in the URL
   - **Project Not Published**: If your app is in testing, add your email as a test user
   - **Credentials Mismatch**: Double-check your client ID and secret

5. **Debugging**:
   - Check the server logs for any errors
   - Look for "Google auth route accessed" and "Google auth callback route accessed" messages
   - If the callback route is not being accessed, the redirect URI is likely incorrect

## Testing Google Authentication

To test Google authentication:

1. Run the test server:
   ```
   node test-server.js
   ```

2. Open the test page:
   ```
   http://localhost:8000/test-login.html
   ```

3. Click "Continue with Google" and complete the authentication flow

4. If successful, you'll be redirected back to the test page with your user information

## Integration with Main Application

Once Google authentication is working with the test server, you can integrate it with your main application:

1. Make sure the same Google OAuth configuration is used in both places
2. Update your frontend to handle the authentication callback
3. Test the full authentication flow from your main application