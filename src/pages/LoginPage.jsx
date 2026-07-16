import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthLayout from '../components/auth/AuthLayout'
import GoogleSignInButton from '../components/auth/GoogleSignInButton'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      await login(email, password)
      navigate(location.state?.from || '/studio')
    } catch (err) {
      setError(err.message || 'Could not sign in. Check your details and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleGoogleSuccess() {
    navigate(location.state?.from || '/studio')
  }

  return (
    <AuthLayout eyebrow="Welcome back" title="Sign in to your studio" subtitle="Your generation history is waiting.">
      <GoogleSignInButton onSuccess={handleGoogleSuccess} onError={setError} />

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-panelBorder" />
        <span className="font-mono text-xs text-graphite">or</span>
        <div className="h-px flex-1 bg-panelBorder" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="rounded-md border border-danger/40 bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
            {error}
          </div>
        )}
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
        <label className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-graphite">Password</span>
            <Link to="/forgot-password" className="font-mono text-xs text-marker hover:underline">
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </label>
        <button type="submit" disabled={isSubmitting} className="btn-primary mt-2 w-full">
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-graphite">
        New here?{' '}
        <Link to="/register" className="text-marker hover:underline">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  )
}
