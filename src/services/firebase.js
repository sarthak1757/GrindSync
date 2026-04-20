import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const readEnv = (key) =>
  String(import.meta.env[key] ?? '')
    .trim()
    .replace(/^['"]|['"]$/g, '')

const firebaseConfig = {
  apiKey: readEnv('VITE_FIREBASE_API_KEY'),
  authDomain: readEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: readEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: readEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: readEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: readEnv('VITE_FIREBASE_APP_ID'),
}

let app = null
let firebaseConfigError = null

try {
  const hasMinimumConfig = Boolean(
    firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.appId,
  )

  if (!hasMinimumConfig) throw new Error('missing-config')

  app = getApps().length ? getApp() : initializeApp(firebaseConfig)
} catch (error) {
  firebaseConfigError = 'Firebase configuration is invalid'
  // Keep technical detail in console, not in user-facing UI.
  console.error('[Firebase Init Error]', error)
}

export const auth = app ? getAuth(app) : null
export const db = app ? getFirestore(app) : null
export { firebaseConfigError }
