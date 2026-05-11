import { useNavigate, useSearchParams } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import '@fontsource/bebas-neue'
import '@fontsource/inter'
import farmerIcon from '../assets/icons/farmers.png'
import bgImage from '../assets/images/stijn-te-strake-UdhpcfImQ9Y-unsplash.jpg'

// ── Mock harvest lookup (replace with contract call later) ─────────────────
const MOCK_HARVESTS = {
  'HC-0012': { id: 'HC-0012', crop: 'Maize',     date: '2025-04-28', gps: '-29.8579, 31.0292', chemicals: 'None',        status: 'Verified', farmer: '0x4f3a...d92c', hash: '0xa3f1...9c2d' },
  'HC-0011': { id: 'HC-0011', crop: 'Wheat',     date: '2025-04-21', gps: '-29.8621, 31.0310', chemicals: 'Fertiliser',  status: 'Pending',  farmer: '0x4f3a...d92c', hash: '0xb7e2...1a4f' },
  'HC-0010': { id: 'HC-0010', crop: 'Tomatoes',  date: '2025-04-14', gps: '-29.8544, 31.0281', chemicals: 'Pesticide A', status: 'Verified', farmer: '0x4f3a...d92c', hash: '0xc9d3...8b5e' },
  'HC-0009': { id: 'HC-0009', crop: 'Soybean',   date: '2025-04-07', gps: '-29.8598, 31.0305', chemicals: 'None',        status: 'Flagged',  farmer: '0x4f3a...d92c', hash: '0xd4c5...2f7a' },
  'HC-0008': { id: 'HC-0008', crop: 'Sunflower', date: '2025-03-31', gps: '-29.8567, 31.0298', chemicals: 'Herbicide B', status: 'Verified', farmer: '0x4f3a...d92c', hash: '0xe5b6...3g8b' },
}

// ── Tiny QR renderer (pure canvas, no library needed) ─────────────────────
// For production swap this with: import { QRCodeCanvas } from 'qrcode.react'
function QRCanvas({ value, size = 200 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    // Simple visual QR placeholder — replace canvas block with <QRCodeCanvas> from qrcode.react
    const cell = size / 25
    ctx.fillStyle = '#060c04'
    ctx.fillRect(0, 0, size, size)

    // Deterministic pattern from value string
    const seed = value.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
    const rand = (i) => ((seed * 9301 + i * 49297) % 233280) / 233280

    ctx.fillStyle = '#4ade80'

    // Finder squares (corners)
    const drawFinder = (x, y) => {
      ctx.fillStyle = '#4ade80'
      ctx.fillRect(x * cell, y * cell, 7 * cell, 7 * cell)
      ctx.fillStyle = '#060c04'
      ctx.fillRect((x + 1) * cell, (y + 1) * cell, 5 * cell, 5 * cell)
      ctx.fillStyle = '#4ade80'
      ctx.fillRect((x + 2) * cell, (y + 2) * cell, 3 * cell, 3 * cell)
    }
    drawFinder(0, 0)
    drawFinder(18, 0)
    drawFinder(0, 18)

    // Data modules
    for (let row = 0; row < 25; row++) {
      for (let col = 0; col < 25; col++) {
        const inFinder =
          (row < 8 && col < 8) ||
          (row < 8 && col > 16) ||
          (row > 16 && col < 8)
        if (!inFinder && rand(row * 25 + col) > 0.5) {
          ctx.fillStyle = `rgba(74,222,128,${0.6 + rand(row + col * 7) * 0.4})`
          ctx.fillRect(col * cell, row * cell, cell - 0.5, cell - 0.5)
        }
      }
    }
  }, [value, size])

  return <canvas ref={canvasRef} width={size} height={size} style={{ display: 'block' }} />
}

