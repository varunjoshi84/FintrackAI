# 🌐 FinTrackAI - Web Client (React + Vite)

Modern, high-performance web application for **FinTrackAI**, featuring interactive financial dashboards, AI-powered transaction analysis (Google Gemini & Hugging Face), bank statement parsing, dynamic charts, Razorpay payments, and an administrative control suite.

Built with **React 19**, **Vite 7**, and **Tailwind CSS v4** with silky-smooth **GSAP** animations.

---

## ✨ Features

- 💎 **Modern Landing & Marketing Pages**
  - High-converting Hero, Features, Pricing, Help, About, Contact, Terms, and Privacy pages.
  - Interactive micro-animations powered by **GSAP**.
  - Fully responsive design tailored for mobile, tablet, and widescreen displays.
- 🔐 **Comprehensive Authentication**
  - Standard Email/Password registration and login with JWT session handling.
  - **Google OAuth 2.0** login with dedicated callback token handler (`/auth/success`).
  - Route protection wrapper (`ProtectedRoute`) ensuring secured access.
- 📊 **Interactive Financial Dashboard**
  - Real-time income, expense, balance, and savings rate trackers.
  - Interactive dynamic charts using **Chart.js** (doughnut spending distributions & monthly cash flow bar graphs).
- 💳 **Transaction Hub**
  - Search, sort, and paginate through past financial transactions.
  - Instant categorization tags (e.g., Food, Travel, Utilities, Investments).
  - Add, edit, or delete transactions with live balance recalculations.
- 📂 **Statement Ingestion & AI Parsing**
  - Drag-and-drop upload interface for bank statements (**PDF** and **CSV**).
  - Real-time parsing feedback and automatic transaction extraction.
- 🤖 **AI-Driven Insights & Reports**
  - Smart financial advice and spending anomaly detection using **Google Gemini** & **Hugging Face** models.
  - Detailed downloadable financial summary reports.
- 💳 **Razorpay Subscription Checkout**
  - Seamless in-app subscription upgrade modal with Razorpay Checkout integration.
  - Plan quota tracking and entitlement enforcement.
- 🛠️ **Administrative Portal**
  - Platform-wide statistics (active users, total revenue, transaction counts).
  - User management table (status toggles, user edits, deletions).
  - Maintenance mode toggle and broadcast notification sender.

---

## 🛠️ Tech Stack

| Component | Technology | Version |
| :--- | :--- | :--- |
| **Framework** | [React](https://react.dev/) | `^19.1.0` |
| **Build Tool / Bundler** | [Vite](https://vitejs.dev/) | `^7.0.3` |
| **Routing** | [React Router DOM](https://reactrouter.com/) | `^7.6.3` |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + PostCSS + Autoprefixer | `@tailwindcss/vite ^4.1.11` |
| **Animations** | [GSAP (GreenSock)](https://greensock.com/gsap/) | `^3.13.0` |
| **Data Visualization** | [Chart.js](https://www.chartjs.org/) | `^4.5.0` |
| **AI Integration** | Google Gemini API & Hugging Face Inference API | |
| **Payments** | Razorpay Web Checkout SDK | |

---

## 📁 Project Structure

```
web/
├── public/                   # Static assets (favicons, logos, images)
├── src/
│   ├── api/                  # API client modules & endpoints
│   │   ├── admin.js          # Admin actions & metrics API
│   │   ├── adminApi.js       # Admin user management API
│   │   ├── auth.js           # Authentication API calls
│   │   ├── config.js         # Axios/fetch configuration & endpoints map
│   │   ├── contact.js        # Contact form submission API
│   │   ├── dashboard.js      # Dashboard stats & metrics API
│   │   ├── insights.js       # AI insights API & data processing
│   │   ├── location.js       # Geolocation & IP location utilities
│   │   ├── upload.js         # File upload & parse API
│   │   └── user.js           # User profile & account API
│   ├── assets/               # Images, SVG icons, and media files
│   ├── Authentication/       # Authentication Views & Modals
│   │   ├── Admin.jsx         # Admin login screen
│   │   ├── AuthSuccess.jsx   # Google OAuth callback handler
│   │   ├── Login.jsx         # User login form
│   │   └── Signup.jsx        # User registration form
│   ├── components/           # Reusable UI Components
│   │   ├── BackToTopButton.jsx # Smooth scroll-to-top button
│   │   ├── Features.jsx      # Features section component
│   │   ├── Footer.jsx        # Global page footer
│   │   ├── Header.jsx        # Navigation bar & header
│   │   ├── Hero.jsx          # Hero section with animated elements
│   │   ├── Pricing.jsx       # Pricing tiers component
│   │   └── ScrollToTop.jsx   # Route change scroll reset helper
│   ├── Dashboard/            # App Dashboard Screens
│   │   ├── AdminDashboard.jsx# Admin metrics, user list, maintenance
│   │   ├── Dashboard.jsx     # Main user dashboard overview
│   │   ├── Insights.jsx      # AI analytics & charts
│   │   ├── Reports.jsx       # Financial report generator
│   │   ├── Transactions.jsx  # Transaction log & filtering table
│   │   └── Upload.jsx        # PDF/CSV statement uploader
│   ├── UserDashboard/        # User Profile & Settings
│   │   └── UserDashboard.jsx # Profile edit, subscription upgrade, security
│   ├── utils/                # Helper functions (formatting, date parsers)
│   ├── App.jsx               # Application routes & ProtectedRoute setup
│   ├── index.css             # Global CSS & Tailwind CSS directives
│   └── main.jsx              # React DOM entrypoint
├── index.html                # HTML template
├── netlify.toml              # Netlify SPA redirect & build config
├── vercel.json               # Vercel SPA routing configuration
├── vite.config.js            # Vite build configuration with React & Tailwind plugins
└── package.json              # Web client dependencies & scripts
```

---

## ⚙️ Environment Variables

Create a `.env` file inside the `web/` directory with the following variables:

```env
# Backend API Base URL
VITE_API_URL=http://localhost:8000/api

# Google Gemini AI Key (for automated financial advice & statement insights)
vite_gemini_api_key=your_google_gemini_api_key

# Razorpay Key ID (Public Client Key for checkout modal)
VITE_RAZORPAY_KEY=rzp_test_your_razorpay_key_id

# Hugging Face Token (optional alternative for AI models)
VITE_HF_TOKEN=hf_your_huggingface_token
```

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (version 18.x or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- Running instance of the [FinTrackAI Backend](../backend)

### 2. Installation
```bash
# Navigate to web directory
cd web

# Install dependencies
npm install
```

### 3. Development Server
```bash
# Run local Vite development server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser to view the application.

---

## 🛠️ Available Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts the local Vite development server with Hot Module Replacement (HMR). |
| `npm run build` | Compiles and bundles production-ready assets into the `dist/` directory. |
| `npm run preview` | Locally previews the production build from `dist/`. |
| `npm run lint` | Runs ESLint across all source files to enforce code style. |

---

## 🌐 Deployment

The web client is pre-configured for seamless single-page application (SPA) deployment on **Vercel** and **Netlify**:

- **Vercel**: Configuration is handled via `vercel.json` rewriting all routes to `/index.html`.
- **Netlify**: Configuration is defined in `netlify.toml` with publish directory set to `dist`.

```bash
# Production build
npm run build
```
Upload the generated `dist/` folder or link your Git repository to Vercel/Netlify for automatic CI/CD deployments.
