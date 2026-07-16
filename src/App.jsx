import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import AppShell from './components/layout/AppShell'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import StudioPage from './pages/StudioPage'
import HistoryPage from './pages/HistoryPage'
import ProfilePage from './pages/ProfilePage'

function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth()
  if (isLoading) return <FullScreenLoader />
  if (!user) return <Navigate to="/login" replace />
  return children
}

function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-panelBorder border-t-marker" />
    </div>
  )
}

function AppRoutes() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route
          path="/studio"
          element={
            <ProtectedRoute>
              <StudioPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
