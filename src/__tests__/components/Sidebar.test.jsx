import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Sidebar from '../../components/layout/Sidebar'
import { useAuth } from '../../context/AuthContext'

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}))

describe('Sidebar', () => {
  it('renders nothing when there is no authenticated user', () => {
    useAuth.mockReturnValue({ user: null, logout: vi.fn() })
    const { container } = render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('shows History, Profile, and Logout for an authenticated user', () => {
    useAuth.mockReturnValue({
      user: { name: 'Ada Lovelace', email: 'ada@studio.com' },
      logout: vi.fn(),
    })
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    )
    expect(screen.getByText('History')).toBeInTheDocument()
    expect(screen.getByText('Profile')).toBeInTheDocument()
    expect(screen.getByText('Logout')).toBeInTheDocument()
  })
})
