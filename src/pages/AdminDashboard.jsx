// src/pages/AdminDashboard.jsx
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import '@fontsource/bebas-neue'
import '@fontsource/inter'
import adminIcon from '../assets/icons/admin.png'
import bgImage from '../assets/images/stijn-te-strake-UdhpcfImQ9Y-unsplash.jpg'
import { supabase } from '../supabaseClient'

const STATUS_CFG = {
  Verified: { color: '#4ade80', rgb: '74,222,128',  bg: 'rgba(74,222,128,0.08)',  label: '✓ Verified' },
  Pending:  { color: '#facc15', rgb: '250,204,21',  bg: 'rgba(250,204,21,0.08)', label: '◎ Pending'  },
  Flagged:  { color: '#f87171', rgb: '248,113,113', bg: 'rgba(248,113,113,0.08)',label: '⚠ Flagged'  },
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [harvests, setHarvests]     = useState([])
  const [profiles, setProfiles]     = useState([])
  const [scans, setScans]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [filter, setFilter]         = useState('All')
  const [hoveredRow, setHoveredRow] = useState(null)
  const [hoveredBtn, setHoveredBtn] = useState(null)
  const [error, setError]           = useState(null)

  useEffect(() => {
    async function fetchAll() {
      setLoading(true)
      setError(null)
      try {
        const [{ data: h, error: hErr }, { data: p, error: pErr }, { data: s, error: sErr }] = await Promise.all([
          supabase.from('harvests').select('*').order('created_at', { ascending: false }),
          supabase.from('profiles').select('*').order('created_at', { ascending: false }),
          supabase.from('scans').select('*').order('scanned_at', { ascending: false }).limit(20),
        ])
        if (hErr) throw hErr
        if (pErr) throw pErr
        if (sErr) throw sErr
        setHarvests(h || [])
        setProfiles(p || [])
        setScans(s || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()

    // Realtime — new/changed users, scans feed, harvest updates
    const channel = supabase
      .channel('admin-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        supabase.from('profiles').select('*').order('created_at', { ascending: false })
          .then(({ data }) => { if (data) setProfiles(data) })
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'scans' }, payload => {
        setScans(prev => [payload.new, ...prev].slice(0, 20))
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'harvests' }, () => {
        supabase.from('harvests').select('*').order('created_at', { ascending: false })
          .then(({ data }) => { if (data) setHarvests(data) })
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  function getStatus(h) {
    if (h.status === 'Flagged' || (h.scan_count || 0) > 10) return 'Flagged'
    if (h.verified === true || h.status === 'Verified') return 'Verified'
    return 'Pending'
  }

  const totalHarvests = harvests.length
  const verified      = harvests.filter(h => getStatus(h) === 'Verified').length
  const pending       = harvests.filter(h => getStatus(h) === 'Pending').length
  const flagged       = harvests.filter(h => getStatus(h) === 'Flagged').length
  const activeFarmers = profiles.filter(p => p.role === 'farmer' && p.is_active).length

  const STATS = [
    { label: 'Total Harvests',    value: totalHarvests, sub: 'all time',        accent: '#4ade80', rgb: '74,222,128'  },
    { label: 'Total QR Scans',    value: scans.length,  sub: 'tracked',         accent: '#60a5fa', rgb: '96,165,250'  },
    { label: 'Flagged Records',   value: flagged,       sub: 'needs review',    accent: '#f87171', rgb: '248,113,113' },
    { label: 'Active Farmers',    value: activeFarmers, sub: 'registered',      accent: '#facc15', rgb: '250,204,21'  },
    { label: 'Verified Harvests', value: verified,      sub: 'confirmed clean', accent: '#4ade80', rgb: '74,222,128'  },
    { label: 'Pending Review',    value: pending,       sub: 'awaiting check',  accent: '#c084fc', rgb: '192,132,252' },
  ]

  const filtered = filter === 'All' ? harvests : harvests.filter(h => getStatus(h) === filter)

  // ── Loading ───────────────────────────────────────────────────────────
  if (loading) return (
    <>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse-dot{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
      <div style={{ minHeight: '100vh', background: '#040902', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter',sans-serif" }}>
        <div style={{ position: 'fixed', inset: 0, backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.15) saturate(0.4)' }} />
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(4,9,2,0.92)' }} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', border: '2px solid rgba(250,204,21,0.15)', borderTopColor: '#facc15', borderRadius: '50%', animation: 'spin 0.9s linear infinite' }} />
          <p style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: '#facc15', margin: 0 }}>Loading Dashboard</p>
        </div>
      </div>
    </>
  )

  // ── Error ─────────────────────────────────────────────────────────────
  if (error) return (
    <div style={{ minHeight: '100vh', background: '#040902', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter',sans-serif" }}>
      <div style={{ textAlign: 'center', maxWidth: '400px', padding: '0 24px' }}>
        <div style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: '#f87171', marginBottom: '12px' }}>Error loading data</div>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', marginBottom: '24px' }}>{error}</p>
        <button onClick={() => window.location.reload()} style={{ padding: '10px 24px', background: 'transparent', border: '1px solid rgba(250,204,21,0.4)', borderRadius: '6px', color: '#facc15', fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', cursor: 'pointer' }}>Retry</button>
      </div>
    </div>
  )

  return (
    <>
      <style>{`
        @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes fadeUp    { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes feedSlide { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
        .admin-page { animation: fadeUp 0.4s ease both; }
        .feed-item  { animation: feedSlide 0.3s ease both; }
        .table-row  { transition: background 0.2s ease; }
        .table-row:hover { background: rgba(250,204,21,0.03) !important; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
      `}</style>

      <div className="admin-page" style={{ fontFamily: "'Inter',sans-serif", minHeight: '100vh', background: '#060c04', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.18) saturate(0.5)' }} />
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'linear-gradient(135deg, rgba(4,9,2,0.94) 0%, rgba(250,204,21,0.03) 100%)' }} />

        {/* Navbar */}
        <nav style={{ position: 'sticky', top: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: '60px', background: 'rgba(4,9,2,0.88)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(250,204,21,0.10)' }}>
          <div onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
            <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '20px', letterSpacing: '3px' }}>
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
              <span style={{ fontSize: '10px', color: '#facc15', fontFamily: 'monospace' }}>Admin · {profiles.filter(p=>p.role==='admin')[0]?.full_name || 'System'}</span>
            </div>
            <button onClick={() => navigate('/user-management')} style={{ background: hoveredBtn === 'users' ? 'rgba(250,204,21,0.1)' : 'transparent', border: '1px solid rgba(250,204,21,0.3)', color: '#facc15', fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', padding: '5px 14px', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={() => setHoveredBtn('users')} onMouseLeave={() => setHoveredBtn(null)}>Users →</button>
            <button onClick={() => navigate('/')} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.35)', fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', padding: '5px 14px', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.3)'; e.currentTarget.style.color='#fff' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.12)'; e.currentTarget.style.color='rgba(255,255,255,0.35)' }}>Exit</button>
          </div>
        </nav>

        <main style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: '40px 24px 80px' }}>

          <div style={{ marginBottom: '36px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: '#facc15', margin: '0 0 8px' }}>System Overview</p>
            <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(40px,6vw,72px)', color: '#fff', letterSpacing: '2px', lineHeight: '0.9', margin: '0 0 10px' }}>
              ADMIN <span style={{ color: '#facc15' }}>DASHBOARD</span>
            </h1>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', margin: 0, lineHeight: '1.6' }}>
              Real-time overview of all harvests, scans, and fraud events across the AgriChain network.
            </p>
          </div>

          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(175px,1fr))', gap: '14px', marginBottom: '32px' }}>
            {STATS.map(({ label, value, sub, accent, rgb }) => (
              <div key={label} style={{ padding: '20px 22px', background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: `1px solid rgba(${rgb},0.12)`, borderRadius: '12px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(to right,${accent},transparent)`, opacity: 0.5 }} />
                <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: '8px' }}>{label}</div>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '42px', color: accent, lineHeight: 1, marginBottom: '4px' }}>{value}</div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.22)' }}>{sub}</div>
                <div style={{ position: 'absolute', bottom: '-8px', right: '10px', fontFamily: "'Bebas Neue',sans-serif", fontSize: '60px', color: accent, opacity: 0.04, lineHeight: 1, pointerEvents: 'none', userSelect: 'none' }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Two column */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '20px', marginBottom: '24px', alignItems: 'start' }}>

            {/* Live scan feed */}
            <div style={{ background: 'rgba(255,255,255,0.025)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', overflow: 'hidden' }}>
              <div style={{ height: '2px', background: 'linear-gradient(to right,#facc15,rgba(250,204,21,0.2),transparent)' }} />
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <p style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', margin: 0 }}>Live Scan Feed</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#4ade80', display: 'inline-block', animation: 'pulse-dot 1.5s infinite' }} />
                    <span style={{ fontSize: '9px', color: 'rgba(74,222,128,0.6)', letterSpacing: '1px', textTransform: 'uppercase' }}>Live</span>
                  </div>
                </div>
                {scans.length === 0 ? (
                  <div style={{ padding: '24px 0', textAlign: 'center', color: 'rgba(255,255,255,0.18)', fontSize: '12px' }}>No scans recorded yet</div>
                ) : scans.map((scan, i) => {
                  const harvest = harvests.find(h => h.id === scan.harvest_id)
                  const isFlagged = harvest?.status === 'Flagged' || (harvest?.scan_count || 0) > 10
                  const color = isFlagged ? '#f87171' : '#4ade80'
                  const rgb   = isFlagged ? '248,113,113' : '74,222,128'
                  const time  = new Date(scan.scanned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                  return (
                    <div key={scan.id} className="feed-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '6px', background: i === 0 ? 'rgba(255,255,255,0.03)' : 'transparent', animationDelay: `${i * 0.04}s` }}>
                      <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: color, flexShrink: 0, boxShadow: `0 0 6px ${color}` }} />
                      <span style={{ fontFamily: 'monospace', fontSize: '9px', color: 'rgba(255,255,255,0.2)', flexShrink: 0 }}>{time}</span>
                      <span style={{ fontSize: '8px', letterSpacing: '1px', textTransform: 'uppercase', color, background: `rgba(${rgb},0.1)`, padding: '2px 7px', borderRadius: '10px', flexShrink: 0 }}>{isFlagged ? 'Flagged' : 'Scan'}</span>
                      <span style={{ fontFamily: 'monospace', fontSize: '10px', color: '#fff', flexShrink: 0 }}>{scan.harvest_id}</span>
                      <span style={{ fontFamily: 'monospace', fontSize: '9px', color: 'rgba(255,255,255,0.2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {scan.scanner_wallet ? `${scan.scanner_wallet.slice(0,10)}...` : 'anonymous'}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Status breakdown */}
            <div style={{ background: 'rgba(255,255,255,0.025)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', overflow: 'hidden' }}>
              <div style={{ height: '2px', background: 'linear-gradient(to right,#4ade80,rgba(74,222,128,0.2),transparent)' }} />
              <div style={{ padding: '20px' }}>
                <p style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', margin: '0 0 20px' }}>Network Status Breakdown</p>
                {[
                  { label: 'Verified', count: verified, color: '#4ade80', rgb: '74,222,128'  },
                  { label: 'Pending',  count: pending,  color: '#facc15', rgb: '250,204,21'  },
                  { label: 'Flagged',  count: flagged,  color: '#f87171', rgb: '248,113,113' },
                ].map(({ label, count, color, rgb }) => {
                  const pct = totalHarvests > 0 ? Math.round((count / totalHarvests) * 100) : 0
                  return (
                    <div key={label} style={{ marginBottom: '18px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
                          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)' }}>{label}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontFamily: 'monospace', fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>{count}</span>
                          <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '18px', color, lineHeight: 1 }}>{pct}%</span>
                        </div>
                      </div>
                      <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(to right,${color},rgba(${rgb},0.6))`, borderRadius: '3px', transition: 'width 0.8s ease' }} />
                      </div>
                    </div>
                  )
                })}
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '20px 0' }} />
                <p style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)', margin: '0 0 14px' }}>Users by Role</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px' }}>
                  {[
                    { role: 'farmer', color: '#4ade80', rgb: '74,222,128' },
                    { role: 'buyer',  color: '#60a5fa', rgb: '96,165,250' },
                    { role: 'admin',  color: '#facc15', rgb: '250,204,21' },
                  ].map(({ role, color, rgb }) => (
                    <div key={role} style={{ padding: '12px', background: `rgba(${rgb},0.04)`, border: `1px solid rgba(${rgb},0.12)`, borderRadius: '8px', textAlign: 'center' }}>
                      <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '28px', color, lineHeight: 1, marginBottom: '3px' }}>
                        {profiles.filter(p => p.role === role).length}
                      </div>
                      <div style={{ fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)' }}>{role}s</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Harvests table */}
          <div style={{ background: 'rgba(255,255,255,0.025)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', overflow: 'hidden' }}>
            <div style={{ height: '2px', background: 'linear-gradient(to right,#facc15,rgba(250,204,21,0.2),transparent)' }} />
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <p style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', margin: 0 }}>All Harvest Records</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['All','Verified','Pending','Flagged'].map(f => (
                  <button key={f} onClick={() => setFilter(f)} style={{ padding: '4px 14px', borderRadius: '20px', border: filter === f ? '1px solid rgba(250,204,21,0.5)' : '1px solid rgba(255,255,255,0.1)', background: filter === f ? 'rgba(250,204,21,0.1)' : 'transparent', color: filter === f ? '#facc15' : 'rgba(255,255,255,0.3)', fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s' }}>{f}</button>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 140px 110px 70px 90px 80px', padding: '10px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
              {['ID','Crop / Name','Farmer','Date','Scans','Status','Action'].map(col => (
                <div key={col} style={{ fontSize: '8px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)' }}>{col}</div>
              ))}
            </div>
            {filtered.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '13px' }}>
                {totalHarvests === 0 ? 'No harvests registered yet.' : 'No records match this filter.'}
              </div>
            ) : filtered.map((h, i) => {
              const status = getStatus(h)
              const sc = STATUS_CFG[status]
              return (
                <div key={h.id} className="table-row" style={{ display: 'grid', gridTemplateColumns: '100px 1fr 140px 110px 70px 90px 80px', padding: '13px 20px', borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', alignItems: 'center' }}
                  onMouseEnter={() => setHoveredRow(h.id)} onMouseLeave={() => setHoveredRow(null)}>
                  <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#facc15' }}>{h.id}</div>
                  <div style={{ fontSize: '12px', color: '#fff', fontWeight: 500 }}>{h.name || '—'}</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '10px', color: 'rgba(255,255,255,0.35)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {h.farmer_wallet ? `${h.farmer_wallet.slice(0,12)}...` : h.farmer || '—'}
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{h.harvest_date}</div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: (h.scan_count||0) > 10 ? '#f87171' : 'rgba(255,255,255,0.5)' }}>
                    {h.scan_count || 0}{(h.scan_count||0) > 10 && <span style={{ fontSize: '9px', marginLeft: '2px' }}>⚠</span>}
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: '20px', background: sc.bg, border: `1px solid rgba(${sc.rgb},0.25)`, fontSize: '9px', color: sc.color, whiteSpace: 'nowrap' }}>{sc.label}</div>
                  <button onClick={() => navigate(`/verify-result?id=${h.id}`)}
                    style={{ padding: '4px 10px', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '4px', color: 'rgba(255,255,255,0.35)', fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(250,204,21,0.4)'; e.currentTarget.style.color='#facc15' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.12)'; e.currentTarget.style.color='rgba(255,255,255,0.35)' }}>View</button>
                </div>
              )
            })}
          </div>

          <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.15)' }}>
              Showing {filtered.length} of {totalHarvests} records · {profiles.length} registered users
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#facc15', display: 'inline-block', animation: 'pulse-dot 2s infinite' }} />
              <span style={{ fontSize: '9px', color: 'rgba(250,204,21,0.5)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Live · Supabase Realtime</span>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}