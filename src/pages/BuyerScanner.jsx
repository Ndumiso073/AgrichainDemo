import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import '@fontsource/bebas-neue'
import '@fontsource/inter'
import buyerIcon from '../assets/icons/user.png'
import bgImage from '../assets/images/max-O_TVsaeZNlE-unsplash.jpg'
import { supabase } from '../supabaseClient'

export default function BuyerScanner() {
  const navigate = useNavigate()
  
  // Cart state
  const [cart, setCart] = useState([])
  const [showCart, setShowCart] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [lastOrder, setLastOrder] = useState(null)
  
  // UI state
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [quantities, setQuantities] = useState({})
  const [hoveredRow, setHoveredRow] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // QR Scanner Modal state
  const [showQrModal, setShowQrModal] = useState(false)
  const [qrInput, setQrInput] = useState('')
  const [qrResult, setQrResult] = useState(null)
  const [verifying, setVerifying] = useState(false)

  // Notification state
  const [buyerNotifications, setBuyerNotifications] = useState([])
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [buyerNotificationCount, setBuyerNotificationCount] = useState(0)

  const account = '0xBuyer...f10a'

  // Fetch products and notifications from Supabase
  useEffect(() => {
    fetchProducts()
    loadBuyerNotifications()
    
    // Set up real-time subscription for notifications
    const subscription = supabase
      .channel('notifications_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'notifications', filter: `buyer_wallet=eq.${account}` }, 
        () => loadBuyerNotifications()
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function fetchProducts() {
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
        setProducts([])
      } else if (data && data.length > 0) {
        console.log(`✅ Successfully loaded ${data.length} products`)
        setProducts(data)
      } else {
        setError('No products found in database.')
        setProducts([])
      }
    } catch (error) {
      console.error('Fetch error:', error)
      setError(error.message)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  async function loadBuyerNotifications() {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('buyer_wallet', account)
        .order('created_at', { ascending: false })
      
      if (!error && data) {
        setBuyerNotifications(data)
        const unreadCount = data.filter(n => !n.read).length
        setBuyerNotificationCount(unreadCount)
        
        // Show toast for new unread notifications
        const unread = data.filter(n => !n.read)
        if (unread.length > 0 && !localStorage.getItem('notifications_shown')) {
          showNotification(unread[0].message, '#60a5fa')
          localStorage.setItem('notifications_shown', 'true')
          setTimeout(() => localStorage.removeItem('notifications_shown'), 5000)
        }
      }
    } catch (error) {
      console.error('Error loading notifications:', error)
    }
  }

  async function markNotificationAsRead(notificationId) {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
    await loadBuyerNotifications()
  }

  async function markAllNotificationsAsRead() {
    for (const notif of buyerNotifications.filter(n => !n.read)) {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notif.id)
    }
    await loadBuyerNotifications()
  }

  // Get unique categories
  const categories = ['All', ...new Set(products.map(p => p.name?.split(' ').pop() || '').filter(Boolean))]

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = (product.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                          (product.farmer?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                          (product.id?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || (product.name?.includes(selectedCategory) || false)
    return matchesSearch && matchesCategory
  })

  function addToCart(product, quantity) {
    const qty = quantity || 1
    if (qty <= 0) return
    
    if (qty > product.stock) {
      showNotification(`Only ${product.stock} ${product.unit}(s) available in stock`, '#f87171')
      return
    }
    
    setCart(prevCart => {
      const existing = prevCart.find(item => item.id === product.id)
      let newCart
      if (existing) {
        newCart = prevCart.map(item =>
          item.id === product.id 
            ? { ...item, quantity: item.quantity + qty }
            : item
        )
      } else {
        newCart = [...prevCart, { ...product, quantity: qty }]
      }
      return newCart
    })
    
    showNotification(`✓ Added ${qty} ${product.unit}(s) of ${product.name}`)
  }

  function updateQuantity(productId, newQuantity) {
    if (newQuantity <= 0) {
      setCart(cart.filter(item => item.id !== productId))
    } else {
      setCart(cart.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      ))
    }
  }

  function removeFromCart(productId) {
    setCart(cart.filter(item => item.id !== productId))
    showNotification('Item removed from cart', '#f87171')
  }

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  async function processCheckout() {
    if (cart.length === 0) return
    
    setLoading(true)
    try {
      for (const item of cart) {
        const product = products.find(p => p.id === item.id)
        if (!product) {
          throw new Error(`Product ${item.name} not found`)
        }
        if (product.stock < item.quantity) {
          throw new Error(`Only ${product.stock} ${product.unit}s of ${product.name} available`)
        }
      }
      
      const farmerWallets = [...new Set(cart.map(item => item.farmer_wallet || 'unknown'))]
      
      const orderData = {
        id: 'ORD-' + Math.random().toString(36).substr(2, 8).toUpperCase(),
        buyer_wallet: account,
        buyer_email: null,
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          farmer: item.farmer,
          farmer_wallet: item.farmer_wallet,
          quantity: item.quantity,
          price: item.price,
          unit: item.unit
        })),
        total: cartTotal,
        status: 'Pending',
        farmer_wallet: farmerWallets[0],
        tracking_number: 'TRK' + Math.random().toString(36).substr(2, 8).toUpperCase(),
        order_date: new Date().toISOString()
      }
      
      const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
      
      if (error) throw new Error(error.message)
      
      setLastOrder(orderData)
      setOrderSuccess(true)
      setCart([])
      setShowCheckout(false)
      
      setTimeout(() => setOrderSuccess(false), 5000)
      showNotification('Order created! Waiting for farmer approval.', '#4ade80')
    } catch (error) {
      console.error('Checkout error:', error)
      showNotification(error.message || 'Failed to create order. Please try again.', '#f87171')
    } finally {
      setLoading(false)
    }
  }

  function showNotification(message, color = '#4ade80') {
    const notification = document.createElement('div')
    notification.textContent = message
    notification.style.cssText = `
      position: fixed; bottom: 20px; right: 20px; background: ${color};
      color: #060c04; padding: 12px 20px; border-radius: 8px;
      z-index: 10000; animation: fadeOut 3s ease forwards;
      font-weight: bold; font-size: 14px;
    `
    document.body.appendChild(notification)
    setTimeout(() => notification.remove(), 3000)
  }

  function updateProductQuantity(productId, value) {
    const product = products.find(p => p.id === productId)
    const newValue = parseInt(value) || 1
    if (product && newValue > product.stock) {
      showNotification(`Only ${product.stock} ${product.unit}(s) available`, '#f87171')
      setQuantities({ ...quantities, [productId]: product.stock })
    } else {
      setQuantities({ ...quantities, [productId]: newValue })
    }
  }

  function openQrVerification() {
    setShowQrModal(true)
    setQrInput('')
    setQrResult(null)
  }

  async function verifyProduct() {
    if (!qrInput.trim()) {
      alert('Please enter a Harvest ID')
      return
    }
    
    setVerifying(true)
    const harvestId = qrInput.trim().toUpperCase()
    
    try {
      const { data, error } = await supabase
        .from('harvests')
        .select('*')
        .eq('id', harvestId)
        .single()
      
      if (error || !data) {
        setQrResult({
          success: false,
          message: '❌ Harvest ID not found. This product may be counterfeit!',
          type: 'error'
        })
      } else {
        setQrResult({
          success: true,
          message: `✓ VERIFIED! Authentic ${data.name} from ${data.farmer}. Harvested on ${data.harvest_date}. Chemicals: ${data.chemicals || 'None'}`,
          type: 'success',
          product: data
        })
      }
    } catch (error) {
      console.error('Verification error:', error)
      setQrResult({
        success: false,
        message: '❌ Verification failed. Please try again.',
        type: 'error'
      })
    } finally {
      setVerifying(false)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#060c04', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid rgba(74,222,128,0.2)', borderTopColor: '#4ade80', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>Loading products...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (error && products.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: '#060c04', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px' }}>
        <div style={{ fontSize: '48px' }}>⚠️</div>
        <h3 style={{ color: '#f87171' }}>Failed to Load Products</h3>
        <p style={{ color: 'rgba(255,255,255,0.5)' }}>{error}</p>
        <button onClick={fetchProducts} style={{ padding: '10px 24px', background: '#4ade80', border: 'none', borderRadius: '8px', color: '#060c04', fontWeight: 'bold', cursor: 'pointer' }}>Retry</button>
      </div>
    )
  }

  return (
    <>
      <style>{`
        @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeOut { 0%{opacity:1} 70%{opacity:1} 100%{opacity:0} }
        @keyframes slideIn { from{transform:translateX(100%)} to{transform:translateX(0)} }
        @keyframes bounce { 0%,100%{transform:scale(1)} 50%{transform:scale(1.2)} }
        @keyframes modalFadeIn { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }
        .buyer-page { animation: fadeUp 0.4s ease both; }
        .cart-sidebar { animation: slideIn 0.3s ease both; }
        .product-table-row { transition: background 0.2s ease; }
        .product-table-row:hover { background: rgba(96,165,250,0.05) !important; }
        .notification-modal {
          animation: modalFadeIn 0.2s ease;
        }
        .notification-item {
          transition: all 0.2s ease;
        }
        .notification-item:hover {
          background: rgba(74,222,128,0.08);
          transform: translateX(4px);
        }
      `}</style>

      <div className="buyer-page" style={{ fontFamily: "'Inter', sans-serif", minHeight: '100vh', background: '#060c04', position: 'relative', overflow: 'hidden' }}>
        {/* Background */}
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.18) saturate(0.5)' }} />
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'linear-gradient(135deg, rgba(4,9,2,0.94) 0%, rgba(6,12,4,0.82) 100%)' }} />

        {/* Navbar */}
        <nav style={{ position: 'sticky', top: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: '60px', background: 'rgba(4,9,2,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(96,165,250,0.10)' }}>
          <div onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '20px', letterSpacing: '3px' }}>
              <span style={{ color: '#4ade80' }}>AGRI</span><span style={{ color: '#fff' }}>CHAIN</span>
            </span>
            <span style={{ fontSize: '7px', color: 'rgba(255,255,255,0.25)', letterSpacing: '2px', textTransform: 'uppercase' }}>Marketplace</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button onClick={openQrVerification} style={{ background: 'transparent', border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80', fontSize: '11px', letterSpacing: '1px', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>🔍 Verify Product</button>

            <button onClick={() => setShowCart(!showCart)} style={{ position: 'relative', background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px', fontSize: '24px' }}>
              🛒
              {cart.length > 0 && (
                <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#4ade80', color: '#060c04', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>

            {/* Notification Bell with Modal */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowNotificationModal(true)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '20px',
                  position: 'relative',
                  padding: '8px'
                }}
              >
                🔔
                {buyerNotificationCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    background: '#f87171',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    fontSize: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    animation: 'bounce 0.5s ease'
                  }}>
                    {buyerNotificationCount}
                  </span>
                )}
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 12px', background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.18)', borderRadius: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#60a5fa', display: 'inline-block', animation: 'pulse-dot 2s infinite' }} />
              <span style={{ fontSize: '10px', color: '#60a5fa', fontFamily: 'monospace' }}>{account}</span>
            </div>
            
            <button onClick={() => navigate('/buyer-orders')} style={{ background: 'transparent', border: '1px solid rgba(96,165,250,0.3)', color: '#60a5fa', fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', padding: '5px 14px', borderRadius: '4px', cursor: 'pointer' }}>My Orders</button>
            <button onClick={() => navigate('/')} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.35)', fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', padding: '5px 14px', borderRadius: '4px', cursor: 'pointer' }}>Exit</button>
          </div>
        </nav>

        {/* Main Content */}
        <main style={{ position: 'relative', zIndex: 1, maxWidth: '1400px', margin: '0 auto', padding: '40px 24px 80px' }}>
          {orderSuccess && lastOrder && (
            <div style={{ marginBottom: '24px', padding: '20px', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📦</div>
              <h3 style={{ color: '#4ade80', marginBottom: '8px' }}>Order Created!</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
                Order #{lastOrder.id} - Go to <strong>"My Orders"</strong> to complete payment when your product arrives.
              </p>
              <button onClick={() => navigate('/buyer-orders')} style={{ marginTop: '12px', padding: '8px 20px', background: '#4ade80', border: 'none', borderRadius: '6px', color: '#060c04', cursor: 'pointer', fontWeight: 'bold' }}>View My Orders →</button>
            </div>
          )}

          <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <p style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: '#60a5fa', margin: '0 0 8px' }}>Fresh from the Farm</p>
              <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(40px, 6vw, 68px)', color: '#fff', letterSpacing: '2px', lineHeight: '0.9', margin: 0 }}>MARKETPLACE</h1>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: '8px' }}>
                Add items to cart, create order, then complete payment when product arrives.
              </p>
              {products.length > 0 && <p style={{ fontSize: '11px', color: '#4ade80', marginTop: '8px' }}>✓ {products.length} verified products available</p>}
            </div>
            <div style={{ padding: '12px 20px', background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px' }}>✓</div>
              <div style={{ fontSize: '10px', color: '#4ade80' }}>Blockchain Verified</div>
            </div>
          </div>

          {/* Search and Filter */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {categories.map(cat => (
                <button key={cat} onClick={() => setSelectedCategory(cat)} style={{ padding: '6px 16px', borderRadius: '20px', border: selectedCategory === cat ? '1px solid #60a5fa' : '1px solid rgba(255,255,255,0.1)', background: selectedCategory === cat ? 'rgba(96,165,250,0.15)' : 'transparent', color: selectedCategory === cat ? '#60a5fa' : 'rgba(255,255,255,0.4)', fontSize: '11px', cursor: 'pointer' }}>{cat}</button>
              ))}
            </div>
            <input type="text" placeholder="Search by name, farmer, or ID..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ padding: '8px 16px', width: '280px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', color: '#fff', fontSize: '12px', outline: 'none' }} />
          </div>

          {/* PRODUCTS TABLE */}
          {filteredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', color: 'rgba(255,255,255,0.3)' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌾</div>
              <p>No products found.</p>
              <button onClick={fetchProducts} style={{ marginTop: '16px', padding: '8px 16px', background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.3)', borderRadius: '6px', color: '#60a5fa', cursor: 'pointer' }}>Refresh</button>
            </div>
          ) : (
            <div style={{ background: 'rgba(255,255,255,0.025)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', overflow: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '60px 80px 1fr 120px 100px 100px 100px 80px 120px', padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', minWidth: '1000px' }}>
                <div>#</div><div>Image</div><div>Product</div><div>Farmer</div><div>Harvest Date</div><div>Chemicals</div><div>Price</div><div>Stock</div><div>Action</div>
              </div>

              {filteredProducts.map((product, index) => (
                <div key={product.id} className="product-table-row" style={{ display: 'grid', gridTemplateColumns: '60px 80px 1fr 120px 100px 100px 100px 80px 120px', padding: '16px 20px', borderBottom: index < filteredProducts.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', alignItems: 'center', background: hoveredRow === product.id ? 'rgba(96,165,250,0.03)' : 'transparent', minWidth: '1000px' }} onMouseEnter={() => setHoveredRow(product.id)} onMouseLeave={() => setHoveredRow(null)}>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{index + 1}</div>
                  <div style={{ fontSize: '32px' }}>{product.image || '🌾'}</div>
                  <div><div style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>{product.name}</div><div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>ID: {product.id}</div></div>
                  <div><div style={{ fontSize: '12px', color: '#fff' }}>{product.farmer}</div><div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>{product.location}</div></div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>{product.harvest_date}</div>
                  <div><span style={{ display: 'inline-block', padding: '3px 8px', borderRadius: '12px', fontSize: '10px', background: product.chemicals === 'None' || !product.chemicals ? 'rgba(74,222,128,0.15)' : 'rgba(250,204,21,0.15)', color: product.chemicals === 'None' || !product.chemicals ? '#4ade80' : '#facc15' }}>{product.chemicals || 'None'}</span></div>
                  <div><div style={{ fontSize: '16px', fontWeight: 'bold', color: '#4ade80' }}>R{product.price}</div><div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>per {product.unit}</div></div>
                  <div><div style={{ fontSize: '13px', color: product.stock > 0 ? '#fff' : '#f87171' }}>{product.stock}</div><div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>{product.unit}s left</div></div>
                  <div><div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input type="number" min="1" max={product.stock} disabled={product.stock === 0} value={quantities[product.id] || 1} onChange={e => updateProductQuantity(product.id, e.target.value)} style={{ width: '55px', padding: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: product.stock === 0 ? 'rgba(255,255,255,0.3)' : '#fff', textAlign: 'center', fontSize: '11px' }} />
                    <button onClick={() => addToCart(product, quantities[product.id] || 1)} disabled={product.stock === 0} style={{ padding: '6px 12px', background: product.stock === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.3)', borderRadius: '6px', color: product.stock === 0 ? 'rgba(255,255,255,0.3)' : '#60a5fa', fontSize: '10px', fontWeight: 'bold', cursor: product.stock === 0 ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}>{product.stock === 0 ? 'Out of Stock' : '🛒 Add'}</button>
                  </div></div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Shopping Cart Sidebar */}
        {showCart && (
          <div className="cart-sidebar" style={{ position: 'fixed', top: 0, right: 0, width: '400px', height: '100vh', background: 'rgba(6,12,4,0.98)', backdropFilter: 'blur(20px)', borderLeft: '1px solid rgba(96,165,250,0.2)', zIndex: 1000, display: 'flex', flexDirection: 'column', boxShadow: '-20px 0 40px rgba(0,0,0,0.5)' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ color: '#fff' }}>Your Cart ({cart.reduce((sum, i) => sum + i.quantity, 0)} items)</h3>
              <button onClick={() => setShowCart(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: '40px' }}><div style={{ fontSize: '48px', marginBottom: '16px' }}>🛒</div><p>Your cart is empty</p></div>
              ) : (
                cart.map(item => (
                  <div key={item.id} style={{ marginBottom: '16px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><div><div style={{ fontWeight: 'bold', color: '#fff' }}>{item.name}</div><div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>by {item.farmer}</div></div><div style={{ color: '#4ade80', fontWeight: 'bold' }}>R{(item.price * item.quantity).toFixed(2)}</div></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', width: '24px', height: '24px', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}>-</button>
                        <span style={{ color: '#fff' }}>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', width: '24px', height: '24px', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}>+</button>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', color: '#f87171', fontSize: '11px', cursor: 'pointer' }}>Remove</button>
                    </div>
                  </div>
                ))
              )}
            </div>
            {cart.length > 0 && (
              <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}><span style={{ color: '#fff' }}>Total:</span><span style={{ fontSize: '20px', fontWeight: 'bold', color: '#4ade80' }}>R{cartTotal.toFixed(2)}</span></div>
                <button onClick={() => { setShowCart(false); setShowCheckout(true); }} style={{ width: '100%', padding: '14px', background: '#4ade80', border: 'none', borderRadius: '8px', color: '#060c04', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}>Create Order →</button>
              </div>
            )}
          </div>
        )}

        {/* Checkout Modal */}
        {showCheckout && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: 'rgba(6,12,4,0.98)', border: '1px solid rgba(96,165,250,0.3)', borderRadius: '16px', padding: '32px', maxWidth: '500px', width: '90%' }}>
              <h2 style={{ color: '#fff', marginBottom: '20px' }}>Confirm Order</h2>
              <div style={{ marginBottom: '20px' }}>
                {cart.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                    <span style={{ color: 'rgba(255,255,255,0.7)' }}>{item.quantity} × {item.name}</span>
                    <span style={{ color: '#fff' }}>R{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '12px', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                  <span style={{ color: '#fff' }}>Total</span>
                  <span style={{ color: '#4ade80', fontSize: '18px' }}>R{cartTotal.toFixed(2)}</span>
                </div>
              </div>
              
              <div style={{ background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.3)', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '20px' }}>📦</span>
                  <span style={{ color: '#facc15', fontWeight: 'bold', fontSize: '13px' }}>Payment After Delivery</span>
                </div>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                  You will NOT be charged now. When your product arrives, go to <strong>"My Orders"</strong> and scan the QR code to complete payment.
                </p>
              </div>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => setShowCheckout(false)} style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>Cancel</button>
                <button onClick={processCheckout} disabled={loading} style={{ flex: 1, padding: '12px', background: '#4ade80', border: 'none', borderRadius: '8px', color: '#060c04', fontWeight: 'bold', cursor: 'pointer' }}>Create Order →</button>
              </div>
            </div>
          </div>
        )}

        {/* Notification Modal */}
        {showNotificationModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div className="notification-modal" style={{
              background: '#060c04',
              border: '1px solid rgba(74,222,128,0.3)',
              borderRadius: '20px',
              width: '90%',
              maxWidth: '500px',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}>
              {/* Modal Header */}
              <div style={{
                padding: '20px 24px',
                borderBottom: '1px solid rgba(74,222,128,0.2)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(74,222,128,0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '24px' }}>🔔</span>
                  <h3 style={{ color: '#fff', margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
                    Notifications
                  </h3>
                  {buyerNotificationCount > 0 && (
                    <span style={{
                      background: '#f87171',
                      color: '#fff',
                      borderRadius: '20px',
                      padding: '2px 8px',
                      fontSize: '11px',
                      fontWeight: 'bold'
                    }}>
                      {buyerNotificationCount} new
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setShowNotificationModal(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: '24px',
                    cursor: 'pointer',
                    padding: '4px 8px'
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Modal Body - Notifications List */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px'
              }}>
                {buyerNotifications.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    color: 'rgba(255,255,255,0.4)'
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔕</div>
                    <p>No notifications yet</p>
                    <p style={{ fontSize: '12px', marginTop: '8px' }}>
                      When farmers approve your orders, you'll see them here.
                    </p>
                  </div>
                ) : (
                  buyerNotifications.map(notif => (
                    <div
                      key={notif.id}
                      className="notification-item"
                      onClick={() => markNotificationAsRead(notif.id)}
                      style={{
                        padding: '16px',
                        marginBottom: '12px',
                        background: notif.read ? 'rgba(255,255,255,0.02)' : 'rgba(74,222,128,0.08)',
                        borderRadius: '12px',
                        border: `1px solid ${notif.read ? 'rgba(255,255,255,0.05)' : 'rgba(74,222,128,0.2)'}`,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: notif.type === 'order_approved' ? 'rgba(74,222,128,0.15)' : 'rgba(96,165,250,0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '20px'
                        }}>
                          {notif.type === 'order_approved' ? '✅' : '📦'}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontSize: '13px',
                            fontWeight: notif.read ? 'normal' : 'bold',
                            color: notif.read ? 'rgba(255,255,255,0.7)' : '#fff',
                            marginBottom: '6px',
                            lineHeight: '1.4'
                          }}>
                            {notif.message}
                          </div>
                          {notif.delivery_date && (
                            <div style={{
                              fontSize: '11px',
                              color: '#4ade80',
                              marginTop: '6px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}>
                              <span>🚚</span>
                              <span>Delivery: {new Date(notif.delivery_date).toLocaleDateString()}</span>
                            </div>
                          )}
                          <div style={{
                            fontSize: '10px',
                            color: 'rgba(255,255,255,0.3)',
                            marginTop: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}>
                            <span>📅</span>
                            <span>{new Date(notif.created_at).toLocaleString()}</span>
                            {!notif.read && (
                              <span style={{
                                background: '#4ade80',
                                color: '#060c04',
                                borderRadius: '4px',
                                padding: '2px 6px',
                                fontSize: '9px',
                                marginLeft: '8px'
                              }}>
                                New
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Modal Footer */}
              {buyerNotifications.length > 0 && (
                <div style={{
                  padding: '16px 24px',
                  borderTop: '1px solid rgba(74,222,128,0.2)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '12px',
                  background: 'rgba(0,0,0,0.3)'
                }}>
                  <button
                    onClick={markAllNotificationsAsRead}
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: 'transparent',
                      border: '1px solid rgba(96,165,250,0.3)',
                      borderRadius: '8px',
                      color: '#60a5fa',
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(96,165,250,0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    Mark All as Read
                  </button>
                  <button
                    onClick={() => {
                      setShowNotificationModal(false)
                      navigate('/buyer-orders')
                    }}
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: '#4ade80',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#060c04',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    View My Orders →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* QR Verification Modal */}
        {showQrModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.95)', zIndex: 1002, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#060c04', border: `1px solid ${qrResult ? (qrResult.success ? 'rgba(74,222,128,0.5)' : 'rgba(248,113,113,0.5)') : 'rgba(96,165,250,0.3)'}`, borderRadius: '16px', padding: '32px', maxWidth: '450px', width: '90%', textAlign: 'center' }}>
              <h3 style={{ color: '#fff', marginBottom: '16px' }}>🔍 Verify Product QR Code</h3>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '20px' }}>Enter the Harvest ID from the QR code on your delivered product</p>
              
              {!qrResult ? (
                <>
                  <div style={{ marginBottom: '20px' }}>
                    <input type="text" placeholder="Enter Harvest ID (e.g., HC-0012)" value={qrInput} onChange={(e) => setQrInput(e.target.value.toUpperCase())} style={{ width: '100%', padding: '14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '14px', fontFamily: 'monospace', textAlign: 'center' }} autoFocus />
                  </div>
                  <button onClick={verifyProduct} disabled={verifying} style={{ width: '100%', padding: '14px', background: verifying ? 'rgba(96,165,250,0.3)' : '#4ade80', border: 'none', borderRadius: '8px', color: verifying ? 'rgba(255,255,255,0.5)' : '#060c04', fontWeight: 'bold', cursor: verifying ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    {verifying ? (<><span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} /> Verifying on Blockchain...</>) : ('✓ Verify on Blockchain')}
                  </button>
                </>
              ) : (
                <div>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: qrResult.success ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)', border: `2px solid ${qrResult.success ? '#4ade80' : '#f87171'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '32px' }}>{qrResult.success ? '✓' : '⚠'}</div>
                  <h4 style={{ color: qrResult.success ? '#4ade80' : '#f87171', marginBottom: '12px' }}>{qrResult.success ? 'PRODUCT VERIFIED!' : 'VERIFICATION FAILED'}</h4>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6', marginBottom: '16px' }}>{qrResult.message}</p>
                  {qrResult.product && qrResult.success && (
                    <div style={{ padding: '12px', background: 'rgba(74,222,128,0.05)', borderRadius: '8px', textAlign: 'left' }}>
                      <div style={{ fontSize: '10px', color: '#4ade80', marginBottom: '8px' }}>📋 Blockchain Record</div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>
                        <div>• Product: {qrResult.product.name}</div>
                        <div>• Farmer: {qrResult.product.farmer}</div>
                        <div>• Harvest Date: {qrResult.product.harvest_date}</div>
                        <div>• Chemicals: {qrResult.product.chemicals || 'None'}</div>
                        <div>• Location: {qrResult.product.location}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <button onClick={() => { setShowQrModal(false); setQrResult(null); setQrInput(''); }} style={{ marginTop: '24px', padding: '10px 20px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', width: '100%' }}>Close</button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}