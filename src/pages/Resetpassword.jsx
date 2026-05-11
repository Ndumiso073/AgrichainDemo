// src/pages/ResetPassword.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import '@fontsource/bebas-neue'
import '@fontsource/inter'

export default function ResetPassword() {
  const navigate = useNavigate()

  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [focused, setFocused]     = useState(null)
  const [showPass, setShowPass]   = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [done, setDone]           = useState(false)
  const [sessionReady, setSessionReady] = useState(false)
  const [invalidLink, setInvalidLink]   = useState(false)

  // Supabase sends the user here with a hash token in the URL.
  // onAuthStateChange fires with SIGNED_IN when the token is consumed.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          setSessionReady(true)
        } else if (event === 'SIGNED_IN' && session) {
          setSessionReady(true)
        }
      }
    )
    // Fallback: if user already has a session (rare)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSessionReady(true)
    })

    // If nothing fires in 5 s, treat link as invalid/expired
    const timer = setTimeout(() => {
      setSessionReady(prev => {
        if (!prev) setInvalidLink(true)
        return prev
      })
    }, 5000)

    return () => { subscription.unsubscribe(); clearTimeout(timer) }
  }, [])

  // ── Password strength ───────────────────────────────────────────────────
  function getStrength(p) {
    let score = 0
    if (p.length >= 8)          score++
    if (/[A-Z]/.test(p))        score++
    if (/[0-9]/.test(p))        score++
    if (/[^A-Za-z0-9]/.test(p)) score++
    return score
  }
  const strength      = getStrength(password)
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength]
  const strengthColor = ['', '#f87171', '#facc15', '#60a5fa', '#4ade80'][strength]

  async function handleReset(e) {
    e.preventDefault()
    if (password.length < 8)   { setError('Password must be at least 8 characters.'); return }
    if (strength < 2)           { setError('Password is too weak. Add numbers or symbols.'); return }
    if (password !== confirm)   { setError('Passwords do not match.'); return }
    setError('')
    setLoading(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) throw updateError
      setDone(true)
      // Auto-redirect to login after 3 s
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = (field) => ({
    width: '100%',
    background: focused === field ? 'rgba(74,222,128,0.05)' : 'rgba(255,255,255,0.03)',
    border: `1px solid ${focused === field
      ? 'rgba(74,222,128,0.5)'
      : error && !focused ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.1)'}`,
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

  const labelStyle = {
    display: 'block', fontSize: '10px', letterSpacing: '2px',
    textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '8px',
  }

  const Bg = () => (
    <>
      <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(74,222,128,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(74,222,128,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: `linear-gradient(rgba(74,222,128,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(74,222,128,0.03) 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
    </>
  )

  const Logo = ({ subtitle }) => (
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
        {subtitle}
      </p>
    </div>
  )

  // Shared card wrapper
  const Card = ({ children, maxWidth = '420px' }) => (
    <div style={{ minHeight: '100vh', background: '#040902', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif", padding: '24px', position: 'relative', overflow: 'hidden' }}>
      <Bg />
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth, background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(74,222,128,0.15)', borderRadius: '20px', padding: '48px 40px', boxShadow: '0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)', textAlign: 'center' }}>
        <div style={{ position: 'absolute', top: 0, left: '40px', right: '40px', height: '2px', background: 'linear-gradient(to right, transparent, rgba(74,222,128,0.6), transparent)', borderRadius: '0 0 4px 4px' }} />
        {children}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } input::placeholder { color: rgba(255,255,255,0.15); }`}</style>
    </div>
  )

  // ── Loading — waiting for token ─────────────────────────────────────────
  if (!sessionReady && !invalidLink) return (
    <Card>
      <Logo subtitle="Verifying Reset Link" />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '16px 0' }}>
        <span style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid rgba(74,222,128,0.2)', borderTopColor: '#4ade80', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', letterSpacing: '1px', margin: 0 }}>Verifying your reset link...</p>
      </div>
    </Card>
  )

  // ── Invalid / expired link ──────────────────────────────────────────────
  if (invalidLink) return (
    <Card>
      <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      <Logo subtitle="Link Expired" />
      <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '32px', color: '#fff', letterSpacing: '2px', margin: '0 0 12px' }}>
        LINK <span style={{ color: '#f87171' }}>EXPIRED</span>
      </h2>
      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', lineHeight: '1.7', margin: '0 0 32px' }}>
        This reset link is invalid or has expired. Reset links are valid for 1 hour. Please request a new one.
      </p>
      <button
        onClick={() => navigate('/forgot-password')}
        style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, rgba(74,222,128,0.9), rgba(34,197,94,0.8))', border: 'none', borderRadius: '10px', color: '#040902', fontSize: '13px', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Inter', sans-serif", boxShadow: '0 8px 24px rgba(74,222,128,0.25)' }}
      >
        Request New Link →
      </button>
    </Card>
  )

  // ── Success screen ──────────────────────────────────────────────────────
  if (done) return (
    <Card>
      <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '28px' }}>✓</div>
      <Logo subtitle="Password Updated" />
      <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '32px', color: '#fff', letterSpacing: '2px', margin: '0 0 12px' }}>
        PASSWORD <span style={{ color: '#4ade80' }}>RESET</span>
      </h2>
      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', lineHeight: '1.7', margin: '0 0 32px' }}>
        Your password has been updated successfully. Redirecting you to login...
      </p>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        <span style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid rgba(74,222,128,0.3)', borderTopColor: '#4ade80', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', letterSpacing: '1px' }}>Redirecting to login...</span>
      </div>
    </Card>
  )

  // ── Reset form ──────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#040902', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif", padding: '24px', position: 'relative', overflow: 'hidden' }}>
      <Bg />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '420px', background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(74,222,128,0.15)', borderRadius: '20px', padding: '48px 40px', boxShadow: '0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)' }}>
        <div style={{ position: 'absolute', top: 0, left: '40px', right: '40px', height: '2px', background: 'linear-gradient(to right, transparent, rgba(74,222,128,0.6), transparent)', borderRadius: '0 0 4px 4px' }} />

        <Logo subtitle="Set New Password" />

        <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* New password */}
          <div>
            <label style={labelStyle}>New Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'} value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused(null)}
                placeholder="Min. 8 characters"
                required style={{ ...inputStyle('password'), paddingRight: '44px' }}
              />
              <button type="button" onClick={() => setShowPass(p => !p)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '12px', padding: 0 }}>
                {showPass ? 'Hide' : 'Show'}
              </button>
            </div>
            {/* Strength bar */}
            {password && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                  {[1,2,3,4].map(i => (
                    <div key={i} style={{ flex: 1, height: '3px', borderRadius: '2px', background: i <= strength ? strengthColor : 'rgba(255,255,255,0.08)', transition: 'background 0.3s' }} />
                  ))}
                </div>
                <span style={{ fontSize: '10px', color: strengthColor, letterSpacing: '0.5px' }}>{strengthLabel}</span>
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <label style={labelStyle}>Confirm New Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirm ? 'text' : 'password'} value={confirm}
                onChange={e => setConfirm(e.target.value)}
                onFocus={() => setFocused('confirm')}
                onBlur={() => setFocused(null)}
                placeholder="Repeat your new password"
                required style={{
                  ...inputStyle('confirm'),
                  paddingRight: '44px',
                  borderColor: confirm && password !== confirm
                    ? 'rgba(248,113,113,0.5)'
                    : confirm && password === confirm
                      ? 'rgba(74,222,128,0.4)'
                      : focused === 'confirm' ? 'rgba(74,222,128,0.5)' : 'rgba(255,255,255,0.1)',
                }}
              />
              <button type="button" onClick={() => setShowConfirm(p => !p)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '12px', padding: 0 }}>
                {showConfirm ? 'Hide' : 'Show'}
              </button>
            </div>
            {confirm && password !== confirm && (
              <p style={{ fontSize: '10px', color: '#f87171', margin: '5px 0 0' }}>Passwords do not match</p>
            )}
            {confirm && password === confirm && (
              <p style={{ fontSize: '10px', color: '#4ade80', margin: '5px 0 0' }}>✓ Passwords match</p>
            )}
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
                Updating Password...
              </span>
            ) : 'Update Password →'}
          </button>
        </form>

        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(74,222,128,0.5)" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>
          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', letterSpacing: '1px' }}>
            Your new password is encrypted and secure
          </span>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(255,255,255,0.15); }
      `}</style>
    </div>
  )
}