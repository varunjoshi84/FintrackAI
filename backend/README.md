# 🏦 FinTrackAI - Backend API

Robust, scalable RESTful API service powering the **FinTrackAI** ecosystem (Web & React Native Mobile). Built with Node.js, Express.js, and MongoDB, featuring automated financial statement parsing (PDF/CSV), JWT & Google OAuth authentication, Razorpay subscription billing, Nodemailer notifications, and comprehensive administrative controls.

---

## 🚀 Features

- **Authentication & Security**
  - Secure email/password authentication using bcrypt hashing & JWT tokens.
  - Google OAuth 2.0 integration via Passport.js.
  - Strict role-based authorization (User & Admin).
  - Rate limiting and maintenance mode middleware.
- **Statement & Receipt Parsing**
  - Automated statement ingestion supporting **CSV** and **PDF** formats.
  - Intelligent transaction extraction (`pdf-parse`, `csv-parser`) and auto-categorization.
  - Plan-based upload limits per subscription tier.
- **Financial Analytics & Dashboard**
  - Real-time income, expense, balance, and savings rate calculations.
  - Category-level breakdown and monthly trend aggregations.
  - Custom report generation and download.
- **Payments & Subscriptions**
  - Razorpay order creation and payment signature verification.
  - Tiered subscription management (Free, Pro, Enterprise).
  - Payment transaction history logging.
- **Admin Management Suite**
  - User management (listing, status toggling, deletion).
  - Platform analytics and user growth tracking.
  - Contact message handling with direct email responses.
  - Maintenance mode toggle and broadcast notifications.
- **Communication & Notifications**
  - Automated welcome emails and payment receipts using Nodemailer (SMTP).
  - Newsletter subscription management.

---

## 🛠️ Tech Stack

| Component | Technology | Version |
| :--- | :--- | :--- |
| **Runtime** | Node.js | `>= 16.0.0` |
| **Framework** | Express.js | `^4.18.2` |
| **Database** | MongoDB with Mongoose ODM | `^7.5.0` |
| **Auth** | JSONWebToken (`jsonwebtoken`), Passport.js (`passport-google-oauth20`), `bcryptjs` | |
| **File Processing**| Multer (`multer`), `pdf-parse`, `csv-parser` | |
| **Payment Gateway**| Razorpay Node SDK (`razorpay`) | `^2.9.6` |
| **Email Service** | Nodemailer (`nodemailer`) | `^6.9.4` |
| **Dev Tools** | Nodemon | `^3.0.1` |

---

## 📁 Project Structure

```
backend/
├── authentication/           # Authentication modules (signup, login, adminLogin)
├── middleware/               # Auth, security, and plan limit middlewares
│   ├── strictAuth.js         # JWT validation & user extraction
│   └── planLimits.js         # Upload limit checks based on plan
├── models/                   # Mongoose Database Schemas
│   ├── User.js               # User accounts & profile schema
│   ├── Transaction.js        # Financial transactions schema
│   ├── Payment.js            # Payment & subscription orders schema
│   └── Contact.js            # Contact submissions schema
├── routes/                   # Modular Express route handlers
│   ├── authRoutes.js         # Google OAuth & session routes
│   ├── dashboardRoutes.js    # Dashboard metrics routes
│   ├── reportRoutes.js       # Report generation routes
│   └── user.js               # User management routes
├── uploads/                  # Temporary file upload staging directory
├── adminController.js        # Admin metrics, user CRUD, maintenance
├── contactController.js      # Contact forms & email reply handling
├── dashboard.js              # Aggregated dashboard metrics & insights
├── database.js               # MongoDB connection handler
├── emailService.js           # Nodemailer transport & HTML email templates
├── googleAuth.js             # Passport Google Strategy configuration
├── newsletterController.js   # Newsletter subscription management
├── paymentController.js      # Razorpay order creation & payment verification
├── pdfUtils.js               # PDF & CSV parsing and categorization engine
├── server.js                 # Express application entrypoint & routing table
├── transactionController.js  # Transaction CRUD operations
├── uploadController.js       # File upload handler & parser orchestrator
├── userController.js         # User profile and account operations
├── Dockerfile                # Docker containerization config
├── vercel.json               # Serverless deployment configuration
└── package.json              # Project dependencies & scripts
```

---

## ⚙️ Environment Variables

Create a `.env` file in the `backend/` directory based on the following template:

```env
# Server Configuration
NODE_ENV=development
PORT=8000

# Database
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/fintrackai?retryWrites=true&w=majority

# JWT & Authentication
JWT_SECRET=your_super_secure_jwt_secret_key
JWT_EXPIRE=7d
SESSION_SECRET=your_session_secret_key

# Google OAuth 2.0
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Frontend & CORS Configuration
FRONTEND_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173

# Payment Gateway (Razorpay)
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret_key

# Email Service (Nodemailer SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM_NAME="FinTrackAI Team"

# File Uploads
MAX_FILE_SIZE=5242880 # 5MB in bytes
UPLOAD_PATH=./uploads
```

---

## 🚦 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (version 16.x or 18.x recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas cluster)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### 2. Installation
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install
```

### 3. Running Locally

```bash
# Start in development mode with auto-reload
npm run dev

# Start in production mode
npm start
```
The server will start at `http://localhost:8000` (or the configured `PORT`).

---

## 📡 API Reference Overview

### Health Check
- `GET /` - Root health check & API status
- `GET /api/health` - Deployment uptime status

### Authentication
- `POST /api/auth/register` - Register a new user account
- `POST /api/auth/login` - User login with JWT token return
- `POST /api/auth/admin/login` - Admin login
- `GET /api/auth/google` - Initiate Google OAuth flow
- `GET /api/auth/google/callback` - Google OAuth callback

### Dashboard & Analytics (Protected)
- `GET /api/dashboard` - Get summarized financial stats & charts data
- `PUT /api/dashboard/profile` - Update user profile settings

### Transactions (Protected)
- `GET /api/transactions` - Fetch user transactions with filters & pagination
- `POST /api/transactions` - Create a single manual transaction
- `PUT /api/transactions/:id` - Update an existing transaction
- `DELETE /api/transactions/:id` - Delete a transaction

### Statements & File Upload (Protected)
- `POST /api/upload/file` - Upload statement file (PDF/CSV) & parse transactions
- `POST /api/upload/transactions` - Alternative upload endpoint
- `POST /api/reports/generate` - Generate formatted financial summary report

### Payments & Subscription (Protected)
- `POST /api/payment/create-order` - Create a Razorpay payment order
- `POST /api/payment/process` - Verify and process payment confirmation
- `GET /api/payment/history` - Retrieve user payment history
- `GET /api/subscription/status` - Check current active plan & quota

### User & Admin Operations
- `GET /api/user/profile` - Get logged-in user profile
- `PUT /api/user/profile` - Update profile data
- `GET /api/admin/stats` - Platform-wide statistics (Admin only)
- `GET /api/admin/users` - Paginated user directory (Admin only)
- `POST /api/admin/maintenance` - Toggle maintenance mode (Admin only)
- `POST /api/contact/send` - Submit public contact message
- `POST /api/newsletter/subscribe` - Newsletter subscription

---

## 🐳 Docker Deployment

You can containerize the backend using the included `Dockerfile`:

```bash
# Build Docker image
docker build -t fintrackai-backend .

# Run Docker container
docker run -p 8000:8000 --env-file .env fintrackai-backend
```
