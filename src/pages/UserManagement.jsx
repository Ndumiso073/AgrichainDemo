import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import '@fontsource/bebas-neue'
import '@fontsource/inter'
import adminIcon from '../assets/icons/admin.png'
import farmerIcon from '../assets/icons/farmers.png'
import buyerIcon from '../assets/icons/user.png'
import bgImage from '../assets/images/stijn-te-strake-UdhpcfImQ9Y-unsplash.jpg'

// ── Mock users ─────────────────────────────────────────────────────────────
const INITIAL_USERS = [
  { id: 1, wallet: '0x4f3a8b2c9d1e6f7a3b4c5d2e8f9a1b0c',  role: 'Farmer', name: 'Sipho Dlamini',   harvests: 12, joined: '2025-01-14', active: true  },
  { id: 2, wallet: '0x8b2ca14f3d9e6f7b4c5d2e8f9a1b0c3d',  role: 'Farmer', name: 'Ayanda Nkosi',    harvests: 8,  joined: '2025-02-03', active: true  },
  { id: 3, wallet: '0x3e9dc72b1a4f8b2c5d6e9f0a3b7c4d1e',  role: 'Farmer', name: 'Thabo Mokoena',   harvests: 6,  joined: '2025-02-18', active: false },
  { id: 4, wallet: '0xBuyerf10a2b3c4d5e6f7a8b9c0d1e2f3a',  role: 'Buyer',  name: 'Nomsa Khumalo',   harvests: 0,  joined: '2025-03-01', active: true  },
  { id: 5, wallet: '0xBuyerc3d12b4c5d6e7f8a9b0c1d2e3f4a',  role: 'Buyer',  name: 'Lungelo Zulu',    harvests: 0,  joined: '2025-03-12', active: true  },
  { id: 6, wallet: '0xBuyera7b23c4d5e6f7a8b9c0d1e2f3a4b',  role: 'Buyer',  name: 'Precious Cele',   harvests: 0,  joined: '2025-03-22', active: false },
  { id: 7, wallet: '0xAdmin9f2e1b3c4d5e6f7a8b9c0d1e2f3a4',  role: 'Admin',  name: 'System Admin',    harvests: 0,  joined: '2025-01-01', active: true  },
  { id: 8, wallet: '0x1c4d7e2f5a8b3c6d9e0f1a4b7c2d5e8f',  role: 'Farmer', name: 'Bongani Mthembu', harvests: 3,  joined: '2025-04-05', active: true  },
]

const ROLE_CFG = {
  Farmer: { color: '#4ade80', rgb: '74,222,128',  icon: farmerIcon },
  Buyer:  { color: '#60a5fa', rgb: '96,165,250',  icon: buyerIcon  },
  Admin:  { color: '#facc15', rgb: '250,204,21',  icon: adminIcon  },
}

