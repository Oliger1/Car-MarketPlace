import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const NAV = [
  {
    group: 'Kryesore',
    items: [
      { to:'/dashboard',        label:'Dashboard',    icon:'grid' },
      { to:'/bookings',         label:'Rezervimet',   icon:'calendar' },
      { to:'/booking-requests', label:'Kërkesat',     icon:'inbox' },
    ]
  },
  {
    group: 'Flota',
    items: [
      { to:'/cars',      label:'Makinat',  icon:'car' },
      { to:'/customers', label:'Klientët', icon:'users' },
    ]
  },
  {
    group: 'Kompania',
    items: [
      { to:'/company', label:'Profili',  icon:'building' },
      { to:'/billing', label:'Abonimi',  icon:'credit' },
    ]
  },
]

function Icon({ name, size=17 }) {
  const icons = {
    grid:     <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></>,
    inbox:    <><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></>,
    car:      <><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></>,
    users:    <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
    building: <><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4M10 10h4M10 14h4M10 18h4"/></>,
    credit:   <><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></>,
    logout:   <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></>,
    menu:     <><path d="M3 12h18M3 6h18M3 18h18"/></>,
    close:    <><path d="M18 6 6 18M6 6l12 12"/></>,
    store:    <><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>,
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  )
}

function NavLink({ item, collapsed, onNavigate }) {
  const { pathname } = useLocation()
  const active = pathname === item.to || pathname.startsWith(item.to + '/')

  return (
    <Link to={item.to} title={collapsed ? item.label : undefined} onClick={onNavigate}
      style={{
        display:'flex', alignItems:'center', gap:10,
        padding: collapsed ? '10px 12px' : '10px 13px',
        borderRadius:12,
        color: active ? 'var(--accent-2)' : 'var(--text-2)',
        background: active ? 'var(--accent-bg)' : 'transparent',
        border: `1px solid ${active ? 'var(--accent-border)' : 'transparent'}`,
        fontSize:'.875rem', fontWeight: active ? 600 : 450,
        textDecoration:'none', transition:'all var(--t)',
        justifyContent: collapsed ? 'center' : 'flex-start',
        whiteSpace:'nowrap',
      }}
      onMouseEnter={e => { if(!active) { e.currentTarget.style.background='var(--bg-4)'; e.currentTarget.style.color='var(--text-1)' }}}
      onMouseLeave={e => { if(!active) { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--text-2)' }}}
    >
      <Icon name={item.icon} />
      {!collapsed && item.label}
    </Link>
  )
}

export default function AppLayout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const doLogout = async () => {
    await logout()
    navigate('/login')
  }

  const closeMobile = () => setMobileOpen(false)

  return (
    <div className="app-shell">
      {mobileOpen && <div className="sidebar-backdrop" onClick={closeMobile} />}

      <aside className={`sidebar ${mobileOpen ? 'is-open' : ''}`} style={{ width: collapsed && !mobileOpen ? 68 : undefined }}>
        <div style={{
          padding: collapsed && !mobileOpen ? '20px 12px' : '20px 18px',
          borderBottom:'1px solid var(--border)',
          display:'flex', alignItems:'center',
          justifyContent: collapsed && !mobileOpen ? 'center' : 'space-between',
          gap:10,
        }}>
          {(!collapsed || mobileOpen) && (
            <Link to="/dashboard" onClick={closeMobile} style={{ display:'flex', alignItems:'center', gap:10, color:'var(--text-1)', textDecoration:'none' }}>
              <span className="logo-mark">M</span>
              <span style={{ fontFamily:'var(--f-display)', fontSize:'1.35rem', fontWeight:800, letterSpacing:'-.03em' }}>
                Mix<span style={{ color:'var(--accent)' }}>.</span>
              </span>
            </Link>
          )}
          <button onClick={() => mobileOpen ? setMobileOpen(false) : setCollapsed(v => !v)} style={{
            background:'none', border:'1px solid var(--border)', color:'var(--text-3)',
            cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
            padding:6, borderRadius:10, transition:'all var(--t)', flexShrink:0,
          }}
            onMouseEnter={e => e.currentTarget.style.color='var(--text-1)'}
            onMouseLeave={e => e.currentTarget.style.color='var(--text-3)'}
          >
            <Icon name={mobileOpen ? 'close' : 'menu'} />
          </button>
        </div>

        <nav style={{ flex:1, padding:'16px 10px', overflowY:'auto', display:'flex', flexDirection:'column', gap:22 }}>
          {NAV.map(g => (
            <div key={g.group}>
              {(!collapsed || mobileOpen) && (
                <div style={{ fontSize:'.65rem', fontWeight:700, letterSpacing:'.12em', textTransform:'uppercase', color:'var(--text-3)', padding:'0 8px', marginBottom:7 }}>
                  {g.group}
                </div>
              )}
              <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
                {g.items.map(item => <NavLink key={item.to} item={item} collapsed={collapsed && !mobileOpen} onNavigate={closeMobile} />)}
              </div>
            </div>
          ))}
        </nav>

        <div style={{ padding: collapsed && !mobileOpen ? '12px' : '12px 12px 16px', borderTop:'1px solid var(--border)' }}>
          {(!collapsed || mobileOpen) && (
            <Link to="/" onClick={closeMobile} style={{
              display:'flex', alignItems:'center', gap:8, marginBottom:12,
              padding:'9px 12px', borderRadius:12, border:'1px solid var(--border)',
              color:'var(--text-2)', fontSize:'.8rem', textDecoration:'none',
            }}>
              <Icon name="store" size={15} /> Marketplace
            </Link>
          )}
          <div style={{
            display:'flex', alignItems:'center',
            justifyContent: collapsed && !mobileOpen ? 'center' : 'space-between', gap:8,
          }}>
            {(!collapsed || mobileOpen) && (
              <div style={{ minWidth:0, flex:1 }}>
                <div className="truncate" style={{ fontSize:'.8rem', fontWeight:600 }}>{user?.email}</div>
                <div style={{ fontSize:'.68rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.06em', marginTop:2 }}>{user?.role}</div>
              </div>
            )}
            <button onClick={doLogout} title="Dil"
              style={{
                flexShrink:0, background:'none', border:'1px solid var(--border)',
                borderRadius:10, color:'var(--text-3)',
                cursor:'pointer', padding:'7px 8px',
                display:'flex', alignItems:'center', justifyContent:'center',
                transition:'all var(--t)',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='var(--red)'; e.currentTarget.style.color='var(--red)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-3)' }}
            >
              <Icon name="logout" size={15} />
            </button>
          </div>
        </div>
      </aside>

      <div style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column' }}>
        <div className="mobile-bar">
          <button onClick={() => setMobileOpen(true)} style={{ background:'none', border:'1px solid var(--border)', borderRadius:10, color:'var(--text-1)', padding:7, display:'flex' }}>
            <Icon name="menu" />
          </button>
          <Link to="/dashboard" style={{ display:'flex', alignItems:'center', gap:8, color:'var(--text-1)', textDecoration:'none', fontFamily:'var(--f-display)', fontWeight:800 }}>
            <span className="logo-mark" style={{ width:28, height:28, fontSize:'.9rem', borderRadius:9 }}>M</span>
            Mix.
          </Link>
          <div style={{ width:34 }} />
        </div>
        <main className="app-main fade-up">
          {children}
        </main>
      </div>
    </div>
  )
}
