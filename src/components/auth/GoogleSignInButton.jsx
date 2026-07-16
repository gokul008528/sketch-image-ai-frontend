import { useState } from 'react'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { firebaseAuth, isFirebaseConfigured } from '../../api/firebase'
import { useAuth } from '../../context/AuthContext'

function GoogleLogo() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.56 2.7-3.87 2.7-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.94v2.33A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.95 10.7A5.4 5.4 0 0 1 3.68 9c0-.59.1-1.17.27-1.7V4.97H.94A9 9 0 0 0 0 9c0 1.45.35 2.83.94 4.03l3.01-2.33z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .94 4.97l3.01 2.33C4.66 5.17 6.65 3.58 9 3.58z"
      />
    </svg>
  )
}

export default function GoogleSignInButton({ label = 'Continue with Google', onError, onSuccess }) {
  const { loginWithGoogle } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleClick() {
    if (!isFirebaseConfigured) {
      onError?.('Google sign-in isn\u2019t configured yet. Add the VITE_FIREBASE_* keys to .env.')
      return
    }
    setIsSubmitting(true)
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(firebaseAuth, provider)
      const idToken = await result.user.getIdToken()
      const user = await loginWithGoogle(idToken, {
        // Passed through only for the local mock client; the real backend
        // ignores this and derives everything from the verified idToken.
        email: result.user.email,
        name: result.user.displayName,
      })
      onSuccess?.(user)
    } catch (err) {
      if (err?.code === 'auth/popup-closed-by-user') return
      onError?.(err.message || 'Could not sign in with Google. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isSubmitting}
      className="btn-secondary flex w-full items-center justify-center gap-2.5"
    >
      <GoogleLogo />
      {isSubmitting ? 'Signing in…' : label}
    </button>
  )
}
