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
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('All')
  const [hoveredRow, setHoveredRow] = useState(null)
  const [hoveredBtn, setHoveredBtn] = useState(null)
  const [selectedHarvest, setSelectedHarvest] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [deliveryDate, setDeliveryDate] = useState('')
  const [processing, setProcessing] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState(null)
  const [activeTab, setActiveTab] = useState('harvests')
  const [notificationCount, setNotificationCount] = useState(0)
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false)
  
  // Sensor notification state
  const [sensorNotifications, setSensorNotifications] = useState([])
  const [showSensorDropdown, setShowSensorDropdown] = useState(false)
  const [sensorAlertCount, setSensorAlertCount] = useState(0)
  
  // Farmer name state
  const [farmerName, setFarmerName] = useState('Farmer')

  const account = '0xFarmer...d92c'

  // Fetch farmer name from profiles table
  useEffect(() => {
    fetchFarmerName()
    // Initialize sensor notifications with simulated data
    initializeSensorNotifications()
    
    // Set up interval to simulate real-time sensor data (every 30 seconds)
    const sensorInterval = setInterval(() => {
      generateRandomSensorAlert()
    }, 30000)
    
    return () => clearInterval(sensorInterval)
  }, [])

  async function fetchFarmerName() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single()
        
        if (profile && profile.full_name) {
          setFarmerName(profile.full_name)
        }
      }
    } catch (error) {
      console.error('Error fetching farmer name:', error)
    }
  }

  // Initialize sensor notifications
  function initializeSensorNotifications() {
    const initialNotifications = [
      {
        id: 'sensor-1',
        type: 'soil_moisture',
        title: 'Soil Moisture Alert',
        message: 'Field A soil moisture is low (22%). Irrigation recommended.',
        severity: 'warning',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        read: false,
        sensor: 'SM-001',
        value: '22%',
        threshold: '40%'
      },
      {
        id: 'sensor-2',
        type: 'temperature',
        title: 'Temperature Warning',
        message: 'Greenhouse temperature has reached 38°C. Consider opening vents.',
        severity: 'info',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        read: true,
        sensor: 'TEMP-003',
        value: '38°C',
        threshold: '35°C'
      }
    ]
    setSensorNotifications(initialNotifications)
    const unreadCount = initialNotifications.filter(n => !n.read).length
    setSensorAlertCount(unreadCount)
  }

  // Generate random sensor alert (simulating IoT data)
  function generateRandomSensorAlert() {
    const alertTypes = [
      {
        type: 'soil_moisture',
        title: 'Soil Moisture Alert',
        message: 'Field B soil moisture is critically low (18%). Immediate irrigation required!',
        severity: 'critical',
        sensor: 'SM-002',
        value: '18%',
        threshold: '40%'
      },
      {
        type: 'temperature',
        title: 'High Temperature Alert',
        message: 'Field temperature has exceeded safe levels (42°C). Heat stress risk for crops.',
        severity: 'critical',
        sensor: 'TEMP-001',
        value: '42°C',
        threshold: '35°C'
      },
      {
        type: 'humidity',
        title: 'Humidity Alert',
        message: 'High humidity detected (85%). Risk of fungal diseases.',
        severity: 'warning',
        sensor: 'HUM-001',
        value: '85%',
        threshold: '70%'
      },
      {
        type: 'rainfall',
        title: 'Rainfall Warning',
        message: 'Heavy rainfall expected in the next 2 hours. Protect harvested crops.',
        severity: 'warning',
        sensor: 'WTH-001',
        value: '25mm',
        threshold: '10mm'
      },
      {
        type: 'pest',
        title: 'Pest Detection Alert',
        message: 'Unusual pest activity detected in the eastern section. Check immediately.',
        severity: 'critical',
        sensor: 'PEST-001',
        value: 'High',
        threshold: 'Normal'
      },
      {
        type: 'water_level',
        title: 'Water Tank Alert',
        message: 'Water tank level is at 15%. Refill required soon.',
        severity: 'warning',
        sensor: 'TANK-001',
        value: '15%',
        threshold: '30%'
      }
    ]
    
    // Randomly select an alert type (30% chance to generate alert)
    if (Math.random() < 0.3) {
      const randomAlert = alertTypes[Math.floor(Math.random() * alertTypes.length)]
      const newAlert = {
        id: 'sensor-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        ...randomAlert,
        timestamp: new Date().toISOString(),
        read: false
      }
      
      setSensorNotifications(prev => [newAlert, ...prev].slice(0, 20)) // Keep last 20 notifications
      setSensorAlertCount(prev => prev + 1)
      
      // Show toast notification for critical alerts
      if (randomAlert.severity === 'critical') {
        showNotificationMessage(`⚠️ CRITICAL: ${randomAlert.message}`, '#f87171')
      } else if (randomAlert.severity === 'warning') {
        showNotificationMessage(`⚠️ ${randomAlert.title}: ${randomAlert.message}`, '#facc15')
      }
    }
  }

  // Mark sensor notification as read
  function markSensorNotificationAsRead(notificationId) {
    setSensorNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    )
    setSensorAlertCount(prev => Math.max(0, prev - 1))
  }

  // Mark all sensor notifications as read
  function markAllSensorNotificationsAsRead() {
    setSensorNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    )
    setSensorAlertCount(0)
  }

  // Get severity color
  function getSeverityColor(severity) {
    switch(severity) {
      case 'critical': return '#f87171'
      case 'warning': return '#facc15'
      case 'info': return '#60a5fa'
      default: return '#4ade80'
    }
  }

  // Get sensor icon
  function getSensorIcon(type) {
    switch(type) {
      case 'soil_moisture': return '💧'
      case 'temperature': return '🌡️'
      case 'humidity': return '💨'
      case 'rainfall': return '🌧️'
      case 'pest': return '🐛'
      case 'water_level': return '🚰'
      default: return '📡'
    }
  }

  useEffect(() => {
    fetchHarvests()
    fetchAllPendingOrders()
    
    // Set up real-time subscription for order updates
    const subscription = supabase
      .channel('orders_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' }, 
        () => {
          console.log('Order changed, refreshing...')
          fetchAllPendingOrders()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function fetchHarvests() {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('harvests')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error:', error)
        setError(`Database error: ${error.message}`)
        setHarvests([])
      } else if (data && data.length > 0) {
        console.log(`✅ Loaded ${data.length} harvests`)
        setHarvests(data)
      } else {
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

  // Fetch ALL pending orders
  async function fetchAllPendingOrders() {
    try {
      console.log('========== FETCHING PENDING ORDERS ==========');
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'Pending')
        .order('order_date', { ascending: false })
      
      if (error) {
        console.error('Error fetching pending orders:', error);
        setOrders([]);
        setNotificationCount(0);
        return;
      }
      
      console.log(`✅ Found ${data?.length || 0} pending orders`);
      
      if (data && data.length > 0) {
        data.forEach(order => {
          console.log(`  - Order ${order.id}: buyer=${order.buyer_name || order.buyer_wallet?.slice(0, 10)}..., total=${order.total}`);
        });
      }
      
      setOrders(data || []);
      setNotificationCount(data?.length || 0);
      console.log(`📢 Notification count (pending orders): ${data?.length || 0}`);
      console.log('=============================================');
      
    } catch (error) {
      console.error('Error loading orders:', error);
      setOrders([]);
      setNotificationCount(0);
    }
  }

  async function approveOrder(order, deliveryDateValue) {
    if (!deliveryDateValue) {
      alert('Please select a delivery date')
      return
    }
    
    setProcessing(true)
    try {
      console.log('Approving order:', order.id, 'with delivery date:', deliveryDateValue)
      
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          status: 'Approved',
          delivery_date: deliveryDateValue,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', order.id)
      
      if (updateError) throw updateError
      
      console.log('✅ Order approved in database')
      
      const notification = {
        id: 'NOTIF-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
        buyer_wallet: order.buyer_wallet,
        buyer_name: order.buyer_name,
        order_id: order.id,
        message: `✅ Your order #${order.id} has been approved by ${farmerName}! Delivery scheduled for ${new Date(deliveryDateValue).toLocaleDateString()}. Please check your orders page for details.`,
        type: 'order_approved',
        read: false,
        created_at: new Date().toISOString(),
        delivery_date: deliveryDateValue,
        farmer_name: farmerName
      }
      
      const { error: notifError } = await supabase
        .from('notifications')
        .insert([notification])
      
      if (notifError) {
        console.error('Error saving notification:', notifError)
      } else {
        console.log('✅ Notification sent to buyer:', order.buyer_name || order.buyer_wallet)
      }
      
      showNotificationMessage('✓ Order approved successfully! Buyer has been notified.')
      
      await fetchAllPendingOrders()
      setShowApproveModal(false)
      setSelectedOrder(null)
      setDeliveryDate('')
      
    } catch (error) {
      console.error('Error approving order:', error)
      alert('Failed to approve order. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  function showNotificationMessage(message, color = '#4ade80') {
    setNotificationMessage(message)
    setTimeout(() => setNotificationMessage(null), 3000)
  }

  function viewHarvestDetails(harvest) {
    setSelectedHarvest(harvest)
    setShowDetailsModal(true)
  }

  function closeModal() {
    setShowDetailsModal(false)
    setSelectedHarvest(null)
  }

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
  const pendingOrders = orders.length
  const totalOrders = orders.length

  const filters = ['All', 'Verified']
  const filteredHarvests = filter === 'All' ? harvests : harvests.filter(h => h.verified === true)

  return (
    <>
      <style>{`
        @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideIn { from{transform:translateX(100%)} to{transform:translateX(0)} }
        @keyframes bounce { 0%,100%{transform:scale(1)} 50%{transform:scale(1.2)} }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse-red { 0%,100%{opacity:1} 50%{opacity:0.6} }
        .dash-page { animation: fadeUp 0.45s ease both; }
        .table-row { transition: background 0.2s ease; cursor: pointer; }
        .table-row:hover { background: rgba(74,222,128,0.04) !important; }
        .orders-table-row { transition: background 0.2s ease; }
        .orders-table-row:hover { background: rgba(96,165,250,0.05) !important; }
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
        .tab-button {
          transition: all 0.2s ease;
        }
        .notification-dropdown, .sensor-dropdown {
          position: absolute;
          top: 50px;
          right: 0;
          width: 380px;
          background: #060c04;
          border: 1px solid rgba(74,222,128,0.3);
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.5);
          z-index: 200;
          overflow: hidden;
        }
        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: bold;
        }
        .sensor-item {
          transition: all 0.2s ease;
        }
        .sensor-item:hover {
          background: rgba(74,222,128,0.05);
          transform: translateX(4px);
        }
        .critical-alert {
          animation: pulse-red 1s infinite;
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

        {/* Notification Toast */}
        {notificationMessage && (
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: '#4ade80',
            color: '#060c04',
            padding: '12px 20px',
            borderRadius: '8px',
            zIndex: 1001,
            animation: 'slideIn 0.3s ease',
            fontWeight: 'bold'
          }}>
            {notificationMessage}
          </div>
        )}

        {/* Navbar */}
        <nav style={{
          position: 'sticky', top: 0, zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 32px', height: '60px',
          background: 'rgba(4,9,2,0.85)',
          backdropFilter: 'blur(20px)',
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
            {/* Sensor Notification Bell */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowSensorDropdown(!showSensorDropdown)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '20px',
                  position: 'relative',
                  padding: '8px'
                }}
              >
                📡
                {sensorAlertCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    background: '#f87171',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    fontSize: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    animation: 'bounce 0.5s ease'
                  }}>
                    {sensorAlertCount}
                  </span>
                )}
              </button>
              
              {showSensorDropdown && (
                <div className="sensor-dropdown">
                  <div style={{ padding: '12px', borderBottom: '1px solid rgba(74,222,128,0.2)', fontWeight: 'bold', color: '#4ade80', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>📡 IoT Sensor Alerts ({sensorAlertCount} unread)</span>
                    {sensorAlertCount > 0 && (
                      <button
                        onClick={markAllSensorNotificationsAsRead}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#60a5fa',
                          fontSize: '10px',
                          cursor: 'pointer'
                        }}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {sensorNotifications.length === 0 ? (
                      <div style={{ padding: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
                        No sensor alerts
                      </div>
                    ) : (
                      sensorNotifications.map(alert => (
                        <div
                          key={alert.id}
                          className={`sensor-item ${alert.severity === 'critical' && !alert.read ? 'critical-alert' : ''}`}
                          onClick={() => markSensorNotificationAsRead(alert.id)}
                          style={{
                            padding: '12px',
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                            background: alert.read ? 'rgba(255,255,255,0.02)' : `rgba(${alert.severity === 'critical' ? '248,113,113' : alert.severity === 'warning' ? '250,204,21' : '96,165,250'}, 0.08)`,
                            cursor: 'pointer',
                            transition: 'background 0.2s'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                            <div style={{ fontSize: '24px' }}>{getSensorIcon(alert.type)}</div>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                <div style={{ fontSize: '12px', fontWeight: 'bold', color: getSeverityColor(alert.severity) }}>
                                  {alert.title}
                                </div>
                                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>
                                  {new Date(alert.timestamp).toLocaleTimeString()}
                                </div>
                              </div>
                              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', marginBottom: '6px' }}>
                                {alert.message}
                              </div>
                              <div style={{ display: 'flex', gap: '12px', fontSize: '9px', color: 'rgba(255,255,255,0.4)' }}>
                                <span>Sensor: {alert.sensor}</span>
                                <span>Value: {alert.value}</span>
                                <span>Threshold: {alert.threshold}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div style={{ padding: '8px', borderTop: '1px solid rgba(74,222,128,0.2)', textAlign: 'center' }}>
  <button
    onClick={() => {
      setShowSensorDropdown(false)
      navigate('/sensor-dashboard')
    }}
    style={{
      background: 'transparent',
      border: 'none',
      color: '#60a5fa',
      fontSize: '11px',
      cursor: 'pointer',
      marginRight: '12px'
    }}
  >
    View All Analytics →
  </button>
  <button
    onClick={() => setShowSensorDropdown(false)}
    style={{
      background: 'transparent',
      border: 'none',
      color: 'rgba(255,255,255,0.5)',
      fontSize: '11px',
      cursor: 'pointer'
    }}
  >
    Close
  </button>
</div>
                </div>
              )}
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '5px 12px',
              background: 'rgba(74,222,128,0.06)',
              border: '1px solid rgba(74,222,128,0.18)',
              borderRadius: '4px',
            }}>
              <div style={{
                width: '24px', height: '24px', borderRadius: '50%',
                background: '#4ade8020', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <span style={{ fontSize: '12px' }}>🌾</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '10px', color: '#4ade80', fontWeight: 'bold' }}>{farmerName}</span>
                <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>{account}</span>
              </div>
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
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.35)' }}
            >
              Exit
            </button>
          </div>
        </nav>

        {/* Main Content */}
        <main style={{ position: 'relative', zIndex: 1, maxWidth: '1400px', margin: '0 auto', padding: '40px 24px 80px' }}>
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
              {farmerName}'s <span style={{ color: '#4ade80' }}>SMART FARM</span>
            </h1>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', margin: 0 }}>
              Monitor your IoT sensors, manage harvests, and approve customer orders.
            </p>
          </div>

          {/* Stat Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '14px',
            marginBottom: '36px',
          }}>
            <div style={{
              padding: '20px 22px',
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(74,222,128,0.14)',
              borderRadius: '12px',
              cursor: 'pointer',
              onClick: () => setActiveTab('harvests')
            }}>
              <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)', marginBottom: '10px' }}>
                Total Harvests
              </div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '48px', color: '#4ade80', lineHeight: 1 }}>
                {totalHarvests}
              </div>
            </div>

            <div style={{
              padding: '20px 22px',
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(74,222,128,0.14)',
              borderRadius: '12px',
            }}>
              <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)', marginBottom: '10px' }}>
                Total Stock
              </div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '48px', color: '#60a5fa', lineHeight: 1 }}>
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
            }}>
              <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)', marginBottom: '10px' }}>
                Total Value
              </div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '48px', color: '#facc15', lineHeight: 1 }}>
                R{totalValue.toLocaleString()}
              </div>
            </div>

            <div style={{
              padding: '20px 22px',
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(250,204,21,0.14)',
              borderRadius: '12px',
              cursor: 'pointer',
              onClick: () => setActiveTab('orders')
            }}>
              <div style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)', marginBottom: '10px' }}>
                Pending Orders
              </div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '48px', color: '#facc15', lineHeight: 1 }}>
                {pendingOrders}
              </div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.22)' }}>need approval</div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '24px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            paddingBottom: '12px'
          }}>
            <button
              className="tab-button"
              onClick={() => setActiveTab('harvests')}
              style={{
                padding: '8px 24px',
                background: activeTab === 'harvests' ? 'rgba(74,222,128,0.15)' : 'transparent',
                border: activeTab === 'harvests' ? '1px solid rgba(74,222,128,0.4)' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: activeTab === 'harvests' ? '#4ade80' : 'rgba(255,255,255,0.5)',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              🌾 My Harvests ({totalHarvests})
            </button>
            <button
              className="tab-button"
              onClick={() => setActiveTab('orders')}
              style={{
                padding: '8px 24px',
                background: activeTab === 'orders' ? 'rgba(250,204,21,0.15)' : 'transparent',
                border: activeTab === 'orders' ? '1px solid rgba(250,204,21,0.4)' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: activeTab === 'orders' ? '#facc15' : 'rgba(255,255,255,0.5)',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              📦 Pending Orders ({pendingOrders})
            </button>
          </div>

          {/* HARVESTS SECTION - Removed Status column */}
          {activeTab === 'harvests' && (
            <>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexWrap: 'wrap', gap: '12px', marginBottom: '16px',
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
                        cursor: 'pointer',
                      }}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <button onClick={fetchHarvests} style={{
                  padding: '5px 14px',
                  background: 'transparent',
                  border: '1px solid rgba(96,165,250,0.3)',
                  borderRadius: '6px',
                  color: '#60a5fa',
                  fontSize: '10px',
                  cursor: 'pointer',
                }}>🔄 Refresh</button>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '60px' }}>
                  <div style={{ width: '40px', height: '40px', border: '3px solid rgba(74,222,128,0.2)', borderTopColor: '#4ade80', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
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
                  overflow: 'auto',
                }}>
                  {/* Table Header - Removed ID and Status columns */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 120px 100px 100px 80px',
                    padding: '12px 20px',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    background: 'rgba(255,255,255,0.02)',
                    fontSize: '10px',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.3)',
                    minWidth: '700px'
                  }}>
                    <div>Harvest Name</div>
                    <div>Crop</div>
                    <div>Harvest Date</div>
                    <div>Price</div>
                    <div>Stock</div>
                  </div>

                  {/* Table Rows */}
                  {filteredHarvests.map((harvest, index) => (
                    <div
                      key={harvest.id}
                      className="table-row"
                      onClick={() => viewHarvestDetails(harvest)}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 120px 100px 100px 80px',
                        padding: '14px 20px',
                        borderBottom: index < filteredHarvests.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                        alignItems: 'center',
                        cursor: 'pointer',
                        background: hoveredRow === harvest.id ? 'rgba(74,222,128,0.04)' : 'transparent',
                        transition: 'background 0.2s',
                        minWidth: '700px'
                      }}
                      onMouseEnter={() => setHoveredRow(harvest.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      <div style={{ fontSize: '13px', fontWeight: '500', color: '#fff' }}>{harvest.name}</div>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>{harvest.crop}</div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{harvest.harvest_date}</div>
                      <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#4ade80' }}>R{harvest.price}/{harvest.unit}</div>
                      <div style={{ fontSize: '13px', color: harvest.stock > 0 ? '#fff' : '#f87171' }}>{harvest.stock} {harvest.unit}s</div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ORDERS SECTION - Table Format (Removed Order ID column) */}
          {activeTab === 'orders' && (
            <div>
              <div style={{ marginBottom: '16px', textAlign: 'right' }}>
                <button
                  onClick={fetchAllPendingOrders}
                  style={{
                    padding: '8px 16px',
                    background: 'rgba(74,222,128,0.1)',
                    border: '1px solid rgba(74,222,128,0.3)',
                    borderRadius: '6px',
                    color: '#4ade80',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  🔄 Refresh Orders
                </button>
              </div>

              {orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}>
                  <div style={{ fontSize: '64px', marginBottom: '16px' }}>📦</div>
                  <h3 style={{ color: '#fff', marginBottom: '8px' }}>No Pending Orders</h3>
                  <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '24px' }}>
                    When customers place orders, they'll appear here for approval.
                  </p>
                  <button onClick={fetchAllPendingOrders} style={{ marginTop: '16px', padding: '8px 20px', background: '#4ade80', border: 'none', borderRadius: '6px', color: '#060c04', cursor: 'pointer', fontWeight: 'bold' }}>
                    🔄 Refresh Orders
                  </button>
                </div>
              ) : (
                <div style={{
                  background: 'rgba(255,255,255,0.025)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '16px',
                  overflow: 'auto'
                }}>
                  {/* Table Header - Removed Order ID column */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 120px 100px 150px 100px 140px',
                    padding: '16px 20px',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    background: 'rgba(255,255,255,0.02)',
                    fontSize: '10px',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.3)',
                    minWidth: '850px'
                  }}>
                    <div>Products</div>
                    <div>Order Date</div>
                    <div>Total</div>
                    <div>Buyer</div>
                    <div>Status</div>
                    <div>Action</div>
                  </div>

                  {/* Table Rows */}
                  {orders.map((order, index) => (
                    <div
                      key={order.id}
                      className="orders-table-row"
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 120px 100px 150px 100px 140px',
                        padding: '16px 20px',
                        borderBottom: index < orders.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                        alignItems: 'center',
                        background: hoveredRow === order.id ? 'rgba(96,165,250,0.03)' : 'transparent',
                        minWidth: '850px',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={() => setHoveredRow(order.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      {/* Products */}
                      <div>
                        {order.items && order.items.map((item, idx) => (
                          <div key={idx} style={{ fontSize: '12px', color: '#fff', marginBottom: idx < order.items.length - 1 ? '4px' : 0 }}>
                            {item.quantity} × {item.name}
                          </div>
                        ))}
                      </div>

                      {/* Order Date */}
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
                        {new Date(order.order_date).toLocaleDateString()}
                      </div>

                      {/* Total */}
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#4ade80' }}>
                        R{order.total?.toFixed(2)}
                      </div>

                      {/* Buyer - Shows name if available, otherwise shows wallet */}
                      <div>
                        {order.buyer_name ? (
                          <>
                            <div style={{ fontSize: '12px', color: '#fff', fontWeight: '500' }}>
                              {order.buyer_name}
                            </div>
                            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', marginTop: '2px' }}>
                              {order.buyer_wallet?.slice(0, 10)}...
                            </div>
                          </>
                        ) : (
                          <div>
                            <div style={{ fontSize: '11px', color: '#fff', fontFamily: 'monospace' }}>
                              {order.buyer_wallet?.slice(0, 10)}...
                            </div>
                            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>
                              {order.buyer_wallet?.slice(-6)}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Status */}
                      <div>
                        <span className="status-badge" style={{
                          background: 'rgba(250,204,21,0.2)',
                          color: '#facc15'
                        }}>
                          ⏳ Pending
                        </span>
                      </div>

                      {/* Action */}
                      <div>
                        <button
                          onClick={() => {
                            setSelectedOrder(order)
                            setShowApproveModal(true)
                          }}
                          style={{
                            padding: '8px 16px',
                            background: '#4ade80',
                            border: 'none',
                            borderRadius: '6px',
                            color: '#060c04',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            width: '100%'
                          }}
                        >
                          ✓ Approve
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Harvest Details Modal */}
      {showDetailsModal && selectedHarvest && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '36px', color: '#4ade80', margin: 0 }}>HARVEST DETAILS</h2>
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
                <div style={{ fontSize: '14px', color: selectedHarvest.chemicals === 'None' ? '#4ade80' : '#facc15' }}>{selectedHarvest.chemicals || 'None'}</div>
              </div>
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>📍 Location</div>
                <div style={{ fontSize: '14px', color: '#fff' }}>{selectedHarvest.location}</div>
              </div>
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>💰 Price</div>
                <div style={{ fontSize: '14px', color: '#4ade80', fontWeight: 'bold' }}>R{selectedHarvest.price}/{selectedHarvest.unit}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => { closeModal(); navigate(`/qr-viewer?id=${selectedHarvest.id}`); }} style={{ flex: 1, padding: '12px', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.4)', borderRadius: '8px', color: '#4ade80', cursor: 'pointer' }}>📱 View QR Code</button>
              <button onClick={closeModal} style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Order Modal */}
      {showApproveModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => { setShowApproveModal(false); setSelectedOrder(null); setDeliveryDate(''); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <h3 style={{ color: '#fff', marginBottom: '16px' }}>Approve Order #{selectedOrder.id}</h3>
            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '20px' }}>
                Set a delivery date for this order. The buyer will be notified immediately.
              </p>
              <label style={{ fontSize: '12px', color: '#4ade80', display: 'block', marginBottom: '8px' }}>Expected Delivery Date:</label>
              <input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} min={new Date().toISOString().split('T')[0]} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: '8px', color: '#fff', fontSize: '14px', marginBottom: '20px' }} />
              <div style={{ padding: '12px', background: 'rgba(96,165,250,0.05)', borderRadius: '8px', textAlign: 'left' }}>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>Order Summary:</div>
                <div style={{ fontSize: '12px', color: '#fff' }}>Total Amount: <strong style={{ color: '#4ade80' }}>R{selectedOrder.total?.toFixed(2)}</strong></div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '8px' }}>Buyer will be notified with delivery date.</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => { setShowApproveModal(false); setSelectedOrder(null); setDeliveryDate(''); }} style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => approveOrder(selectedOrder, deliveryDate)} disabled={processing || !deliveryDate} style={{ flex: 1, padding: '12px', background: processing || !deliveryDate ? 'rgba(74,222,128,0.3)' : '#4ade80', border: 'none', borderRadius: '8px', color: processing || !deliveryDate ? 'rgba(255,255,255,0.5)' : '#060c04', fontWeight: 'bold', cursor: processing || !deliveryDate ? 'not-allowed' : 'pointer' }}>{processing ? 'Approving...' : '✓ Approve & Notify Buyer'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}