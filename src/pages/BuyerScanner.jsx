import { useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import '@fontsource/bebas-neue'
import '@fontsource/inter'
import buyerIcon from '../assets/icons/user.png'
import bgImage from '../assets/images/max-O_TVsaeZNlE-unsplash.jpg'

// Mock harvest IDs for quick-scan demo buttons
const DEMO_IDS = ['HC-0012', 'HC-0011', 'HC-0010', 'HC-0009', 'HC-0008']

export default function BuyerScanner() {
  const navigate = useNavigate()
  const [manualId, setManualId]     = useState('')
  const [error, setError]           = useState('')
  const [scanning, setScanning]     = useState(false)
  const [camError, setCamError]     = useState(false)
  const [hoveredBtn, setHoveredBtn] = useState(null)
  const [focused, setFocused]       = useState(false)
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  const account = '0xBuyer...f10a'

  // ── Camera ────────────────────────────────────────────────────────────────
  async function startCamera() {
    setScanning(true)
    setCamError(false)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
    } catch {
      setCamError(true)
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    setScanning(false)
  }

  useEffect(() => () => stopCamera(), [])

  // ── Navigation ────────────────────────────────────────────────────────────
  function goVerify(id) {
    const clean = id.trim().toUpperCase()
    if (!clean) { setError('Please enter a Harvest ID or scan a QR code.'); return }
    navigate(`/verify-result?id=${clean}`)
  }

  function handleManual() {
    if (!manualId.trim()) { setError('Please enter a Harvest ID.'); return }
    setError('')
    goVerify(manualId)
  }

  // shared button style
  const ghostBtn = (key) => ({
    padding: '10px 18px',
    background: hoveredBtn === key ? 'rgba(96,165,250,0.1)' : 'transparent',
    border: '1px solid rgba(96,165,250,0.3)',
    borderRadius: '6px', color: '#60a5fa',
    fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase',
    cursor: 'pointer', transition: 'all 0.2s',
  })

  return (
    <>
      <style>{`
        @keyframes pulse-dot   { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes fadeUp      { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes scanLine    { 0%{top:0%} 50%{top:92%} 100%{top:0%} }
        @keyframes borderPulse { 0%,100%{border-color:rgba(96,165,250,0.3)} 50%{border-color:rgba(96,165,250,0.7)} }
        .buyer-page { animation: fadeUp 0.4s ease both; }
        .scan-border { animation: borderPulse 2s ease-in-out infinite; }
      `}</style>

      <div className="buyer-page" style={{
        fontFamily: "'Inter', sans-serif",
        minHeight: '100vh', background: '#060c04',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background */}
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.18) saturate(0.5)' }} />
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'linear-gradient(135deg, rgba(4,9,2,0.94) 0%, rgba(6,12,4,0.82) 100%)' }} />

        {/* Navbar */}
        <nav style={{
          position: 'sticky', top: 0, zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 32px', height: '60px',
          background: 'rgba(4,9,2,0.85)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(96,165,250,0.10)',
        }}>
          <div onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '20px', letterSpacing: '3px' }}>
              <span style={{ color: '#4ade80' }}>AGRI</span><span style={{ color: '#fff' }}>CHAIN</span>
            </span>
            <span style={{ fontSize: '7px', color: 'rgba(255,255,255,0.25)', letterSpacing: '2px', textTransform: 'uppercase' }}>Blockchain Verified</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={buyerIcon} alt="Buyer" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
            </div>
            <span style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' }}>Buyer Scanner</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 12px', background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.18)', borderRadius: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#60a5fa', display: 'inline-block', animation: 'pulse-dot 2s infinite' }} />
              <span style={{ fontSize: '10px', color: '#60a5fa', fontFamily: 'monospace' }}>{account}</span>
            </div>
            <button
              onClick={() => navigate('/')}
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.35)', fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', padding: '5px 14px', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.35)' }}
            >Exit</button>
          </div>
        </nav>

        {/* Main */}
        <main style={{ position: 'relative', zIndex: 1, maxWidth: '860px', margin: '0 auto', padding: '48px 24px 80px' }}>

          {/* Heading */}
          <div style={{ marginBottom: '40px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: '#60a5fa', margin: '0 0 8px' }}>Verify produce</p>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(40px, 6vw, 68px)', color: '#fff', letterSpacing: '2px', lineHeight: '0.9', margin: '0 0 10px' }}>
              SCAN <span style={{ color: '#60a5fa' }}>& VERIFY</span>
            </h1>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', margin: 0, lineHeight: '1.6' }}>
              Scan a harvest QR code with your camera or enter the Harvest ID manually to pull its blockchain record instantly.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>

            {/* ── Left: Camera scanner ───────────────────────── */}
            <div style={{ background: 'rgba(255,255,255,0.025)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', overflow: 'hidden' }}>
              <div style={{ height: '2px', background: 'linear-gradient(to right, #60a5fa, rgba(96,165,250,0.2), transparent)' }} />
              <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>

                <p style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', margin: 0 }}>Camera QR Scan</p>

                {/* Viewfinder */}
                <div
                  className={scanning ? 'scan-border' : ''}
                  style={{
                    width: '100%', aspectRatio: '1',
                    maxWidth: '280px',
                    position: 'relative',
                    background: scanning ? 'rgba(0,0,0,0.6)' : 'rgba(96,165,250,0.03)',
                    border: scanning ? '1px solid rgba(96,165,250,0.4)' : '1px dashed rgba(255,255,255,0.1)',
                    borderRadius: '12px', overflow: 'hidden',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {scanning && !camError ? (
                    <>
                      <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      {/* Scan line */}
                      <div style={{
                        position: 'absolute', left: 0, right: 0, height: '2px',
                        background: 'linear-gradient(to right, transparent, #60a5fa, transparent)',
                        animation: 'scanLine 2s ease-in-out infinite',
                        boxShadow: '0 0 8px rgba(96,165,250,0.6)',
                      }} />
                      {/* Corner brackets */}
                      {[
                        { top: 8,  left: 8,  borderTop: '2px solid #60a5fa', borderLeft: '2px solid #60a5fa'  },
                        { top: 8,  right: 8, borderTop: '2px solid #60a5fa', borderRight: '2px solid #60a5fa' },
                        { bottom: 8, left: 8,  borderBottom: '2px solid #60a5fa', borderLeft: '2px solid #60a5fa'  },
                        { bottom: 8, right: 8, borderBottom: '2px solid #60a5fa', borderRight: '2px solid #60a5fa' },
                      ].map((s, i) => (
                        <div key={i} style={{ position: 'absolute', width: '16px', height: '16px', ...s, zIndex: 2 }} />
                      ))}
                    </>
                  ) : camError ? (
                    <div style={{ textAlign: 'center', padding: '24px' }}>
                      <div style={{ fontSize: '32px', marginBottom: '10px' }}>📷</div>
                      <p style={{ fontSize: '11px', color: '#f87171', lineHeight: '1.6', margin: 0 }}>Camera access denied. Use manual entry instead.</p>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '24px' }}>
                      <div style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.3 }}>▦</div>
                      <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', lineHeight: '1.6', margin: 0 }}>Camera preview will appear here</p>
                    </div>
                  )}
                </div>

                {/* Camera controls */}
                {!scanning ? (
                  <button
                    onClick={startCamera}
                    style={{
                      width: '100%', padding: '12px',
                      background: hoveredBtn === 'cam' ? 'rgba(96,165,250,0.15)' : 'rgba(96,165,250,0.08)',
                      border: '1px solid rgba(96,165,250,0.4)',
                      borderRadius: '6px', color: '#60a5fa',
                      fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                    onMouseEnter={() => setHoveredBtn('cam')}
                    onMouseLeave={() => setHoveredBtn(null)}
                  >
                    ◉ Start Camera
                  </button>
                ) : (
                  <button
                    onClick={stopCamera}
                    style={{
                      width: '100%', padding: '12px',
                      background: 'rgba(248,113,113,0.08)',
                      border: '1px solid rgba(248,113,113,0.35)',
                      borderRadius: '6px', color: '#f87171',
                      fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                  >
                    ✕ Stop Camera
                  </button>
                )}

                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.18)', textAlign: 'center', margin: 0, lineHeight: '1.6' }}>
                  Point your camera at a harvest QR code. Auto-detection requires the <span style={{ color: '#60a5fa' }}>html5-qrcode</span> library (install separately).
                </p>
              </div>
            </div>

            {/* ── Right: Manual entry + demo ─────────────────── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Manual input card */}
              <div style={{ background: 'rgba(255,255,255,0.025)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', overflow: 'hidden' }}>
                <div style={{ height: '2px', background: 'linear-gradient(to right, #4ade80, rgba(74,222,128,0.2), transparent)' }} />
                <div style={{ padding: '24px' }}>
                  <p style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', margin: '0 0 16px' }}>Manual Entry</p>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', margin: '0 0 16px', lineHeight: '1.6' }}>
                    Enter the Harvest ID printed on the packaging (e.g. <span style={{ color: '#4ade80', fontFamily: 'monospace' }}>HC-0012</span>).
                  </p>

                  <div style={{ marginBottom: '12px' }}>
                    <input
                      type="text"
                      placeholder="e.g. HC-0012"
                      value={manualId}
                      onChange={e => { setManualId(e.target.value); setError('') }}
                      onFocus={() => setFocused(true)}
                      onBlur={() => setFocused(false)}
                      onKeyDown={e => e.key === 'Enter' && handleManual()}
                      style={{
                        width: '100%', padding: '11px 14px',
                        background: focused ? 'rgba(74,222,128,0.04)' : 'rgba(255,255,255,0.03)',
                        border: error ? '1px solid rgba(248,113,113,0.5)' : focused ? '1px solid rgba(74,222,128,0.4)' : '1px solid rgba(255,255,255,0.09)',
                        borderRadius: '8px', color: '#fff',
                        fontSize: '13px', fontFamily: 'monospace',
                        outline: 'none', transition: 'all 0.2s',
                        boxSizing: 'border-box',
                        letterSpacing: '1px',
                      }}
                    />
                    {error && <div style={{ fontSize: '10px', color: '#f87171', marginTop: '5px' }}>{error}</div>}
                  </div>

                  <button
                    onClick={handleManual}
                    style={{
                      width: '100%', padding: '12px',
                      background: hoveredBtn === 'verify' ? 'rgba(74,222,128,0.18)' : 'rgba(74,222,128,0.09)',
                      border: '1px solid rgba(74,222,128,0.45)',
                      borderRadius: '6px', color: '#4ade80',
                      fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase',
                      cursor: 'pointer', transition: 'all 0.2s',
                      transform: hoveredBtn === 'verify' ? 'translateY(-1px)' : 'translateY(0)',
                      boxShadow: hoveredBtn === 'verify' ? '0 6px 20px rgba(74,222,128,0.12)' : 'none',
                    }}
                    onMouseEnter={() => setHoveredBtn('verify')}
                    onMouseLeave={() => setHoveredBtn(null)}
                  >
                    → Verify on Blockchain
                  </button>
                </div>
              </div>

              {/* Demo quick-scan card */}
              <div style={{ background: 'rgba(255,255,255,0.025)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', overflow: 'hidden' }}>
                <div style={{ height: '2px', background: 'linear-gradient(to right, #facc15, rgba(250,204,21,0.2), transparent)' }} />
                <div style={{ padding: '24px' }}>
                  <p style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', margin: '0 0 6px' }}>Demo — Quick Scan</p>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', margin: '0 0 16px', lineHeight: '1.5' }}>
                    Tap any ID below to simulate a QR scan and see the verification result.
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {DEMO_IDS.map(id => (
                      <button
                        key={id}
                        onClick={() => goVerify(id)}
                        style={{
                          padding: '7px 14px',
                          background: hoveredBtn === id ? 'rgba(250,204,21,0.1)' : 'rgba(250,204,21,0.04)',
                          border: '1px solid rgba(250,204,21,0.2)',
                          borderRadius: '6px',
                          color: '#facc15', fontFamily: 'monospace',
                          fontSize: '11px', letterSpacing: '0.5px',
                          cursor: 'pointer', transition: 'all 0.2s',
                        }}
                        onMouseEnter={() => setHoveredBtn(id)}
                        onMouseLeave={() => setHoveredBtn(null)}
                      >
                        {id}
                      </button>
                    ))}
                  </div>
                  <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.15)', margin: '14px 0 0', lineHeight: '1.5' }}>
                    💡 HC-0009 is flagged — try it to see the fraud alert.
                  </p>
                </div>
              </div>

              {/* Info strip */}
              <div style={{ padding: '14px 16px', background: 'rgba(96,165,250,0.04)', border: '1px solid rgba(96,165,250,0.1)', borderRadius: '10px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '16px', flexShrink: 0 }}>🔗</span>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.28)', margin: 0, lineHeight: '1.65' }}>
                  All verification checks query the Polygon blockchain directly. Results are real-time and cannot be forged.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ marginTop: '28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.15)' }}>Powered by Polygon Amoy · SHA-256 verified</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#60a5fa', display: 'inline-block', animation: 'pulse-dot 2s infinite' }} />
              <span style={{ fontSize: '9px', color: 'rgba(96,165,250,0.5)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Live · Block #18,442,211</span>
            </div>
          </div>

        </main>
      </div>
    </>
  )
}