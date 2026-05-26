import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import '@fontsource/bebas-neue'
import '@fontsource/inter'
import bgImage from '../assets/images/dave-hoefler-Envk7kTMWTQ-unsplash.jpg'

export default function SensorDashboard() {
  const navigate = useNavigate()
  const [sensorNotifications, setSensorNotifications] = useState([])
  const [selectedSensorType, setSelectedSensorType] = useState('all')
  const [selectedSeverity, setSelectedSeverity] = useState('all')
  const [showRealTimeData, setShowRealTimeData] = useState(true)
  
  // Real-time sensor data (IoT sensors)
  const [sensorData, setSensorData] = useState({
    soil: [
      { id: 'SM-001', location: 'Field A', moisture: 22, temperature: 28, nutrients: 65, status: 'critical' },
      { id: 'SM-002', location: 'Field B', moisture: 55, temperature: 26, nutrients: 72, status: 'good' },
      { id: 'SM-003', location: 'Field C', moisture: 38, temperature: 29, nutrients: 45, status: 'warning' },
      { id: 'SM-004', location: 'Greenhouse 1', moisture: 68, temperature: 24, nutrients: 82, status: 'good' },
      { id: 'SM-005', location: 'Field D', moisture: 18, temperature: 31, nutrients: 35, status: 'critical' }
    ],
    waterTanks: [
      { id: 'TANK-001', location: 'Main Reservoir', level: 15, capacity: 10000, status: 'critical' },
      { id: 'TANK-002', location: 'North Field', level: 45, capacity: 5000, status: 'warning' },
      { id: 'TANK-003', location: 'South Field', level: 78, capacity: 8000, status: 'good' }
    ],
    weather: {
      temperature: 32,
      humidity: 68,
      rainfall: 0,
      windSpeed: 12,
      forecast: 'Partly cloudy'
    },
    drones: [
      { id: 'DRONE-001', location: 'Field A', healthIndex: 85, issues: ['Dry patches'], lastScan: '2024-01-15' },
      { id: 'DRONE-002', location: 'Field B', healthIndex: 92, issues: [], lastScan: '2024-01-14' }
    ]
  })

  // Pest incidence data - Table format
  const [pestIncidence, setPestIncidence] = useState([
    { 
      id: 1,
      pest: 'Aphids', 
      count: 23, 
      trend: 'increasing', 
      severity: 'high', 
      location: 'Field A, Field C', 
      treatment: 'Organic pesticide recommended',
      lastDetected: '2024-01-15',
      status: 'active'
    },
    { 
      id: 2,
      pest: 'Fall Armyworm', 
      count: 15, 
      trend: 'stable', 
      severity: 'medium', 
      location: 'Field B', 
      treatment: 'Monitor closely',
      lastDetected: '2024-01-14',
      status: 'monitoring'
    },
    { 
      id: 3,
      pest: 'Stemborer', 
      count: 8, 
      trend: 'decreasing', 
      severity: 'low', 
      location: 'Field D', 
      treatment: 'Under control',
      lastDetected: '2024-01-12',
      status: 'controlled'
    },
    { 
      id: 4,
      pest: 'Red Spider Mite', 
      count: 12, 
      trend: 'increasing', 
      severity: 'medium', 
      location: 'Greenhouse 1', 
      treatment: 'Increase humidity',
      lastDetected: '2024-01-15',
      status: 'active'
    },
    { 
      id: 5,
      pest: 'Cutworms', 
      count: 5, 
      trend: 'decreasing', 
      severity: 'low', 
      location: 'Field C', 
      treatment: 'No action needed',
      lastDetected: '2024-01-10',
      status: 'controlled'
    },
    { 
      id: 6,
      pest: 'Thrips', 
      count: 18, 
      trend: 'increasing', 
      severity: 'high', 
      location: 'Greenhouse 2', 
      treatment: 'Apply neem oil immediately',
      lastDetected: '2024-01-15',
      status: 'critical'
    }
  ])

  // Water saving statistics
  const [waterSavings, setWaterSavings] = useState({
    savedThisMonth: 12500,
    totalSaved: 187500,
    efficiency: 32,
    automatedZones: 5
  })

  useEffect(() => {
    loadSensorData()
    // Simulate real-time data updates every 30 seconds
    const interval = setInterval(() => {
      simulateRealTimeData()
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  function loadSensorData() {
    const storedData = localStorage.getItem('sensorNotifications')
    if (storedData) {
      setSensorNotifications(JSON.parse(storedData))
    } else {
      const sampleData = [
        {
          id: 'sensor-1',
          type: 'soil_moisture',
          title: 'Soil Moisture Critical',
          message: 'Field A soil moisture is critically low at 18%. Automated irrigation activated.',
          severity: 'critical',
          timestamp: new Date().toISOString(),
          read: false,
          sensor: 'SM-001',
          value: '18%',
          threshold: '40%',
          location: 'Field A',
          action: 'Irrigation started'
        },
        {
          id: 'sensor-2',
          type: 'temperature',
          title: 'High Temperature Alert',
          message: 'Field temperature reached 42°C. Heat stress risk for maize crop.',
          severity: 'critical',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          read: false,
          sensor: 'TEMP-001',
          value: '42°C',
          threshold: '35°C',
          location: 'Field B',
          action: 'Ventilation recommended'
        },
        {
          id: 'sensor-3',
          type: 'pest',
          title: 'Pest Detection',
          message: 'Aphids detected in Field A. Population above threshold.',
          severity: 'warning',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          read: true,
          sensor: 'PEST-001',
          value: 'High',
          threshold: 'Normal',
          location: 'Field A',
          action: 'Organic pesticide recommended'
        },
        {
          id: 'sensor-4',
          type: 'water_tank',
          title: 'Water Tank Low',
          message: 'Main reservoir at 15% capacity. Refill required within 24 hours.',
          severity: 'warning',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          read: false,
          sensor: 'TANK-001',
          value: '15%',
          threshold: '30%',
          location: 'Main Reservoir',
          action: 'Schedule water delivery'
        },
        {
          id: 'sensor-5',
          type: 'drone',
          title: 'Drone Scan Complete',
          message: 'Field scan detected dry patches in eastern section. Health index: 78%',
          severity: 'info',
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          read: true,
          sensor: 'DRONE-001',
          value: 'Health: 78%',
          threshold: '85%',
          location: 'Field A',
          action: 'Review scan report'
        }
      ]
      setSensorNotifications(sampleData)
      localStorage.setItem('sensorNotifications', JSON.stringify(sampleData))
    }
  }

  function simulateRealTimeData() {
    // Update soil moisture randomly
    const updatedSoil = sensorData.soil.map(field => ({
      ...field,
      moisture: Math.max(5, Math.min(100, field.moisture + (Math.random() - 0.5) * 5)),
      temperature: Math.max(15, Math.min(45, field.temperature + (Math.random() - 0.5) * 2))
    }))
    
    // Update water tank levels
    const updatedTanks = sensorData.waterTanks.map(tank => ({
      ...tank,
      level: Math.max(0, Math.min(100, tank.level - Math.random() * 2))
    }))
    
    setSensorData(prev => ({
      ...prev,
      soil: updatedSoil,
      waterTanks: updatedTanks
    }))
    
    // Generate alert for critical conditions
    const criticalSoil = updatedSoil.find(field => field.moisture < 20)
    if (criticalSoil && Math.random() < 0.3) {
      const newAlert = {
        id: 'sensor-' + Date.now(),
        type: 'soil_moisture',
        title: 'Automated Irrigation Alert',
        message: `${criticalSoil.location} moisture at ${criticalSoil.moisture}%. Smart irrigation system activated.`,
        severity: 'warning',
        timestamp: new Date().toISOString(),
        read: false,
        sensor: criticalSoil.id,
        value: `${criticalSoil.moisture}%`,
        threshold: '40%',
        location: criticalSoil.location,
        action: 'Irrigation in progress'
      }
      setSensorNotifications(prev => [newAlert, ...prev].slice(0, 30))
      localStorage.setItem('sensorNotifications', JSON.stringify([newAlert, ...sensorNotifications].slice(0, 30)))
    }
  }

  function getSeverityColor(severity) {
    switch(severity) {
      case 'critical': return '#f87171'
      case 'warning': return '#facc15'
      case 'info': return '#60a5fa'
      default: return '#4ade80'
    }
  }

  function getSensorIcon(type) {
    switch(type) {
      case 'soil_moisture': return '💧'
      case 'temperature': return '🌡️'
      case 'humidity': return '💨'
      case 'rainfall': return '🌧️'
      case 'pest': return '🐛'
      case 'water_tank': return '🚰'
      case 'drone': return '🚁'
      default: return '📡'
    }
  }

  function getSoilStatusColor(moisture) {
    if (moisture < 25) return '#f87171'
    if (moisture < 45) return '#facc15'
    return '#4ade80'
  }

  function getPestStatusColor(status) {
    switch(status) {
      case 'critical': return '#f87171'
      case 'active': return '#facc15'
      case 'monitoring': return '#60a5fa'
      case 'controlled': return '#4ade80'
      default: return 'rgba(255,255,255,0.5)'
    }
  }

  const filteredNotifications = sensorNotifications.filter(notif => {
    if (selectedSensorType !== 'all' && notif.type !== selectedSensorType) return false
    if (selectedSeverity !== 'all' && notif.severity !== selectedSeverity) return false
    return true
  })

  const unreadCount = sensorNotifications.filter(n => !n.read).length
  const criticalCount = sensorNotifications.filter(n => n.severity === 'critical').length

  return (
    <>
      <style>{`
        @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideIn { from{transform:translateX(100%)} to{transform:translateX(0)} }
        @keyframes pulse-red { 0%,100%{opacity:1} 50%{opacity:0.6} }
        @keyframes waterFlow { 0%{background-position:0% 50%} 100%{background-position:100% 50%} }
        .sensor-page { animation: fadeUp 0.4s ease both; }
        .stat-card { transition: all 0.2s ease; }
        .stat-card:hover { transform: translateY(-4px); }
        .sensor-value { transition: all 0.3s ease; }
        .pest-table-row { transition: all 0.2s ease; }
        .pest-table-row:hover { background: rgba(74,222,128,0.05) !important; transform: translateX(4px); }
        .water-animation { background: linear-gradient(90deg, #60a5fa, #4ade80, #60a5fa); background-size: 200% 100%; animation: waterFlow 2s ease infinite; }
      `}</style>

      <div className="sensor-page" style={{
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
          filter: 'brightness(0.18) saturate(0.5)',
        }} />
        <div style={{
          position: 'fixed', inset: 0, zIndex: 0,
          background: 'linear-gradient(135deg, rgba(4,9,2,0.94) 0%, rgba(6,12,4,0.82) 100%)',
        }} />

        {/* Navbar */}
        <nav style={{
          position: 'sticky', top: 0, zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 32px', height: '60px',
          background: 'rgba(4,9,2,0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(96,165,250,0.10)',
        }}>
          <div onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '20px', letterSpacing: '3px' }}>
              <span style={{ color: '#4ade80' }}>AGRI</span><span style={{ color: '#fff' }}>CHAIN</span>
              <span style={{ color: '#60a5fa', fontSize: '12px', marginLeft: '8px' }}>IoT</span>
            </span>
            <span style={{ fontSize: '7px', color: 'rgba(255,255,255,0.25)', letterSpacing: '2px', textTransform: 'uppercase' }}>Smart Farm Monitoring</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '5px 12px',
              background: 'rgba(96,165,250,0.06)',
              border: '1px solid rgba(96,165,250,0.18)',
              borderRadius: '4px',
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#60a5fa', display: 'inline-block', animation: 'pulse-dot 2s infinite' }} />
              <span style={{ fontSize: '10px', color: '#60a5fa', fontFamily: 'monospace' }}>Live IoT Data</span>
            </div>
            <button
              onClick={() => navigate('/farmer')}
              style={{
                background: 'transparent', border: '1px solid rgba(96,165,250,0.3)', color: '#60a5fa',
                fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', padding: '5px 14px', borderRadius: '4px', cursor: 'pointer'
              }}
            >
              ← Back to Dashboard
            </button>
          </div>
        </nav>

        {/* Main Content */}
        <main style={{ position: 'relative', zIndex: 1, maxWidth: '1400px', margin: '0 auto', padding: '40px 24px 80px' }}>
          
          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: '#60a5fa', margin: '0 0 8px' }}>
              Internet of Things & Smart Technologies
            </p>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(40px, 6vw, 68px)', color: '#fff', letterSpacing: '2px', lineHeight: '0.9', margin: 0 }}>
              IOT <span style={{ color: '#60a5fa' }}>SENSOR</span> DASHBOARD
            </h1>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: '8px' }}>
              24/7 Real-time monitoring • Automated irrigation • Smart alerts • Data-driven insights
            </p>
          </div>

          {/* Water Savings Banner */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(96,165,250,0.1), rgba(74,222,128,0.05))',
            border: '1px solid rgba(96,165,250,0.3)',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '48px' }}>💧</span>
              <div>
                <div style={{ fontSize: '11px', color: '#60a5fa', letterSpacing: '2px' }}>WATER SAVED THIS MONTH</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#4ade80' }}>{waterSavings.savedThisMonth.toLocaleString()} L</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '48px' }}>📊</span>
              <div>
                <div style={{ fontSize: '11px', color: '#60a5fa', letterSpacing: '2px' }}>IRRIGATION EFFICIENCY</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#4ade80' }}>+{waterSavings.efficiency}%</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '48px' }}>🤖</span>
              <div>
                <div style={{ fontSize: '11px', color: '#60a5fa', letterSpacing: '2px' }}>AUTOMATED ZONES</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#4ade80' }}>{waterSavings.automatedZones}</div>
              </div>
            </div>
          </div>

          {/* Real-time Soil Sensors */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '20px', color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>🌱</span> Soil Sensor Network
              <span style={{ fontSize: '11px', color: '#60a5fa', fontWeight: 'normal' }}>• Readings every hour</span>
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px'
            }}>
              {sensorData.soil.map((field) => (
                <div key={field.id} style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${getSoilStatusColor(field.moisture)}30`,
                  borderRadius: '12px',
                  padding: '20px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>{field.location}</div>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>Sensor: {field.id}</div>
                    </div>
                    <div style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: getSoilStatusColor(field.moisture),
                      animation: field.moisture < 25 ? 'pulse-red 1s infinite' : 'none'
                    }} />
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Soil Moisture</span>
                      <span style={{ fontSize: '12px', fontWeight: 'bold', color: getSoilStatusColor(field.moisture) }}>{field.moisture}%</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${field.moisture}%`, height: '100%', background: getSoilStatusColor(field.moisture), borderRadius: '3px' }} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>Temperature</div>
                      <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>{field.temperature}°C</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>Nutrients</div>
                      <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#4ade80' }}>{field.nutrients}%</div>
                    </div>
                  </div>
                  {field.moisture < 25 && (
                    <div style={{ marginTop: '12px', padding: '8px', background: 'rgba(74,222,128,0.1)', borderRadius: '6px' }}>
                      <span style={{ fontSize: '10px', color: '#4ade80' }}>💧 Automated irrigation activated</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Water Tank Levels */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '20px', color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>🚰</span> Water Tank Monitoring
              <span style={{ fontSize: '11px', color: '#60a5fa', fontWeight: 'normal' }}>• Leak detection active</span>
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '16px'
            }}>
              {sensorData.waterTanks.map((tank) => (
                <div key={tank.id} style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(96,165,250,0.2)',
                  borderRadius: '12px',
                  padding: '20px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>{tank.location}</div>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>Sensor: {tank.id}</div>
                    </div>
                    <div style={{ fontSize: '20px' }}>💧</div>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Water Level</span>
                      <span style={{ fontSize: '12px', fontWeight: 'bold', color: tank.level < 30 ? '#f87171' : tank.level < 50 ? '#facc15' : '#4ade80' }}>{tank.level}%</span>
                    </div>
                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${tank.level}%`, height: '100%', background: tank.level < 30 ? '#f87171' : tank.level < 50 ? '#facc15' : '#4ade80', borderRadius: '4px' }} />
                    </div>
                  </div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>Capacity: {tank.capacity.toLocaleString()} L</div>
                  {tank.level < 30 && (
                    <div style={{ marginTop: '12px', padding: '8px', background: 'rgba(248,113,113,0.1)', borderRadius: '6px' }}>
                      <span style={{ fontSize: '10px', color: '#f87171' }}>⚠️ Low water level - Refill recommended</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Weather Station & Drones */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
            marginBottom: '32px'
          }}>
            {/* Weather Station */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '16px',
              padding: '24px'
            }}>
              <h3 style={{ color: '#fff', fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🌤️</span> On-Farm Weather Station
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(96,165,250,0.05)', borderRadius: '12px' }}>
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>🌡️</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#60a5fa' }}>{sensorData.weather.temperature}°C</div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>Temperature</div>
                </div>
                <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(74,222,128,0.05)', borderRadius: '12px' }}>
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>💨</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4ade80' }}>{sensorData.weather.humidity}%</div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>Humidity</div>
                </div>
                <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(250,204,21,0.05)', borderRadius: '12px' }}>
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>🌧️</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#facc15' }}>{sensorData.weather.rainfall} mm</div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>Rainfall (24h)</div>
                </div>
                <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(96,165,250,0.05)', borderRadius: '12px' }}>
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>💨</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#60a5fa' }}>{sensorData.weather.windSpeed} km/h</div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>Wind Speed</div>
                </div>
              </div>
              <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(96,165,250,0.05)', borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', color: '#60a5fa' }}>Forecast: {sensorData.weather.forecast}</div>
              </div>
            </div>

            {/* Drone Crop Health */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '16px',
              padding: '24px'
            }}>
              <h3 style={{ color: '#fff', fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🚁</span> Drone Crop Health Maps
              </h3>
              {sensorData.drones.map((drone) => (
                <div key={drone.id} style={{ marginBottom: '16px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>{drone.location}</div>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>Last scan: {drone.lastScan}</div>
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: drone.healthIndex > 85 ? '#4ade80' : drone.healthIndex > 70 ? '#facc15' : '#f87171' }}>
                      {drone.healthIndex}%
                    </div>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginBottom: '12px' }}>
                    <div style={{ width: `${drone.healthIndex}%`, height: '100%', background: drone.healthIndex > 85 ? '#4ade80' : drone.healthIndex > 70 ? '#facc15' : '#f87171', borderRadius: '4px' }} />
                  </div>
                  {drone.issues.length > 0 && (
                    <div style={{ fontSize: '11px', color: '#facc15' }}>
                      Issues detected: {drone.issues.join(', ')}
                    </div>
                  )}
                </div>
              ))}
              <div style={{ padding: '12px', background: 'rgba(74,222,128,0.05)', borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', color: '#4ade80' }}>📊 Recommendation</div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>Schedule drone flight for Field C next week</div>
              </div>
            </div>
          </div>

          {/* Pest Incidence Tracking - Table Format */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '20px', color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>🐛</span> Pest Incidence Tracking
              <span style={{ fontSize: '11px', color: '#60a5fa', fontWeight: 'normal' }}>• Real-time monitoring</span>
            </h2>
            <div style={{
              background: 'rgba(255,255,255,0.025)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '16px',
              overflow: 'auto'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '100px 80px 100px 100px 200px 1fr 100px',
                padding: '16px 20px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(255,255,255,0.02)',
                fontSize: '10px',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.3)',
                minWidth: '900px'
              }}>
                <div>Pest Name</div>
                <div>Count</div>
                <div>Trend</div>
                <div>Severity</div>
                <div>Location</div>
                <div>Treatment</div>
                <div>Status</div>
              </div>

              {pestIncidence.map((pest) => (
                <div
                  key={pest.id}
                  className="pest-table-row"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '100px 80px 100px 100px 200px 1fr 100px',
                    padding: '14px 20px',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    alignItems: 'center',
                    minWidth: '900px',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontSize: '13px', fontWeight: '500', color: '#fff' }}>{pest.pest}</div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#4ade80' }}>{pest.count}</div>
                  <div>
                    <span style={{
                      fontSize: '11px',
                      color: pest.trend === 'increasing' ? '#f87171' : pest.trend === 'decreasing' ? '#4ade80' : '#facc15'
                    }}>
                      {pest.trend === 'increasing' ? '📈 Increasing' : pest.trend === 'decreasing' ? '📉 Decreasing' : '➡️ Stable'}
                    </span>
                  </div>
                  <div>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      background: pest.severity === 'high' ? 'rgba(248,113,113,0.2)' : pest.severity === 'medium' ? 'rgba(250,204,21,0.2)' : 'rgba(74,222,128,0.2)',
                      color: pest.severity === 'high' ? '#f87171' : pest.severity === 'medium' ? '#facc15' : '#4ade80'
                    }}>
                      {pest.severity.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>{pest.location}</div>
                  <div style={{ fontSize: '11px', color: '#60a5fa' }}>{pest.treatment}</div>
                  <div>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '9px',
                      fontWeight: 'bold',
                      background: `rgba(${getPestStatusColor(pest.status).slice(4, -1)}, 0.2)`,
                      color: getPestStatusColor(pest.status)
                    }}>
                      {pest.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(250,204,21,0.05)', borderRadius: '8px' }}>
              <div style={{ fontSize: '11px', color: '#facc15', marginBottom: '4px' }}>⚠️ Critical Alert</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
                Thrips population is increasing rapidly in Greenhouse 2. Apply neem oil immediately to prevent crop damage.
              </div>
            </div>
          </div>

          {/* Recent Alerts */}
          <div style={{
            background: 'rgba(255,255,255,0.025)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '16px',
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px 24px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(255,255,255,0.02)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '24px' }}>🔔</span>
                <h3 style={{ color: '#fff', margin: 0 }}>Smart Alerts & Notifications</h3>
                {unreadCount > 0 && (
                  <span style={{
                    background: '#f87171',
                    color: '#fff',
                    borderRadius: '20px',
                    padding: '2px 8px',
                    fontSize: '10px'
                  }}>
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <select
                  value={selectedSensorType}
                  onChange={(e) => setSelectedSensorType(e.target.value)}
                  style={{
                    padding: '6px 12px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '11px',
                    cursor: 'pointer'
                  }}
                >
                  <option value="all">All Sensors</option>
                  <option value="soil_moisture">Soil Moisture</option>
                  <option value="temperature">Temperature</option>
                  <option value="pest">Pest Detection</option>
                  <option value="water_tank">Water Tank</option>
                  <option value="drone">Drone Scan</option>
                </select>
                <select
                  value={selectedSeverity}
                  onChange={(e) => setSelectedSeverity(e.target.value)}
                  style={{
                    padding: '6px 12px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '11px',
                    cursor: 'pointer'
                  }}
                >
                  <option value="all">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="warning">Warning</option>
                  <option value="info">Info</option>
                </select>
              </div>
            </div>

            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {filteredNotifications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.4)' }}>
                  No alerts to display
                </div>
              ) : (
                filteredNotifications.map((alert) => (
                  <div key={alert.id} style={{
                    padding: '16px 24px',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    background: alert.read ? 'transparent' : `rgba(${getSeverityColor(alert.severity).slice(4, -1)}, 0.05)`,
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(74,222,128,0.05)'}
                  onMouseLeave={(e) => {
                    if (!alert.read) e.currentTarget.style.background = `rgba(${getSeverityColor(alert.severity).slice(4, -1)}, 0.05)`
                    else e.currentTarget.style.background = 'transparent'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{ fontSize: '28px' }}>{getSensorIcon(alert.type)}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 'bold', color: getSeverityColor(alert.severity) }}>
                            {alert.title}
                          </span>
                          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>
                            {new Date(alert.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginBottom: '6px' }}>
                          {alert.message}
                        </div>
                        <div style={{ display: 'flex', gap: '16px', fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>
                          <span>📍 {alert.location}</span>
                          <span>📡 {alert.sensor}</span>
                          <span>📊 {alert.value} (Threshold: {alert.threshold})</span>
                        </div>
                        {alert.action && (
                          <div style={{ marginTop: '8px', padding: '6px 10px', background: 'rgba(74,222,128,0.1)', borderRadius: '4px', display: 'inline-block' }}>
                            <span style={{ fontSize: '10px', color: '#4ade80' }}>⚡ {alert.action}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  )
}