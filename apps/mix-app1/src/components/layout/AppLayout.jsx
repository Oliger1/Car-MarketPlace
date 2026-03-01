import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const NAV = [
  {
    group: 'Kryesore',
    items: [
      { to:'/dashboard',        label:'Dashboard',    icon:'grid' },
      { to:'/timeline',         label:'Timeline',     icon:'timeline' },
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
    timeline:  <><rect x="3" y="4" width="3" height="16" rx="1.5"/><rect x="10" y="4" width="3" height="10" rx="1.5"/><rect x="17" y="4" width="3" height="13" rx="1.5"/></>,
    menu:     <><path d="M3 12h18M3 6h18M3 18h18"/></>,
    chevron:  <><path d="m9 18 6-6-6-6"/></>,
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  )
}

function NavLink({ item, collapsed }) {
  const { pathname } = useLocation()
  const active = pathname === item.to || pathname.startsWith(item.to + '/')

  return (
    <Link to={item.to} title={collapsed ? item.label : undefined}
      style={{
        display:'flex', alignItems:'center', gap:9,
        padding: collapsed ? '9px 12px' : '9px 13px',
        borderRadius:'var(--r)',
        color: active ? 'var(--accent)' : 'var(--text-2)',
        background: active ? 'var(--accent-bg)' : 'transparent',
        border: `1px solid ${active ? 'var(--accent-border)' : 'transparent'}`,
        fontSize:'.875rem', fontWeight: active ? 600 : 400,
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
  const w = collapsed ? 64 : 248

  const doLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width:w, flexShrink:0,
        background:'var(--bg-2)', borderRight:'1px solid var(--border)',
        display:'flex', flexDirection:'column',
        position:'sticky', top:0, height:'100vh',
        transition:'width .2s ease', overflow:'hidden',
      }}>
        {/* Logo */}
        <div style={{
          padding: collapsed ? '18px 12px' : '18px 18px',
          borderBottom:'1px solid var(--border)',
          display:'flex', alignItems:'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          gap:10,
        }}>
          {!collapsed && (
            <Link to="/dashboard" style={{ fontFamily:'var(--f-display)', fontSize:'1.5rem', fontWeight:800, color:'var(--text-1)', letterSpacing:'-.02em' }}>
              Mix<span style={{ color:'var(--accent)' }}>.</span>
            </Link>
          )}
          <button onClick={() => setCollapsed(v => !v)} style={{
            background:'none', border:'none', color:'var(--text-3)',
            cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
            padding:4, borderRadius:'var(--r-sm)', transition:'color var(--t)', flexShrink:0,
          }}
            onMouseEnter={e => e.currentTarget.style.color='var(--text-1)'}
            onMouseLeave={e => e.currentTarget.style.color='var(--text-3)'}
          >
            <Icon name="menu" />
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:'14px 8px', overflowY:'auto', display:'flex', flexDirection:'column', gap:20 }}>
          {NAV.map(g => (
            <div key={g.group}>
              {!collapsed && (
                <div style={{ fontSize:'.65rem', fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:'var(--text-3)', padding:'0 7px', marginBottom:5 }}>
                  {g.group}
                </div>
              )}
              <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
                {g.items.map(item => <NavLink key={item.to} item={item} collapsed={collapsed} />)}
              </div>
            </div>
          ))}
        </nav>

        {/* User */}
        <div style={{
          padding: collapsed ? '14px 12px' : '14px 13px',
          borderTop:'1px solid var(--border)',
          display:'flex', alignItems:'center',
          justifyContent: collapsed ? 'center' : 'space-between', gap:8,
        }}>
          {!collapsed && (
            <div style={{ minWidth:0, flex:1 }}>
              <div className="truncate" style={{ fontSize:'.8rem', fontWeight:600 }}>{user?.email}</div>
              <div style={{ fontSize:'.7rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.05em', marginTop:1 }}>{user?.role}</div>
            </div>
          )}
          <button onClick={doLogout} title="Dil"
            style={{
              flexShrink:0, background:'none', border:'1px solid var(--border)',
              borderRadius:'var(--r-sm)', color:'var(--text-3)',
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
      </aside>

      {/* Main */}
      <main style={{ flex:1, minWidth:0, padding:'32px 36px', overflowY:'auto' }} className="fade-up">
        {children}
      </main>
    </div>
  )
}
