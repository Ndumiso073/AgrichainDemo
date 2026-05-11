import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import '@fontsource/bebas-neue'
import '@fontsource/inter'
import adminIcon from '../assets/icons/admin.png'
import bgImage from '../assets/images/stijn-te-strake-UdhpcfImQ9Y-unsplash.jpg'

// ── Mock data ──────────────────────────────────────────────────────────────
const STATS = [
  { label: 'Total Harvests',   value: '2,481', sub: '+12 today',       accent: '#4ade80', rgb: '74,222,128'   },
  { label: 'Total QR Scans',   value: '8,934', sub: '+203 today',      accent: '#60a5fa', rgb: '96,165,250'   },
  { label: 'Flagged Records',  value: '47',    sub: '3 new this week',  accent: '#f87171', rgb: '248,113,113'  },
  { label: 'Active Farmers',   value: '134',   sub: '+5 this month',   accent: '#facc15', rgb: '250,204,21'   },
  { label: 'Verified Today',   value: '189',   sub: '94% success rate', accent: '#4ade80', rgb: '74,222,128'  },
  { label: 'Avg Scans/Harvest',value: '3.6',   sub: 'normal range',    accent: '#c084fc', rgb: '192,132,252'  },
]

const LIVE_FEED = [
  { time: '14:32:07', type: 'Verify',   id: 'HC-0012', actor: '0xBuyer...f10a', status: 'success', color: '#4ade80' },
  { time: '14:30:55', type: 'Register', id: 'HC-0013', actor: '0x4f3a...d92c',  status: 'success', color: '#60a5fa' },
  { time: '14:28:41', type: 'Verify',   id: 'HC-0009', actor: '0xBuyer...c3d1', status: 'flagged', color: '#f87171' },
  { time: '14:27:19', type: 'Verify',   id: 'HC-0009', actor: '0xBuyer...a7b2', status: 'flagged', color: '#f87171' },
  { time: '14:25:03', type: 'Register', id: 'HC-0011', actor: '0x4f3a...d92c',  status: 'success', color: '#60a5fa' },
  { time: '14:22:47', type: 'Verify',   id: 'HC-0010', actor: '0xBuyer...e9f4', status: 'success', color: '#4ade80' },
  { time: '14:20:31', type: 'Flag',     id: 'HC-0009', actor: 'System Auto',    status: 'alert',   color: '#f87171' },
  { time: '14:18:15', type: 'Verify',   id: 'HC-0008', actor: '0xBuyer...b2c5', status: 'success', color: '#4ade80' },
]

const ALL_HARVESTS = [
  { id: 'HC-0012', crop: 'Maize',     farmer: '0x4f3a...d92c', date: '2025-04-28', scans: 4,  status: 'Verified' },
  { id: 'HC-0011', crop: 'Wheat',     farmer: '0x4f3a...d92c', date: '2025-04-21', scans: 0,  status: 'Pending'  },
  { id: 'HC-0010', crop: 'Tomatoes',  farmer: '0x4f3a...d92c', date: '2025-04-14', scans: 11, status: 'Verified' },
  { id: 'HC-0009', crop: 'Soybean',   farmer: '0x4f3a...d92c', date: '2025-04-07', scans: 23, status: 'Flagged'  },
  { id: 'HC-0008', crop: 'Sunflower', farmer: '0x4f3a...d92c', date: '2025-03-31', scans: 7,  status: 'Verified' },
  { id: 'HC-0007', crop: 'Cabbage',   farmer: '0x8b2c...a14f', date: '2025-03-24', scans: 2,  status: 'Verified' },
  { id: 'HC-0006', crop: 'Potato',    farmer: '0x8b2c...a14f', date: '2025-03-17', scans: 5,  status: 'Verified' },
  { id: 'HC-0005', crop: 'Onion',     farmer: '0x3e9d...c72b', date: '2025-03-10', scans: 18, status: 'Flagged'  },
]

