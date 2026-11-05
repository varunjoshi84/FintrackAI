<div align="center">

# 🏦 FinTrackAI - High-Performance Backend Core
### Distributed Polyglot Financial Ingestion & Analytics REST Engine

[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Billing-02042B?style=for-the-badge&logo=razorpay&logoColor=3395FF)](https://razorpay.com/)

<p align="center">
  <b>The mission-critical backbone of FinTrackAI.</b><br/>
  Engineered with polyglot persistence (PostgreSQL for ACID financial ledgers + MongoDB for high-velocity user identities), streaming bank statement parsing, cryptographic billing webhooks, and AI pipeline orchestration.
</p>

</div>

---

## 🏛️ Polyglot Architecture & Domain Matrix

FinTrackAI separates relational financial obligations from dynamic user document stores:

```
                  ┌──────────────────────────────┐
                  │    Express API Application   │
                  └──────────────┬───────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 ▼                               ▼
    ┌─────────────────────────┐     ┌─────────────────────────┐
    │  Prisma Repository DAL  │     │   Mongoose ODM Layer    │
    └────────────┬────────────┘     └────────────┬────────────┘
                 ▼                               ▼
    ┌─────────────────────────┐     ┌─────────────────────────┐
    │  🐘 PostgreSQL Ledger   │     │   🍃 MongoDB Atlas      │
    │  - Transactions (ACID)  │     │  - User Accounts & Auth │
    │  - Subscription Payments│     │  - Contacts & Inquiries │
    │  - Composite B-Tree Idx │     │  - Audit System Logs    │
    └─────────────────────────┘     └─────────────────────────┘
```

---

## 🗺️ Backend Data Flow Diagrams (DFD)

### Level 0 DFD: Backend Service Boundary

```mermaid
flowchart TD
    Client([💻 Web / 📱 Mobile Client])
    OAuthProv([🔑 Google OAuth])
    RazorpayGW([💳 Razorpay Gateway])
    EmailService([✉️ Nodemailer SMTP])
    AIProvider([🤖 Gemini / HuggingFace])

    BackendCore[[⚙️ FinTrackAI Backend API Core]]

    Client -->|REST Requests, JWT Headers, Multer Files| BackendCore
    BackendCore -->|JSON Payloads, Dashboards, Pre-Signed URLs| Client

    BackendCore <-->|OAuth Code Exchange & Verification| OAuthProv
    BackendCore <-->|Order Creation & HMAC Verification| RazorpayGW
    BackendCore -->|Trigger Notifications & Invoices| EmailService
    BackendCore <-->|Transaction NLP Classification Prompts| AIProvider
```

---

### Level 1 DFD: Internal Backend Flow & Data Stores

```mermaid
flowchart TD
    subgraph Inbound_Traffic [Clients]
        REQ[Web & Mobile REST Requests]
    end

    subgraph Security_Layer [Gatekeeper & Middleware]
        MW1[Strict Auth & JWT Validator]
        MW2[Role-Based Authorization Admin/User]
        MW3[Multer File Upload Streamer]
        MW4[Rate Limiter & Security Headers]
    end

    subgraph Controllers [Application Controllers]
        C1[Auth & User Controller]
        C2[Upload & Parsing Controller]
        C3[Transaction & Analytics Controller]
        C4[Payment & Subscription Controller]
        C5[Admin Operations Controller]
    end

    subgraph Repositories_and_Services [Data Access & Logic Layer]
        S_PARSE[PDF / CSV Parser Service]
        S_AI[Gemini / HF AI Categorizer]
        R_TXN[Transaction Repository]
        R_PAY[Payment Repository]
    end

    subgraph Polyglot_Databases [Databases]
        DB_MONGO[(🍃 MongoDB Atlas)]
        DB_PG[(🐘 PostgreSQL via Prisma)]
    end

    REQ --> MW4 --> MW1 --> MW2

    MW1 --> C1
    MW3 --> C2
    MW1 --> C3
    MW1 --> C4
    MW2 --> C5

    %% Auth Controller
    C1 <-->|Read / Write User Credentials| DB_MONGO

    %% Upload Controller
    C2 --> S_PARSE
    S_PARSE --> S_AI
    S_AI --> R_TXN

    %% Transaction Controller
    C3 <--> R_TXN
    R_TXN <--> DB_PG

    %% Payment Controller
    C4 <--> R_PAY
    R_PAY <--> DB_PG
    C4 -->|Update Plan Status| DB_MONGO

    %% Admin Controller
    C5 <--> DB_MONGO
    C5 <--> DB_PG
```

---

### Level 2 DFD: Payment & Subscription Ledger Subsystem

```mermaid
flowchart LR
    subgraph Client_App [Client Browser / App]
        P_INIT[Select Plan Upgrade]
        P_CHECKOUT[Complete Razorpay Modal]
    end

    subgraph Backend_Payment_Pipeline [Payment Verification Engine]
        P1[Create Razorpay Order]
        P2[Receive Payment Response]
        P3[Validate HMAC-SHA256 Signature]
        P4[Atomic Transaction: Record Ledger]
        P5[Upgrade Subscription Profile]
        P6[Dispatch Receipt Email]
    end

    subgraph Storage [Databases]
        PG[(🐘 PostgreSQL Payments Table)]
        MONGO[(🍃 MongoDB Users Table)]
    end

    P_INIT --> P1
    P1 -->|Return order_id| P_CHECKOUT
    P_CHECKOUT -->|razorpay_payment_id + signature| P2
    P2 --> P3
    P3 -->|Signature Verified| P4 & P5
    P4 --> PG
    P5 --> MONGO
    P5 --> P6
```

---

## 🛠️ Tech Stack & Dependencies

| Layer | Library / Tool | Purpose |
| :--- | :--- | :--- |
| **Runtime & Framework** | Node.js `>=18.x`, Express `4.18.x` | RESTful API server |
| **Relational ORM** | Prisma `5.22.x` | PostgreSQL schema migrations & queries |
| **Document ODM** | Mongoose `8.x` | MongoDB connection & document models |
| **Document Processing** | `pdf-parse`, `csv-parser`, `multer` | Multi-format bank statement OCR & stream parsing |
| **Security & Auth** | `jsonwebtoken`, `bcryptjs`, `passport-google-oauth20` | Dual JWT & OAuth 2.0 implementation |
| **Payments** | `razorpay`, `crypto` | Order generation & cryptographic webhook verification |
| **Notifications** | `nodemailer` | Automated HTML transactional emails |

---

## 📁 Directory Structure

```
backend/
├── config/            # DB connectors (MongoDB, Prisma, Passport, Mailer)
├── controllers/       # Controller business logic (Auth, User, Admin, Payment)
├── middleware/        # Strict authentication, RBAC, Multer file filters
├── models/            # Mongoose schemas (User, Contact, Newsletter)
├── prisma/            # Relational PostgreSQL schema (schema.prisma) & migrations
├── repositories/      # Prisma Data Access Layer for Transactions and Payments
├── routes/            # Express router definitions
├── utils/             # PDF parser, CSV parser, AI category mapper
└── server.js          # Main application bootstrapper
```

---

## ⚡ Quick Start

```bash
cd backend
npm install

# 1. Environment configuration
cp .env.example .env

# 2. Database migrations (PostgreSQL)
npx prisma generate
npx prisma db push

# 3. Start development server
npm run dev
```

*Server will initialize on `http://localhost:8000`.*
