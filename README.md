# Bobby Media Mobile App (Android / iOS / Web)

This is the standalone React Native & Expo mobile application for **Bobby Media**.

## Features
- **Customer Portal**: Dashboard, Bookings Timeline, Photo Gallery with download, Reward Points, Profile management.
- **Admin Portal**: Revenue Dashboard, Booking status workflow, Manual Payment Recording, Photo/Camera Uploader.
- **Cross-Platform**: Runs on Android, iOS, and Web.

## Quick Start

### 1. Install Dependencies
`ash
npm install
`

### 2. Configure Backend API
The mobile app connects to your Render backend API in pi/index.ts. You can also configure:
`env
EXPO_PUBLIC_API_URL=https://bobby-media-api.onrender.com/api
`

### 3. Run the App
`ash
# Start Expo interactive CLI
npx expo start

# Shortcuts in terminal:
# Press 'a' -> Run on Android Emulator or Expo Go
# Press 'i' -> Run on iOS Simulator or Expo Go
# Press 'w' -> Run Mobile Web in browser (http://localhost:8081)
`

## Push to Separate GitHub Repository
`ash
git remote add origin https://github.com/<your-username>/bobby-media-mobile.git
git branch -M main
git push -u origin main
`