export default function UserManagement() {
  const navigate = useNavigate()
  const [users, setUsers]           = useState(INITIAL_USERS)
  const [filter, setFilter]         = useState('All')
  const [search, setSearch]         = useState('')
  const [hoveredRow, setHoveredRow] = useState(null)
  const [hoveredBtn, setHoveredBtn] = useState(null)
  const [editingRole, setEditingRole] = useState(null)
  const [focused, setFocused]       = useState(false)
  const [toast, setToast]           = useState(null)

  const account = '0xAdmin...9f2e'

  function showToast(msg, color = '#4ade80') {
    setToast({ msg, color })
    setTimeout(() => setToast(null), 2500)
  }

  function toggleAccess(id) {
    setUsers(prev => prev.map(u => {
      if (u.id !== id) return u
      const next = { ...u, active: !u.active }
      showToast(`${next.active ? 'Enabled' : 'Disabled'} access for ${next.name}`, next.active ? '#4ade80' : '#f87171')
      return next
    }))
  }

  function changeRole(id, role) {
    setUsers(prev => prev.map(u => {
      if (u.id !== id) return u
      showToast(`Role changed to ${role} for ${u.name}`, ROLE_CFG[role].color)
      return { ...u, role }
    }))
    setEditingRole(null)
  }

  const filtered = users.filter(u => {
    const matchRole   = filter === 'All' || u.role === filter
    const matchSearch = search === '' || u.name.toLowerCase().includes(search.toLowerCase()) || u.wallet.toLowerCase().includes(search.toLowerCase())
    return matchRole && matchSearch
  })

  const totalFarmers = users.filter(u => u.role === 'Farmer').length
  const totalBuyers  = users.filter(u => u.role === 'Buyer').length
  const totalAdmins  = users.filter(u => u.role === 'Admin').length
  const totalActive  = users.filter(u => u.active).length

  return (
    <>
      <style>{`
        @keyframes pulse-dot  { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes fadeUp     { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes toastIn    { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .um-page  { animation: fadeUp 0.4s ease both; }
        .table-row { transition: background 0.2s ease; }
        .table-row:hover { background: rgba(250,204,21,0.03) !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '28px', right: '28px', zIndex: 200,
          padding: '12px 20px',
          background: 'rgba(6,12,4,0.95)',
          border: `1px solid rgba(${toast.color === '#4ade80' ? '74,222,128' : toast.color === '#f87171' ? '248,113,113' : '250,204,21'},0.35)`,
          borderRadius: '8px', color: toast.color,
          fontSize: '12px', letterSpacing: '0.3px',
          animation: 'toastIn 0.3s ease',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>
          {toast.msg}
        </div>
      )}

      <div className="um-page" style={{ fontFamily: "'Inter', sans-serif", minHeight: '100vh', background: '#060c04', position: 'relative', overflow: 'hidden' }}>

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
            <span style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' }}>User Management</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 12px', background: 'rgba(250,204,21,0.06)', border: '1px solid rgba(250,204,21,0.18)', borderRadius: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#facc15', display: 'inline-block', animation: 'pulse-dot 2s infinite' }} />
              <span style={{ fontSize: '10px', color: '#facc15', fontFamily: 'monospace' }}>{account}</span>
            </div>
            <button onClick={() => navigate('/admin')} style={{ background: 'transparent', border: '1px solid rgba(250,204,21,0.3)', color: '#facc15', fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', padding: '5px 14px', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(250,204,21,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              ← Dashboard
            </button>
            <button onClick={() => navigate('/')} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.35)', fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', padding: '5px 14px', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.35)' }}>
              Exit
            </button>
          </div>
        </nav>

        <main style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto', padding: '40px 24px 80px' }}>

          {/* Heading */}
          <div style={{ marginBottom: '32px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: '#facc15', margin: '0 0 8px' }}>Role-based Access Control</p>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(40px, 6vw, 72px)', color: '#fff', letterSpacing: '2px', lineHeight: '0.9', margin: '0 0 10px' }}>
              USER <span style={{ color: '#facc15' }}>MANAGEMENT</span>
            </h1>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', margin: 0, lineHeight: '1.6' }}>
              Manage wallet addresses, assign roles, and control platform access across the network.
            </p>
          </div>

          {/* ── Summary stat cards ────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '28px' }}>
            {[
              { label: 'Total Users',   value: users.length,  accent: '#facc15', rgb: '250,204,21'  },
              { label: 'Farmers',       value: totalFarmers,  accent: '#4ade80', rgb: '74,222,128'  },
              { label: 'Buyers',        value: totalBuyers,   accent: '#60a5fa', rgb: '96,165,250'  },
              { label: 'Active Now',    value: totalActive,   accent: '#4ade80', rgb: '74,222,128'  },
            ].map(({ label, value, accent, rgb }) => (
              <div key={label} style={{ padding: '18px 20px', background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: `1px solid rgba(${rgb},0.12)`, borderRadius: '12px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(to right, ${accent}, transparent)`, opacity: 0.5 }} />
                <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: '8px' }}>{label}</div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '44px', color: accent, lineHeight: 1 }}>{value}</div>
                <div style={{ position: 'absolute', bottom: '-6px', right: '10px', fontFamily: "'Bebas Neue', sans-serif", fontSize: '58px', color: accent, opacity: 0.04, lineHeight: 1, pointerEvents: 'none' }}>{value}</div>
              </div>
            ))}
          </div>

          {/* ── Table controls ────────────────────────────────── */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
            {/* Filter pills */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['All', 'Farmer', 'Buyer', 'Admin'].map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{ padding: '5px 16px', borderRadius: '20px', border: filter === f ? '1px solid rgba(250,204,21,0.5)' : '1px solid rgba(255,255,255,0.1)', background: filter === f ? 'rgba(250,204,21,0.1)' : 'transparent', color: filter === f ? '#facc15' : 'rgba(255,255,255,0.35)', fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s' }}>
                  {f}
                </button>
              ))}
            </div>

            {/* Search */}
            <input
              type="text"
              placeholder="Search by name or wallet..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              style={{
                padding: '7px 14px', width: '240px',
                background: focused ? 'rgba(250,204,21,0.04)' : 'rgba(255,255,255,0.03)',
                border: focused ? '1px solid rgba(250,204,21,0.35)' : '1px solid rgba(255,255,255,0.09)',
                borderRadius: '6px', color: '#fff',
                fontSize: '12px', fontFamily: "'Inter', sans-serif",
                outline: 'none', transition: 'all 0.2s',
              }}
            />
          </div>

          {/* ── Users table ───────────────────────────────────── */}
          <div style={{ background: 'rgba(255,255,255,0.025)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', overflow: 'hidden' }}>
            <div style={{ height: '2px', background: 'linear-gradient(to right, #facc15, rgba(250,204,21,0.2), transparent)' }} />

            {/* Col headers */}
            <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr 80px 100px 90px 90px 90px', padding: '10px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
              {['Name', 'Wallet', 'Role', 'Joined', 'Harvests', 'Status', 'Actions'].map(col => (
                <div key={col} style={{ fontSize: '8px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)' }}>{col}</div>
              ))}
            </div>

            {/* Rows */}
            {filtered.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '13px' }}>No users found.</div>
            ) : filtered.map((u, i) => {
              const rc = ROLE_CFG[u.role]
              return (
                <div key={u.id} className="table-row" style={{ display: 'grid', gridTemplateColumns: '180px 1fr 80px 100px 90px 90px 90px', padding: '13px 20px', borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', alignItems: 'center' }}
                  onMouseEnter={() => setHoveredRow(u.id)} onMouseLeave={() => setHoveredRow(null)}>

                  {/* Name + icon */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: `rgba(${rc.rgb},0.08)`, border: `1px solid rgba(${rc.rgb},0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <img src={rc.icon} alt={u.role} style={{ width: '14px', height: '14px', objectFit: 'contain' }} />
                    </div>
                    <span style={{ fontSize: '12px', color: '#fff', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.name}</span>
                  </div>

                  {/* Wallet */}
                  <div style={{ fontFamily: 'monospace', fontSize: '10px', color: 'rgba(255,255,255,0.3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '8px' }}>{u.wallet}</div>

                  {/* Role — clickable to change */}
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => setEditingRole(editingRole === u.id ? null : u.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '20px', background: `rgba(${rc.rgb},0.08)`, border: `1px solid rgba(${rc.rgb},0.25)`, color: rc.color, fontSize: '9px', letterSpacing: '0.5px', cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                      {u.role} <span style={{ fontSize: '8px', opacity: 0.6 }}>▾</span>
                    </button>
                    {/* Role dropdown */}
                    {editingRole === u.id && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '4px', zIndex: 10, background: 'rgba(6,12,4,0.97)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', overflow: 'hidden', minWidth: '100px', backdropFilter: 'blur(20px)' }}>
                        {['Farmer', 'Buyer', 'Admin'].map(r => (
                          <button key={r} onClick={() => changeRole(u.id, r)} style={{ display: 'block', width: '100%', padding: '9px 14px', background: r === u.role ? `rgba(${ROLE_CFG[r].rgb},0.08)` : 'transparent', border: 'none', color: ROLE_CFG[r].color, fontSize: '11px', textAlign: 'left', cursor: 'pointer', transition: 'background 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.background = `rgba(${ROLE_CFG[r].rgb},0.1)`}
                            onMouseLeave={e => e.currentTarget.style.background = r === u.role ? `rgba(${ROLE_CFG[r].rgb},0.08)` : 'transparent'}>
                            {r}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Joined */}
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>{u.joined}</div>

                  {/* Harvests */}
                  <div style={{ fontSize: '12px', color: u.harvests > 0 ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.2)' }}>{u.harvests > 0 ? u.harvests : '—'}</div>

                  {/* Status toggle */}
                  <div>
                    <div
                      onClick={() => toggleAccess(u.id)}
                      style={{
                        width: '40px', height: '22px', borderRadius: '11px',
                        background: u.active ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.08)',
                        border: u.active ? '1px solid rgba(74,222,128,0.4)' : '1px solid rgba(255,255,255,0.12)',
                        position: 'relative', cursor: 'pointer', transition: 'all 0.25s',
                      }}
                    >
                      <div style={{
                        position: 'absolute', top: '3px',
                        left: u.active ? '20px' : '3px',
                        width: '14px', height: '14px', borderRadius: '50%',
                        background: u.active ? '#4ade80' : 'rgba(255,255,255,0.3)',
                        transition: 'all 0.25s ease',
                        boxShadow: u.active ? '0 0 6px rgba(74,222,128,0.5)' : 'none',
                      }} />
                    </div>
                  </div>

                  {/* Action */}
                  <button
                    onClick={() => toggleAccess(u.id)}
                    style={{
                      padding: '4px 10px',
                      background: 'transparent',
                      border: u.active ? '1px solid rgba(248,113,113,0.25)' : '1px solid rgba(74,222,128,0.25)',
                      borderRadius: '4px',
                      color: u.active ? '#f87171' : '#4ade80',
                      fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = u.active ? 'rgba(248,113,113,0.08)' : 'rgba(74,222,128,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {u.active ? 'Revoke' : 'Enable'}
                  </button>
                </div>
              )
            })}
          </div>

          {/* RBAC legend */}
          <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            {[
              { role: 'Farmer', color: '#4ade80', rgb: '74,222,128',  perms: ['Register harvests', 'View own records', 'Generate QR codes'] },
              { role: 'Buyer',  color: '#60a5fa', rgb: '96,165,250',  perms: ['Scan QR codes', 'View verification results', 'Report suspicious scans'] },
              { role: 'Admin',  color: '#facc15', rgb: '250,204,21',  perms: ['Full system access', 'Manage all users', 'View all records + fraud data'] },
            ].map(({ role, color, rgb, perms }) => (
              <div key={role} style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: `1px solid rgba(${rgb},0.1)`, borderRadius: '10px' }}>
                <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color, marginBottom: '10px' }}>{role} Permissions</div>
                {perms.map(p => (
                  <div key={p} style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '5px' }}>
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: color, opacity: 0.6, flexShrink: 0 }} />
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>{p}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.15)' }}>Showing {filtered.length} of {users.length} users · RBAC enforced on-chain</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#facc15', display: 'inline-block', animation: 'pulse-dot 2s infinite' }} />
              <span style={{ fontSize: '9px', color: 'rgba(250,204,21,0.5)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Live · Block #18,442,217</span>
            </div>
          </div>

        </main>
      </div>
    </>
  )
}