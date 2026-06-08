// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * ProtectedRoute
 * - allowedRoles: array of roles allowed (e.g. ['farmer'], ['admin'], ['farmer','admin'])
 * - If not logged in → redirect to /login
 * - If logged in but wrong role → redirect to /unauthorized
 * - If loading → show spinner
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, profile, loading } = useAuth()

  // Still fetching session
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', background: '#040902',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: '16px',
      }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%',
          border: '2px solid rgba(74,222,128,0.2)',
          borderTopColor: '#4ade80',
          animation: 'spin 0.7s linear infinite',
        }} />
        <span style={{
          color: 'rgba(255,255,255,0.2)', fontSize: '11px',
          letterSpacing: '2px', textTransform: 'uppercase',
          fontFamily: 'Inter, sans-serif',
        }}>
          Checking session...
        </span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  // Not authenticated
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Authenticated but profile not yet loaded → keep waiting
if (user && !profile) {
  return (
    <div style={{
      minHeight: '100vh', background: '#040902',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: '16px',
    }}>
      <div style={{
        width: '32px', height: '32px', borderRadius: '50%',
        border: '2px solid rgba(74,222,128,0.2)',
        borderTopColor: '#4ade80',
        animation: 'spin 0.7s linear infinite',
      }} />
      <span style={{
        color: 'rgba(255,255,255,0.2)', fontSize: '11px',
        letterSpacing: '2px', textTransform: 'uppercase',
        fontFamily: 'Inter, sans-serif',
      }}>
        Loading profile...
      </span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

  // Authenticated but role not allowed
  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}