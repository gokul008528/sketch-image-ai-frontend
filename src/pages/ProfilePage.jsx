import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [status, setStatus] = useState(null) // null | 'saving' | 'saved' | 'error'
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('saving')
    setError(null)
    try {
      await updateProfile({ name })
      setStatus('saved')
    } catch (err) {
      setStatus('error')
      setError(err.message || 'Could not update your profile.')
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <span className="font-mono text-xs uppercase tracking-wider text-marker">Account</span>
      <h1 className="mt-2 font-display text-3xl font-semibold text-chalk">Profile</h1>
      <p className="mt-2 text-sm text-graphite">Manage your account details.</p>

      <div className="card mt-8 p-7">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="rounded-md border border-danger/40 bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
              {error}
            </div>
          )}
          <label className="flex flex-col gap-1.5">
            <span className="font-mono text-xs text-graphite">Name</span>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="font-mono text-xs text-graphite">Email</span>
            <input type="email" value={user?.email || ''} disabled className="input-field opacity-60" />
            <span className="text-xs text-graphite">Contact support to change your email address.</span>
          </label>
          <button type="submit" disabled={status === 'saving'} className="btn-primary mt-2 w-fit">
            {status === 'saving' ? 'Saving…' : 'Save changes'}
          </button>
          {status === 'saved' && <p className="text-sm text-sageBright">Saved.</p>}
        </form>
      </div>
    </main>
  )
}
