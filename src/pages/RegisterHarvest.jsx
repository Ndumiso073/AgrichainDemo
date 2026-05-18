import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import '@fontsource/bebas-neue'
import '@fontsource/inter'
import farmerIcon from '../assets/icons/farmers.png'
import bgImage from '../assets/images/werner-sevenster-JuP0ZG0UNi0-unsplash.jpg'

const CROP_TYPES = ['Maize', 'Wheat', 'Tomatoes', 'Soybean', 'Sunflower', 'Cabbage', 'Potato', 'Onion', 'Spinach', 'Other']
const CHEMICAL_OPTIONS = ['None', 'Fertiliser', 'Pesticide A', 'Pesticide B', 'Herbicide A', 'Herbicide B', 'Fungicide', 'Other']
const PAYMENT_STATUSES = ['Unpaid', 'Partially Paid', 'Fully Paid']

export default function RegisterHarvest() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    crop: '',
    harvestDate: '',
    gpsLat: '',
    gpsLng: '',
    chemicals: 'None',
    paymentStatus: 'Unpaid',
    notes: '',
  })

  const [errors, setErrors]     = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted]   = useState(false)
  const [txHash, setTxHash]         = useState('')
  const [hoveredBtn, setHoveredBtn] = useState(null)
  const [focusedField, setFocusedField] = useState(null)

  const account = '0x4f3a...d92c'

  function validate() {
    const e = {}
    if (!form.crop)        e.crop        = 'Crop type is required'
    if (!form.harvestDate) e.harvestDate = 'Harvest date is required'
    if (!form.gpsLat)      e.gpsLat      = 'Latitude is required'
    if (!form.gpsLng)      e.gpsLng      = 'Longitude is required'
    if (form.gpsLat && isNaN(parseFloat(form.gpsLat)))  e.gpsLat = 'Must be a valid number'
    if (form.gpsLng && isNaN(parseFloat(form.gpsLng)))  e.gpsLng = 'Must be a valid number'
    return e
  }

  async function handleSubmit() {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    setErrors({})
    setSubmitting(true)

    // Simulate blockchain transaction (replace with ethers.js call later)
    await new Promise(r => setTimeout(r, 2800))
    const fakeHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
    setTxHash(fakeHash)
    setSubmitting(false)
    setSubmitted(true)
  }

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => { const e = { ...prev }; delete e[field]; return e })
  }

  // ── Shared input styles ──────────────────────────────────────────────────
  const inputStyle = (field) => ({
    width: '100%',
    padding: '11px 14px',
    background: focusedField === field ? 'rgba(74,222,128,0.04)' : 'rgba(255,255,255,0.03)',
    border: errors[field]
      ? '1px solid rgba(248,113,113,0.5)'
      : focusedField === field
        ? '1px solid rgba(74,222,128,0.4)'
        : '1px solid rgba(255,255,255,0.09)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '13px',
    fontFamily: "'Inter', sans-serif",
    outline: 'none',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
  })

  const labelStyle = {
    fontSize: '9px',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.3)',
    marginBottom: '7px',
    display: 'block',
  }

  const errorStyle = {
    fontSize: '10px',
    color: '#f87171',
    marginTop: '5px',
    letterSpacing: '0.2px',
  }

  // ── Success screen ───────────────────────────────────────────────────────
  if (submitted) {
    return (
      <>
        <style>{`
          @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.4} }
          @keyframes scaleIn { from{opacity:0;transform:scale(0.88)} to{opacity:1;transform:scale(1)} }
          .success-card { animation: scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both; }
        `}</style>
        <div style={{
          fontFamily: "'Inter', sans-serif",
          minHeight: '100vh',
          background: '#060c04',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'fixed', inset: 0,
            backgroundImage: `url(${bgImage})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            filter: 'brightness(0.18) saturate(0.5)',
          }} />
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(4,9,2,0.85)' }} />

          <div className="success-card" style={{
            position: 'relative', zIndex: 1,
            maxWidth: '520px', width: '100%', margin: '24px',
            padding: '48px 40px',
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(74,222,128,0.2)',
            borderRadius: '18px',
            textAlign: 'center',
          }}>
            {/* Top accent */}
            <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: '2px', background: 'linear-gradient(to right, transparent, #4ade80, transparent)', borderRadius: '2px' }} />

            {/* Check icon */}
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'rgba(74,222,128,0.1)',
              border: '1px solid rgba(74,222,128,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: '28px',
            }}>
              ✓
            </div>

            <p style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: '#4ade80', margin: '0 0 10px' }}>
              Transaction confirmed
            </p>
            <h2 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '52px', color: '#fff',
              letterSpacing: '2px', lineHeight: '0.9',
              margin: '0 0 16px',
            }}>
              HARVEST <span style={{ color: '#4ade80' }}>REGISTERED</span>
            </h2>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', lineHeight: '1.7', margin: '0 0 28px' }}>
              Your harvest has been permanently written to the Polygon blockchain. It is now tamper-proof and verifiable by any buyer.
            </p>

            {/* TX hash */}
            <div style={{
              padding: '14px 16px',
              background: 'rgba(74,222,128,0.04)',
              border: '1px solid rgba(74,222,128,0.12)',
              borderRadius: '8px',
              marginBottom: '32px',
              textAlign: 'left',
            }}>
              <div style={{ fontSize: '8px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: '6px' }}>Transaction Hash</div>
              <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#4ade80', wordBreak: 'break-all', lineHeight: '1.5' }}>{txHash}</div>
            </div>

            {/* Registered details */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              gap: '10px', marginBottom: '32px', textAlign: 'left',
            }}>
              {[
                { label: 'Crop',     value: form.crop },
                { label: 'Date',     value: form.harvestDate },
                { label: 'GPS',      value: `${form.gpsLat}, ${form.gpsLng}` },
                { label: 'Chemicals',value: form.chemicals },
                { label: 'Payment',  value: form.paymentStatus },
              ].map(({ label, value }) => (
                <div key={label} style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px' }}>
                  <div style={{ fontSize: '8px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)', marginBottom: '4px' }}>{label}</div>
                  <div style={{ fontSize: '12px', color: '#fff' }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => navigate('/qr-viewer')}
                style={{
                  flex: 1, padding: '11px',
                  background: 'rgba(74,222,128,0.1)',
                  border: '1px solid rgba(74,222,128,0.4)',
                  borderRadius: '6px', color: '#4ade80',
                  fontSize: '11px', letterSpacing: '1.5px',
                  textTransform: 'uppercase', cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(74,222,128,0.18)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(74,222,128,0.1)'}
              >
                View QR Code
              </button>
              <button
                onClick={() => navigate('/farmer')}
                style={{
                  flex: 1, padding: '11px',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '6px', color: 'rgba(255,255,255,0.45)',
                  fontSize: '11px', letterSpacing: '1.5px',
                  textTransform: 'uppercase', cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.color = '#fff' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)' }}
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }

  // ── Main form ────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to { transform: rotate(360deg); } }
        .reg-page { animation: fadeUp 0.4s ease both; }
        select option { background: #0d1a0a; color: #fff; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.4); cursor: pointer; }
      `}</style>

      <div
        className="reg-page"
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
          filter: 'brightness(0.2) saturate(0.55)',
        }} />
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'linear-gradient(135deg, rgba(4,9,2,0.93) 0%, rgba(6,12,4,0.82) 100%)' }} />

        {/* Navbar */}
        <nav style={{
          position: 'sticky', top: 0, zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 32px', height: '60px',
          background: 'rgba(4,9,2,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(74,222,128,0.10)',
        }}>
          <div onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '20px', letterSpacing: '3px' }}>
              <span style={{ color: '#4ade80' }}>AGRI</span>
              <span style={{ color: '#fff' }}>CHAIN</span>
            </span>
            <span style={{ fontSize: '7px', color: 'rgba(255,255,255,0.25)', letterSpacing: '2px', textTransform: 'uppercase' }}>Blockchain Verified</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <img src={farmerIcon} alt="Farmer" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
            </div>
            <span style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' }}>
              Register Harvest
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '5px 12px',
              background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.18)', borderRadius: '4px',
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', display: 'inline-block', animation: 'pulse-dot 2s infinite' }} />
              <span style={{ fontSize: '10px', color: '#4ade80', fontFamily: 'monospace' }}>{account}</span>
            </div>
            <button
              onClick={() => navigate('/farmer')}
              style={{
                background: 'transparent', border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.35)', fontSize: '10px',
                letterSpacing: '1.5px', textTransform: 'uppercase',
                padding: '5px 14px', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.35)' }}
            >
              ← Dashboard
            </button>
          </div>
        </nav>

        {/* Main */}
        <main style={{ position: 'relative', zIndex: 1, maxWidth: '720px', margin: '0 auto', padding: '48px 24px 80px' }}>

          {/* Heading */}
          <div style={{ marginBottom: '36px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: '#4ade80', margin: '0 0 8px' }}>
              On-chain registration
            </p>
            <h1 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 'clamp(40px, 6vw, 68px)',
              color: '#fff', letterSpacing: '2px', lineHeight: '0.9',
              margin: '0 0 10px',
            }}>
              NEW <span style={{ color: '#4ade80' }}>HARVEST</span>
            </h1>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', margin: 0, lineHeight: '1.6' }}>
              Fill in the details below. Once submitted, this record will be permanently written to the Polygon blockchain and cannot be altered.
            </p>
          </div>

          {/* Form card */}
          <div style={{
            background: 'rgba(255,255,255,0.025)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '16px',
            overflow: 'hidden',
          }}>
            {/* Card top accent */}
            <div style={{ height: '2px', background: 'linear-gradient(to right, #4ade80, rgba(74,222,128,0.2), transparent)' }} />

            <div style={{ padding: '36px' }}>

              {/* Row 1: Crop + Date */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={labelStyle}>Crop Type *</label>
                  <select
                    value={form.crop}
                    onChange={e => update('crop', e.target.value)}
                    onFocus={() => setFocusedField('crop')}
                    onBlur={() => setFocusedField(null)}
                    style={{ ...inputStyle('crop'), appearance: 'none', cursor: 'pointer' }}
                  >
                    <option value="">Select crop...</option>
                    {CROP_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.crop && <div style={errorStyle}>{errors.crop}</div>}
                </div>

                <div>
                  <label style={labelStyle}>Harvest Date *</label>
                  <input
                    type="date"
                    value={form.harvestDate}
                    onChange={e => update('harvestDate', e.target.value)}
                    onFocus={() => setFocusedField('harvestDate')}
                    onBlur={() => setFocusedField(null)}
                    style={{ ...inputStyle('harvestDate'), colorScheme: 'dark' }}
                  />
                  {errors.harvestDate && <div style={errorStyle}>{errors.harvestDate}</div>}
                </div>
              </div>

              {/* Row 2: GPS */}
              <div style={{ marginBottom: '8px' }}>
                <label style={labelStyle}>GPS Location *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <input
                      type="text"
                      placeholder="Latitude (e.g. -29.8579)"
                      value={form.gpsLat}
                      onChange={e => update('gpsLat', e.target.value)}
                      onFocus={() => setFocusedField('gpsLat')}
                      onBlur={() => setFocusedField(null)}
                      style={inputStyle('gpsLat')}
                    />
                    {errors.gpsLat && <div style={errorStyle}>{errors.gpsLat}</div>}
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Longitude (e.g. 31.0292)"
                      value={form.gpsLng}
                      onChange={e => update('gpsLng', e.target.value)}
                      onFocus={() => setFocusedField('gpsLng')}
                      onBlur={() => setFocusedField(null)}
                      style={inputStyle('gpsLng')}
                    />
                    {errors.gpsLng && <div style={errorStyle}>{errors.gpsLng}</div>}
                  </div>
                </div>
                {/* GPS helper */}
                <div style={{ marginTop: '6px', fontSize: '10px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.2px' }}>
                  💡 Use Google Maps → right-click your farm location → copy coordinates
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '24px 0' }} />

              {/* Row 3: Chemicals + Payment */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={labelStyle}>Chemicals Used</label>
                  <select
                    value={form.chemicals}
                    onChange={e => update('chemicals', e.target.value)}
                    onFocus={() => setFocusedField('chemicals')}
                    onBlur={() => setFocusedField(null)}
                    style={{ ...inputStyle('chemicals'), appearance: 'none', cursor: 'pointer' }}
                  >
                    {CHEMICAL_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Payment Status</label>
                  <select
                    value={form.paymentStatus}
                    onChange={e => update('paymentStatus', e.target.value)}
                    onFocus={() => setFocusedField('paymentStatus')}
                    onBlur={() => setFocusedField(null)}
                    style={{ ...inputStyle('paymentStatus'), appearance: 'none', cursor: 'pointer' }}
                  >
                    {PAYMENT_STATUSES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              {/* Row 4: Notes */}
              <div style={{ marginBottom: '28px' }}>
                <label style={labelStyle}>Additional Notes <span style={{ color: 'rgba(255,255,255,0.2)' }}>(optional)</span></label>
                <textarea
                  placeholder="Any extra details about this harvest..."
                  value={form.notes}
                  onChange={e => update('notes', e.target.value)}
                  onFocus={() => setFocusedField('notes')}
                  onBlur={() => setFocusedField(null)}
                  rows={3}
                  style={{
                    ...inputStyle('notes'),
                    resize: 'vertical',
                    minHeight: '80px',
                    lineHeight: '1.6',
                  }}
                />
              </div>

              {/* Info strip */}
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: '12px',
                padding: '14px 16px',
                background: 'rgba(74,222,128,0.04)',
                border: '1px solid rgba(74,222,128,0.1)',
                borderRadius: '8px',
                marginBottom: '28px',
              }}>
                <span style={{ fontSize: '16px', flexShrink: 0 }}>🔒</span>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', margin: 0, lineHeight: '1.65' }}>
                  This data will be hashed with SHA-256 and stored on the Polygon Amoy testnet. Once confirmed, it cannot be modified or deleted — ensuring full traceability.
                </p>
              </div>

              {/* Submit button */}
              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={{
                  width: '100%', padding: '14px',
                  background: submitting
                    ? 'rgba(74,222,128,0.06)'
                    : hoveredBtn === 'submit'
                      ? 'rgba(74,222,128,0.18)'
                      : 'rgba(74,222,128,0.1)',
                  border: '1px solid rgba(74,222,128,0.45)',
                  borderRadius: '8px',
                  color: submitting ? 'rgba(74,222,128,0.5)' : '#4ade80',
                  fontSize: '12px', letterSpacing: '2px',
                  textTransform: 'uppercase', cursor: submitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.25s ease',
                  transform: hoveredBtn === 'submit' && !submitting ? 'translateY(-1px)' : 'translateY(0)',
                  boxShadow: hoveredBtn === 'submit' && !submitting ? '0 8px 24px rgba(74,222,128,0.14)' : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                }}
                onMouseEnter={() => setHoveredBtn('submit')}
                onMouseLeave={() => setHoveredBtn(null)}
              >
                {submitting ? (
                  <>
                    <span style={{
                      display: 'inline-block', width: '14px', height: '14px',
                      border: '2px solid rgba(74,222,128,0.3)',
                      borderTopColor: '#4ade80',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                    }} />
                    Writing to blockchain...
                  </>
                ) : (
                  '⬡ Register Harvest on Polygon'
                )}
              </button>

            </div>
          </div>

          {/* Bottom note */}
          <div style={{
            marginTop: '20px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: '8px',
          }}>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.15)' }}>
              Fields marked * are required · Gas fees apply on mainnet
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', display: 'inline-block', animation: 'pulse-dot 2s infinite' }} />
              <span style={{ fontSize: '9px', color: 'rgba(74,222,128,0.5)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Polygon Amoy Testnet</span>
            </div>
          </div>

        </main>
      </div>
    </>
  )
}