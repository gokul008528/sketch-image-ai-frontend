import { NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../ui/Spinner'

const LINKS = [
  { to: '/history', label: 'History' },
  { to: '/profile', label: 'Profile' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)

  if (!user) return null

  async function handleLogout() {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      await logout()
      navigate('/')
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <aside
      aria-label="Primary"
      className="hidden w-56 shrink-0 flex-col border-r border-panelBorder bg-surface px-3 py-6 md:flex"
    >
      <div className="mb-6 px-2">
        <p className="truncate font-display text-sm font-medium text-chalk">{user.name}</p>
        <p className="truncate font-mono text-xs text-graphite">{user.email}</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {LINKS.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `rounded-md px-3 py-2 font-display text-sm transition-colors ${
                isActive ? 'bg-panel text-chalk' : 'text-graphite hover:bg-panel/60 hover:text-chalk'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        disabled={loggingOut}
        className="mt-4 flex items-center gap-2 rounded-md px-3 py-2 text-left font-display text-sm text-graphite transition-colors hover:bg-panel/60 hover:text-chalk disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loggingOut && <Spinner className="h-3.5 w-3.5" />}
        {loggingOut ? 'Signing out…' : 'Logout'}
      </button>
    </aside>
  )
}
