<div align="center">

# 📱 FinTrackAI - Native Mobile App
### Cross-Platform React Native & Expo Financial Intelligence

[![React Native](https://img.shields.io/badge/React_Native-0.81-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK_54-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![React Navigation](https://img.shields.io/badge/React_Navigation-v7-6B52AE?style=for-the-badge&logo=react&logoColor=white)](https://reactnavigation.org/)
[![GitHub Release](https://img.shields.io/github/v/release/varunjoshi84/FintrackAI?color=7C3AED&label=Download%20APK&logo=android&logoColor=white)](https://github.com/varunjoshi84/FintrackAI/releases/latest)

<p align="center">
  <b>Enterprise personal finance in the palm of your hand.</b><br/>
  Native iOS & Android mobile application engineered with React Native and Expo SDK 54, offering seamless session recovery, instant statement and camera-receipt uploads, real-time spending telemetry, and offline-resilient caching.
</p>

[🚀 Download Production Standalone APK](https://github.com/varunjoshi84/FintrackAI/releases/latest)

</div>

---

## ✨ Mobile Highlights

- ⚡ **Native Performance**: Ultra-responsive screens built on React Native 0.81 with Hermes engine.
- 📸 **Receipt & Document Scanning**: Take photos of physical receipts via `expo-image-picker` or pick bank statements via `expo-document-picker`.
- 📊 **Vector Spending Visualizations**: Smooth Bézier curves and donut charts powered by `react-native-chart-kit` and `react-native-svg`.
- 🔐 **Secure Native Storage**: Session tokens and credentials preserved across reboots using `@react-native-async-storage/async-storage`.
- 📦 **Automated Cloud Builds**: Production standalone `.apk` builds streamlined via Expo Application Services (EAS).

---

## 🗺️ Mobile App Data Flow Diagrams (DFD)

### Level 0 DFD: Mobile App Boundary

```mermaid
flowchart TD
    User([📱 Mobile User])
    OS_Services([📷 Camera / 📁 File System])
    Backend([🏦 FinTrackAI REST API])
    EAS_Cloud([☁️ Expo Application Services])

    MobileApp[[📱 FinTrackAI Native Client]]

    User -->|Touch Gestures, Form Inputs, Auth Requests| MobileApp
    MobileApp -->|Rendered Native UI, Real-time Visuals, Alerts| User

    MobileApp <-->|Access Storage & Camera Roll| OS_Services
    MobileApp <-->|REST Requests with Bearer Auth Token| Backend
    MobileApp <-->|Over-The-Air Updates & Standalone APK Packaging| EAS_Cloud
```

---

### Level 1 DFD: Internal React Native Architecture & State Management

```mermaid
flowchart TD
    subgraph UI_Screens [Native Screens]
        SCR_LOGIN[Login / Signup Screen]
        SCR_DASH[Dashboard Screen]
        SCR_TXN[Transactions Screen]
        SCR_UPLOAD[Upload Screen]
        SCR_INSIGHTS[Insights Screen]
        SCR_PROF[Profile & Settings Screen]
    end

    subgraph Navigation_and_Context [Navigation & Global State]
        APP_NAV[AppNavigator: BottomTabs & Stack]
        AUTH_CTX[AuthContext: User & Session]
        ASYNC_STORAGE[(AsyncStorage: Persisted Session Token)]
    end

    subgraph Native_Sensors_and_Pickers [Device Hardware Integration]
        DOC_PICKER[expo-document-picker: PDFs/CSVs]
        IMG_PICKER[expo-image-picker: Camera/Gallery]
    end

    subgraph Mobile_API_Layer [API Client & Config]
        API_AUTH[api/auth.js]
        API_DASH[api/dashboard.js]
        API_USER[api/user.js]
    end

    subgraph Backend_Cloud [Backend API]
        BACKEND_API[(FinTrackAI Backend)]
    end

    SCR_LOGIN --> API_AUTH
    API_AUTH <--> BACKEND_API
    API_AUTH --> AUTH_CTX
    AUTH_CTX <--> ASYNC_STORAGE
    AUTH_CTX --> APP_NAV

    APP_NAV --> SCR_DASH & SCR_TXN & SCR_UPLOAD & SCR_INSIGHTS & SCR_PROF

    SCR_UPLOAD --> DOC_PICKER & IMG_PICKER
    DOC_PICKER & IMG_PICKER --> BACKEND_API

    SCR_DASH & SCR_TXN & SCR_INSIGHTS <--> API_DASH
    API_DASH <--> BACKEND_API

    SCR_PROF <--> API_USER
    API_USER <--> BACKEND_API
```

---

### Level 2 DFD: Mobile Receipt / Statement Upload Subsystem

```mermaid
flowchart LR
    subgraph Device_Input
        DOC[Document Picker: PDF/CSV]
        CAM[Camera: Receipt Photo]
    end

    subgraph Mobile_Engine [Mobile Ingestion Pipeline]
        N1[1. Native File System Read]
        N2[2. Construct Multi-Part FormData Payload]
        N3[3. Attach Authorization Bearer Token]
        N4[4. Upload Stream to /api/upload]
        N5[5. Receive Parsed Entities & Refresh State]
    end

    subgraph Screen_Refresh
        SCR[Dashboard & Transactions Screen Updated]
    end

    DOC & CAM --> N1
    N1 --> N2
    N2 --> N3
    N3 --> N4
    N4 --> N5
    N5 --> SCR
```

---

## 🛠️ Tech Stack & Dependencies

| Tool | Version | Description |
| :--- | :--- | :--- |
| **Framework** | React Native `0.81.0` | Mobile application core |
| **Tooling** | Expo SDK `~54.0.0` | Development toolkit and native modules |
| **Navigation** | React Navigation `^7.0.0` | Native Stack and Bottom Tabs |
| **Storage** | Async Storage `2.2.0` | Asynchronous, unencrypted, persistent key-value storage |
| **Visuals** | `react-native-chart-kit` & `react-native-svg` | Smooth chart drawing & SVG icons |
| **Device APIs** | `expo-document-picker`, `expo-image-picker` | File picking and camera integration |
| **Build System** | Expo EAS CLI | Cloud compilation to `.apk` & `.aab` |

---

## 📁 Directory Structure

```
mobile/
├── src/
│   ├── api/             # Network requests (auth, dashboard, user)
│   ├── context/         # AuthContext with session restoration
│   ├── navigation/      # Native AppNavigator routing
│   ├── screens/         # Dashboard, Transactions, Upload, Insights, Profile
│   └── theme/           # Color tokens & design constants
├── App.js               # Entry point wrapped with AuthProvider
├── app.json             # Manifest configuration
├── eas.json             # EAS cloud build configurations (Preview APK)
└── package.json
```

---

## ⚡ Quick Start & Development

```bash
cd mobile
npm install

# Start development packager
npm start
```

- Press `a` for Android Emulator
- Press `i` for iOS Simulator
- Scan QR code using the **Expo Go** app on your phone.

---

## 📦 Building Standalone APK

The mobile app includes configured EAS profiles in `eas.json`. To compile a new standalone Android `.apk`:

```bash
eas build -p android --profile preview
```

Or download the latest pre-compiled build:

🚀 **[Download Latest FinTrackAI Android APK](https://github.com/varunjoshi84/FintrackAI/releases/latest)**