const STATUS_CFG = {
  Verified: { color: '#4ade80', rgb: '74,222,128',  bg: 'rgba(74,222,128,0.08)',  label: '✓ Verified' },
  Pending:  { color: '#facc15', rgb: '250,204,21',  bg: 'rgba(250,204,21,0.08)', label: '◎ Pending'  },
  Flagged:  { color: '#f87171', rgb: '248,113,113', bg: 'rgba(248,113,113,0.08)',label: '⚠ Flagged'  },
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [hoveredRow, setHoveredRow] = useState(null)
  const [filter, setFilter] = useState('All')
  const [hoveredBtn, setHoveredBtn] = useState(null)

  const account = '0xAdmin...9f2e'
  const filtered = filter === 'All' ? ALL_HARVESTS : ALL_HARVESTS.filter(h => h.status === filter)

  return (
    <>
      <style>{`
        @keyframes pulse-dot  { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes fadeUp     { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes feedSlide  { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
        .admin-page { animation: fadeUp 0.4s ease both; }
        .feed-item  { animation: feedSlide 0.3s ease both; }
        .table-row  { transition: background 0.2s ease; }
        .table-row:hover { background: rgba(250,204,21,0.03) !important; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
      `}</style>

      <div className="admin-page" style={{ fontFamily: "'Inter', sans-serif", minHeight: '100vh', background: '#060c04', position: 'relative', overflow: 'hidden' }}>

        {/* Background */}
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.18) saturate(0.5)' }} />
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'linear-gradient(135deg, rgba(4,9,2,0.94) 0%, rgba(250,204,21,0.03) 100%)' }} />

        {/* Navbar */}
        <nav style={{ position: 'sticky', top: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: '60px', background: 'rgba(4,9,2,0.88)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(250,204,21,0.10)' }}>
          <div onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '20px', letterSpacing: '3px' }}>
              <span style={{ color: '#4ade80' }}>AGRI</span><span style={{ color: '#fff' }}>CHAIN</span>
            </span>
            <span style={{ fontSize: '7px', color: 'rgba(255,255,255,0.25)', letterSpacing: '2px', textTransform: 'uppercase' }}>Blockchain Verified</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(250,204,21,0.08)', border: '1px solid rgba(250,204,21,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={adminIcon} alt="Admin" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
            </div>
            <span style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' }}>Admin Dashboard</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 12px', background: 'rgba(250,204,21,0.06)', border: '1px solid rgba(250,204,21,0.18)', borderRadius: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#facc15', display: 'inline-block', animation: 'pulse-dot 2s infinite' }} />
              <span style={{ fontSize: '10px', color: '#facc15', fontFamily: 'monospace' }}>{account}</span>
            </div>
            <button
              onClick={() => navigate('/user-management')}
              style={{
                background: hoveredBtn === 'users' ? 'rgba(250,204,21,0.1)' : 'transparent',
                border: '1px solid rgba(250,204,21,0.3)', color: '#facc15',
                fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase',
                padding: '5px 14px', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={() => setHoveredBtn('users')}
              onMouseLeave={() => setHoveredBtn(null)}
            >
              Users →
            </button>
            <button
              onClick={() => navigate('/')}
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.35)', fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', padding: '5px 14px', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.35)' }}
            >Exit</button>
          </div>
        </nav>

        <main style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: '40px 24px 80px' }}>

          {/* Heading */}
          <div style={{ marginBottom: '36px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: '#facc15', margin: '0 0 8px' }}>System Overview</p>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(40px, 6vw, 72px)', color: '#fff', letterSpacing: '2px', lineHeight: '0.9', margin: '0 0 10px' }}>
              ADMIN <span style={{ color: '#facc15' }}>DASHBOARD</span>
            </h1>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', margin: 0, lineHeight: '1.6' }}>
              Real-time overview of all harvests, scans, and fraud events across the AgriChain network.
            </p>
          </div>

          {/* ── Stat cards ────────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))', gap: '14px', marginBottom: '32px' }}>
            {STATS.map(({ label, value, sub, accent, rgb }) => (
              <div key={label} style={{ padding: '20px 22px', background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: `1px solid rgba(${rgb},0.12)`, borderRadius: '12px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(to right, ${accent}, transparent)`, opacity: 0.5 }} />
                <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: '8px' }}>{label}</div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '42px', color: accent, lineHeight: 1, letterSpacing: '1px', marginBottom: '4px' }}>{value}</div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.22)', letterSpacing: '0.3px' }}>{sub}</div>
                <div style={{ position: 'absolute', bottom: '-8px', right: '10px', fontFamily: "'Bebas Neue', sans-serif", fontSize: '60px', color: accent, opacity: 0.04, lineHeight: 1, pointerEvents: 'none', userSelect: 'none' }}>{value}</div>
              </div>
            ))}
          </div>

          {/* ── Two column: live feed + chart ─────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '20px', marginBottom: '24px', alignItems: 'start' }}>

            {/* Live transaction feed */}
            <div style={{ background: 'rgba(255,255,255,0.025)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', overflow: 'hidden' }}>
              <div style={{ height: '2px', background: 'linear-gradient(to right, #facc15, rgba(250,204,21,0.2), transparent)' }} />
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <p style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', margin: 0 }}>Live Feed</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#4ade80', display: 'inline-block', animation: 'pulse-dot 1.5s infinite' }} />
                    <span style={{ fontSize: '9px', color: 'rgba(74,222,128,0.6)', letterSpacing: '1px', textTransform: 'uppercase' }}>Live</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {LIVE_FEED.map((tx, i) => (
                    <div key={i} className="feed-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 10px', borderRadius: '6px', background: i === 0 ? 'rgba(255,255,255,0.03)' : 'transparent', animationDelay: `${i * 0.05}s` }}>
                      {/* Type dot */}
                      <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: tx.color, flexShrink: 0, boxShadow: `0 0 6px ${tx.color}` }} />
                      {/* Time */}
                      <span style={{ fontFamily: 'monospace', fontSize: '9px', color: 'rgba(255,255,255,0.2)', flexShrink: 0 }}>{tx.time}</span>
                      {/* Type badge */}
                      <span style={{ fontSize: '8px', letterSpacing: '1px', textTransform: 'uppercase', color: tx.color, background: `rgba(${tx.color === '#4ade80' ? '74,222,128' : tx.color === '#60a5fa' ? '96,165,250' : '248,113,113'},0.1)`, padding: '2px 7px', borderRadius: '10px', flexShrink: 0 }}>{tx.type}</span>
                      {/* ID */}
                      <span style={{ fontFamily: 'monospace', fontSize: '10px', color: '#fff', flexShrink: 0 }}>{tx.id}</span>
                      {/* Actor */}
                      <span style={{ fontFamily: 'monospace', fontSize: '9px', color: 'rgba(255,255,255,0.2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.actor}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Status breakdown visual */}
            <div style={{ background: 'rgba(255,255,255,0.025)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', overflow: 'hidden' }}>
              <div style={{ height: '2px', background: 'linear-gradient(to right, #4ade80, rgba(74,222,128,0.2), transparent)' }} />
              <div style={{ padding: '20px' }}>
                <p style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', margin: '0 0 20px' }}>Network Status Breakdown</p>

                {/* Bar chart */}
                {[
                  { label: 'Verified', count: 1894, total: 2481, color: '#4ade80', rgb: '74,222,128'  },
                  { label: 'Pending',  count: 540,  total: 2481, color: '#facc15', rgb: '250,204,21'  },
                  { label: 'Flagged',  count: 47,   total: 2481, color: '#f87171', rgb: '248,113,113' },
                ].map(({ label, count, total, color, rgb }) => {
                  const pct = Math.round((count / total) * 100)
                  return (
                    <div key={label} style={{ marginBottom: '18px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
                          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)', letterSpacing: '0.3px' }}>{label}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontFamily: 'monospace', fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>{count.toLocaleString()}</span>
                          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '18px', color, letterSpacing: '1px', lineHeight: 1 }}>{pct}%</span>
                        </div>
                      </div>
                      <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(to right, ${color}, rgba(${rgb},0.6))`, borderRadius: '3px', transition: 'width 0.8s ease' }} />
                      </div>
                    </div>
                  )
                })}

                {/* Divider */}
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '20px 0' }} />

                {/* Scan heatmap — simple grid */}
                <p style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)', margin: '0 0 12px' }}>Weekly Scan Activity</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                  {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day, i) => {
                    const heights = [65, 80, 45, 90, 72, 38, 55]
                    return (
                      <div key={day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <div style={{ width: '100%', height: '60px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', display: 'flex', alignItems: 'flex-end', overflow: 'hidden' }}>
                          <div style={{ width: '100%', height: `${heights[i]}%`, background: `rgba(74,222,128,${0.15 + (heights[i] / 100) * 0.55})`, borderRadius: '3px 3px 0 0', transition: 'height 0.6s ease' }} />
                        </div>
                        <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.5px' }}>{day}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* ── All harvests table ────────────────────────────── */}
          <div style={{ background: 'rgba(255,255,255,0.025)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', overflow: 'hidden' }}>
            <div style={{ height: '2px', background: 'linear-gradient(to right, #facc15, rgba(250,204,21,0.2), transparent)' }} />

            {/* Table header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <p style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', margin: 0 }}>All Harvest Records</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['All', 'Verified', 'Pending', 'Flagged'].map(f => (
                  <button key={f} onClick={() => setFilter(f)} style={{ padding: '4px 14px', borderRadius: '20px', border: filter === f ? '1px solid rgba(250,204,21,0.5)' : '1px solid rgba(255,255,255,0.1)', background: filter === f ? 'rgba(250,204,21,0.1)' : 'transparent', color: filter === f ? '#facc15' : 'rgba(255,255,255,0.3)', fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s' }}>
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Col headers */}
            <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr 160px 110px 60px 90px 80px', padding: '10px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
              {['ID', 'Crop', 'Farmer', 'Date', 'Scans', 'Status', 'Action'].map(col => (
                <div key={col} style={{ fontSize: '8px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)' }}>{col}</div>
              ))}
            </div>

            {/* Rows */}
            {filtered.map((h, i) => {
              const sc = STATUS_CFG[h.status]
              return (
                <div key={h.id} className="table-row" style={{ display: 'grid', gridTemplateColumns: '90px 1fr 160px 110px 60px 90px 80px', padding: '13px 20px', borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', alignItems: 'center' }}
                  onMouseEnter={() => setHoveredRow(h.id)} onMouseLeave={() => setHoveredRow(null)}>
                  <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#facc15', letterSpacing: '0.5px' }}>{h.id}</div>
                  <div style={{ fontSize: '12px', color: '#fff', fontWeight: 500 }}>{h.crop}</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '10px', color: 'rgba(255,255,255,0.35)' }}>{h.farmer}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{h.date}</div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: h.scans > 10 ? '#f87171' : 'rgba(255,255,255,0.5)' }}>
                    {h.scans}{h.scans > 10 && <span style={{ fontSize: '9px', marginLeft: '2px' }}>⚠</span>}
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: '20px', background: sc.bg, border: `1px solid rgba(${sc.rgb},0.25)`, fontSize: '9px', color: sc.color, whiteSpace: 'nowrap' }}>{sc.label}</div>
                  <button
                    onClick={() => navigate(`/verify-result?id=${h.id}`)}
                    style={{ padding: '4px 10px', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '4px', color: 'rgba(255,255,255,0.35)', fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(250,204,21,0.4)'; e.currentTarget.style.color = '#facc15' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.35)' }}
                  >View</button>
                </div>
              )
            })}
          </div>

          {/* Bottom bar */}
          <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.15)' }}>Showing {filtered.length} of {ALL_HARVESTS.length} records · Polygon Amoy</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#facc15', display: 'inline-block', animation: 'pulse-dot 2s infinite' }} />
              <span style={{ fontSize: '9px', color: 'rgba(250,204,21,0.5)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Live · Block #18,442,215</span>
            </div>
          </div>

        </main>
      </div>
    </>
  )
}