# Firebase Setup Guide for Android

## ✅ Completed Steps

1. **Android folder created** - The native Android project with Gradle has been successfully generated
2. **Firebase plugin added** - Added `@react-native-firebase/app` to `app.json`
3. **Firebase service updated** - Migrated from web Firebase SDK to React Native Firebase SDK
4. **Web Firebase removed** - Uninstalled the `firebase` web package

## 📋 Next Steps to Complete Firebase Setup

### Step 1: Download google-services.json

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one if you haven't)
3. Click on **Project Settings** (gear icon ⚙️)
4. Scroll down to **Your apps** section
5. Click **Add app** → Select **Android** (📱 icon)
6. Register your app with these details:
   - **Android package name**: `com.alimoo23.instagram`
   - **App nickname** (optional): Instagram Clone
   - **Debug signing certificate SHA-1** (optional for now)
7. Click **Register app**
8. Download the `google-services.json` file
9. Place it in: `android/app/google-services.json`

### Step 2: Enable Firebase Services

In the Firebase Console, enable the following services:

1. **Authentication**:
   - Go to **Build** → **Authentication**
   - Click **Get Started**
   - Enable **Email/Password** sign-in method

2. **Realtime Database**:
   - Go to **Build** → **Realtime Database**
   - Click **Create Database**
   - Choose a location (e.g., us-central1)
   - Start in **Test mode** (for development)
   - Update rules later for production

### Step 3: Rebuild the Android Project

After placing the `google-services.json` file, run:

```bash
npx expo prebuild --platform android --clean
```

This will regenerate the Android project with Firebase properly configured.

### Step 4: Run the App

```bash
npm run android
```

Or:

```bash
npx expo run:android
```

## 📁 Project Structure

```
instagram/
├── android/                    # ✅ Native Android project (generated)
│   ├── app/
│   │   ├── google-services.json  # ⚠️ You need to add this file
│   │   └── build.gradle
│   ├── build.gradle
│   └── settings.gradle
├── service/
│   └── firebase.jsx           # ✅ Updated to use React Native Firebase
└── app.json                   # ✅ Updated with Firebase plugin
```

## 🔧 Troubleshooting

### If you get "google-services.json not found" error:
- Make sure the file is in `android/app/google-services.json`
- Run `npx expo prebuild --platform android --clean`

### If you get build errors:
- Clean the build: `cd android && ./gradlew clean && cd ..`
- Rebuild: `npx expo run:android`

### If Firebase is not initializing:
- Check that `google-services.json` is in the correct location
- Verify the package name matches: `com.alimoo23.instagram`
- Make sure you've enabled the required services in Firebase Console

## 📝 Important Notes

- **Package Name**: Your app is registered as `com.alimoo23.instagram`
- **React Native Firebase** automatically initializes using the config files
- No need to manually configure Firebase in code
- The `google-services.json` file contains your Firebase configuration

## 🎉 What's Working Now

- ✅ Android folder with Gradle
- ✅ Firebase plugin configured
- ✅ Firebase service using native SDK
- ✅ Authentication functions ready
- ✅ Realtime Database integration ready

## ⏭️ Next: Add google-services.json

The only remaining step is to download and add the `google-services.json` file from Firebase Console!
