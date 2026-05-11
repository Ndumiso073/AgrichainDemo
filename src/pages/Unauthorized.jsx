// src/pages/Unauthorized.jsx
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '@fontsource/bebas-neue'
import '@fontsource/inter'

export default function Unauthorized() {
  const navigate = useNavigate()
  const { profile, signOut } = useAuth()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#040902',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter', sans-serif", padding: '24px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Red glow */}
      <div style={{
        position: 'absolute', top: '40%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px', height: '600px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(239,68,68,0.07) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '400px',
      }}>
        {/* Icon */}
        <div style={{
          width: '72px', height: '72px', borderRadius: '50%',
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px',
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
          </svg>
        </div>

        <div style={{
          fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase',
          color: '#ef4444', marginBottom: '12px', opacity: 0.8,
        }}>
          Access Denied
        </div>

        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: '52px', color: '#fff', letterSpacing: '2px',
          margin: '0 0 16px', lineHeight: 1,
        }}>
          UNAUTHORIZED
        </h1>

        <p style={{
          color: 'rgba(255,255,255,0.3)', fontSize: '13px', lineHeight: '1.7',
          marginBottom: '32px',
        }}>
          Your role <span style={{ color: 'rgba(239,68,68,0.7)', fontWeight: '600' }}>
            ({profile?.role || 'unknown'})
          </span> does not have permission to access this page.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: '12px 24px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px', color: 'rgba(255,255,255,0.5)',
              fontSize: '12px', cursor: 'pointer',
              fontFamily: "'Inter', sans-serif",
              transition: 'all 0.2s ease',
            }}
          >
            ← Go Back
          </button>
          <button
            onClick={handleSignOut}
            style={{
              padding: '12px 24px',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: '10px', color: '#f87171',
              fontSize: '12px', cursor: 'pointer',
              fontFamily: "'Inter', sans-serif",
              transition: 'all 0.2s ease',
            }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}