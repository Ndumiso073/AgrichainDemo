import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import '@fontsource/bebas-neue'
import '@fontsource/inter'
import farmerIcon from '../assets/icons/farmers.png'
import bgImage from '../assets/images/dave-hoefler-Envk7kTMWTQ-unsplash.jpg'

// ── Mock harvest data (replace with contract calls later) ──────────────────
const MOCK_HARVESTS = [
  { id: 'HC-0012', crop: 'Maize',      date: '2025-04-28', gps: '-29.8579, 31.0292', chemicals: 'None',        status: 'Verified',  scans: 4,  hash: '0xa3f1...9c2d' },
  { id: 'HC-0011', crop: 'Wheat',      date: '2025-04-21', gps: '-29.8621, 31.0310', chemicals: 'Fertiliser',  status: 'Pending',   scans: 0,  hash: '0xb7e2...1a4f' },
  { id: 'HC-0010', crop: 'Tomatoes',   date: '2025-04-14', gps: '-29.8544, 31.0281', chemicals: 'Pesticide A', status: 'Verified',  scans: 11, hash: '0xc9d3...8b5e' },
  { id: 'HC-0009', crop: 'Soybean',    date: '2025-04-07', gps: '-29.8598, 31.0305', chemicals: 'None',        status: 'Flagged',   scans: 23, hash: '0xd4c5...2f7a' },
  { id: 'HC-0008', crop: 'Sunflower',  date: '2025-03-31', gps: '-29.8567, 31.0298', chemicals: 'Herbicide B', status: 'Verified',  scans: 7,  hash: '0xe5b6...3g8b' },
  { id: 'HC-0007', crop: 'Cabbage',    date: '2025-03-24', gps: '-29.8534, 31.0274', chemicals: 'None',        status: 'Verified',  scans: 2,  hash: '0xf6a7...4h9c' },
]

const STATUS_CONFIG = {
  Verified: { color: '#4ade80', rgb: '74,222,128',   bg: 'rgba(74,222,128,0.08)',  label: '✓ Verified' },
  Pending:  { color: '#facc15', rgb: '250,204,21',   bg: 'rgba(250,204,21,0.08)', label: '◎ Pending'  },
  Flagged:  { color: '#f87171', rgb: '248,113,113',  bg: 'rgba(248,113,113,0.08)',label: '⚠ Flagged'  },
}

