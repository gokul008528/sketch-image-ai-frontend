import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthLayout from '../components/auth/AuthLayout'
import GoogleSignInButton from '../components/auth/GoogleSignInButton'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleGoogleSuccess() {
    navigate('/studio')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setIsSubmitting(true)
    try {
      await register(name, email, password)
      navigate('/studio')
    } catch (err) {
      setError(err.message || 'Could not create your account. Try a different email.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout eyebrow="Get started" title="Create your account" subtitle="Free to start — no card required.">
      <GoogleSignInButton
        label="Sign up with Google"
        onSuccess={handleGoogleSuccess}
        onError={setError}
      />

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
          <span className="font-mono text-xs text-graphite">Name</span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field"
            placeholder="Ada Lovelace"
            autoComplete="name"
          />
        </label>
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
          <span className="font-mono text-xs text-graphite">Password</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            placeholder="At least 8 characters"
            autoComplete="new-password"
          />
        </label>
        <button type="submit" disabled={isSubmitting} className="btn-primary mt-2 w-full">
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-graphite">
        Already have an account?{' '}
        <Link to="/login" className="text-marker hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