export default function QRViewer() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const harvestId = searchParams.get('id') || 'HC-0012'
  const harvest = MOCK_HARVESTS[harvestId] || MOCK_HARVESTS['HC-0012']

  const [copied, setCopied]       = useState(false)
  const [hoveredBtn, setHoveredBtn] = useState(null)
  const [downloading, setDownloading] = useState(false)

  const verifyUrl = `${window.location.origin}/verify-result?id=${harvest.id}`

  const account = '0x4f3a...d92c'

  const STATUS_COLOR = {
    Verified: { color: '#4ade80', rgb: '74,222,128',  label: '✓ Verified' },
    Pending:  { color: '#facc15', rgb: '250,204,21',  label: '◎ Pending'  },
    Flagged:  { color: '#f87171', rgb: '248,113,113', label: '⚠ Flagged'  },
  }
  const sc = STATUS_COLOR[harvest.status]

  function copyLink() {
    navigator.clipboard.writeText(verifyUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function downloadQR() {
    setDownloading(true)
    setTimeout(() => {
      const canvas = document.querySelector('#qr-canvas canvas')
      if (canvas) {
        const link = document.createElement('a')
        link.download = `AgriChain-${harvest.id}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
      }
      setDownloading(false)
    }, 400)
  }

  return (
    <>
      <style>{`
        @keyframes pulse-dot  { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes fadeUp     { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes qrGlow     { 0%,100%{box-shadow:0 0 24px rgba(74,222,128,0.12)} 50%{box-shadow:0 0 40px rgba(74,222,128,0.22)} }
        .qr-page { animation: fadeUp 0.4s ease both; }
        .qr-glow { animation: qrGlow 3s ease-in-out infinite; }
      `}</style>

      <div
        className="qr-page"
        style={{
          fontFamily: "'Inter', sans-serif",
          minHeight: '100vh',
          background: '#060c04',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background */}
        <div style={{
          position: 'fixed', inset: 0, zIndex: 0,
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          filter: 'brightness(0.18) saturate(0.5)',
        }} />
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'linear-gradient(135deg, rgba(4,9,2,0.94) 0%, rgba(6,12,4,0.82) 100%)' }} />

        {/* Navbar */}
        <nav style={{
          position: 'sticky', top: 0, zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 32px', height: '60px',
          background: 'rgba(4,9,2,0.85)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(74,222,128,0.10)',
        }}>
          <div onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '20px', letterSpacing: '3px' }}>
              <span style={{ color: '#4ade80' }}>AGRI</span><span style={{ color: '#fff' }}>CHAIN</span>
            </span>
            <span style={{ fontSize: '7px', color: 'rgba(255,255,255,0.25)', letterSpacing: '2px', textTransform: 'uppercase' }}>Blockchain Verified</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={farmerIcon} alt="Farmer" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
            </div>
            <span style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' }}>QR Code Viewer</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 12px', background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.18)', borderRadius: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', display: 'inline-block', animation: 'pulse-dot 2s infinite' }} />
              <span style={{ fontSize: '10px', color: '#4ade80', fontFamily: 'monospace' }}>{account}</span>
            </div>
            <button
              onClick={() => navigate('/farmer')}
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.35)', fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', padding: '5px 14px', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.35)' }}
            >
              ← Dashboard
            </button>
          </div>
        </nav>

        {/* Main */}
        <main style={{ position: 'relative', zIndex: 1, maxWidth: '960px', margin: '0 auto', padding: '48px 24px 80px' }}>

          {/* Heading */}
          <div style={{ marginBottom: '40px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: '#4ade80', margin: '0 0 8px' }}>
              Harvest · {harvest.id}
            </p>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(40px, 6vw, 68px)', color: '#fff', letterSpacing: '2px', lineHeight: '0.9', margin: '0 0 10px' }}>
              QR <span style={{ color: '#4ade80' }}>CODE</span>
            </h1>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', margin: 0, lineHeight: '1.6' }}>
              Share or print this QR code. Buyers scan it to instantly verify this harvest on the blockchain.
            </p>
          </div>

          {/* Two-column layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>

            {/* ── Left: QR code card ───────────────────────────── */}
            <div style={{
              background: 'rgba(255,255,255,0.025)',
              backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '16px', overflow: 'hidden',
            }}>
              <div style={{ height: '2px', background: 'linear-gradient(to right, #4ade80, rgba(74,222,128,0.2), transparent)' }} />

              <div style={{ padding: '36px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>

                {/* QR frame */}
                <div style={{ position: 'relative' }}>
                  {/* Corner brackets */}
                  {[
                    { top: -6, left: -6,   borderTop: '2px solid #4ade80', borderLeft: '2px solid #4ade80'  },
                    { top: -6, right: -6,  borderTop: '2px solid #4ade80', borderRight: '2px solid #4ade80' },
                    { bottom: -6, left: -6,  borderBottom: '2px solid #4ade80', borderLeft: '2px solid #4ade80'  },
                    { bottom: -6, right: -6, borderBottom: '2px solid #4ade80', borderRight: '2px solid #4ade80' },
                  ].map((s, i) => (
                    <div key={i} style={{ position: 'absolute', width: '18px', height: '18px', ...s }} />
                  ))}

                  <div
                    id="qr-canvas"
                    className="qr-glow"
                    style={{
                      padding: '16px',
                      background: '#060c04',
                      border: '1px solid rgba(74,222,128,0.15)',
                      borderRadius: '8px',
                    }}
                  >
                    <QRCanvas value={verifyUrl} size={200} />
                  </div>
                </div>

                {/* Harvest ID below QR */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '22px', color: '#4ade80', letterSpacing: '3px' }}>
                    {harvest.id}
                  </div>
                  <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.22)', letterSpacing: '1.5px', textTransform: 'uppercase', marginTop: '4px' }}>
                    AgriChain · Polygon Amoy
                  </div>
                </div>

                {/* Status badge */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '6px 16px',
                  background: `rgba(${sc.rgb},0.08)`,
                  border: `1px solid rgba(${sc.rgb},0.25)`,
                  borderRadius: '20px',
                  fontSize: '10px', letterSpacing: '1px',
                  color: sc.color,
                }}>
                  {sc.label}
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                  <button
                    onClick={downloadQR}
                    disabled={downloading}
                    style={{
                      width: '100%', padding: '11px',
                      background: hoveredBtn === 'download' ? 'rgba(74,222,128,0.15)' : 'rgba(74,222,128,0.08)',
                      border: '1px solid rgba(74,222,128,0.4)',
                      borderRadius: '6px', color: '#4ade80',
                      fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase',
                      cursor: downloading ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                    }}
                    onMouseEnter={() => setHoveredBtn('download')}
                    onMouseLeave={() => setHoveredBtn(null)}
                  >
                    {downloading ? 'Preparing...' : '↓ Download QR Code'}
                  </button>

                  <button
                    onClick={() => window.print()}
                    style={{
                      width: '100%', padding: '11px',
                      background: 'transparent',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '6px', color: 'rgba(255,255,255,0.4)',
                      fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.color = '#fff' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}
                  >
                    ⎙ Print QR Code
                  </button>
                </div>
              </div>
            </div>

            {/* ── Right: Harvest details + share ───────────────── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Harvest details card */}
              <div style={{
                background: 'rgba(255,255,255,0.025)',
                backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '16px', overflow: 'hidden',
              }}>
                <div style={{ height: '2px', background: 'linear-gradient(to right, #4ade80, rgba(74,222,128,0.2), transparent)' }} />
                <div style={{ padding: '24px' }}>
                  <p style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', margin: '0 0 16px' }}>
                    Harvest Details
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                    {[
                      { label: 'Harvest ID',  value: harvest.id,        mono: true  },
                      { label: 'Crop',        value: harvest.crop,      mono: false },
                      { label: 'Date',        value: harvest.date,      mono: false },
                      { label: 'GPS',         value: harvest.gps,       mono: true  },
                      { label: 'Chemicals',   value: harvest.chemicals, mono: false },
                      { label: 'Farmer',      value: harvest.farmer,    mono: true  },
                      { label: 'Block Hash',  value: harvest.hash,      mono: true  },
                    ].map(({ label, value, mono }, i, arr) => (
                      <div key={label} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '11px 0',
                        borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                        gap: '12px',
                      }}>
                        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.28)', letterSpacing: '0.5px', flexShrink: 0 }}>{label}</span>
                        <span style={{
                          fontSize: mono ? '10px' : '12px',
                          fontFamily: mono ? 'monospace' : "'Inter', sans-serif",
                          color: label === 'Harvest ID' ? '#4ade80' : '#fff',
                          textAlign: 'right', wordBreak: 'break-all',
                        }}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Share link card */}
              <div style={{
                background: 'rgba(255,255,255,0.025)',
                backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '16px', overflow: 'hidden',
              }}>
                <div style={{ height: '2px', background: 'linear-gradient(to right, #60a5fa, rgba(96,165,250,0.2), transparent)' }} />
                <div style={{ padding: '24px' }}>
                  <p style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', margin: '0 0 12px' }}>
                    Verification Link
                  </p>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', margin: '0 0 14px', lineHeight: '1.6' }}>
                    Share this link with buyers — it opens the verification page directly.
                  </p>

                  {/* URL box */}
                  <div style={{
                    padding: '10px 14px',
                    background: 'rgba(96,165,250,0.04)',
                    border: '1px solid rgba(96,165,250,0.12)',
                    borderRadius: '6px',
                    marginBottom: '12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px',
                  }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '10px', color: 'rgba(255,255,255,0.4)', wordBreak: 'break-all', lineHeight: '1.5' }}>
                      {verifyUrl}
                    </span>
                  </div>

                  <button
                    onClick={copyLink}
                    style={{
                      width: '100%', padding: '11px',
                      background: copied ? 'rgba(74,222,128,0.1)' : hoveredBtn === 'copy' ? 'rgba(96,165,250,0.12)' : 'rgba(96,165,250,0.06)',
                      border: copied ? '1px solid rgba(74,222,128,0.4)' : '1px solid rgba(96,165,250,0.3)',
                      borderRadius: '6px',
                      color: copied ? '#4ade80' : '#60a5fa',
                      fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                    onMouseEnter={() => setHoveredBtn('copy')}
                    onMouseLeave={() => setHoveredBtn(null)}
                  >
                    {copied ? '✓ Link Copied!' : '⧉ Copy Verification Link'}
                  </button>
                </div>
              </div>

              {/* Scan to verify CTA */}
              <button
                onClick={() => navigate('/buyer')}
                style={{
                  width: '100%', padding: '14px',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px',
                  color: 'rgba(255,255,255,0.25)',
                  fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase',
                  cursor: 'pointer', transition: 'all 0.25s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(96,165,250,0.3)'; e.currentTarget.style.color = '#60a5fa' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.25)' }}
              >
                → Test as Buyer: Open Scanner
              </button>

            </div>
          </div>

          {/* Bottom note */}
          <div style={{ marginTop: '28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.15)' }}>
              QR encodes a verification URL · Data is immutable on-chain
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', display: 'inline-block', animation: 'pulse-dot 2s infinite' }} />
              <span style={{ fontSize: '9px', color: 'rgba(74,222,128,0.5)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Polygon Amoy · Block #18,442,209</span>
            </div>
          </div>

        </main>
      </div>
    </>
  )
}