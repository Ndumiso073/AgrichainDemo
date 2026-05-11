// src/pages/ForgotPassword.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import '@fontsource/bebas-neue'
import '@fontsource/inter'

export default function ForgotPassword() {
  const [email, setEmail]   = useState('')
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(null)
  const [sent, setSent]     = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim()) { setError('Please enter your email address.'); return }
    setError('')
    setLoading(true)
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        { redirectTo: `${window.location.origin}/reset-password` }
      )
      if (resetError) throw resetError
      setSent(true)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = (field) => ({
    width: '100%',
    background: focused === field ? 'rgba(74,222,128,0.05)' : 'rgba(255,255,255,0.03)',
    border: `1px solid ${focused === field
      ? 'rgba(74,222,128,0.5)'
      : error ? 'rgba(239,68,68,0.35)' : 'rgba(255,255,255,0.1)'}`,
    borderRadius: '10px',
    padding: '14px 16px',
    color: '#fff',
    fontSize: '14px',
    fontFamily: "'Inter', sans-serif",
    outline: 'none',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
    boxShadow: focused === field ? '0 0 0 3px rgba(74,222,128,0.08)' : 'none',
  })

  const Bg = () => (
    <>
      <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(74,222,128,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(74,222,128,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: `linear-gradient(rgba(74,222,128,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(74,222,128,0.03) 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
    </>
  )

  const Logo = () => (
    <div style={{ textAlign: 'center', marginBottom: '28px' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path d="M16 2L28 9V23L16 30L4 23V9L16 2Z" stroke="rgba(74,222,128,0.8)" strokeWidth="1.5" fill="rgba(74,222,128,0.08)" />
          <path d="M16 8L23 12V20L16 24L9 20V12L16 8Z" fill="rgba(74,222,128,0.15)" stroke="rgba(74,222,128,0.4)" strokeWidth="1" />
          <circle cx="16" cy="16" r="3" fill="rgba(74,222,128,0.7)" />
        </svg>
        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '28px', color: '#fff', letterSpacing: '3px' }}>
          AGRI<span style={{ color: '#4ade80' }}>CHAIN</span>
        </span>
      </div>
      <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', letterSpacing: '2px', textTransform: 'uppercase', margin: 0 }}>
        Password Recovery
      </p>
    </div>
  )

  // ── Success screen ──────────────────────────────────────────────────────
  if (sent) return (
    <div style={{ minHeight: '100vh', background: '#040902', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif", padding: '24px', position: 'relative', overflow: 'hidden' }}>
      <Bg />
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '420px', background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(74,222,128,0.15)', borderRadius: '20px', padding: '48px 40px', boxShadow: '0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)', textAlign: 'center' }}>
        <div style={{ position: 'absolute', top: 0, left: '40px', right: '40px', height: '2px', background: 'linear-gradient(to right, transparent, rgba(74,222,128,0.6), transparent)', borderRadius: '0 0 4px 4px' }} />

        {/* Email icon */}
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="1.5">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
        </div>

        <Logo />

        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '32px', color: '#fff', letterSpacing: '2px', margin: '0 0 12px' }}>
          CHECK YOUR <span style={{ color: '#4ade80' }}>EMAIL</span>
        </h2>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', lineHeight: '1.7', margin: '0 0 8px' }}>
          A password reset link was sent to
        </p>
        <p style={{ fontSize: '13px', color: '#4ade80', fontFamily: 'monospace', margin: '0 0 24px', wordBreak: 'break-all' }}>
          {email}
        </p>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', lineHeight: '1.7', margin: '0 0 32px' }}>
          Click the link in the email to reset your password. The link expires in 1 hour. Check your spam folder if you don't see it.
        </p>

        <Link to="/login" style={{ display: 'block', width: '100%', padding: '14px', background: 'linear-gradient(135deg, rgba(74,222,128,0.9), rgba(34,197,94,0.8))', border: 'none', borderRadius: '10px', color: '#040902', fontSize: '13px', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Inter', sans-serif", boxShadow: '0 8px 24px rgba(74,222,128,0.25)', textDecoration: 'none', boxSizing: 'border-box' }}>
          Back to Login →
        </Link>

        <button
          onClick={() => { setSent(false); setEmail('') }}
          style={{ marginTop: '12px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.25)', fontSize: '11px', cursor: 'pointer', letterSpacing: '0.5px', fontFamily: "'Inter', sans-serif" }}
        >
          Try a different email
        </button>
      </div>
    </div>
  )

  // ── Form ────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#040902', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif", padding: '24px', position: 'relative', overflow: 'hidden' }}>
      <Bg />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '420px', background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(74,222,128,0.15)', borderRadius: '20px', padding: '48px 40px', boxShadow: '0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)' }}>
        <div style={{ position: 'absolute', top: 0, left: '40px', right: '40px', height: '2px', background: 'linear-gradient(to right, transparent, rgba(74,222,128,0.6), transparent)', borderRadius: '0 0 4px 4px' }} />

        <Logo />

        {/* Info box */}
        <div style={{ background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.15)', borderRadius: '10px', padding: '14px 16px', marginBottom: '24px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" style={{ marginTop: '1px', flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', lineHeight: '1.6', margin: 0 }}>
            Enter the email address linked to your AgriChain account and we'll send you a secure reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '8px' }}>
              Email Address
            </label>
            <input
              type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              onFocus={() => setFocused('email')}
              onBlur={() => setFocused(null)}
              placeholder="you@example.com"
              required style={inputStyle('email')}
            />
          </div>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', padding: '10px 14px', color: '#f87171', fontSize: '12px', lineHeight: '1.5' }}>
              ⚠ {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            marginTop: '4px', width: '100%', padding: '14px',
            background: loading ? 'rgba(74,222,128,0.3)' : 'linear-gradient(135deg, rgba(74,222,128,0.9), rgba(34,197,94,0.8))',
            border: 'none', borderRadius: '10px',
            color: loading ? 'rgba(255,255,255,0.5)' : '#040902',
            fontSize: '13px', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase',
            cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s ease',
            fontFamily: "'Inter', sans-serif",
            boxShadow: loading ? 'none' : '0 8px 24px rgba(74,222,128,0.25)',
          }}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                Sending Reset Link...
              </span>
            ) : 'Send Reset Link →'}
          </button>
        </form>

        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', margin: 0 }}>
            Remember your password?{' '}
            <Link to="/login" style={{ color: '#4ade80', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(255,255,255,0.15); }
      `}</style>
    </div>
  )
}