# OceanSight Frontend

## Overview
The OceanSight frontend is a Vite-powered React application that provides user authentication, image upload, and history visualization for the underwater enhancement + detection pipeline served by the FastAPI backend.

## Features
- **Firebase Authentication** with email/password and Google OAuth.
- **Secure dashboard** gated by `ProtectedRoute` that uploads underwater imagery to the backend.
- **Processing feedback** with loading indicators and error handling for failed requests.
- **Prediction history** stored per user in Firebase Realtime Database, including copyable result links.

## Tech Stack
- **React 18** with functional components and hooks.
- **Vite** for development/build tooling.
- **Tailwind CSS** utility classes (via `index.css`).
- **Firebase Web SDK** (`auth`, `database`, `analytics`).
- **lucide-react** icon library.

## Directory Highlights
```
src/
├── App.jsx              # Router + auth state listener
├── Dashboard.jsx        # Upload workflow, backend integration, results view
├── History.jsx          # Per-user prediction history listing
├── Header.jsx           # Navigation bar with logout + route shortcuts
├── Login.jsx            # Auth form (email/password + Google OAuth)
├── ProtectedRoute.jsx   # Gated routes based on Firebase auth state
├── firebase.js          # Firebase initialization using Vite env vars
├── App.css / index.css  # Styling (legacy + Tailwind directives)
└── main.jsx             # App bootstrap
```

## Environment Variables (`Frontend/.env`)
```
VITE_URL=http://127.0.0.1:8000
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
```
- `VITE_URL` should point to the FastAPI backend base URL (without trailing slash).
- Firebase variables must align with your Firebase project configuration and authorized domains.

## Install & Run
1. `npm install`
2. `npm run dev`
3. Open the Vite dev URL (default `http://127.0.0.1:5173`).

## Build & Preview
1. `npm run build`
2. `npm run preview`

## Backend Contract
- The dashboard posts `multipart/form-data` to `${VITE_URL}/predict` with the selected file and Firebase ID token.
- The UI expects a JSON response containing `original_url`, `enhanced_url`, and `result_url` to render previews and persist history.
- If the backend returns a binary file instead, update the frontend fetch handler accordingly or adjust the API.

## Firebase Data Model
- `users/{uid}`: metadata captured at first login.
- `users/{uid}/predictions/{pushId}`: stored URLs and `timestamp` for each prediction run.

## Testing & Linting
- `npm run lint` (ESLint flat config) keeps code style consistent.

## Troubleshooting
- **Blank screen after login**: Confirm environment variables and that Firebase auth domain matches the dev URL.
- **History empty**: Ensure backend populates the expected JSON fields and Firebase database rules permit read/write for authenticated users.
- **Analytics errors**: Analytics requires HTTPS; consider guarding `getAnalytics` during local development if warnings appear.
