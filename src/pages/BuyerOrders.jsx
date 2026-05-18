import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import '@fontsource/bebas-neue'
import '@fontsource/inter'
import buyerIcon from '../assets/icons/user.png'
import bgImage from '../assets/images/max-O_TVsaeZNlE-unsplash.jpg'
import { supabase } from '../supabaseClient'
import jsQR from 'jsqr'

export default function BuyerOrders() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [verificationResult, setVerificationResult] = useState(null)
  const [processingPayment, setProcessingPayment] = useState(false)
  const [hoveredOrder, setHoveredOrder] = useState(null)
  const [showManualEntry, setShowManualEntry] = useState(false)
  const [manualHarvestId, setManualHarvestId] = useState('')
  const [cameraActive, setCameraActive] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [scanMessage, setScanMessage] = useState('Position QR code in the frame')
  
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const animationRef = useRef(null)

  const account = '0xBuyer...f10a'

  // Load orders from Supabase database
  useEffect(() => {
    loadOrders()
    return () => {
      // Cleanup on unmount
      if (streamRef.current) {
        stopCamera()
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  // Load orders from Supabase database
  async function loadOrders() {
    try {
      console.log('Fetching orders from Supabase...')
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('order_date', { ascending: false })
      
      if (error) {
        console.error('Supabase fetch error:', error)
        throw error
      }
      
      console.log('✅ Loaded orders from Supabase:', data?.length || 0, 'orders found')
      
      const transformedOrders = (data || []).map(order => ({
        id: order.id,
        date: order.order_date,
        items: order.items,
        total: order.total,
        status: order.status,
        trackingNumber: order.tracking_number,
        paymentDate: order.payment_date
      }))
      
      setOrders(transformedOrders)
    } catch (error) {
      console.error('Error loading orders:', error)
      setOrders([])
    }
  }

  // Open payment modal for a specific order
  function openPaymentForOrder(order) {
    setSelectedOrder(order)
    setShowPaymentModal(true)
    setVerificationResult(null)
    setShowManualEntry(false)
    setManualHarvestId('')
    setCameraActive(false)
    setScanning(false)
    setScanMessage('Position QR code in the frame')
  }

  // Start camera for QR scanning
  async function startCamera() {
    setCameraActive(true)
    setScanning(true)
    setVerificationResult(null)
    setScanMessage('Looking for QR code...')
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      })
      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        
        // Start scanning after video is playing
        videoRef.current.onloadedmetadata = () => {
          scanQRCode()
        }
      }
    } catch (err) {
      console.error("Camera error:", err)
      setScanMessage("Camera access denied. Please use manual entry.")
      setCameraActive(false)
      setScanning(false)
    }
  }

  // Stop camera
  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
    setCameraActive(false)
    setScanning(false)
  }

  // Scan QR code from video frames
  // Scan QR code from video frames
