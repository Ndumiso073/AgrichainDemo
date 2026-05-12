import { useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import '@fontsource/bebas-neue'
import '@fontsource/inter'
import farmerIcon from '../assets/icons/farmers.png'
import bgImage from '../assets/images/werner-sevenster-JuP0ZG0UNi0-unsplash.jpg'
import { supabase } from '../supabaseClient'

const CROP_TYPES = ['Maize', 'Wheat', 'Tomatoes', 'Soybean', 'Sunflower', 'Cabbage', 'Potato', 'Onion', 'Spinach', 'Other']
const CHEMICAL_OPTIONS = ['None', 'Fertiliser', 'Pesticide A', 'Pesticide B', 'Herbicide A', 'Herbicide B', 'Fungicide', 'Other']
const UNITS = ['kg', 'ton', 'bag', 'crate', 'box', 'litre', 'head', 'bunch']

const CROP_EMOJIS = {
  'Maize': '🌽',
  'Wheat': '🌾',
  'Tomatoes': '🍅',
  'Soybean': '🫘',
  'Sunflower': '🌻',
  'Cabbage': '🥬',
  'Potato': '🥔',
  'Onion': '🧅',
  'Spinach': '🥬',
  'Other': '🌱'
}

const SA_LOCATION_SUGGESTIONS = [
  'Stellenbosch, Western Cape', 'Paarl, Western Cape', 'Franschhoek, Western Cape',
  'Worcester, Western Cape', 'Robertson, Western Cape', 'Ceres, Western Cape',
  'Grabouw, Western Cape', 'Elgin, Western Cape', 'Piketberg, Western Cape',
  'Middelburg, Eastern Cape', 'Graaff-Reinet, Eastern Cape', 'Cradock, Eastern Cape',
  'George, Garden Route', 'Knysna, Garden Route', 'Oudtshoorn, Klein Karoo',
  'Ladysmith, KwaZulu-Natal', 'Newcastle, KwaZulu-Natal', 'Dundee, KwaZulu-Natal',
  'Potchefstroom, North West', 'Rustenburg, North West', 'Brits, North West',
  'Polokwane, Limpopo', 'Tzaneen, Limpopo', 'Phalaborwa, Limpopo',
  'Nelspruit, Mpumalanga', 'Witbank, Mpumalanga', 'Secunda, Mpumalanga',
  'Bloemfontein, Free State', 'Bethlehem, Free State', 'Kroonstad, Free State',
  'Upington, Northern Cape', 'Kimberley, Northern Cape', 'Springbok, Northern Cape',
  'Johannesburg Surrounds, Gauteng', 'Pretoria Surrounds, Gauteng', 'Magaliesburg, Gauteng'
]

function generateId() {
  const random = Math.floor(1000 + Math.random() * 9000)
  return `HC-${random}`
}

export default function RegisterHarvest() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    farmer: '',
    farmer_wallet: '',
    price: '',
    unit: 'kg',
    stock: '',
    crop: '',
    harvest_date: '',
    location: '',
    chemicals: 'None',
    description: '',
  })

  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submittedId, setSubmittedId] = useState('')
  const [hoveredBtn, setHoveredBtn] = useState(null)
  const [focusedField, setFocusedField] = useState(null)
  const [submitError, setSubmitError] = useState('')

  const [locationSuggestions, setLocationSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [highlightedIdx, setHighlightedIdx] = useState(-1)
  const suggestionsRef = useRef(null)
  const locationInputRef = useRef(null)

  function handleLocationInput(value) {
    update('location', value)
    if (value.trim().length < 2) {
      setLocationSuggestions([])
      setShowSuggestions(false)
      return
    }
    const lower = value.toLowerCase()
    const matches = SA_LOCATION_SUGGESTIONS.filter(s => s.toLowerCase().includes(lower)).slice(0, 6)
    setLocationSuggestions(matches)
    setShowSuggestions(matches.length > 0)
    setHighlightedIdx(-1)
  }

  function selectSuggestion(suggestion) {
    update('location', suggestion)
    setShowSuggestions(false)
    setLocationSuggestions([])
  }

  function handleLocationKeyDown(e) {
    if (!showSuggestions) return
    if (e.key === 'ArrowDown') { 
      e.preventDefault(); 
      setHighlightedIdx(i => Math.min(i + 1, locationSuggestions.length - 1)) 
    }
    else if (e.key === 'ArrowUp') { 
      e.preventDefault(); 
      setHighlightedIdx(i => Math.max(i - 1, -1)) 
    }
    else if (e.key === 'Enter' && highlightedIdx >= 0) { 
      e.preventDefault(); 
      selectSuggestion(locationSuggestions[highlightedIdx]) 
    }
    else if (e.key === 'Escape') setShowSuggestions(false)
  }

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        suggestionsRef.current && !suggestionsRef.current.contains(e.target) &&
        locationInputRef.current && !locationInputRef.current.contains(e.target)
      ) setShowSuggestions(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Harvest name is required'
    if (!form.farmer.trim()) e.farmer = 'Farmer name is required'
    if (!form.crop) e.crop = 'Crop type is required'
    if (!form.harvest_date) e.harvest_date = 'Harvest date is required'
    if (!form.location.trim()) e.location = 'Location is required'
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0)
      e.price = 'Valid price is required'
    if (!form.stock || isNaN(Number(form.stock)) || Number(form.stock) < 0)
      e.stock = 'Valid stock quantity is required'
    return e
  }

  async function handleSubmit() {
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) { 
      setErrors(validationErrors)
      return 
    }
    
    setErrors({})
    setSubmitError('')
    setSubmitting(true)

    try {
      const harvestId = generateId()
      const cropEmoji = CROP_EMOJIS[form.crop] || '🌾'

      const harvestData = {
        id: harvestId,
        name: form.name.trim(),
        farmer: form.farmer.trim(),
        farmer_wallet: form.farmer_wallet.trim() || null,
        price: parseFloat(Number(form.price).toFixed(2)),
        unit: form.unit,
        stock: parseInt(form.stock, 10),
        harvest_date: form.harvest_date,
        chemicals: form.chemicals === 'None' ? null : form.chemicals,
        location: form.location.trim() || null,
        image: cropEmoji,
        description: form.description.trim() || `${form.crop} harvest from ${form.location.trim()}`,
        verified: true,
      }

      console.log('Attempting to insert:', harvestData)

      // Try a simple insert first
      const { data, error } = await supabase
        .from('harvests')
        .insert([harvestData])
        .select()

      if (error) {
        console.error('Insert error details:', error)
        
        // Check for specific errors
        if (error.code === '42501') {
          throw new Error('Permission denied. Please run: GRANT INSERT ON harvests TO anon, authenticated; in Supabase SQL editor')
        } else if (error.code === '42P01') {
          throw new Error('Table "harvests" not found. Please check your table name.')
        } else if (error.message.includes('row-level security')) {
          throw new Error('RLS policy blocking insert. Please add INSERT policy in Supabase.')
        } else {
          throw new Error(error.message)
        }
      }

      if (!data || data.length === 0) {
        throw new Error('No data returned from insert')
      }

      console.log('Insert successful!', data[0])
      setSubmittedId(harvestId)
      setSubmitted(true)

    } catch (err) {
      console.error('Submit error:', err)
      setSubmitError(err.message || 'Failed to save harvest. Check console for details.')
      setSubmitting(false)
    }
  }

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => { const e = { ...prev }; delete e[field]; return e })
  }

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

  // Success screen
  if (submitted) {
    return (
      <>
        <style>{`
          @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.4} }
          @keyframes scaleIn { from{opacity:0;transform:scale(0.88)} to{opacity:1;transform:scale(1)} }
          .success-card { animation: scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both; }
        `}</style>
        <div style={{ fontFamily: "'Inter', sans-serif", minHeight: '100vh', background: '#060c04', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'fixed', inset: 0, backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.18) saturate(0.5)' }} />
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(4,9,2,0.85)' }} />

          <div className="success-card" style={{ position: 'relative', zIndex: 1, maxWidth: '520px', width: '100%', margin: '24px', padding: '48px 40px', background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: '18px', textAlign: 'center' }}>
            <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: '2px', background: 'linear-gradient(to right, transparent, #4ade80, transparent)', borderRadius: '2px' }} />

            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '28px', color: '#4ade80' }}>✓</div>

            <p style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: '#4ade80', margin: '0 0 10px' }}>Harvest saved</p>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '52px', color: '#fff', letterSpacing: '2px', lineHeight: '0.9', margin: '0 0 16px' }}>
              HARVEST <span style={{ color: '#4ade80' }}>REGISTERED</span>
            </h2>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', lineHeight: '1.7', margin: '0 0 28px' }}>
              Your harvest has been successfully saved and is now visible to buyers on the marketplace.
            </p>

            <div style={{ padding: '14px 16px', background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.12)', borderRadius: '8px', marginBottom: '32px', textAlign: 'left' }}>
              <div style={{ fontSize: '8px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: '6px' }}>Harvest ID</div>
              <div style={{ fontFamily: 'monospace', fontSize: '14px', color: '#4ade80' }}>{submittedId}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '32px', textAlign: 'left' }}>
              {[
                { label: 'Name', value: form.name },
                { label: 'Farmer', value: form.farmer },
                { label: 'Crop', value: form.crop },
                { label: 'Date', value: form.harvest_date },
                { label: 'Price', value: `R ${Number(form.price).toFixed(2)} / ${form.unit}` },
                { label: 'Stock', value: `${form.stock} ${form.unit}` },
                { label: 'Location', value: form.location },
                { label: 'Chemicals', value: form.chemicals },
              ].map(({ label, value }) => (
                <div key={label} style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px' }}>
                  <div style={{ fontSize: '8px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)', marginBottom: '4px' }}>{label}</div>
                  <div style={{ fontSize: '12px', color: '#fff' }}>{value}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  setSubmitted(false)
                  setForm({ 
                    name: '', 
                    farmer: '', 
                    farmer_wallet: '', 
                    price: '', 
                    unit: 'kg', 
                    stock: '', 
                    crop: '', 
                    harvest_date: '', 
                    location: '', 
                    chemicals: 'None', 
                    description: '' 
                  })
                }}
                style={{ flex: 1, padding: '11px', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.4)', borderRadius: '6px', color: '#4ade80', fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(74,222,128,0.18)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(74,222,128,0.1)'}
              >
                Register Another
              </button>
              <button
                onClick={() => navigate('/farmer')}
                style={{ flex: 1, padding: '11px', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', color: 'rgba(255,255,255,0.45)', fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s' }}
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

  // Main form
  return (
    <>
      <style>{`
        @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes dropIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        .reg-page { animation: fadeUp 0.4s ease both; }
        select option { background: #0d1a0a; color: #fff; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.4); cursor: pointer; }
        .suggestion-item:hover { background: rgba(74,222,128,0.1) !important; color: #4ade80 !important; }
        .suggestion-item.highlighted { background: rgba(74,222,128,0.1) !important; color: #4ade80 !important; }
      `}</style>

      <div className="reg-page" style={{ fontFamily: "'Inter', sans-serif", minHeight: '100vh', background: '#060c04', position: 'relative', overflow: 'hidden' }}>

        {/* Background */}
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.2) saturate(0.55)' }} />
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'linear-gradient(135deg, rgba(4,9,2,0.93) 0%, rgba(6,12,4,0.82) 100%)' }} />

        {/* Navbar */}
        <nav style={{ position: 'sticky', top: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: '60px', background: 'rgba(4,9,2,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(74,222,128,0.10)' }}>
          <div onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '20px', letterSpacing: '3px' }}>
              <span style={{ color: '#4ade80' }}>AGRI</span>
              <span style={{ color: '#fff' }}>CHAIN</span>
            </span>
            <span style={{ fontSize: '7px', color: 'rgba(255,255,255,0.25)', letterSpacing: '2px', textTransform: 'uppercase' }}>Blockchain Verified</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={farmerIcon} alt="Farmer" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
            </div>
            <span style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' }}>Register Harvest</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 12px', background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.18)', borderRadius: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', display: 'inline-block', animation: 'pulse-dot 2s infinite' }} />
              <span style={{ fontSize: '10px', color: '#4ade80', fontFamily: 'monospace' }}>Farmer</span>
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
        <main style={{ position: 'relative', zIndex: 1, maxWidth: '720px', margin: '0 auto', padding: '48px 24px 80px' }}>

          {/* Heading */}
          <div style={{ marginBottom: '36px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: '#4ade80', margin: '0 0 8px' }}>Database registration</p>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(40px, 6vw, 68px)', color: '#fff', letterSpacing: '2px', lineHeight: '0.9', margin: '0 0 10px' }}>
              NEW <span style={{ color: '#4ade80' }}>HARVEST</span>
            </h1>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', margin: 0, lineHeight: '1.6' }}>
              Fill in the details below. Once submitted, this record will be saved and visible to buyers on the marketplace.
            </p>
          </div>

          {/* Form card */}
          <div style={{ background: 'rgba(255,255,255,0.025)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ height: '2px', background: 'linear-gradient(to right, #4ade80, rgba(74,222,128,0.2), transparent)' }} />

            <div style={{ padding: '36px' }}>

              {/* Section: Harvest Identity */}
              <div style={{ fontSize: '9px', letterSpacing: '2.5px', textTransform: 'uppercase', color: 'rgba(74,222,128,0.5)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>Harvest Identity</span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(74,222,128,0.12)' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={labelStyle}>Harvest Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Spring Tomato Batch"
                    value={form.name}
                    onChange={e => update('name', e.target.value)}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    style={inputStyle('name')}
                  />
                  {errors.name && <div style={errorStyle}>{errors.name}</div>}
                </div>

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
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={labelStyle}>Farmer Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. John Dlamini"
                    value={form.farmer}
                    onChange={e => update('farmer', e.target.value)}
                    onFocus={() => setFocusedField('farmer')}
                    onBlur={() => setFocusedField(null)}
                    style={inputStyle('farmer')}
                  />
                  {errors.farmer && <div style={errorStyle}>{errors.farmer}</div>}
                </div>

                <div>
                  <label style={labelStyle}>Wallet Address <span style={{ color: 'rgba(255,255,255,0.2)' }}>(optional)</span></label>
                  <input
                    type="text"
                    placeholder="0x..."
                    value={form.farmer_wallet}
                    onChange={e => update('farmer_wallet', e.target.value)}
                    onFocus={() => setFocusedField('farmer_wallet')}
                    onBlur={() => setFocusedField(null)}
                    style={{ ...inputStyle('farmer_wallet'), fontFamily: 'monospace', fontSize: '11px' }}
                  />
                </div>
              </div>

              <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '8px 0 24px' }} />

              {/* Section: Pricing & Stock */}
              <div style={{ fontSize: '9px', letterSpacing: '2.5px', textTransform: 'uppercase', color: 'rgba(74,222,128,0.5)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>Pricing &amp; Stock</span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(74,222,128,0.12)' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={labelStyle}>Price (ZAR) *</label>
                  <input
                    type="number"
                    placeholder="e.g. 150.00"
                    value={form.price}
                    min="0"
                    step="0.01"
                    onChange={e => update('price', e.target.value)}
                    onFocus={() => setFocusedField('price')}
                    onBlur={() => setFocusedField(null)}
                    style={inputStyle('price')}
                  />
                  {errors.price && <div style={errorStyle}>{errors.price}</div>}
                </div>

                <div>
                  <label style={labelStyle}>Unit *</label>
                  <select
                    value={form.unit}
                    onChange={e => update('unit', e.target.value)}
                    onFocus={() => setFocusedField('unit')}
                    onBlur={() => setFocusedField(null)}
                    style={{ ...inputStyle('unit'), appearance: 'none', cursor: 'pointer' }}
                  >
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Stock *</label>
                  <input
                    type="number"
                    placeholder="e.g. 500"
                    value={form.stock}
                    min="0"
                    step="1"
                    onChange={e => update('stock', e.target.value)}
                    onFocus={() => setFocusedField('stock')}
                    onBlur={() => setFocusedField(null)}
                    style={inputStyle('stock')}
                  />
                  {errors.stock && <div style={errorStyle}>{errors.stock}</div>}
                </div>
              </div>

              <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '8px 0 24px' }} />

              {/* Section: Farm Details */}
              <div style={{ fontSize: '9px', letterSpacing: '2.5px', textTransform: 'uppercase', color: 'rgba(74,222,128,0.5)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>Farm Details</span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(74,222,128,0.12)' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={labelStyle}>Harvest Date *</label>
                  <input
                    type="date"
                    value={form.harvest_date}
                    onChange={e => update('harvest_date', e.target.value)}
                    onFocus={() => setFocusedField('harvest_date')}
                    onBlur={() => setFocusedField(null)}
                    style={{ ...inputStyle('harvest_date'), colorScheme: 'dark' }}
                  />
                  {errors.harvest_date && <div style={errorStyle}>{errors.harvest_date}</div>}
                </div>

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
              </div>

              {/* Location with autocomplete */}
              <div style={{ marginBottom: '20px', position: 'relative' }}>
                <label style={labelStyle}>Farm Location *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    ref={locationInputRef}
                    type="text"
                    placeholder="Start typing a region, town or province..."
                    value={form.location}
                    onChange={e => handleLocationInput(e.target.value)}
                    onFocus={() => { setFocusedField('location'); if (locationSuggestions.length > 0) setShowSuggestions(true) }}
                    onBlur={() => setFocusedField(null)}
                    onKeyDown={handleLocationKeyDown}
                    autoComplete="off"
                    style={{ ...inputStyle('location'), paddingRight: '36px' }}
                  />
                  <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', pointerEvents: 'none', opacity: 0.35 }}>📍</span>
                </div>

                {showSuggestions && (
                  <div ref={suggestionsRef} style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: '#0d1a0a', border: '1px solid rgba(74,222,128,0.2)', borderRadius: '8px', overflow: 'hidden', zIndex: 100, boxShadow: '0 8px 32px rgba(0,0,0,0.5)', animation: 'dropIn 0.15s ease both' }}>
                    {locationSuggestions.map((s, idx) => (
                      <div
                        key={s}
                        className={`suggestion-item${highlightedIdx === idx ? ' highlighted' : ''}`}
                        onMouseDown={() => selectSuggestion(s)}
                        style={{ padding: '10px 14px', fontSize: '12px', color: highlightedIdx === idx ? '#4ade80' : 'rgba(255,255,255,0.6)', background: highlightedIdx === idx ? 'rgba(74,222,128,0.08)' : 'transparent', cursor: 'pointer', transition: 'all 0.15s', borderBottom: idx < locationSuggestions.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
                      >
                        <span style={{ fontSize: '10px', opacity: 0.4 }}>📍</span>
                        {s}
                      </div>
                    ))}
                  </div>
                )}
                {errors.location && <div style={errorStyle}>{errors.location}</div>}
              </div>

              {/* Description */}
              <div style={{ marginBottom: '28px' }}>
                <label style={labelStyle}>Description <span style={{ color: 'rgba(255,255,255,0.2)' }}>(optional)</span></label>
                <textarea
                  placeholder="Any extra details about this harvest..."
                  value={form.description}
                  onChange={e => update('description', e.target.value)}
                  onFocus={() => setFocusedField('description')}
                  onBlur={() => setFocusedField(null)}
                  rows={3}
                  style={{ ...inputStyle('description'), resize: 'vertical', minHeight: '80px', lineHeight: '1.6' }}
                />
              </div>

              {/* Submit error */}
              {submitError && (
                <div style={{ padding: '12px 16px', background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: '8px', marginBottom: '16px', fontSize: '12px', color: '#f87171', lineHeight: '1.5' }}>
                  ⚠ {submitError}
                </div>
              )}

              {/* Submit button */}
              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={{
                  width: '100%', padding: '14px',
                  background: submitting ? 'rgba(74,222,128,0.06)' : hoveredBtn === 'submit' ? 'rgba(74,222,128,0.18)' : 'rgba(74,222,128,0.1)',
                  border: '1px solid rgba(74,222,128,0.45)',
                  borderRadius: '8px',
                  color: submitting ? 'rgba(74,222,128,0.5)' : '#4ade80',
                  fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase',
                  cursor: submitting ? 'not-allowed' : 'pointer',
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
                    <span style={{ display: 'inline-block', width: '14px', height: '14px', border: '2px solid rgba(74,222,128,0.3)', borderTopColor: '#4ade80', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    Saving harvest...
                  </>
                ) : (
                  '⬡ Register Harvest'
                )}
              </button>

            </div>
          </div>

          <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.15)' }}>Fields marked * are required</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', display: 'inline-block', animation: 'pulse-dot 2s infinite' }} />
              <span style={{ fontSize: '9px', color: 'rgba(74,222,128,0.5)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>AgriChain Marketplace</span>
            </div>
          </div>

        </main>
      </div>
    </>
  )
}