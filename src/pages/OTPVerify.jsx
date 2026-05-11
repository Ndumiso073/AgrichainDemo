// src/pages/OTPVerify.jsx
import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import '@fontsource/bebas-neue'
import '@fontsource/inter'

export default function OTPVerify() {
  const navigate = useNavigate()
  const location = useLocation()
  const { profile, loading } = useAuth()

  const email   = location.state?.email   || ''
  const skipOtp = location.state?.skipOtp || false

  const [otp, setOtp]             = useState(['', '', '', '', '', ''])
  const [error, setError]         = useState('')
  const [loadingVerify, setLoadingVerify] = useState(false)
  const [resending, setResending] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [verified, setVerified]   = useState(false)
  const inputRefs = useRef([])
  const redirected = useRef(false)

  // skipOtp: only redirect once profile is loaded
  useEffect(() => {
    if (!skipOtp) return
    if (loading) return          // still fetching session
    if (!profile) return         // still fetching profile
    if (redirected.current) return  // already redirected
    redirected.current = true
    if (profile.role === 'farmer') navigate('/farmer', { replace: true })
    else if (profile.role === 'buyer') navigate('/buyer', { replace: true })
    else if (profile.role === 'admin') navigate('/admin', { replace: true })
    else navigate('/farmer', { replace: true })
  }, [skipOtp, profile, loading, navigate])

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  // Redirect if no email and not skipOtp
  useEffect(() => {
    if (!email && !skipOtp) navigate('/login')
  }, [email, skipOtp, navigate])

  function handleOtpChange(index, value) {
    if (!/^\d*$/.test(value)) return
    const next = [...otp]
    next[index] = value.slice(-1)
    setOtp(next)
    setError('')
    if (value && index < 5) inputRefs.current[index + 1]?.focus()
    if (next.every(d => d !== '') && value) handleVerify(next.join(''))
  }

  function handleKeyDown(index, e) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  function handlePaste(e) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setOtp(pasted.split(''))
      handleVerify(pasted)
    }
  }

  async function handleVerify(code) {
    setLoadingVerify(true)
    setError('')
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email, token: code, type: 'email',
      })
      if (verifyError) throw verifyError
      setVerified(true)
      setTimeout(() => {
        const role = profile?.role
        if (role === 'farmer') navigate('/farmer', { replace: true })
        else if (role === 'buyer') navigate('/buyer', { replace: true })
        else if (role === 'admin') navigate('/admin', { replace: true })
        else navigate('/farmer', { replace: true })
      }, 1500)
    } catch (err) {
      setError('Invalid or expired code. Please try again.')
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setLoadingVerify(false)
    }
  }

  async function resendOtp() {
    if (countdown > 0) return
    setResending(true)
    setError('')
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email, options: { shouldCreateUser: false },
      })
      if (error) throw error
      setCountdown(60)
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } catch (err) {
      setError('Failed to resend code. Try again.')
    } finally {
      setResending(false)
    }
  }

  // Show loading spinner while waiting for profile on skipOtp
  if (skipOtp && (loading || !profile)) {
    return (
      <div style={{
        minHeight: '100vh', background: '#040902',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '16px',
      }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '50%',
          border: '2px solid rgba(74,222,128,0.2)',
          borderTopColor: '#4ade80',
          animation: 'spin 0.7s linear infinite',
        }} />
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase' }}>
          Loading your profile...
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#040902',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter', sans-serif", padding: '24px',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: '30%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '700px', height: '700px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(74,222,128,0.05) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `
          linear-gradient(rgba(74,222,128,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(74,222,128,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }} />

      <div style={{
        position: 'relative', zIndex: 1, width: '100%', maxWidth: '420px',
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        border: `1px solid ${verified ? 'rgba(74,222,128,0.5)' : 'rgba(74,222,128,0.15)'}`,
        borderRadius: '20px', padding: '48px 40px',
        boxShadow: verified
          ? '0 32px 80px rgba(74,222,128,0.15), inset 0 1px 0 rgba(255,255,255,0.06)'
          : '0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
        transition: 'all 0.4s ease',
      }}>
        <div style={{
          position: 'absolute', top: 0, left: '40px', right: '40px', height: '2px',
          background: verified
            ? 'linear-gradient(to right, transparent, rgba(74,222,128,1), transparent)'
            : 'linear-gradient(to right, transparent, rgba(74,222,128,0.6), transparent)',
          borderRadius: '0 0 4px 4px', transition: 'all 0.4s ease',
        }} />

        {verified ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'rgba(74,222,128,0.12)', border: '2px solid rgba(74,222,128,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px', animation: 'pulse-green 1s ease infinite',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h2 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '36px', color: '#4ade80', letterSpacing: '2px', margin: '0 0 8px',
            }}>VERIFIED</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
              Identity confirmed. Redirecting...
            </p>
          </div>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: '36px' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="1.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <h2 style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: '32px', color: '#fff', letterSpacing: '2px', margin: '0 0 8px',
              }}>
                TWO-FACTOR <span style={{ color: '#4ade80' }}>AUTH</span>
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', lineHeight: '1.6', margin: 0 }}>
                A 6-digit code was sent to<br />
                <span style={{ color: 'rgba(74,222,128,0.7)', fontWeight: '600' }}>{email}</span>
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '24px' }}>
              {otp.map((digit, i) => (
                <input
                  key={i} ref={el => inputRefs.current[i] = el}
                  type="text" inputMode="numeric" maxLength={1}
                  value={digit}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  onPaste={i === 0 ? handlePaste : undefined}
                  disabled={loadingVerify}
                  style={{
                    width: '48px', height: '56px', textAlign: 'center',
                    fontSize: '22px', fontWeight: '700', color: '#fff',
                    background: digit ? 'rgba(74,222,128,0.08)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${digit ? 'rgba(74,222,128,0.5)' : 'rgba(255,255,255,0.12)'}`,
                    borderRadius: '10px', outline: 'none', transition: 'all 0.15s ease',
                    caretColor: '#4ade80', fontFamily: "'Inter', sans-serif",
                    cursor: loadingVerify ? 'not-allowed' : 'text',
                  }}
                />
              ))}
            </div>

            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: '8px', padding: '10px 14px', color: '#f87171',
                fontSize: '12px', textAlign: 'center', marginBottom: '16px',
              }}>⚠ {error}</div>
            )}

            {loadingVerify && (
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <span style={{
                  display: 'inline-block', width: '20px', height: '20px', borderRadius: '50%',
                  border: '2px solid rgba(74,222,128,0.2)', borderTopColor: '#4ade80',
                  animation: 'spin 0.7s linear infinite',
                }} />
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', marginLeft: '8px' }}>
                  Verifying...
                </span>
              </div>
            )}

            <div style={{ textAlign: 'center' }}>
              <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px', marginBottom: '8px' }}>
                Didn't receive it?
              </p>
              <button onClick={resendOtp} disabled={countdown > 0 || resending} style={{
                background: 'none', border: 'none',
                color: countdown > 0 ? 'rgba(255,255,255,0.2)' : '#4ade80',
                fontSize: '12px', cursor: countdown > 0 ? 'default' : 'pointer',
                fontFamily: "'Inter', sans-serif", transition: 'color 0.2s ease',
              }}>
                {resending ? 'Sending...' : countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
              </button>
            </div>

            <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <button onClick={() => navigate('/login')} style={{
                background: 'none', border: 'none',
                color: 'rgba(255,255,255,0.2)', fontSize: '11px',
                cursor: 'pointer', fontFamily: "'Inter', sans-serif", letterSpacing: '0.5px',
              }}>
                ← Back to login
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse-green {
          0%, 100% { box-shadow: 0 0 0 0 rgba(74,222,128,0.3); }
          50% { box-shadow: 0 0 0 12px rgba(74,222,128,0); }
        }
      `}</style>
    </div>
  )
}