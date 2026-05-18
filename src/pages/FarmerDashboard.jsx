import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import '@fontsource/bebas-neue'
import '@fontsource/inter'
import farmerIcon from '../assets/icons/farmers.png'
import bgImage from '../assets/images/dave-hoefler-Envk7kTMWTQ-unsplash.jpg'
import { supabase } from '../supabaseClient'

export default function FarmerDashboard() {
  const navigate = useNavigate()
  const [harvests, setHarvests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('All')
  const [hoveredRow, setHoveredRow] = useState(null)
  const [hoveredBtn, setHoveredBtn] = useState(null)
  const [selectedHarvest, setSelectedHarvest] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  const account = '0xFarmer...d92c'

  // Fetch harvests from Supabase
  useEffect(() => {
    fetchHarvests()
  }, [])

  async function fetchHarvests() {
    setLoading(true)
    setError(null)
    try {
      console.log('Fetching harvests from Supabase...')
      
      const { data, error } = await supabase
        .from('harvests')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error:', error)
        setError(`Database error: ${error.message}`)
        setHarvests([])
      } else if (data && data.length > 0) {
        console.log(`✅ Successfully loaded ${data.length} harvests`)
        setHarvests(data)
      } else {
        console.warn('⚠️ No harvests found')
        setHarvests([])
      }
    } catch (error) {
      console.error('Fetch error:', error)
      setError(error.message)
      setHarvests([])
    } finally {
      setLoading(false)
    }
  }

  // View harvest details
  function viewHarvestDetails(harvest) {
    setSelectedHarvest(harvest)
    setShowDetailsModal(true)
  }

  // Close modal
  function closeModal() {
    setShowDetailsModal(false)
    setSelectedHarvest(null)
  }

  // Calculate growing days
  function calculateGrowingDays(plantedDate, harvestDate) {
    if (!plantedDate || !harvestDate) return 'N/A'
    const planted = new Date(plantedDate)
    const harvested = new Date(harvestDate)
    const days = Math.round((harvested - planted) / (1000 * 60 * 60 * 24))
    return days > 0 ? `${days} days` : 'N/A'
  }

  const totalHarvests = harvests.length
  const totalStock = harvests.reduce((sum, h) => sum + (h.stock || 0), 0)
  const totalValue = harvests.reduce((sum, h) => sum + ((h.price || 0) * (h.stock || 0)), 0)

  const filters = ['All', 'Verified']

  const filteredHarvests = filter === 'All' 
    ? harvests 
    : harvests.filter(h => h.verified === true)

  return (
    <>
      <style>{`
        @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .dash-page { animation: fadeUp 0.45s ease both; }
        .table-row { transition: background 0.2s ease; cursor: pointer; }
        .table-row:hover { background: rgba(74,222,128,0.04) !important; }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.8);
          backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .modal-content {
          background: #060c04;
          border: 1px solid rgba(74,222,128,0.3);
          border-radius: 16px;
          padding: 32px;
          max-width: 600px;
          width: 90%;
          max-height: 85vh;
          overflow: auto;
          animation: fadeUp 0.3s ease both;
        }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(74,222,128,0.2); border-radius: 4px; }
      `}</style>

      <div className="dash-page" style={{
        fontFamily: "'Inter', sans-serif",
        minHeight: '100vh',
        background: '#060c04',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background */}
        <div style={{
          position: 'fixed', inset: 0, zIndex: 0,
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          filter: 'brightness(0.22) saturate(0.6)',
        }} />
        <div style={{
          position: 'fixed', inset: 0, zIndex: 0,
          background: 'linear-gradient(135deg, rgba(4,9,2,0.92) 0%, rgba(6,12,4,0.80) 100%)',
        }} />

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
            <span style={{ fontSize: '7px', color: 'rgba(255,255,255,0.25)', letterSpacing: '2px', textTransform: 'uppercase' }}>Farmer Portal</span>
          </div>

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
              onClick={() => navigate('/register-harvest')}
              style={{
                background: hoveredBtn === 'register' ? 'rgba(74,222,128,0.15)' : 'rgba(74,222,128,0.08)',
                border: '1px solid rgba(74,222,128,0.45)',
                borderRadius: '6px',
                color: '#4ade80',
                fontSize: '10px',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                padding: '5px 14px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={() => setHoveredBtn('register')}
              onMouseLeave={() => setHoveredBtn(null)}
            >
              + New Harvest
            </button>
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

        {/* Main Content */}
        <main style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: '40px 24px 80px' }}>

          {/* Page Heading */}
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
              All your registered harvests are permanently stored on the Polygon blockchain. Click any row to view details.
            </p>
          </div>

          {/* Stat Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '14px',
            marginBottom: '36px',
          }}>
            <div style={{
              padding: '20px 22px',
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(74,222,128,0.14)',
              borderRadius: '12px',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
                background: 'linear-gradient(to right, #4ade80, transparent)',
                opacity: 0.5,
              }} />
              <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)', marginBottom: '10px' }}>
                Total Harvests
              </div>
              <div style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: '48px', color: '#4ade80',
                lineHeight: 1, letterSpacing: '1px',
              }}>
                {totalHarvests}
              </div>
              <div style={{
                position: 'absolute', bottom: '-8px', right: '12px',
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: '72px', color: '#4ade80', opacity: 0.04,
                lineHeight: 1, pointerEvents: 'none',
              }}>
                {totalHarvests}
              </div>
            </div>

            <div style={{
              padding: '20px 22px',
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(74,222,128,0.14)',
              borderRadius: '12px',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
                background: 'linear-gradient(to right, #60a5fa, transparent)',
                opacity: 0.5,
              }} />
              <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)', marginBottom: '10px' }}>
                Total Stock
              </div>
              <div style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: '48px', color: '#60a5fa',
                lineHeight: 1, letterSpacing: '1px',
              }}>
                {totalStock}
              </div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.22)' }}>units available</div>
            </div>

            <div style={{
              padding: '20px 22px',
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(74,222,128,0.14)',
              borderRadius: '12px',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
                background: 'linear-gradient(to right, #facc15, transparent)',
                opacity: 0.5,
              }} />
              <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)', marginBottom: '10px' }}>
                Total Value
              </div>
              <div style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: '48px', color: '#facc15',
                lineHeight: 1, letterSpacing: '1px',
              }}>
                R{totalValue.toLocaleString()}
              </div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.22)' }}>estimated</div>
            </div>
          </div>

          {/* Filter and Actions */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: '12px',
            marginBottom: '16px',
          }}>
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
            <button
              onClick={fetchHarvests}
              style={{
                padding: '5px 14px',
                background: 'transparent',
                border: '1px solid rgba(96,165,250,0.3)',
                borderRadius: '6px',
                color: '#60a5fa',
                fontSize: '10px',
                cursor: 'pointer',
              }}
            >
              🔄 Refresh
            </button>
          </div>

          {/* Harvests Table */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <div style={{
                width: '40px', height: '40px',
                border: '3px solid rgba(74,222,128,0.2)',
                borderTopColor: '#4ade80',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
                margin: '0 auto 16px',
              }} />
              <p style={{ color: 'rgba(255,255,255,0.5)' }}>Loading harvests...</p>
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '60px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
              <p style={{ color: '#f87171' }}>{error}</p>
              <button onClick={fetchHarvests} style={{ marginTop: '16px', padding: '8px 20px', background: '#4ade80', border: 'none', borderRadius: '6px', color: '#060c04', cursor: 'pointer' }}>Retry</button>
            </div>
          ) : filteredHarvests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌾</div>
              <p style={{ color: 'rgba(255,255,255,0.3)' }}>No harvests found.</p>
              <button onClick={() => navigate('/register-harvest')} style={{ marginTop: '16px', padding: '8px 20px', background: '#4ade80', border: 'none', borderRadius: '6px', color: '#060c04', cursor: 'pointer' }}>Register Your First Harvest →</button>
            </div>
          ) : (
            <div style={{
              background: 'rgba(255,255,255,0.025)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '14px',
              overflow: 'hidden',
            }}>
              {/* Table Header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '70px 1fr 120px 100px 100px 80px 100px',
                padding: '12px 20px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(255,255,255,0.02)',
              }}>
                <div style={{ fontSize: '8px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)' }}>ID</div>
                <div style={{ fontSize: '8px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)' }}>Harvest Name</div>
                <div style={{ fontSize: '8px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)' }}>Crop</div>
                <div style={{ fontSize: '8px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)' }}>Harvest Date</div>
                <div style={{ fontSize: '8px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)' }}>Price</div>
                <div style={{ fontSize: '8px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)' }}>Stock</div>
                <div style={{ fontSize: '8px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)' }}>Status</div>
              </div>

              {/* Table Rows */}
              {filteredHarvests.map((harvest, index) => (
                <div
                  key={harvest.id}
                  className="table-row"
                  onClick={() => viewHarvestDetails(harvest)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '70px 1fr 120px 100px 100px 80px 100px',
                    padding: '14px 20px',
                    borderBottom: index < filteredHarvests.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    alignItems: 'center',
                    cursor: 'pointer',
                    background: hoveredRow === harvest.id ? 'rgba(74,222,128,0.04)' : 'transparent',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={() => setHoveredRow(harvest.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#4ade80', letterSpacing: '0.5px' }}>
                    {harvest.id}
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '500', color: '#fff' }}>
                    {harvest.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                    {harvest.crop} {harvest.image}
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                    {harvest.harvest_date}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#4ade80' }}>
                    R{harvest.price} / {harvest.unit}
                  </div>
                  <div style={{ fontSize: '13px', color: harvest.stock > 0 ? '#fff' : '#f87171' }}>
                    {harvest.stock} {harvest.unit}s
                  </div>
                  <div>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center',
                      padding: '3px 10px',
                      borderRadius: '20px',
                      background: 'rgba(74,222,128,0.08)',
                      border: '1px solid rgba(74,222,128,0.25)',
                      fontSize: '9px',
                      color: '#4ade80',
                    }}>
                      ✓ Verified
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div style={{
            marginTop: '24px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: '8px',
          }}>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.18)' }}>
              Showing {filteredHarvests.length} of {totalHarvests} harvests · All data stored on Polygon Amoy
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', display: 'inline-block', animation: 'pulse-dot 2s infinite' }} />
              <span style={{ fontSize: '9px', color: 'rgba(74,222,128,0.5)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Live · Block #18,442,207</span>
            </div>
          </div>
        </main>
      </div>

      {/* Harvest Details Modal */}
      {showDetailsModal && selectedHarvest && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '36px', color: '#4ade80', letterSpacing: '2px', margin: 0 }}>
                HARVEST DETAILS
              </h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '24px', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px', padding: '16px', background: 'rgba(74,222,128,0.05)', borderRadius: '12px' }}>
              <div style={{ fontSize: '64px' }}>{selectedHarvest.image || '🌾'}</div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>{selectedHarvest.name}</div>
                <div style={{ fontSize: '12px', color: '#4ade80', fontFamily: 'monospace' }}>ID: {selectedHarvest.id}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>👨‍🌾 Farmer</div>
                <div style={{ fontSize: '14px', color: '#fff' }}>{selectedHarvest.farmer}</div>
              </div>
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>🌱 Crop Type</div>
                <div style={{ fontSize: '14px', color: '#fff' }}>{selectedHarvest.crop}</div>
              </div>
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>📅 Planted Date</div>
                <div style={{ fontSize: '14px', color: '#fff' }}>{selectedHarvest.planted_date || 'N/A'}</div>
              </div>
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>📅 Harvest Date</div>
                <div style={{ fontSize: '14px', color: '#fff' }}>{selectedHarvest.harvest_date}</div>
              </div>
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>⏱️ Growing Period</div>
                <div style={{ fontSize: '14px', color: '#4ade80' }}>{calculateGrowingDays(selectedHarvest.planted_date, selectedHarvest.harvest_date)}</div>
              </div>
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>🧪 Chemicals Used</div>
                <div style={{ fontSize: '14px', color: selectedHarvest.chemicals === 'None' || !selectedHarvest.chemicals ? '#4ade80' : '#facc15' }}>
                  {selectedHarvest.chemicals || 'None'}
                </div>
              </div>
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>📍 Location</div>
                <div style={{ fontSize: '14px', color: '#fff' }}>{selectedHarvest.location}</div>
              </div>
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>💰 Price</div>
                <div style={{ fontSize: '14px', color: '#4ade80', fontWeight: 'bold' }}>R{selectedHarvest.price} / {selectedHarvest.unit}</div>
              </div>
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>📦 Stock Available</div>
                <div style={{ fontSize: '14px', color: selectedHarvest.stock > 0 ? '#fff' : '#f87171' }}>{selectedHarvest.stock} {selectedHarvest.unit}s</div>
              </div>
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>🔗 Blockchain Status</div>
                <div style={{ fontSize: '14px', color: '#4ade80' }}>✓ Verified on Polygon</div>
              </div>
            </div>

            {/* Blockchain Hash */}
            {selectedHarvest.blockchain_hash && (
              <div style={{ padding: '16px', background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.12)', borderRadius: '8px', marginBottom: '24px' }}>
                <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '8px' }}>🔒 SHA-256 Blockchain Hash</div>
                <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#4ade80', wordBreak: 'break-all' }}>{selectedHarvest.blockchain_hash}</div>
              </div>
            )}

            {/* Description */}
            {selectedHarvest.description && (
              <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', marginBottom: '24px' }}>
                <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '8px' }}>📝 Description</div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6' }}>{selectedHarvest.description}</div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  closeModal()
                  navigate(`/qr-viewer?id=${selectedHarvest.id}`)
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'rgba(74,222,128,0.1)',
                  border: '1px solid rgba(74,222,128,0.4)',
                  borderRadius: '8px',
                  color: '#4ade80',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                📱 View QR Code
              </button>
              <button
                onClick={closeModal}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: 'rgba(255,255,255,0.6)',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}