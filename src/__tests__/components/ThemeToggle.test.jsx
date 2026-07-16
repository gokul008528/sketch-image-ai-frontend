import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider } from '../../context/ThemeContext'
import ThemeToggle from '../../components/ui/ThemeToggle'

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
  })

  it('defaults to the light theme when no preference is stored', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    )
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    expect(screen.getByTitle('Light')).toHaveAttribute('aria-pressed', 'true')
  })

  it('persists the chosen theme to localStorage and updates the DOM', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    )

    fireEvent.click(screen.getByTitle('Dark'))

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(localStorage.getItem('s2r_theme_preference')).toBe('dark')
    expect(screen.getByTitle('Dark')).toHaveAttribute('aria-pressed', 'true')
  })
})
