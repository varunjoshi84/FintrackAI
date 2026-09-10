# 📱 FinTrackAI - Mobile App (React Native & Expo)

Cross-platform mobile application for **FinTrackAI**, bringing AI-driven financial tracking, statement uploads, interactive spending charts, and transaction management directly to iOS and Android devices.

Built with **React Native** and powered by the **Expo SDK 54** ecosystem.

---

## ✨ Features

- 🔐 **Authentication & Session Persistence**
  - Seamless User Login and Registration.
  - Secure token storage using `@react-native-async-storage/async-storage`.
  - Automatic session restore and protected route gating.
- 📊 **Smart Financial Dashboard**
  - Instant overview of Total Income, Total Expenses, and Net Balance.
  - Recent transactions list with clear debit/credit indicators.
  - Pull-to-refresh to fetch the latest financial stats in real time.
- 💳 **Transaction Management**
  - View, search, and filter transactions across dates, types, and categories.
  - Add and edit manual transactions with instant cloud synchronization.
- 📄 **Statement & Receipt Upload**
  - Upload PDF/CSV bank statements via `expo-document-picker`.
  - Capture or upload receipt photos via `expo-image-picker`.
  - Multi-part form data upload to the backend parser engine.
- 📈 **Visual Spending Insights**
  - Interactive charts powered by `react-native-chart-kit` and `react-native-svg`.
  - Category-by-category expense breakdowns and financial health metrics.
- 👤 **User Profile & Settings**
  - View account details, subscription tier, and upload quotas.
  - Safe sign-out clearing local storage and session state.

---

## 🛠️ Tech Stack

| Category | Technology | Version / Details |
| :--- | :--- | :--- |
| **Framework** | [React Native](https://reactnative.dev/) | `0.81.0` |
| **Tooling & Runtime** | [Expo](https://expo.dev/) | `~54.0.0` |
| **Language** | React (JSX / JavaScript) | `19.1.0` |
| **Navigation** | [React Navigation](https://reactnavigation.org/) | `^7.0.0` (Native Stack & Bottom Tabs) |
| **State & Storage** | React Context API + `@react-native-async-storage/async-storage` | `2.2.0` |
| **Charts & Visuals** | `react-native-chart-kit` + `react-native-svg` | `^6.12.0` / `15.12.1` |
| **File & Camera** | `expo-document-picker`, `expo-image-picker` | `~14.0.0` / `~17.0.0` |
| **Icons** | `@expo/vector-icons` (Ionicons) | `^15.0.0` |
| **Build & Deploy** | Expo Application Services (EAS Build) | `eas.json` configured |

---

## 📁 Project Structure

```
mobile/
├── src/
│   ├── api/                  # API request helpers and endpoint definitions
│   │   ├── auth.js           # Authentication API calls (login, signup, token validation)
│   │   ├── config.js         # API Base URL and fetch wrapper with auth headers
│   │   ├── dashboard.js      # Dashboard stats, transactions, insights API
│   │   └── user.js           # User profile and account API
│   ├── context/
│   │   └── AuthContext.js    # Global auth state & session provider
│   ├── navigation/
│   │   └── AppNavigator.js   # Bottom Tab & Stack navigation container
│   ├── screens/              # App Screen Components
│   │   ├── LoginScreen.js        # User login screen
│   │   ├── SignupScreen.js       # New user registration screen
│   │   ├── DashboardScreen.js    # Financial overview & recent cards
│   │   ├── TransactionsScreen.js # Detailed transaction logs & filters
│   │   ├── UploadScreen.js       # Document & receipt upload interface
│   │   ├── InsightsScreen.js     # Charts & category breakdown
│   │   └── ProfileScreen.js      # Profile details & settings
│   └── theme/
│       └── colors.js         # Unified color palette & design tokens
├── App.js                    # Mobile root component wrapped with AuthProvider
├── app.json                  # Expo project manifest (bundle ID, permissions, icon)
├── eas.json                  # EAS build profiles (development, preview, production)
└── package.json              # Dependencies and start scripts
```

---

## ⚙️ Configuration & Backend URL

The mobile app connects to the FinTrackAI Backend API. You can configure the API endpoint in [`src/api/config.js`](file:///src/api/config.js):

```javascript
// For production backend:
export const API_BASE_URL = 'https://fintrackai.onrender.com/api';

// For local development:
// Replace with your local machine's LAN IP address (do not use 'localhost' on physical devices)
// export const API_BASE_URL = 'http://192.168.1.X:8000/api';
```

> **Note for Physical Devices & Emulators:**
> When testing on a physical phone with Expo Go or in an emulator, use your computer's local network IP address (e.g. `http://192.168.1.50:8000/api`) so the mobile device can reach your local backend server.

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (version 18+ recommended)
- [Expo Go App](https://expo.dev/go) installed on your iOS or Android phone (optional for testing on physical device)
- [Xcode](https://developer.apple.com/xcode/) (macOS only, for iOS Simulator)
- [Android Studio](https://developer.android.com/studio) (for Android Emulator)

### 2. Installation
```bash
# Navigate to the mobile directory
cd mobile

# Install dependencies
npm install
```

### 3. Running the App

```bash
# Start the Expo development server
npm start
```

After starting the development server:
- Scan the QR code using the **Expo Go** app on Android or the **Camera** app on iOS.
- Or press `a` in the terminal to launch in the **Android Emulator**.
- Or press `i` in the terminal to launch in the **iOS Simulator**.
- Or press `w` to open in a web browser.

### Dedicated Platform Commands:
```bash
# Run on Android directly
npm run android

# Run on iOS directly
npm run ios

# Run web preview
npm run web
```

---

## 📦 Building with EAS (Expo Application Services)

The project includes `eas.json` configured for Android and iOS builds.

### 1. Install EAS CLI & Login
```bash
npm install -g eas-cli
eas login
```

### 2. Build for Preview / Internal Testing (e.g., Android APK)
```bash
# Build standalone Android APK
eas build -p android --profile preview

# Build for iOS
eas build -p ios --profile preview
```

### 3. Build for Production Store Distribution
```bash
# Build Android App Bundle (AAB) for Google Play
eas build -p android --profile production

# Build IPA for Apple App Store
eas build -p ios --profile production
```

---

## 🎨 UI & Design Tokens

The mobile app follows a clean, modern aesthetic defined in `src/theme/colors.js`:
- **Primary Color**: `#2563EB` (Royal Blue)
- **Background**: `#F8FAFC` (Clean Light Gray)
- **Success / Income**: `#10B981` (Emerald Green)
- **Danger / Expense**: `#EF4444` (Crimson Red)
- **Card Background**: `#FFFFFF` with soft drop shadows
