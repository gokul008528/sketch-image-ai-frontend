import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import ThemeToggle from '../ui/ThemeToggle'

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5 group">
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path
          d="M4 20 C6 10, 10 4, 14 4 C18 4, 20 8, 24 6"
          stroke="rgb(var(--color-graphite))"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="3 4"
          className="transition-all duration-300 group-hover:stroke-marker"
        />
        <path
          d="M4 20 C6 10, 10 4, 14 4 C18 4, 20 8, 24 6"
          stroke="rgb(var(--color-marker))"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="4 40"
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        />
        <circle cx="24" cy="6" r="2.5" fill="rgb(var(--color-marker))" />
      </svg>
      <span className="font-display text-lg font-semibold tracking-tight text-chalk">
        Sketch<span className="text-marker">2</span>Real
      </span>
    </Link>
  )
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-20 border-b border-panelBorder/60 bg-canvas/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex">
          {user ? (
            <>
              <NavLink
                to="/studio"
                className={({ isActive }) =>
                  `rounded-md px-3.5 py-2 font-display text-sm transition-colors ${
                    isActive ? 'text-chalk' : 'text-graphite hover:text-chalk'
                  }`
                }
              >
                Studio
              </NavLink>
              <div className="ml-3 border-l border-panelBorder pl-3">
                <ThemeToggle />
              </div>
            </>
          ) : (
            <>
              <ThemeToggle />
              <Link to="/login" className="rounded-md px-3.5 py-2 font-display text-sm text-graphite hover:text-chalk">
                Sign in
              </Link>
              <Link to="/register" className="btn-primary !px-4 !py-2 text-sm">
                Get started
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            className="flex flex-col gap-1.5"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <span className={`h-0.5 w-6 bg-chalk transition-transform ${menuOpen ? 'translate-y-2 rotate-45' : ''}`} />
          <span className={`h-0.5 w-6 bg-chalk transition-opacity ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`h-0.5 w-6 bg-chalk transition-transform ${menuOpen ? '-translate-y-2 -rotate-45' : ''}`} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-panelBorder bg-canvas px-6 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {user ? (
              <>
                <Link to="/studio" onClick={() => setMenuOpen(false)} className="py-2 font-display text-sm text-chalk">
                  Studio
                </Link>
                <Link to="/history" onClick={() => setMenuOpen(false)} className="py-2 font-display text-sm text-chalk">
                  History
                </Link>
                <Link to="/profile" onClick={() => setMenuOpen(false)} className="py-2 font-display text-sm text-chalk">
                  Profile
                </Link>
                <button onClick={handleLogout} className="py-2 text-left font-display text-sm text-graphite">
                  Sign out ({user.name})
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="py-2 font-display text-sm text-chalk">
                  Sign in
                </Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="py-2 font-display text-sm text-marker">
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
