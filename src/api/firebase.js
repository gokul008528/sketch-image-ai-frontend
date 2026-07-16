/**
 * Firebase is used on the frontend ONLY for the Google Sign-In popup and to
 * mint a Google ID token. That token is exchanged for our own app session at
 * POST /api/auth/google (see client.js) — Firebase never issues our app's
 * access/refresh tokens, and no other part of the app talks to Firebase.
 *
 * Fill in the VITE_FIREBASE_* values in .env (see .env.example) with the
 * config from the Firebase console (Project settings > General > Your apps).
 * Only Google sign-in needs to be enabled under Authentication > Sign-in method.
 */
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const hasAllFields = Boolean(
  firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId
)

let firebaseAuth = null
let isConfigured = false

if (hasAllFields) {
  try {
    const app = initializeApp(firebaseConfig)
    firebaseAuth = getAuth(app)
    isConfigured = true
  } catch (err) {
    // A bad/invalid key (e.g. auth/invalid-api-key) should disable the
    // Google button, not crash the whole app. Surface it loudly in dev so
    // it isn't a silent mystery, but never let it take down the page.
    // eslint-disable-next-line no-console
    console.error(
      '[firebase] Failed to initialize with the configured VITE_FIREBASE_* values — ' +
        'double-check them against Firebase console > Project settings > General > Your apps. ' +
        '"Continue with Google" is disabled until this is fixed.',
      err
    )
  }
} else if (import.meta.env.DEV) {
  // Loud in dev so "Continue with Google" failing isn't a mystery; harmless
  // in prod builds where env vars should always be set.
  // eslint-disable-next-line no-console
  console.warn(
    '[firebase] VITE_FIREBASE_* env vars are missing — "Continue with Google" will not work until they are set in .env.'
  )
}

export { firebaseAuth, isConfigured as isFirebaseConfigured }
