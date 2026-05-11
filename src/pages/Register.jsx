// src/pages/Register.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import '@fontsource/bebas-neue'
import '@fontsource/inter'

const ROLES = [
  { value: 'farmer', label: 'Farmer',  desc: 'Register and manage harvests',  accent: '#4ade80', rgb: '74,222,128'  },
  { value: 'buyer',  label: 'Buyer',   desc: 'Scan and verify produce',        accent: '#60a5fa', rgb: '96,165,250'  },
]

export default function Register() {
  const navigate = useNavigate()

  const [step, setStep]           = useState(1) // 1 = details, 2 = success
  const [role, setRole]           = useState('')
  const [fullName, setFullName]   = useState('')
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [focused, setFocused]     = useState(null)
  const [showPass, setShowPass]   = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // ── Password strength ───────────────────────────────────────────────────
  function getStrength(p) {
    let score = 0
    if (p.length >= 8)          score++
    if (/[A-Z]/.test(p))        score++
    if (/[0-9]/.test(p))        score++
    if (/[^A-Za-z0-9]/.test(p)) score++
    return score
  }
  const strength     = getStrength(password)
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength]
  const strengthColor = ['', '#f87171', '#facc15', '#60a5fa', '#4ade80'][strength]

  // ── Validation ──────────────────────────────────────────────────────────
  function validate() {
    if (!fullName.trim())        return 'Full name is required.'
    if (!role)                   return 'Please select a role.'
    if (!email.trim())           return 'Email address is required.'
    if (password.length < 8)    return 'Password must be at least 8 characters.'
    if (strength < 2)            return 'Password is too weak. Add numbers or symbols.'
    if (password !== confirm)    return 'Passwords do not match.'
    return null
  }

  // ── Submit ──────────────────────────────────────────────────────────────
  async function handleRegister(e) {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }
    setError('')
    setLoading(true)

    try {
      // 1. Create Supabase auth user — triggers confirmation email automatically
      const { data, error: signUpError } = await supabase.auth.signUp({
        email:    email.trim(),
        password: password,
        options: {
          data: { full_name: fullName.trim(), role },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      })
      if (signUpError) throw signUpError

      // 2. Insert profile row (role + name stored here too)
      if (data?.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id:        data.user.id,
            full_name: fullName.trim(),
            email:     email.trim(),
            role:      role,
          })
        if (profileError) console.warn('Profile insert error:', profileError.message)
      }

      setStep(2)
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Shared styles ───────────────────────────────────────────────────────
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

  // ── Background + card wrapper (shared) ──────────────────────────────────
  const Bg = () => (
    <>
      <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(74,222,128,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(74,222,128,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: `linear-gradient(rgba(74,222,128,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(74,222,128,0.03) 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
    </>
  )

  // ── Logo ────────────────────────────────────────────────────────────────
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
        Create Your Account
      </p>
    </div>
  )

  // ── Step 2: Success screen ───────────────────────────────────────────────
  if (step === 2) return (
    <div style={{ minHeight: '100vh', background: '#040902', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif", padding: '24px', position: 'relative', overflow: 'hidden' }}>
      <Bg />
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '420px', background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(74,222,128,0.15)', borderRadius: '20px', padding: '48px 40px', boxShadow: '0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)', textAlign: 'center' }}>
        <div style={{ position: 'absolute', top: 0, left: '40px', right: '40px', height: '2px', background: 'linear-gradient(to right, transparent, rgba(74,222,128,0.6), transparent)', borderRadius: '0 0 4px 4px' }} />

        {/* Check circle */}
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '28px' }}>✓</div>

        <Logo />

        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '36px', color: '#fff', letterSpacing: '2px', margin: '0 0 12px' }}>
          CHECK YOUR <span style={{ color: '#4ade80' }}>EMAIL</span>
        </h2>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', lineHeight: '1.7', margin: '0 0 8px' }}>
          We sent a confirmation link to
        </p>
        <p style={{ fontSize: '13px', color: '#4ade80', fontFamily: 'monospace', margin: '0 0 24px', wordBreak: 'break-all' }}>
          {email}
        </p>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', lineHeight: '1.7', margin: '0 0 32px' }}>
          Click the link in the email to activate your account. Check your spam folder if you don't see it within a few minutes.
        </p>

        <button
          onClick={() => navigate('/login')}
          style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, rgba(74,222,128,0.9), rgba(34,197,94,0.8))', border: 'none', borderRadius: '10px', color: '#040902', fontSize: '13px', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Inter', sans-serif", boxShadow: '0 8px 24px rgba(74,222,128,0.25)' }}
        >
          Go to Login →
        </button>
      </div>
      <style>{`input::placeholder { color: rgba(255,255,255,0.15); }`}</style>
    </div>
  )

  // ── Step 1: Registration form ────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#040902', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif", padding: '24px', position: 'relative', overflow: 'hidden' }}>
      <Bg />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '460px', background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(74,222,128,0.15)', borderRadius: '20px', padding: '48px 40px', boxShadow: '0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)' }}>
        <div style={{ position: 'absolute', top: 0, left: '40px', right: '40px', height: '2px', background: 'linear-gradient(to right, transparent, rgba(74,222,128,0.6), transparent)', borderRadius: '0 0 4px 4px' }} />

        <Logo />

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Full name */}
          <div>
            <label style={labelStyle}>Full Name</label>
            <input
              type="text" value={fullName}
              onChange={e => setFullName(e.target.value)}
              onFocus={() => setFocused('name')}
              onBlur={() => setFocused(null)}
              placeholder="e.g. Sipho Dlamini"
              required style={inputStyle('name')}
            />
          </div>

          {/* Role selection */}
          <div>
            <label style={labelStyle}>I am a</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {ROLES.map(r => (
                <div
                  key={r.value}
                  onClick={() => setRole(r.value)}
                  style={{
                    padding: '14px 16px', borderRadius: '10px', cursor: 'pointer',
                    background: role === r.value ? `rgba(${r.rgb},0.08)` : 'rgba(255,255,255,0.02)',
                    border: role === r.value ? `1px solid rgba(${r.rgb},0.45)` : '1px solid rgba(255,255,255,0.08)',
                    transition: 'all 0.2s',
                    boxShadow: role === r.value ? `0 0 0 3px rgba(${r.rgb},0.08)` : 'none',
                  }}
                >
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '18px', color: role === r.value ? r.accent : '#fff', letterSpacing: '1px', marginBottom: '3px' }}>{r.label}</div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.28)', lineHeight: '1.4' }}>{r.desc}</div>
                  {role === r.value && (
                    <div style={{ marginTop: '6px', width: '16px', height: '16px', borderRadius: '50%', background: `rgba(${r.rgb},0.15)`, border: `1px solid rgba(${r.rgb},0.5)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: r.accent }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Email */}
          <div>
            <label style={labelStyle}>Email Address</label>
            <input
              type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              onFocus={() => setFocused('email')}
              onBlur={() => setFocused(null)}
              placeholder="you@example.com"
              required style={inputStyle('email')}
            />
          </div>

          {/* Password */}
          <div>
            <label style={labelStyle}>Password</label>
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
            <label style={labelStyle}>Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirm ? 'text' : 'password'} value={confirm}
                onChange={e => setConfirm(e.target.value)}
                onFocus={() => setFocused('confirm')}
                onBlur={() => setFocused(null)}
                placeholder="Repeat your password"
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

          {/* Error */}
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', padding: '10px 14px', color: '#f87171', fontSize: '12px', lineHeight: '1.5' }}>
              ⚠ {error}
            </div>
          )}

          {/* Submit */}
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
                Creating Account...
              </span>
            ) : 'Create Account →'}
          </button>
        </form>

        {/* Footer links */}
        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', margin: 0 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#4ade80', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(74,222,128,0.5)" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', letterSpacing: '1px' }}>
              Email confirmation required to activate account
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(255,255,255,0.15); }
      `}</style>
    </div>
  )
}