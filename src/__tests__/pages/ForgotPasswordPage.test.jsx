import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ForgotPasswordPage from '../../pages/ForgotPasswordPage'
import { useAuth } from '../../context/AuthContext'

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}))

describe('ForgotPasswordPage', () => {
  it('shows the generic success message even when the request rejects', async () => {
    useAuth.mockReturnValue({
      requestPasswordReset: vi.fn().mockRejectedValue(new Error('nope')),
    })
    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>
    )

    fireEvent.change(screen.getByPlaceholderText('you@studio.com'), {
      target: { value: 'someone@example.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: /send reset link/i }))

    await waitFor(() => expect(screen.getByText(/reset link sent/i)).toBeInTheDocument())
  })
})
