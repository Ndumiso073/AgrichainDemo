import { useNavigate, useSearchParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import '@fontsource/bebas-neue'
import '@fontsource/inter'
import buyerIcon from '../assets/icons/user.png'
import bgImage from '../assets/images/max-O_TVsaeZNlE-unsplash.jpg'

// ── Mock blockchain data (replace with contract call later) ────────────────
const MOCK_HARVESTS = {
  'HC-0012': { id: 'HC-0012', crop: 'Maize',     date: '2025-04-28', gps: '-29.8579, 31.0292', chemicals: 'None',        status: 'Verified', scans: 4,  farmer: '0x4f3a...d92c', hash: '0xa3f19c2d8b1e4f6a7d3c2b1e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0' },
  'HC-0011': { id: 'HC-0011', crop: 'Wheat',     date: '2025-04-21', gps: '-29.8621, 31.0310', chemicals: 'Fertiliser',  status: 'Pending',  scans: 0,  farmer: '0x4f3a...d92c', hash: '0xb7e21a4f9c3d8e2f5a6b1c7d4e9f0a3b8c5d2e7f4a1b6c3d8e5f2a9b4c1d6e3' },
  'HC-0010': { id: 'HC-0010', crop: 'Tomatoes',  date: '2025-04-14', gps: '-29.8544, 31.0281', chemicals: 'Pesticide A', status: 'Verified', scans: 11, farmer: '0x4f3a...d92c', hash: '0xc9d38b5e2a7f1c6b4d9e3f8a5c2b7d4e1f6a9b3c8d5e2f7a4b1c6d3e8f5a2b9' },
  'HC-0009': { id: 'HC-0009', crop: 'Soybean',   date: '2025-04-07', gps: '-29.8598, 31.0305', chemicals: 'None',        status: 'Flagged',  scans: 23, farmer: '0x4f3a...d92c', hash: '0xd4c52f7a1b8e3c6d9f2a5b8e1c4d7f0a3b6c9d2e5f8a1b4c7d0e3f6a9b2c5d8' },
  'HC-0008': { id: 'HC-0008', crop: 'Sunflower', date: '2025-03-31', gps: '-29.8567, 31.0298', chemicals: 'Herbicide B', status: 'Verified', scans: 7,  farmer: '0x4f3a...d92c', hash: '0xe5b63g8b4c1d7f2a9e6b3c0d5f8a2b7c4d1e8f5a2b9c6d3e0f7a4b1c8d5e2f9' },
}

const SCAN_TIMESTAMPS = [
  '2025-05-01 09:14:22', '2025-05-02 14:32:07', '2025-05-03 08:55:41',
  '2025-05-04 11:22:19', '2025-05-05 16:44:33', '2025-05-06 10:08:55',
]

export default function VerifyResult() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const id = searchParams.get('id')?.toUpperCase() || 'HC-0012'

  const [loading, setLoading]     = useState(true)
  const [harvest, setHarvest]     = useState(null)
  const [notFound, setNotFound]   = useState(false)
  const [hoveredBtn, setHoveredBtn] = useState(null)

  // Simulate blockchain fetch
  useEffect(() => {
    setLoading(true)
    setNotFound(false)
    const t = setTimeout(() => {
      const data = MOCK_HARVESTS[id]
      if (data) setHarvest(data)
      else setNotFound(true)
      setLoading(false)
    }, 1800)
    return () => clearTimeout(t)
  }, [id])

  const isFlagged  = harvest?.status === 'Flagged'
  const isVerified = harvest?.status === 'Verified'
  const isPending  = harvest?.status === 'Pending'

  const accentColor = isFlagged ? '#f87171' : isVerified ? '#4ade80' : '#facc15'
  const accentRgb   = isFlagged ? '248,113,113' : isVerified ? '74,222,128' : '250,204,21'

  // ── Loading screen ─────────────────────────────────────────────────────
  if (loading) return (
    <>
      <style>{`
        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
      <div style={{ fontFamily: "'Inter', sans-serif", minHeight: '100vh', background: '#060c04', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px', animation: 'fadeIn 0.3s ease' }}>
        <div style={{ position: 'fixed', inset: 0, backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.15) saturate(0.4)' }} />
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(4,9,2,0.90)' }} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '52px', height: '52px', border: '2px solid rgba(74,222,128,0.15)', borderTopColor: '#4ade80', borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: '#4ade80', margin: '0 0 6px' }}>Querying Blockchain</p>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', margin: 0, fontFamily: 'monospace' }}>Fetching record · {id}</p>
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', opacity: 0.4, animation: `pulse-dot 1.2s ease ${i * 0.2}s infinite` }} />
            ))}
          </div>
        </div>
      </div>
    </>
  )

  // ── Not found screen ───────────────────────────────────────────────────
  if (notFound) return (
    <>
      <style>{`@keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }`}</style>
      <div style={{ fontFamily: "'Inter', sans-serif", minHeight: '100vh', background: '#060c04', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <div style={{ position: 'fixed', inset: 0, backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.15) saturate(0.4)' }} />
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(4,9,2,0.90)' }} />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '420px', padding: '0 24px', animation: 'fadeUp 0.4s ease' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠</div>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '48px', color: '#f87171', letterSpacing: '2px', margin: '0 0 12px' }}>NOT FOUND</h2>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', lineHeight: '1.7', marginBottom: '28px' }}>
            No harvest record found for <span style={{ color: '#f87171', fontFamily: 'monospace' }}>{id}</span> on the Polygon blockchain. This ID may be invalid or counterfeit.
          </p>
          <button onClick={() => navigate('/buyer')} style={{ padding: '11px 28px', background: 'transparent', border: '1px solid rgba(248,113,113,0.4)', borderRadius: '6px', color: '#f87171', fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', cursor: 'pointer' }}>
            ← Try Again
          </button>
        </div>
      </div>
    </>
  )

  // ── Main result page ───────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes pulse-dot   { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes fadeUp      { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes alertPulse  { 0%,100%{box-shadow:0 0 0 0 rgba(248,113,113,0.0)} 50%{box-shadow:0 0 32px 8px rgba(248,113,113,0.12)} }
        @keyframes verifyGlow  { 0%,100%{box-shadow:0 0 0 0 rgba(74,222,128,0.0)} 50%{box-shadow:0 0 32px 8px rgba(74,222,128,0.10)} }
        .result-page { animation: fadeUp 0.4s ease both; }
        .fraud-card  { animation: alertPulse 2.5s ease-in-out infinite; }
        .verify-card { animation: verifyGlow 3s ease-in-out infinite; }
      `}</style>

      <div className="result-page" style={{ fontFamily: "'Inter', sans-serif", minHeight: '100vh', background: '#060c04', position: 'relative', overflow: 'hidden' }}>

        {/* Background */}
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: `brightness(0.16) saturate(0.5) ${isFlagged ? 'hue-rotate(320deg)' : ''}` }} />
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: `linear-gradient(135deg, rgba(4,9,2,0.95) 0%, rgba(${accentRgb},0.04) 100%)` }} />

        {/* Navbar */}
        <nav style={{ position: 'sticky', top: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: '60px', background: 'rgba(4,9,2,0.88)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: `1px solid rgba(${accentRgb},0.12)` }}>
          <div onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '20px', letterSpacing: '3px' }}>
              <span style={{ color: '#4ade80' }}>AGRI</span><span style={{ color: '#fff' }}>CHAIN</span>
            </span>
            <span style={{ fontSize: '7px', color: 'rgba(255,255,255,0.25)', letterSpacing: '2px', textTransform: 'uppercase' }}>Blockchain Verified</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: `rgba(${accentRgb},0.08)`, border: `1px solid rgba(${accentRgb},0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={buyerIcon} alt="Buyer" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
            </div>
            <span style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' }}>Verification Result</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => navigate('/buyer')} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.35)', fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', padding: '5px 14px', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.35)' }}>
              ← Scanner
            </button>
          </div>
        </nav>

        <main style={{ position: 'relative', zIndex: 1, maxWidth: '900px', margin: '0 auto', padding: '48px 24px 80px' }}>

          {/* ── FRAUD ALERT BANNER (flagged only) ─────────────── */}
          {isFlagged && (
            <div className="fraud-card" style={{
              marginBottom: '32px', padding: '24px 28px',
              background: 'rgba(248,113,113,0.06)',
              border: '1px solid rgba(248,113,113,0.4)',
              borderRadius: '14px',
              display: 'flex', alignItems: 'center', gap: '20px',
              position: 'relative', overflow: 'hidden',
            }}>
              {/* Red glow line */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(to right, #f87171, rgba(248,113,113,0.3), transparent)' }} />
              <div style={{ fontSize: '40px', flexShrink: 0 }}>🚨</div>
              <div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '28px', color: '#f87171', letterSpacing: '2px', lineHeight: 1, marginBottom: '6px' }}>
                  FRAUD WARNING
                </div>
                <p style={{ fontSize: '12px', color: 'rgba(248,113,113,0.75)', margin: 0, lineHeight: '1.65' }}>
                  This harvest has been scanned <strong style={{ color: '#f87171' }}>{harvest.scans} times</strong> — far above the expected threshold. This may indicate QR duplication or label tampering. Do not purchase without further verification.
                </p>
              </div>
            </div>
          )}

          {/* ── Heading ───────────────────────────────────────── */}
          <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <p style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: accentColor, margin: '0 0 8px' }}>
                {isFlagged ? 'Suspicious record' : isVerified ? 'Blockchain verified' : 'Awaiting verification'}
              </p>
              <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(40px, 6vw, 68px)', color: '#fff', letterSpacing: '2px', lineHeight: '0.9', margin: 0 }}>
                {isFlagged ? <><span style={{ color: '#f87171' }}>FRAUD</span> ALERT</> : isVerified ? <>HARVEST <span style={{ color: '#4ade80' }}>VERIFIED</span></> : <>RECORD <span style={{ color: '#facc15' }}>PENDING</ span></>}
              </h1>
            </div>

            {/* Big verdict badge */}
            <div className={isVerified ? 'verify-card' : isFlagged ? 'fraud-card' : ''} style={{
              padding: '16px 28px',
              background: `rgba(${accentRgb},0.07)`,
              border: `1px solid rgba(${accentRgb},0.35)`,
              borderRadius: '12px', textAlign: 'center',
            }}>
              <div style={{ fontSize: '36px', marginBottom: '4px' }}>
                {isFlagged ? '⚠' : isVerified ? '✓' : '◎'}
              </div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '18px', color: accentColor, letterSpacing: '2px' }}>
                {isFlagged ? 'FLAGGED' : isVerified ? 'VERIFIED' : 'PENDING'}
              </div>
            </div>
          </div>

          {/* ── Two column layout ─────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

            {/* Left: harvest data */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Core data card */}
              <div style={{ background: 'rgba(255,255,255,0.025)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', overflow: 'hidden' }}>
                <div style={{ height: '2px', background: `linear-gradient(to right, ${accentColor}, rgba(${accentRgb},0.2), transparent)` }} />
                <div style={{ padding: '22px' }}>
                  <p style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)', margin: '0 0 16px' }}>Harvest Record</p>
                  {[
                    { label: 'Harvest ID',   value: harvest.id,       mono: true,  accent: true  },
                    { label: 'Crop Type',    value: harvest.crop,     mono: false, accent: false },
                    { label: 'Harvest Date', value: harvest.date,     mono: false, accent: false },
                    { label: 'GPS Location', value: harvest.gps,      mono: true,  accent: false },
                    { label: 'Chemicals',    value: harvest.chemicals,mono: false, accent: false },
                    { label: 'Farmer Wallet',value: harvest.farmer,   mono: true,  accent: false },
                  ].map(({ label, value, mono, accent }, i, arr) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', gap: '12px' }}>
                      <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.28)', flexShrink: 0 }}>{label}</span>
                      <span style={{ fontSize: mono ? '10px' : '12px', fontFamily: mono ? 'monospace' : "'Inter', sans-serif", color: accent ? accentColor : '#fff', textAlign: 'right', wordBreak: 'break-all' }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* SHA-256 hash card */}
              <div style={{ background: 'rgba(255,255,255,0.025)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', overflow: 'hidden' }}>
                <div style={{ height: '2px', background: 'linear-gradient(to right, #8b5cf6, rgba(139,92,246,0.2), transparent)' }} />
                <div style={{ padding: '20px' }}>
                  <p style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)', margin: '0 0 10px' }}>SHA-256 Block Hash</p>
                  <p style={{ fontFamily: 'monospace', fontSize: '10px', color: '#8b5cf6', wordBreak: 'break-all', lineHeight: '1.6', margin: 0 }}>{harvest.hash}</p>
                </div>
              </div>
            </div>

            {/* Right: scan activity + actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Scan count card */}
              <div style={{ background: 'rgba(255,255,255,0.025)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: isFlagged ? '1px solid rgba(248,113,113,0.2)' : '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', overflow: 'hidden' }}>
                <div style={{ height: '2px', background: `linear-gradient(to right, ${accentColor}, rgba(${accentRgb},0.2), transparent)` }} />
                <div style={{ padding: '20px' }}>
                  <p style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)', margin: '0 0 14px' }}>Scan Activity</p>

                  {/* Big scan number */}
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', marginBottom: '16px' }}>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '64px', color: accentColor, lineHeight: 1, letterSpacing: '1px' }}>{harvest.scans}</div>
                    <div style={{ paddingBottom: '8px' }}>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.5px' }}>total scans</div>
                      {isFlagged && <div style={{ fontSize: '9px', color: '#f87171', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '2px' }}>⚠ Threshold exceeded</div>}
                    </div>
                  </div>

                  {/* Scan log */}
                  <p style={{ fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', margin: '0 0 8px' }}>Recent scans</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {SCAN_TIMESTAMPS.slice(0, Math.min(harvest.scans, 6)).map((ts, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 8px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: '10px', color: 'rgba(255,255,255,0.25)' }}>Scan #{i + 1}</span>
                        <span style={{ fontFamily: 'monospace', fontSize: '10px', color: isFlagged ? 'rgba(248,113,113,0.5)' : 'rgba(255,255,255,0.25)' }}>{ts}</span>
                      </div>
                    ))}
                    {harvest.scans > 6 && (
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.18)', textAlign: 'center', padding: '4px', fontFamily: 'monospace' }}>
                        +{harvest.scans - 6} more scan{harvest.scans - 6 > 1 ? 's' : ''} on-chain
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  onClick={() => navigate('/buyer')}
                  style={{
                    width: '100%', padding: '12px',
                    background: hoveredBtn === 'scan' ? `rgba(${accentRgb},0.14)` : `rgba(${accentRgb},0.07)`,
                    border: `1px solid rgba(${accentRgb},0.35)`,
                    borderRadius: '6px', color: accentColor,
                    fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                  onMouseEnter={() => setHoveredBtn('scan')}
                  onMouseLeave={() => setHoveredBtn(null)}
                >
                  ← Scan Another QR
                </button>
                <button
                  onClick={() => navigate('/')}
                  style={{
                    width: '100%', padding: '12px',
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px', color: 'rgba(255,255,255,0.35)',
                    fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.color = '#fff' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.35)' }}
                >
                  Home
                </button>
              </div>

              {/* Polygon explorer link */}
              <div style={{ padding: '14px 16px', background: 'rgba(139,92,246,0.04)', border: '1px solid rgba(139,92,246,0.12)', borderRadius: '10px' }}>
                <p style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', margin: '0 0 6px' }}>On-chain Explorer</p>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.28)', margin: '0 0 10px', lineHeight: '1.5' }}>View this transaction directly on Polygon Amoy explorer.</p>
                <a
                  href={`https://amoy.polygonscan.com/tx/${harvest.hash}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: '10px', color: '#8b5cf6', textDecoration: 'none', letterSpacing: '0.5px', fontFamily: 'monospace' }}
                >
                  polygonscan.com ↗
                </a>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ marginTop: '28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.15)' }}>Data sourced directly from Polygon Amoy · Tamper-proof</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: accentColor, display: 'inline-block', animation: 'pulse-dot 2s infinite' }} />
              <span style={{ fontSize: '9px', color: `rgba(${accentRgb},0.5)`, letterSpacing: '1.5px', textTransform: 'uppercase' }}>Block #18,442,213</span>
            </div>
          </div>

        </main>
      </div>
    </>
  )
}