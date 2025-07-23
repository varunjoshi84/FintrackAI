# Setting Up Google Authentication

This guide explains how to set up Google authentication for the Fintack AI application.

## Prerequisites

1. A Google Cloud Platform account
2. Node.js and npm installed
3. The Fintack AI application code

## Step 1: Create Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Select "Web application" as the application type
6. Add your domain to "Authorized JavaScript origins" (e.g., `http://localhost:5173` for development)
7. Add your redirect URI to "Authorized redirect URIs" (e.g., `http://localhost:8000/api/auth/google/callback`)
8. Click "Create" and note your Client ID and Client Secret

## Step 2: Configure Environment Variables

1. In the backend directory, create a `.env` file based on `.env.example`
2. Add your Google OAuth credentials:

```
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
FRONTEND_URL=http://localhost:5173
SESSION_SECRET=your_random_secret_string
```

## Step 3: Install Dependencies

Run the following command in the backend directory:

```bash
npm install
```

This will install all required dependencies including:
- passport
- passport-google-oauth20
- express-session

## Step 4: Start the Application

1. Start the backend server:

```bash
cd backend
npm run dev
```

2. Start the frontend:

```bash
cd frontendpart
npm run dev
```

## How It Works

1. When a user clicks "Continue with Google" on the login page, they are redirected to Google's authentication page
2. After successful authentication, Google redirects back to our backend at `/api/auth/google/callback`
3. The backend creates or retrieves the user account and generates a JWT token
4. The user is redirected to the frontend's `/auth/success` page with the token
5. The frontend stores the token and redirects to the dashboard

## Troubleshooting

- If you see "Error: redirect_uri_mismatch", make sure the callback URL in your Google Cloud Console matches exactly with your backend URL
- Check that all environment variables are set correctly
- Ensure that both frontend and backend servers are running
- Check the browser console and server logs for any errors