async function scanQRCode() {
  if (!videoRef.current || !canvasRef.current) {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
    return
  }
  
  const video = videoRef.current
  const canvas = canvasRef.current
  const context = canvas.getContext('2d')
  
  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    // Set canvas size to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    // Get image data
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    
    // Try to decode QR code (scan multiple times per frame for better detection)
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "attemptBoth",
    })
    
    if (code && verificationResult === null) {
      console.log("QR Code detected:", code.data)
      
      // Stop scanning immediately
      setScanMessage("QR code detected! Verifying...")
      
      // Extract Harvest ID from QR code
      let harvestId = code.data.trim().toUpperCase()
      
      // Try to extract ID if it's a URL or contains HC-
      const idMatch = harvestId.match(/HC-[A-Z0-9]{4,8}/i)
      if (idMatch) {
        harvestId = idMatch[0].toUpperCase()
      }
      
      // Check if it looks like a valid Harvest ID
      const isValidHarvestId = /^HC-[A-Z0-9]{4,8}$/i.test(harvestId)
      
      if (!isValidHarvestId) {
        setVerificationResult({
          success: false,
          type: 'invalid_qr',
          message: `❌ Invalid QR Code\n\nThis QR code is not a valid AgriChain Harvest ID.\n\nPlease scan a product QR code from an AgriChain registered product.`,
          qrContent: code.data
        })
        setScanMessage("Invalid QR code detected")
        stopCamera()
        return
      }
      
      // Verify the scanned ID against the order
      await verifyScannedQr(harvestId)
      return
    } else if (scanning) {
      setScanMessage("Scanning... Position QR code in frame")
    }
  }
  
  // Continue scanning
  animationRef.current = requestAnimationFrame(() => scanQRCode())
}

  // Verify scanned QR code against the order
  async function verifyScannedQr(harvestId) {
    try {
      // Check if this Harvest ID matches ANY product in the order
      const matchingProduct = selectedOrder?.items.find(item => item.id === harvestId)
      
      if (!matchingProduct) {
        setVerificationResult({
          success: false,
          type: 'not_in_order',
          message: `❌ Harvest ID "${harvestId}" does not match any product in this order.\n\nExpected products:\n${selectedOrder?.items.map(i => `  • ${i.name} (${i.id})`).join('\n')}`,
        })
        setScanMessage("Product not in this order")
        stopCamera()
        return
      }
      
      // Check if this harvest has been scanned before (fraud detection)
      const existingScans = JSON.parse(localStorage.getItem('harvest_scans') || '[]')
      const hasBeenScanned = existingScans.some(
        scan => scan.harvest_id === harvestId && scan.order_id === selectedOrder.id
      )
      
      if (hasBeenScanned) {
        setVerificationResult({
          success: false,
          type: 'already_scanned',
          message: `🚨 FRAUD ALERT!\n\nThis QR code has already been scanned for this order.\n\nPayment cannot be completed. Each product can only be verified once.`,
        })
        setScanMessage("QR code already used!")
        stopCamera()
        return
      }
      
      // Fetch full product details from database
      const { data: productData, error: productError } = await supabase
        .from('harvests')
        .select('*')
        .eq('id', harvestId)
        .single()
      
      if (productError || !productData) {
        setVerificationResult({
          success: false,
          type: 'not_found',
          message: `❌ Product with ID "${harvestId}" not found in blockchain database.\n\nThis may be counterfeit. Do not complete payment.`,
        })
        setScanMessage("Product not found in database")
        stopCamera()
        return
      }
      
      // Check if product is out of stock
      if (productData.stock <= 0) {
        setVerificationResult({
          success: false,
          type: 'out_of_stock',
          message: `❌ "${productData.name}" is out of stock.\n\nCannot complete payment.`,
          product: productData
        })
        setScanMessage("Product out of stock")
        stopCamera()
        return
      }
      
      // Success - product is valid
      setVerificationResult({
        success: true,
        type: 'success',
        message: `✓ PRODUCT VERIFIED!\n\n"${productData.name}" from ${productData.farmer} is authentic.\n\nYou can now complete payment.`,
        product: productData,
        harvestId: harvestId
      })
      setScanMessage("Product verified! Ready to pay.")
      stopCamera()
      
    } catch (error) {
      console.error('Verification error:', error)
      setVerificationResult({
        success: false,
        type: 'error',
        message: '❌ Verification failed. Please try again.',
      })
      stopCamera()
    }
  }

  // Manual entry fallback
  async function handleManualVerify() {
    if (!manualHarvestId.trim()) {
      alert('Please enter a Harvest ID')
      return
    }
    if (streamRef.current) {
      stopCamera()
    }
    await verifyScannedQr(manualHarvestId.trim().toUpperCase())
  }

  // Process payment after successful verification
  async function processPayment() {
    if (!selectedOrder || !verificationResult?.success) return
    
    setProcessingPayment(true)
    
    try {
      // Record that this QR has been scanned (prevent reuse)
      const existingScans = JSON.parse(localStorage.getItem('harvest_scans') || '[]')
      existingScans.push({
        harvest_id: verificationResult.harvestId,
        order_id: selectedOrder.id,
        scanned_by: account,
        scan_timestamp: new Date().toISOString(),
        verified: true
      })
      localStorage.setItem('harvest_scans', JSON.stringify(existingScans))
      
      // Update stock in database for all items in order
      for (const item of selectedOrder.items) {
        const { data: productData } = await supabase
          .from('harvests')
          .select('stock')
          .eq('id', item.id)
          .single()
        
        if (productData) {
          const newStock = productData.stock - item.quantity
          await supabase
            .from('harvests')
            .update({ stock: newStock })
            .eq('id', item.id)
          console.log(`✅ Updated stock for ${item.name}: ${newStock} left`)
        }
      }
      
      // Update order status in Supabase
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          status: 'Paid', 
          payment_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedOrder.id)
      
      if (updateError) {
        console.error('Error updating order:', updateError)
      } else {
        console.log('✅ Order status updated to Paid in Supabase')
      }
      
      // Reload orders to refresh the list
      await loadOrders()
      
      // Close modal and show success
      setShowPaymentModal(false)
      setSelectedOrder(null)
      setVerificationResult(null)
      if (streamRef.current) {
        stopCamera()
      }
      
      alert('✓ Payment successful! Your order has been confirmed.')
      
    } catch (error) {
      console.error('Payment error:', error)
      alert('Payment failed. Please try again.')
    } finally {
      setProcessingPayment(false)
    }
  }

  // Cancel order
  async function cancelOrder(orderId) {
    if (confirm('Are you sure you want to cancel this order?')) {
      try {
        const { error } = await supabase
          .from('orders')
          .update({ 
            status: 'Cancelled',
            updated_at: new Date().toISOString()
          })
          .eq('id', orderId)
        
        if (error) {
          console.error('Error cancelling order:', error)
        }
        
        await loadOrders()
        alert('Order cancelled.')
      } catch (error) {
        console.error('Cancel error:', error)
        alert('Failed to cancel order.')
      }
    }
  }

  // Cleanup on modal close
  function closeModal() {
    if (streamRef.current) {
      stopCamera()
    }
    setShowPaymentModal(false)
    setSelectedOrder(null)
    setVerificationResult(null)
    setShowManualEntry(false)
    setManualHarvestId('')
    setCameraActive(false)
    setScanning(false)
    setScanMessage('Position QR code in the frame')
  }

  return (
    <>
      <style>{`
        @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideIn { from{transform:translateX(100%)} to{transform:translateX(0)} }
        @keyframes spin { to { transform: rotate(360deg); } }
        .orders-page { animation: fadeUp 0.4s ease both; }
        .order-card { transition: all 0.2s ease; }
        .order-card:hover { transform: translateY(-2px); }
        .scan-result { animation: slideIn 0.3s ease both; }
        .camera-preview { transform: scaleX(-1); }
      `}</style>

      <div className="orders-page" style={{
        fontFamily: "'Inter', sans-serif",
        minHeight: '100vh', background: '#060c04',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background */}
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.18) saturate(0.5)' }} />
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'linear-gradient(135deg, rgba(4,9,2,0.94) 0%, rgba(6,12,4,0.82) 100%)' }} />

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
            </span>
            <span style={{ fontSize: '7px', color: 'rgba(255,255,255,0.25)', letterSpacing: '2px', textTransform: 'uppercase' }}>My Orders</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={buyerIcon} alt="Buyer" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
            </div>
            <span style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' }}>Order History</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 12px', background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.18)', borderRadius: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#60a5fa', display: 'inline-block', animation: 'pulse-dot 2s infinite' }} />
              <span style={{ fontSize: '10px', color: '#60a5fa', fontFamily: 'monospace' }}>{account}</span>
            </div>
            <button onClick={() => navigate('/buyer')} style={{
              background: 'transparent', border: '1px solid rgba(96,165,250,0.3)', color: '#60a5fa',
              fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', padding: '5px 14px', borderRadius: '4px', cursor: 'pointer'
            }}>← Back to Shop</button>
            <button onClick={() => navigate('/')} style={{
              background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.35)',
              fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', padding: '5px 14px', borderRadius: '4px', cursor: 'pointer'
            }}>Exit</button>
          </div>
        </nav>

        <main style={{ position: 'relative', zIndex: 1, maxWidth: '1000px', margin: '0 auto', padding: '40px 24px 80px' }}>

          {/* Heading */}
          <div style={{ marginBottom: '40px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: '#60a5fa', margin: '0 0 8px' }}>
              Track and Pay
            </p>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(40px, 6vw, 68px)', color: '#fff', letterSpacing: '2px', lineHeight: '0.9', margin: 0 }}>
              MY <span style={{ color: '#60a5fa' }}>ORDERS</span>
            </h1>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: '8px' }}>
              When your product arrives, click "Pay Now" and scan the QR code to complete payment.
            </p>
          </div>

          {/* Orders List */}
          {orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>📦</div>
              <h3 style={{ color: '#fff', marginBottom: '8px' }}>No Orders Yet</h3>
              <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '24px' }}>
                Start shopping to create an order.
              </p>
              <button onClick={() => navigate('/buyer')} style={{ padding: '10px 24px', background: '#4ade80', border: 'none', borderRadius: '8px', color: '#060c04', fontWeight: 'bold', cursor: 'pointer' }}>Browse Marketplace →</button>
            </div>
          ) : (
            orders.map(order => (
              <div
                key={order.id}
                className="order-card"
                style={{
                  marginBottom: '24px',
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${hoveredOrder === order.id ? 'rgba(96,165,250,0.3)' : 'rgba(255,255,255,0.07)'}`,
                  borderRadius: '16px',
                  overflow: 'hidden'
                }}
                onMouseEnter={() => setHoveredOrder(order.id)}
                onMouseLeave={() => setHoveredOrder(null)}
              >
                {/* Order Header */}
                <div style={{
                  padding: '20px',
                  background: 'rgba(96,165,250,0.05)',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Order #{order.id}</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>
                      Created: {new Date(order.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      background: order.status === 'Paid' ? 'rgba(74,222,128,0.2)' : order.status === 'Cancelled' ? 'rgba(248,113,113,0.2)' : 'rgba(250,204,21,0.2)',
                      color: order.status === 'Paid' ? '#4ade80' : order.status === 'Cancelled' ? '#f87171' : '#facc15'
                    }}>
                      {order.status || 'Pending Payment'}
                    </span>
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#4ade80' }}>
                    R{order.total.toFixed(2)}
                  </div>
                </div>

                {/* Order Items */}
                <div style={{ padding: '20px' }}>
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 0',
                        borderBottom: idx < order.items.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '14px', color: '#fff' }}>
                          {item.quantity} × {item.name}
                        </div>
                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>
                          Farmer: {item.farmer} • Harvest ID: {item.id}
                        </div>
                      </div>
                      <div style={{ fontSize: '14px', color: '#4ade80' }}>
                        R{(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}

                  {/* Action Buttons */}
                  <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
                    {order.status !== 'Paid' && order.status !== 'Cancelled' && (
                      <button
                        onClick={() => openPaymentForOrder(order)}
                        style={{
                          flex: 1,
                          padding: '12px',
                          background: '#4ade80',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#060c04',
                          fontWeight: 'bold',
                          fontSize: '14px',
                          cursor: 'pointer'
                        }}
                      >
                        📷 Pay Now (Scan QR)
                      </button>
                    )}
                    {order.status !== 'Paid' && order.status !== 'Cancelled' && (
                      <button
                        onClick={() => cancelOrder(order.id)}
                        style={{
                          flex: 1,
                          padding: '12px',
                          background: 'transparent',
                          border: '1px solid rgba(248,113,113,0.3)',
                          borderRadius: '8px',
                          color: '#f87171',
                          fontSize: '14px',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel Order
                      </button>
                    )}
                    {order.status === 'Paid' && (
                      <div style={{
                        flex: 1,
                        padding: '12px',
                        background: 'rgba(74,222,128,0.1)',
                        borderRadius: '8px',
                        textAlign: 'center',
                        color: '#4ade80',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}>
                        ✓ Payment Completed
                      </div>
                    )}
                    {order.status === 'Cancelled' && (
                      <div style={{
                        flex: 1,
                        padding: '12px',
                        background: 'rgba(248,113,113,0.1)',
                        borderRadius: '8px',
                        textAlign: 'center',
                        color: '#f87171',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}>
                        ✗ Order Cancelled
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </main>

        {/* Payment QR Scanner Modal with Camera */}
        {showPaymentModal && selectedOrder && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.95)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              background: '#060c04',
              border: `1px solid ${verificationResult ? (verificationResult.success ? 'rgba(74,222,128,0.5)' : 'rgba(248,113,113,0.5)') : 'rgba(96,165,250,0.3)'}`,
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '550px',
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto',
              textAlign: 'center'
            }}>
              <h3 style={{ color: '#fff', marginBottom: '8px' }}>
                Complete Payment for Order #{selectedOrder.id}
              </h3>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '20px' }}>
                Scan the QR code on your delivered product to verify and pay
              </p>
              
              {!verificationResult ? (
                <>
                  {!cameraActive ? (
                    <button
                      onClick={startCamera}
                      style={{
                        width: '100%',
                        padding: '40px',
                        background: 'rgba(96,165,250,0.1)',
                        border: '2px dashed rgba(96,165,250,0.3)',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontSize: '48px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '16px'
                      }}
                    >
                      📷
                      <span style={{ fontSize: '14px', color: '#60a5fa' }}>Start Camera</span>
                    </button>
                  ) : (
                    <div style={{ position: 'relative', width: '100%' }}>
                      <video
                        ref={videoRef}
                        className="camera-preview"
                        style={{
                          width: '100%',
                          borderRadius: '12px',
                          background: '#000',
                          maxHeight: '400px',
                          objectFit: 'cover'
                        }}
                        playsInline
                        muted
                      />
                      <canvas
                        ref={canvasRef}
                        style={{ display: 'none' }}
                      />
                      {scanning && (
                        <>
                          <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '220px',
                            height: '220px',
                            border: '2px solid rgba(96,165,250,0.6)',
                            borderRadius: '12px',
                            pointerEvents: 'none',
                            boxShadow: '0 0 0 2px rgba(0,0,0,0.3)'
                          }} />
                          <div style={{
                            position: 'absolute',
                            bottom: '10px',
                            left: 0,
                            right: 0,
                            textAlign: 'center',
                            fontSize: '11px',
                            color: 'rgba(255,255,255,0.7)',
                            background: 'rgba(0,0,0,0.6)',
                            padding: '6px',
                            borderRadius: '8px',
                            margin: '10px'
                          }}>
                            {scanMessage}
                          </div>
                        </>
                      )}
                      <button
                        onClick={stopCamera}
                        style={{
                          marginTop: '12px',
                          padding: '8px 16px',
                          background: '#f87171',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#fff',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Stop Camera
                      </button>
                    </div>
                  )}
                  
                  {/* Manual Entry Toggle */}
                  <button
                    onClick={() => {
                      if (cameraActive) stopCamera()
                      setShowManualEntry(!showManualEntry)
                    }}
                    style={{
                      marginTop: '16px',
                      background: 'transparent',
                      border: 'none',
                      color: '#60a5fa',
                      fontSize: '11px',
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    {showManualEntry ? '← Back to Camera' : 'Enter ID Manually'}
                  </button>
                  
                  {showManualEntry && (
                    <div style={{ marginTop: '16px' }}>
                      <input
                        type="text"
                        placeholder="Enter Harvest ID (e.g., HC-0012)"
                        value={manualHarvestId}
                        onChange={(e) => setManualHarvestId(e.target.value.toUpperCase())}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          color: '#fff',
                          textAlign: 'center',
                          fontSize: '14px',
                          fontFamily: 'monospace'
                        }}
                      />
                      <button
                        onClick={handleManualVerify}
                        style={{
                          marginTop: '12px',
                          width: '100%',
                          padding: '12px',
                          background: '#facc15',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#060c04',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        Verify Manually
                      </button>
                    </div>
                  )}
                  
                  <div style={{ marginTop: '20px', padding: '12px', background: 'rgba(96,165,250,0.05)', borderRadius: '8px' }}>
                    <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>
                      Expected Harvest IDs for this order:
                    </p>
                    {selectedOrder.items.map((item, i) => (
                      <div key={i} style={{ color: '#4ade80', fontSize: '11px', marginBottom: '4px' }}>
                        • {item.name}: <strong>{item.id}</strong>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="scan-result">
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: verificationResult.success ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)',
                    border: `2px solid ${verificationResult.success ? '#4ade80' : '#f87171'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    fontSize: '32px'
                  }}>
                    {verificationResult.success ? '✓' : '⚠'}
                  </div>
                  
                  <h4 style={{ 
                    color: verificationResult.success ? '#4ade80' : '#f87171', 
                    marginBottom: '12px' 
                  }}>
                    {verificationResult.success ? 'PRODUCT VERIFIED!' : 'VERIFICATION FAILED'}
                  </h4>
                  
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6', marginBottom: '20px', whiteSpace: 'pre-line' }}>
                    {verificationResult.message}
                  </p>
                  
                  {verificationResult.product && verificationResult.success && (
                    <div style={{
                      padding: '12px',
                      background: 'rgba(74,222,128,0.05)',
                      borderRadius: '8px',
                      textAlign: 'left',
                      marginBottom: '20px'
                    }}>
                      <div style={{ fontSize: '10px', color: '#4ade80', marginBottom: '8px' }}>📋 Product Details</div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>
                        <div>• Product: {verificationResult.product.name}</div>
                        <div>• Farmer: {verificationResult.product.farmer}</div>
                        <div>• Harvest Date: {verificationResult.product.harvest_date}</div>
                        <div>• Chemicals: {verificationResult.product.chemicals || 'None'}</div>
                      </div>
                    </div>
                  )}
                  
                  {verificationResult.success && (
                    <button
                      onClick={processPayment}
                      disabled={processingPayment}
                      style={{
                        width: '100%',
                        padding: '14px',
                        background: processingPayment ? 'rgba(74,222,128,0.3)' : '#4ade80',
                        border: 'none',
                        borderRadius: '8px',
                        color: processingPayment ? 'rgba(255,255,255,0.5)' : '#060c04',
                        fontWeight: 'bold',
                        cursor: processingPayment ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      {processingPayment ? (
                        <><span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} /> Processing Payment...</>
                      ) : (
                        '✓ Confirm Payment'
                      )}
                    </button>
                  )}
                  
                  {!verificationResult.success && (
                    <button
                      onClick={() => {
                        setVerificationResult(null)
                        setShowManualEntry(false)
                        setManualHarvestId('')
                        setCameraActive(false)
                      }}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: 'transparent',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                        color: 'rgba(255,255,255,0.6)',
                        cursor: 'pointer'
                      }}
                    >
                      Try Again
                    </button>
                  )}
                </div>
              )}

              <button
                onClick={closeModal}
                style={{
                  marginTop: '20px',
                  padding: '10px 20px',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: 'rgba(255,255,255,0.6)',
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}