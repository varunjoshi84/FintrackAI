<div align="center">

# 🌐 FinTrackAI - Web Client (React 19 + Vite)
### High-Performance Interactive Financial Intelligence Portal

[![React](https://img.shields.io/badge/React-19.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![GSAP](https://img.shields.io/badge/GSAP-3.13-88CE02?style=for-the-badge&logo=greensock&logoColor=white)](https://greensock.com/gsap/)
[![Chart.js](https://img.shields.io/badge/Chart.js-4.5-FF6384?style=for-the-badge&logo=chart.js&logoColor=white)](https://www.chartjs.org/)

<p align="center">
  <b>The modern web experience for FinTrackAI.</b><br/>
  Featuring reactive financial dashboards, drag-and-drop statement ingestion, dynamic Chart.js visualizations, GSAP micro-animations, Razorpay checkout modals, and a comprehensive admin management console.
</p>

</div>

---

## ✨ Interface Highlights

- 💎 **Ultra-Smooth UI/UX**: Built with Tailwind CSS v4 and fluid scroll animations powered by GSAP.
- 📊 **Dynamic Financial Visualizations**: Real-time spending breakdowns, doughnut charts, and cash-flow trends.
- 📂 **Smart Statement Ingestion**: Instant drag-and-drop support for PDF and CSV bank statements.
- 🤖 **Predictive AI Insights**: Integrated prompts requesting personalized advice via Google Gemini.
- 💳 **In-App Razorpay Checkout**: One-click subscription tier upgrades with automatic session updates.

---

## 🗺️ Web Client Data Flow Diagrams (DFD)

### Level 0 DFD: Web Client Boundary

```mermaid
flowchart TD
    User([👤 Web User / Admin])
    Backend([🏦 FinTrackAI REST API])
    RazorpayModal([💳 Razorpay Web Modal])
    GeminiAPI([🧠 Gemini AI Engine])

    WebClient[[🌐 FinTrackAI Web Application]]

    User -->|Interactions, Files, Credentials, Settings| WebClient
    WebClient -->|Rendered Dashboards, Charts, Alerts, Receipts| User

    WebClient <-->|Axios Requests & JWT Bearer Auth| Backend
    WebClient <-->|Open Checkout & Receive Payment Verification| RazorpayModal
    WebClient <-->|Natural Language Insights Query| GeminiAPI
```

---

### Level 1 DFD: Internal React Architecture & State Flow

```mermaid
flowchart TD
    subgraph User_Interactions [Browser User Interface]
        UI_AUTH[Auth Forms / OAuth Button]
        UI_DASH[Dashboard & Chart Cards]
        UI_UPLOAD[Statement Dropzone]
        UI_TXN[Transaction Table & Filters]
        UI_BILLING[Pricing & Checkout Modal]
    end

    subgraph State_and_Routing [Client State & Router]
        ROUTER[React Router DOM v7]
        AUTH_CTX[Auth State & LocalStorage]
        DATA_STATE[Component Local & Metric States]
    end

    subgraph API_Services [Axios API Client Services]
        A_AUTH[api/auth.js]
        A_DASH[api/dashboard.js]
        A_UPLOAD[api/upload.js]
        A_INSIGHTS[api/insights.js]
        A_ADMIN[api/admin.js]
    end

    subgraph External_Servers [Backend & Gateways]
        API_SERVER[(FinTrackAI REST API)]
        RZP[(Razorpay Checkout SDK)]
    end

    UI_AUTH --> A_AUTH
    A_AUTH <--> API_SERVER
    A_AUTH --> AUTH_CTX

    AUTH_CTX --> ROUTER

    UI_UPLOAD --> A_UPLOAD
    A_UPLOAD <--> API_SERVER

    UI_DASH --> A_DASH
    A_DASH <--> API_SERVER
    A_DASH --> DATA_STATE
    DATA_STATE --> UI_DASH

    UI_TXN <--> API_SERVER

    UI_BILLING --> RZP
    RZP --> API_SERVER
```

---

### Level 2 DFD: Client Document Upload & Live Chart Update Subsystem

```mermaid
flowchart LR
    subgraph User_Action
        FILE[/Drag & Drop Bank PDF / CSV/]
    end

    subgraph Client_Processor [Web Processing Pipeline]
        V[1. Client-Side Format & Size Validation]
        M[2. Multipart FormData Packing]
        API[3. Post to /api/upload with Bearer Token]
        POLL[4. Await Extraction & Normalization]
        RERENDER[5. Trigger Chart.js & Metric Recalculation]
    end

    subgraph Visual_Output
        CANVAS[Interactive Dashboard Re-Rendered]
    end

    FILE --> V
    V --> M
    M --> API
    API --> POLL
    POLL --> RERENDER
    RERENDER --> CANVAS
```

---

## 🛠️ Tech Stack & Dependencies

| Tool | Version | Description |
| :--- | :--- | :--- |
| **Framework** | React `19.1.0` | Core UI library |
| **Bundler** | Vite `7.0.3` | Ultra-fast HMR and build pipeline |
| **Styling** | Tailwind CSS `v4.1.x` | Modern utility-first CSS |
| **Animations** | GSAP `3.13.x` | Timeline and tween animations |
| **Visuals** | Chart.js `4.5.x` | High-DPI canvas charts and legends |
| **Routing** | React Router DOM `7.6.x` | Client-side routing with protected view wrappers |
| **HTTP Client** | Axios `1.7.x` | Network requests with interceptors |

---

## 📁 Directory Structure

```
web/
├── public/                 # Favicons, logos, static illustrations
├── src/
│   ├── api/                # API client modules (auth, dashboard, upload, admin)
│   ├── assets/             # Media and SVGs
│   ├── Authentication/     # Login, Signup, OAuth success redirects
│   ├── components/         # Navbar, Footer, Modals, StatCards, Charts
│   ├── pages/              # Landing, Dashboard, Transactions, Ingestion, Admin
│   ├── App.jsx             # Route definitions and layout wrappers
│   └── main.jsx            # React root mount
├── package.json
└── vite.config.js
```

---

## ⚡ Quick Start

```bash
cd web
npm install

# Start Vite dev server
npm run dev
```

*Open `http://localhost:5173` in your browser.*