export default function FarmerDashboard() {
  const navigate = useNavigate()
  const [hoveredRow, setHoveredRow] = useState(null)
  const [hoveredBtn, setHoveredBtn] = useState(null)
  const [filter, setFilter] = useState('All')

  // Fake wallet — replace with real account from ethers later
  const account = '0x4f3a...d92c'

  const total    = MOCK_HARVESTS.length
  const verified = MOCK_HARVESTS.filter(h => h.status === 'Verified').length
  const pending  = MOCK_HARVESTS.filter(h => h.status === 'Pending').length
  const flagged  = MOCK_HARVESTS.filter(h => h.status === 'Flagged').length

  const filtered = filter === 'All'
    ? MOCK_HARVESTS
    : MOCK_HARVESTS.filter(h => h.status === filter)

  const stats = [
    { label: 'Total Harvests', value: total,    accent: '#4ade80', rgb: '74,222,128'  },
    { label: 'Verified',       value: verified, accent: '#4ade80', rgb: '74,222,128'  },
    { label: 'Pending',        value: pending,  accent: '#facc15', rgb: '250,204,21'  },
    { label: 'Flagged',        value: flagged,  accent: '#f87171', rgb: '248,113,113' },
  ]

  const filters = ['All', 'Verified', 'Pending', 'Flagged']

  return (
    <>
      <style>{`
        @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .dash-page { animation: fadeUp 0.45s ease both; }
        .table-row { transition: background 0.2s ease; }
        .table-row:hover { background: rgba(74,222,128,0.04) !important; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(74,222,128,0.2); border-radius: 4px; }
      `}</style>

      <div
        className="dash-page"
        style={{
          fontFamily: "'Inter', sans-serif",
          minHeight: '100vh',
          background: '#060c04',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* ── Background image ───────────────────────────────────── */}
        <div style={{
          position: 'fixed', inset: 0, zIndex: 0,
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.22) saturate(0.6)',
        }} />
        {/* Gradient overlay */}
        <div style={{
          position: 'fixed', inset: 0, zIndex: 0,
          background: 'linear-gradient(135deg, rgba(4,9,2,0.92) 0%, rgba(6,12,4,0.80) 100%)',
        }} />

        {/* ── Navbar ─────────────────────────────────────────────── */}
        <nav style={{
          position: 'sticky', top: 0, zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 32px', height: '60px',
          background: 'rgba(4,9,2,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(74,222,128,0.10)',
        }}>
          {/* Logo */}
          <div
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', lineHeight: 1 }}
          >
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '20px', letterSpacing: '3px' }}>
              <span style={{ color: '#4ade80' }}>AGRI</span>
              <span style={{ color: '#fff' }}>CHAIN</span>
            </span>
            <span style={{ fontSize: '7px', color: 'rgba(255,255,255,0.25)', letterSpacing: '2px', textTransform: 'uppercase' }}>Blockchain Verified</span>
          </div>

          {/* Page title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: 'rgba(74,222,128,0.08)',
              border: '1px solid rgba(74,222,128,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <img src={farmerIcon} alt="Farmer" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
            </div>
            <span style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' }}>
              Farmer Dashboard
            </span>
          </div>

          {/* Wallet + logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '5px 12px',
              background: 'rgba(74,222,128,0.06)',
              border: '1px solid rgba(74,222,128,0.18)',
              borderRadius: '4px',
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', display: 'inline-block', animation: 'pulse-dot 2s infinite' }} />
              <span style={{ fontSize: '10px', color: '#4ade80', fontFamily: 'monospace', letterSpacing: '0.5px' }}>{account}</span>
            </div>
            <button
              onClick={() => navigate('/')}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.35)',
                fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase',
                padding: '5px 14px', borderRadius: '4px', cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.35)' }}
            >
              Exit
            </button>
          </div>
        </nav>

        {/* ── Main content ───────────────────────────────────────── */}
        <main style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto', padding: '40px 24px 80px' }}>

          {/* Page heading */}
          <div style={{ marginBottom: '36px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: '#4ade80', margin: '0 0 8px' }}>
              Welcome back
            </p>
            <h1 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 'clamp(40px, 6vw, 72px)',
              color: '#fff', letterSpacing: '2px', lineHeight: '0.9',
              margin: '0 0 10px',
            }}>
              YOUR <span style={{ color: '#4ade80' }}>HARVESTS</span>
            </h1>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', margin: 0, letterSpacing: '0.2px' }}>
              All your registered harvests are permanently stored on the Polygon blockchain.
            </p>
          </div>

          {/* ── Stat cards ──────────────────────────────────────── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '14px',
            marginBottom: '36px',
          }}>
            {stats.map(({ label, value, accent, rgb }) => (
              <div key={label} style={{
                padding: '20px 22px',
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: `1px solid rgba(${rgb},0.14)`,
                borderRadius: '12px',
                position: 'relative',
                overflow: 'hidden',
              }}>
                {/* Accent top bar */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
                  background: `linear-gradient(to right, ${accent}, transparent)`,
                  opacity: 0.5,
                }} />
                <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)', marginBottom: '10px' }}>
                  {label}
                </div>
                <div style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: '48px', color: accent,
                  lineHeight: 1, letterSpacing: '1px',
                }}>
                  {value}
                </div>
                {/* Faint bg number */}
                <div style={{
                  position: 'absolute', bottom: '-8px', right: '12px',
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: '72px', color: accent, opacity: 0.04,
                  lineHeight: 1, pointerEvents: 'none', userSelect: 'none',
                }}>
                  {value}
                </div>
              </div>
            ))}
          </div>

          {/* ── Table header: filter + register button ───────────── */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: '12px',
            marginBottom: '16px',
          }}>
            {/* Filter pills */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {filters.map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: '5px 16px',
                    borderRadius: '20px',
                    border: filter === f ? '1px solid rgba(74,222,128,0.5)' : '1px solid rgba(255,255,255,0.1)',
                    background: filter === f ? 'rgba(74,222,128,0.1)' : 'transparent',
                    color: filter === f ? '#4ade80' : 'rgba(255,255,255,0.35)',
                    fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Register button */}
            <button
              onClick={() => navigate('/register-harvest')}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '9px 22px',
                background: hoveredBtn === 'register' ? 'rgba(74,222,128,0.15)' : 'rgba(74,222,128,0.08)',
                border: '1px solid rgba(74,222,128,0.45)',
                borderRadius: '6px',
                color: '#4ade80', fontSize: '11px', letterSpacing: '1.5px',
                textTransform: 'uppercase', cursor: 'pointer',
                transition: 'all 0.25s ease',
                transform: hoveredBtn === 'register' ? 'translateY(-1px)' : 'translateY(0)',
                boxShadow: hoveredBtn === 'register' ? '0 6px 20px rgba(74,222,128,0.15)' : 'none',
              }}
              onMouseEnter={() => setHoveredBtn('register')}
              onMouseLeave={() => setHoveredBtn(null)}
            >
              <span style={{ fontSize: '16px', lineHeight: 1 }}>+</span>
              Register New Harvest
            </button>
          </div>

          {/* ── Harvest table ────────────────────────────────────── */}
          <div style={{
            background: 'rgba(255,255,255,0.025)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '14px',
            overflow: 'hidden',
          }}>
            {/* Table head */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '90px 1fr 110px 160px 1fr 80px 90px 80px',
              padding: '12px 20px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(255,255,255,0.02)',
            }}>
              {['Harvest ID', 'Crop', 'Date', 'GPS', 'Chemicals', 'Scans', 'Status', 'Action'].map(col => (
                <div key={col} style={{
                  fontSize: '8px', letterSpacing: '2px', textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.22)', paddingRight: '8px',
                }}>
                  {col}
                </div>
              ))}
            </div>

            {/* Table rows */}
            {filtered.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '13px' }}>
                No harvests found.
              </div>
            ) : (
              filtered.map((h, i) => {
                const sc = STATUS_CONFIG[h.status]
                return (
                  <div
                    key={h.id}
                    className="table-row"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '90px 1fr 110px 160px 1fr 80px 90px 80px',
                      padding: '14px 20px',
                      borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                      alignItems: 'center',
                      cursor: 'default',
                    }}
                    onMouseEnter={() => setHoveredRow(h.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    {/* ID */}
                    <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#4ade80', letterSpacing: '0.5px' }}>
                      {h.id}
                    </div>
                    {/* Crop */}
                    <div style={{ fontSize: '12px', color: '#fff', fontWeight: '500' }}>
                      {h.crop}
                    </div>
                    {/* Date */}
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                      {h.date}
                    </div>
                    {/* GPS */}
                    <div style={{ fontFamily: 'monospace', fontSize: '10px', color: 'rgba(255,255,255,0.35)' }}>
                      {h.gps}
                    </div>
                    {/* Chemicals */}
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                      {h.chemicals}
                    </div>
                    {/* Scans */}
                    <div style={{
                      fontSize: '12px', fontWeight: '600',
                      color: h.scans > 10 ? '#f87171' : 'rgba(255,255,255,0.5)',
                    }}>
                      {h.scans}
                      {h.scans > 10 && <span style={{ fontSize: '9px', marginLeft: '3px', color: '#f87171' }}>⚠</span>}
                    </div>
                    {/* Status badge */}
                    <div style={{
                      display: 'inline-flex', alignItems: 'center',
                      padding: '3px 10px',
                      borderRadius: '20px',
                      background: sc.bg,
                      border: `1px solid rgba(${sc.rgb},0.25)`,
                      fontSize: '9px', letterSpacing: '0.5px',
                      color: sc.color,
                      whiteSpace: 'nowrap',
                    }}>
                      {sc.label}
                    </div>
                    {/* Action */}
                    <div>
                      <button
                        onClick={() => navigate(`/qr-viewer?id=${h.id}`)}
                        style={{
                          padding: '4px 12px',
                          background: 'transparent',
                          border: '1px solid rgba(255,255,255,0.12)',
                          borderRadius: '4px',
                          color: 'rgba(255,255,255,0.4)',
                          fontSize: '9px', letterSpacing: '1px',
                          textTransform: 'uppercase',
                          cursor: 'pointer', transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = 'rgba(74,222,128,0.4)'
                          e.currentTarget.style.color = '#4ade80'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
                          e.currentTarget.style.color = 'rgba(255,255,255,0.4)'
                        }}
                      >
                        QR
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* ── Footer note ─────────────────────────────────────── */}
          <div style={{
            marginTop: '24px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: '8px',
          }}>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.18)', letterSpacing: '0.3px' }}>
              Showing {filtered.length} of {total} records · All data stored on Polygon Amoy
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', display: 'inline-block', animation: 'pulse-dot 2s infinite' }} />
              <span style={{ fontSize: '9px', color: 'rgba(74,222,128,0.5)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Live · Block #18,442,207</span>
            </div>
          </div>

        </main>
      </div>
    </>
  )
}