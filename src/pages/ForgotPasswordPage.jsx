import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthLayout from '../components/auth/AuthLayout'

export default function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await requestPasswordReset(email)
    } catch {
      // Intentionally ignored: always show the same success state below so
      // the response can't be used to check which emails have accounts.
    } finally {
      setIsSubmitting(false)
      setSent(true)
    }
  }

  if (sent) {
    return (
      <AuthLayout eyebrow="Check your inbox" title="Reset link sent">
        <p className="text-sm text-graphite">
          If an account exists for <span className="text-chalk">{email}</span>, we&apos;ve sent a
          link to reset your password. It may take a few minutes to arrive.
        </p>
        <Link to="/login" className="mt-6 inline-block text-sm text-marker hover:underline">
          Back to sign in
        </Link>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      eyebrow="Trouble signing in"
      title="Reset your password"
      subtitle="We'll email you a link to get back in."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-xs text-graphite">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            placeholder="you@studio.com"
            autoComplete="email"
          />
        </label>
        <button type="submit" disabled={isSubmitting} className="btn-primary mt-2 w-full">
          {isSubmitting ? 'Sending…' : 'Send reset link'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-graphite">
        Remembered it?{' '}
        <Link to="/login" className="text-marker hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
