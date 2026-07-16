import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { authApi, tokenStore, USE_MOCK } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function bootstrap() {
      const hasToken = USE_MOCK
        ? !!localStorage.getItem('mock_current_user')
        : !!tokenStore.getAccess()
      if (!hasToken) {
        setIsLoading(false)
        return
      }
      try {
        const { user } = await authApi.me()
        setUser(user)
      } catch {
        tokenStore.clear()
        localStorage.removeItem('mock_current_user')
      } finally {
        setIsLoading(false)
      }
    }
    bootstrap()
  }, [])

  const login = useCallback(async (email, password) => {
    setError(null)
    const { user, accessToken, refreshToken } = await authApi.login(email, password)
    tokenStore.set(accessToken, refreshToken)
    if (USE_MOCK) localStorage.setItem('mock_current_user', JSON.stringify(user))
    setUser(user)
    return user
  }, [])

  const register = useCallback(async (name, email, password) => {
    setError(null)
    const { user, accessToken, refreshToken } = await authApi.register(name, email, password)
    tokenStore.set(accessToken, refreshToken)
    if (USE_MOCK) localStorage.setItem('mock_current_user', JSON.stringify(user))
    setUser(user)
    return user
  }, [])

  // idToken is a verified Firebase/Google ID token. The real backend derives
  // the user's name/email from that token server-side; the local mock client
  // can't verify a real token, so it uses mockHint ({ email, name }) instead,
  // passed straight from the Firebase result on the frontend for demo purposes only.
  const loginWithGoogle = useCallback(async (idToken, mockHint) => {
    setError(null)
    const { user, accessToken, refreshToken } = USE_MOCK
      ? await authApi.loginWithGoogle(mockHint)
      : await authApi.loginWithGoogle(idToken)
    tokenStore.set(accessToken, refreshToken)
    if (USE_MOCK) localStorage.setItem('mock_current_user', JSON.stringify(user))
    setUser(user)
    return user
  }, [])

  const requestPasswordReset = useCallback((email) => authApi.requestPasswordReset(email), [])

  const resetPassword = useCallback(
    (token, newPassword) => authApi.resetPassword(token, newPassword),
    []
  )

  const updateProfile = useCallback(async (updates) => {
    const { user } = await authApi.updateProfile(updates)
    if (USE_MOCK) localStorage.setItem('mock_current_user', JSON.stringify(user))
    setUser(user)
    return user
  }, [])

  const logout = useCallback(async () => {
    await authApi.logout()
    tokenStore.clear()
    localStorage.removeItem('mock_current_user')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        setError,
        login,
        register,
        loginWithGoogle,
        requestPasswordReset,
        resetPassword,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
