import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import '@fontsource/bebas-neue'
import '@fontsource/inter'
import farmerIcon from '../assets/icons/farmers.png'
import buyerIcon from '../assets/icons/user.png'
import adminIcon from '../assets/icons/admin.png'
import carouselImg1 from '../assets/images/werner-sevenster-JuP0ZG0UNi0-unsplash.jpg'
import carouselImg2 from '../assets/images/dave-hoefler-Envk7kTMWTQ-unsplash.jpg'
import carouselImg3 from '../assets/images/max-O_TVsaeZNlE-unsplash.jpg'
import carouselImg4 from '../assets/images/stijn-te-strake-UdhpcfImQ9Y-unsplash.jpg'
import howItWorksBg from '../assets/images/arnaldo-aldana-HfH5yd70ox8-unsplash.jpg'
import stepImg1 from '../assets/images/daniel-fazio-oK9EKfqv8HE-unsplash.jpg'
import stepImg2 from '../assets/images/gabriel-jimenez-jin4W1HqgL4-unsplash.jpg'
import stepImg3 from '../assets/images/jonathan-kemper-CbZh3kaPxrE-unsplash.jpg'
import stepImg4 from '../assets/images/justus-menke-zRqRhIJqdnI-unsplash.jpg'

export default function Landing() {
  const navigate = useNavigate()
  const [account, setAccount] = useState(null)
  const [connecting, setConnecting] = useState(false)
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [hoveredCard, setHoveredCard] = useState(null)
  const [hoveredStep, setHoveredStep] = useState(null)

  const carouselImages = [
    { src: carouselImg1, title: 'Farm Life' },
    { src: carouselImg2, title: 'Agricultural Innovation' },
    { src: carouselImg3, title: 'Harvest Season' },
    { src: carouselImg4, title: 'Sustainable Farming' },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % carouselImages.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  async function connectWallet() {
    if (!window.ethereum) {
      alert('Please install MetaMask to continue.')
      return
    }
    setConnecting(true)
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      setAccount(accounts[0])
    } catch (err) {
      console.error(err)
    }
    setConnecting(false)
  }

  function enterAs(role) {
    // Navigate to login so user can authenticate
    navigate('/login', { state: { role } })
  }

  const roles = [
    { role: 'farmer', label: 'Farmer', icon: farmerIcon, accent: '#4ade80', rgb: '74,222,128', tag: 'Register harvests', desc: 'Log your crop, GPS, and chemicals permanently on-chain.' },
    { role: 'buyer',  label: 'Buyer',  icon: buyerIcon,  accent: '#60a5fa', rgb: '96,165,250', tag: 'Verify produce',   desc: 'Scan a QR and instantly confirm what you are buying.' },
    { role: 'admin',  label: 'Admin',  icon: adminIcon,  accent: '#facc15', rgb: '250,204,21', tag: 'Monitor system',  desc: 'Oversee all records, users, and fraud detection.' },
  ]

  const stats = [
    { label: 'Harvests registered', value: '2,481', tag: '+12 today' },
    { label: 'QR scans verified',   value: '8,934', tag: 'live'      },
    { label: 'Fraud blocked',       value: '47',    tag: 'detected'  },
  ]

  const steps = [
    {
      step: '01',
      title: 'Grow',
      tag: 'On the farm',
      desc: 'Farmers cultivate verified crops using sustainable methods tracked from seed to harvest ready for registration.',
      img: stepImg1,
      accent: '#4ade80',
      rgb: '74,222,128',
    },
    {
      step: '02',
      title: 'Register',
      tag: 'On the blockchain',
      desc: 'Harvest data — GPS coordinates, chemicals used, and date — is hashed and written permanently to Polygon.',
      img: stepImg2,
      accent: '#60a5fa',
      rgb: '96,165,250',
    },
    {
      step: '03',
      title: 'Verify',
      tag: 'Instant QR scan',
      desc: 'Buyers scan a QR code to pull the immutable on-chain record and confirm authenticity in seconds.',
      img: stepImg3,
      accent: '#facc15',
      rgb: '250,204,21',
    },
    {
      step: '04',
      title: 'Deliver',
      tag: 'Trust confirmed',
      desc: 'Produce moves through the supply chain carrying a verified, fraud-proof digital certificate of origin.',
      img: stepImg4,
      accent: '#c084fc',
      rgb: '192,132,252',
    },
  ]

  return (
    <>
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .step-card-img {
          transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        .step-card:hover .step-card-img {
          transform: scale(1.07);
        }
      `}</style>

      <div style={{ fontFamily: "'Inter', sans-serif", background: '#060c04' }} className="overflow-x-hidden">

        {/* ═══════════════ HERO ═══════════════ */}
        <div className="relative min-h-screen overflow-hidden flex flex-col">

          {/* Carousel backgrounds */}
          <div className="absolute inset-0">
            {carouselImages.map((img, idx) => (
              <div
                key={idx}
                className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${idx === carouselIndex ? 'opacity-100' : 'opacity-0'}`}
                style={{ backgroundImage: `url(${img.src})`, filter: 'brightness(1.05) contrast(1.05)' }}
              />
            ))}
          </div>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(4,9,2,0.72) 0%, rgba(4,9,2,0.45) 40%, rgba(4,9,2,0.90) 100%)' }} />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 70% 80% at 50% 50%, rgba(4,9,2,0.35) 0%, rgba(4,9,2,0.78) 100%)' }} />

          {/* Navbar */}
          <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 pt-6 md:pt-8">
            <div className="flex flex-col leading-none">
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '22px', letterSpacing: '3px' }}>
                <span className="text-green-400">AGRI</span>
                <span className="text-white">CHAIN</span>
              </span>
              <span className="text-[8px] text-white/30 tracking-[2px] uppercase mt-0.5">Blockchain Verified</span>
            </div>

            <ul className="hidden md:flex gap-8 list-none m-0 p-0">
              {['Home', 'About', 'How it works', 'Verify'].map((item, i) => (
                <li key={item}>
                  <a href="#" className={`text-[11px] tracking-[1.5px] uppercase no-underline transition-colors ${i === 0 ? 'text-green-400' : 'text-white/40 hover:text-white'}`}>{item}</a>
                </li>
              ))}
            </ul>

            <button
              onClick={connectWallet}
              style={{ background: account ? 'rgba(74,222,128,0.08)' : 'transparent', border: '1px solid rgba(74,222,128,0.45)', borderRadius: '4px' }}
              className="text-green-400 text-[10px] md:text-[11px] tracking-[1.5px] uppercase px-4 md:px-5 py-2 cursor-pointer hover:bg-green-400/10 transition-all"
            >
              {connecting ? 'Connecting...' : account ? `${account.slice(0,6)}...${account.slice(-4)}` : '⬤ Connect Wallet'}
            </button>
          </nav>

          {/* Hero body */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 md:px-12 pt-10 pb-6">

            <p className="text-[10px] md:text-[11px] tracking-[3px] uppercase text-green-400 mb-4">
              Secure · Transparent · Verified
            </p>

            <h1
              style={{ fontFamily: "'Bebas Neue', sans-serif", lineHeight: '0.88', letterSpacing: '2px' }}
              className="text-white text-[88px] md:text-[130px] lg:text-[160px]"
            >
              AGRI<br />
              <span className="text-green-400">CHAIN</span>
            </h1>

            <p className="text-white/50 text-[13px] md:text-[14px] leading-relaxed max-w-md mt-5 tracking-wide">
              Blockchain-powered agricultural traceability. Every harvest registered, verified, and fraud-proof — from farm to buyer.
            </p>

            {/* Role cards */}
            <div className="flex flex-col sm:flex-row gap-3 mt-10 w-full max-w-xl">
              {roles.map(({ role, label, icon, accent, rgb, tag, desc }) => (
                <div
                  key={role}
                  onClick={() => enterAs(role)}
                  className="relative cursor-pointer flex-1"
                  style={{
                    padding: '18px 16px',
                    background: 'rgba(255,255,255,0.02)',
                    backdropFilter: 'blur(4px) saturate(1.1)',
                    WebkitBackdropFilter: 'blur(4px) saturate(1.1)',
                    border: `1px solid rgba(${rgb},0.18)`,
                    borderRadius: '12px',
                    transition: 'all 0.3s ease',
                    boxShadow: hoveredCard === role ? `0 0 28px rgba(${rgb},0.14)` : 'none',
                    transform: hoveredCard === role ? 'translateY(-3px)' : 'translateY(0)',
                  }}
                  onMouseEnter={() => setHoveredCard(role)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div style={{ position: 'absolute', top: 0, left: '14px', right: '14px', height: '2px', background: accent, opacity: 0.55, borderRadius: '0 0 4px 4px' }} />
                  <div className="flex justify-center mb-3">
                    <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: `rgba(${rgb},0.08)`, border: `1px solid rgba(${rgb},0.18)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src={icon} alt={label} style={{ width: '24px', height: '24px', objectFit: 'contain', opacity: 0.9 }} />
                    </div>
                  </div>
                  <div style={{ fontSize: '8px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)', marginBottom: '3px' }}>Enter as</div>
                  <div style={{ fontSize: '15px', color: '#fff', fontWeight: '600', letterSpacing: '0.3px', marginBottom: '3px' }}>{label}</div>
                  <div style={{ fontSize: '9px', color: accent, opacity: 0.8, letterSpacing: '0.3px', marginBottom: '6px' }}>{tag}</div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', lineHeight: '1.5' }}>{desc}</div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 md:gap-12 mt-10 pt-8 w-full max-w-xl border-t border-white/[0.06]">
              {stats.map(({ label, value, tag }) => (
                <div key={label} className="text-center">
                  <div className="text-[9px] tracking-[1.5px] uppercase text-white/25 mb-1">{label}</div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '26px' }} className="text-white tracking-wide leading-none">
                    {value}
                    <span className="text-green-400 text-[11px] ml-1.5" style={{ fontFamily: "'Inter', sans-serif" }}>{tag}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Carousel dots */}
          <div className="absolute right-5 md:right-10 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-2.5">
            {carouselImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setCarouselIndex(i)}
                className={`rounded-full transition-all duration-300 border-0 p-0 cursor-pointer ${i === carouselIndex ? 'bg-green-400 w-2.5 h-2.5' : 'bg-white/25 w-2 h-2 hover:bg-white/50'}`}
              />
            ))}
          </div>

          {/* Blockchain badge */}
          <div className="absolute bottom-6 right-5 md:right-10 z-10 bg-black/55 border border-green-400/20 rounded-lg px-3 py-2.5 md:px-4 md:py-3">
            <div className="text-[8px] md:text-[9px] tracking-[2px] uppercase text-white/30 mb-1 flex items-center gap-1.5">
              <span style={{ animation: 'pulse-dot 2s infinite' }} className="inline-block w-1.5 h-1.5 rounded-full bg-green-400" />
              Live on Polygon
            </div>
            <div className="font-mono text-[9px] md:text-[10px] text-green-400/75">0x4f3a...d92c · Block #18,442,201</div>
          </div>
        </div>

        {/* ═══════════════ HOW IT WORKS ═══════════════ */}
        {/* Seamless fade-in transition from hero */}
        <div style={{ position: 'relative', height: '120px', marginBottom: '-2px', background: 'linear-gradient(to bottom, #060c04, transparent)', zIndex: 2, pointerEvents: 'none' }} />

        <section
          style={{
            position: 'relative',
            overflow: 'hidden',
            marginTop: '-120px',
          }}
        >
          {/* Background image layer */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${howItWorksBg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center 30%',
              filter: 'brightness(0.45) saturate(0.7)',
            }}
          />

          {/* Top fade — blends into hero's dark bottom */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '220px',
            background: 'linear-gradient(to bottom, #060c04 0%, rgba(4,9,2,0.0) 100%)',
            zIndex: 1,
          }} />

          {/* Overall dark overlay for readability */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(4,9,2,0.62)',
            zIndex: 1,
          }} />

          {/* Deep fade toward footer — progressively darker */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: '520px',
            background: 'linear-gradient(to top, rgba(4,9,2,0.96) 0%, rgba(4,9,2,0.5) 50%, rgba(4,9,2,0.0) 100%)',
            zIndex: 1,
          }} />

          {/* Subtle green top glow line */}
          <div style={{
            position: 'absolute', top: '120px', left: '50%', transform: 'translateX(-50%)',
            width: '500px', height: '1px',
            background: 'linear-gradient(to right, transparent, rgba(74,222,128,0.35), transparent)',
            zIndex: 2,
          }} />

          {/* Section content */}
          <div style={{ position: 'relative', zIndex: 2, maxWidth: '1100px', margin: '0 auto', padding: '160px 24px 120px' }}>

            {/* Section header */}
            <div style={{ textAlign: 'center', marginBottom: '72px' }}>
              <p style={{
                fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase',
                color: '#4ade80', marginBottom: '12px', margin: '0 0 12px',
              }}>
                From Soil to Sale
              </p>
              <h2 style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 'clamp(52px, 8vw, 96px)',
                color: '#fff',
                letterSpacing: '2px',
                lineHeight: '0.9',
                margin: '0 0 18px',
              }}>
                HOW IT <span style={{ color: '#4ade80' }}>WORKS</span>
              </h2>
              <p style={{
                color: 'rgba(255,255,255,0.32)',
                fontSize: '13px',
                maxWidth: '400px',
                margin: '0 auto',
                lineHeight: '1.75',
                letterSpacing: '0.2px',
              }}>
                Four steps that take your harvest from the field to a verified, fraud-proof record on the blockchain.
              </p>
            </div>

            {/* Step cards grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
              gap: '18px',
            }}>
              {steps.map(({ step, title, tag, desc, img, accent, rgb }) => (
                <div
                  key={step}
                  className="step-card"
                  style={{
                    position: 'relative',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    border: `1px solid rgba(${rgb}, ${hoveredStep === step ? '0.35' : '0.14'})`,
                    background: 'rgba(6,12,4,0.60)',
                    backdropFilter: 'blur(18px)',
                    WebkitBackdropFilter: 'blur(18px)',
                    transition: 'transform 0.35s cubic-bezier(0.25,0.46,0.45,0.94), box-shadow 0.35s ease, border-color 0.35s ease',
                    transform: hoveredStep === step ? 'translateY(-7px)' : 'translateY(0)',
                    boxShadow: hoveredStep === step
                      ? `0 24px 56px rgba(${rgb},0.18), 0 0 0 1px rgba(${rgb},0.1)`
                      : '0 4px 24px rgba(0,0,0,0.4)',
                    cursor: 'default',
                  }}
                  onMouseEnter={() => setHoveredStep(step)}
                  onMouseLeave={() => setHoveredStep(null)}
                >
                  {/* Accent top bar */}
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0,
                    height: '2px',
                    background: `linear-gradient(to right, ${accent}, rgba(${rgb},0.2), transparent)`,
                    opacity: hoveredStep === step ? 0.9 : 0.5,
                    transition: 'opacity 0.35s ease',
                    zIndex: 2,
                  }} />

                  {/* Card image */}
                  <div style={{ position: 'relative', height: '195px', overflow: 'hidden' }}>
                    <img
                      className="step-card-img"
                      src={img}
                      alt={title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                    {/* Image bottom fade */}
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: `linear-gradient(to bottom, rgba(6,12,4,0.05) 0%, rgba(6,12,4,0.72) 100%)`,
                    }} />
                    {/* Step number */}
                    <div style={{
                      position: 'absolute', top: '14px', left: '16px',
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: '48px',
                      color: accent,
                      lineHeight: 1,
                      textShadow: `0 2px 20px rgba(${rgb},0.6)`,
                      opacity: hoveredStep === step ? 1 : 0.85,
                      transition: 'opacity 0.3s ease',
                    }}>
                      {step}
                    </div>
                  </div>

                  {/* Card body */}
                  <div style={{ padding: '18px 20px 22px' }}>
                    <div style={{
                      fontSize: '8px',
                      letterSpacing: '2px',
                      textTransform: 'uppercase',
                      color: accent,
                      opacity: 0.7,
                      marginBottom: '7px',
                    }}>
                      {tag}
                    </div>
                    <div style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: '30px',
                      color: '#fff',
                      letterSpacing: '1px',
                      lineHeight: 1,
                      marginBottom: '10px',
                    }}>
                      {title}
                    </div>
                    <p style={{
                      color: 'rgba(255,255,255,0.35)',
                      fontSize: '11px',
                      lineHeight: '1.7',
                      margin: 0,
                    }}>
                      {desc}
                    </p>
                  </div>

                  {/* Bottom-right glow dot */}
                  <div style={{
                    position: 'absolute', bottom: '18px', right: '18px',
                    width: '7px', height: '7px', borderRadius: '50%',
                    background: accent,
                    opacity: hoveredStep === step ? 0.8 : 0.35,
                    boxShadow: `0 0 12px rgba(${rgb},0.7)`,
                    transition: 'opacity 0.3s ease',
                  }} />
                </div>
              ))}
            </div>

            {/* Step connector timeline */}
            <div style={{
              marginTop: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {steps.map(({ step, accent, rgb }, i) => (
                <div key={step} style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    border: `1px solid rgba(${rgb},0.4)`,
                    background: `rgba(${rgb},0.07)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: '12px',
                    color: accent,
                    letterSpacing: '0.5px',
                    transition: 'all 0.3s ease',
                  }}>
                    {step}
                  </div>
                  {i < steps.length - 1 && (
                    <div style={{
                      width: 'clamp(32px, 6vw, 90px)',
                      height: '1px',
                      background: 'linear-gradient(to right, rgba(74,222,128,0.3), rgba(74,222,128,0.06))',
                    }} />
                  )}
                </div>
              ))}
            </div>

          </div>

          {/* ═══════════════ FOOTER (shares background image) ═══════════════ */}
          <footer style={{ position: 'relative', borderTop: '1px solid rgba(255,255,255,0.06)', zIndex: 2 }}>

          {/* Green glow line at top */}
          <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '500px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(74,222,128,0.4), transparent)' }} />

          <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '64px 24px 40px' }}>

            {/* Main footer grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '40px', marginBottom: '48px' }}>

              {/* Brand column */}
              <div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '32px', letterSpacing: '3px', lineHeight: '1', marginBottom: '10px' }}>
                  <span style={{ color: '#4ade80' }}>AGRI</span>
                  <span style={{ color: '#fff' }}>CHAIN</span>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: '11px', lineHeight: '1.7', maxWidth: '200px', margin: 0 }}>
                  Securing Africa's agricultural supply chain, one block at a time.
                </p>
              </div>

              {/* Navigate */}
              <div>
                <p style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)', marginBottom: '14px' }}>Navigate</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {['Home', 'How it works', 'Verify produce', 'About'].map(link => (
                    <a key={link} href="#" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '12px', transition: 'color 0.2s' }}
                      onMouseEnter={e => e.target.style.color = '#4ade80'}
                      onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.4)'}
                    >{link}</a>
                  ))}
                </div>
              </div>

              {/* Built with */}
              <div>
                <p style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)', marginBottom: '14px' }}>Built with</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { name: 'Polygon Blockchain', color: '#8b5cf6' },
                    { name: 'Solidity Contracts', color: '#4ade80' },
                    { name: 'React + Vite',       color: '#60a5fa' },
                    { name: 'SHA-256 Security',   color: '#facc15' },
                  ].map(({ name, color }) => (
                    <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: color, flexShrink: 0 }} />
                      <span style={{ color: 'rgba(255,255,255,0.32)', fontSize: '11px' }}>{name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <p style={{ fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)', marginBottom: '2px' }}>Get started</p>
                <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: '11px', lineHeight: '1.6', margin: 0 }}>
                  Connect your MetaMask wallet and choose your role.
                </p>
                <button
                  onClick={connectWallet}
                  style={{ background: 'transparent', border: '1px solid rgba(74,222,128,0.45)', color: '#4ade80', fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', alignSelf: 'flex-start', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(74,222,128,0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {account ? `${account.slice(0,6)}...${account.slice(-4)}` : '⬤ Get started'}
                </button>
              </div>
            </div>

            {/* Bottom bar */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <span style={{ color: 'rgba(255,255,255,0.18)', fontSize: '10px', letterSpacing: '0.5px' }}>
                © 2025 AgriChain · Powered by Polygon · Built for transparency
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', animation: 'pulse-dot 2s infinite' }} />
                <span style={{ color: 'rgba(74,222,128,0.6)', fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Network live</span>
              </div>
            </div>
          </div>
          </footer>
        </section>

      </div>
    </>
  )
}