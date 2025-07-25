# FinTrackAI Backend

## Production Deployment

### Environment Variables Required:
```
NODE_ENV=production
PORT=8000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_jwt_secret
FRONTEND_URL=https://your-frontend-domain.com
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SESSION_SECRET=your_session_secret
```

### Deploy with Docker:
```bash
docker build -t fintrackai-backend .
docker run -p 8000:8000 --env-file .env fintrackai-backend
```

### Deploy to Heroku:
```bash
heroku create your-app-name
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_mongodb_uri
# Set other environment variables...
git push heroku main
```

### Deploy to Railway/Render:
1. Connect GitHub repository
2. Set environment variables in dashboard
3. Deploy automatically

### Health Check:
- Endpoint: `/health`
- Returns: `{"status": "healthy", "uptime": 123, "timestamp": "..."}`