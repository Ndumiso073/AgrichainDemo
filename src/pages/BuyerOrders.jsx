import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import '@fontsource/bebas-neue'
import '@fontsource/inter'
import buyerIcon from '../assets/icons/user.png'
import bgImage from '../assets/images/max-O_TVsaeZNlE-unsplash.jpg'

export default function BuyerOrders() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load orders from localStorage
    const savedOrders = localStorage.getItem('buyerOrders')
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders))
    }
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#060c04', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(74,222,128,0.2)', borderTopColor: '#4ade80', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#060c04', fontFamily: "'Inter', sans-serif", position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.18) saturate(0.5)' }} />
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'linear-gradient(135deg, rgba(4,9,2,0.94) 0%, rgba(6,12,4,0.82) 100%)' }} />

      <nav style={{ position: 'sticky', top: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: '60px', background: 'rgba(4,9,2,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(96,165,250,0.10)' }}>
        <div onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '20px' }}><span style={{ color: '#4ade80' }}>AGRI</span><span style={{ color: '#fff' }}>CHAIN</span></span>
        </div>
        <button onClick={() => navigate('/buyer')} style={{ background: 'transparent', border: '1px solid rgba(96,165,250,0.3)', color: '#60a5fa', padding: '5px 14px', borderRadius: '4px', cursor: 'pointer' }}>← Back to Shop</button>
      </nav>

      <main style={{ position: 'relative', zIndex: 1, maxWidth: '1000px', margin: '0 auto', padding: '40px 24px 80px' }}>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '52px', color: '#fff', marginBottom: '32px' }}>MY <span style={{ color: '#60a5fa' }}>ORDERS</span></h1>

        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📦</div>
            <h3 style={{ color: '#fff' }}>No Orders Yet</h3>
            <button onClick={() => navigate('/buyer')} style={{ marginTop: '20px', padding: '10px 24px', background: '#4ade80', border: 'none', borderRadius: '8px', color: '#060c04', fontWeight: 'bold', cursor: 'pointer' }}>Start Shopping →</button>
          </div>
        ) : (
          orders.map(order => (
            <div key={order.id} style={{ marginBottom: '24px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', overflow: 'hidden' }}>
              <div style={{ padding: '20px', background: 'rgba(96,165,250,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div><div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Order #{order.id}</div><div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>{new Date(order.date).toLocaleDateString()}</div></div>
                <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '11px', background: 'rgba(250,204,21,0.2)', color: '#facc15' }}>{order.status}</span>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#4ade80' }}>R{order.total.toFixed(2)}</div>
              </div>
              <div style={{ padding: '20px' }}>
                {order.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: idx < order.items.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                    <div><div style={{ color: '#fff' }}>{item.quantity} × {item.name}</div><div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>Harvest ID: {item.id}</div></div>
                    <div style={{ color: '#4ade80' }}>R{(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
                {order.trackingNumber && (
                  <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(96,165,250,0.05)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>Tracking: {order.trackingNumber}</div>
                    <div style={{ fontSize: '11px', color: '#60a5fa', marginTop: '8px' }}>📦 When delivered, use "Verify Product" on the main page to scan QR codes.</div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  )
}