import { useState, useEffect, useRef } from 'react'

// ─── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner({ size = 20, color = 'var(--accent)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      style={{ animation: 'spin .75s linear infinite', display: 'block', flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" stroke={color} strokeOpacity=".2" strokeWidth="2.5" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

// ─── Button ───────────────────────────────────────────────────────────────────
const BV = {
  primary:   { bg: 'var(--accent)',     color: '#0c0e14',         border: 'transparent' },
  secondary: { bg: 'var(--bg-3)',       color: 'var(--text-1)',   border: 'var(--border-2)' },
  ghost:     { bg: 'transparent',      color: 'var(--text-2)',   border: 'transparent' },
  danger:    { bg: 'var(--red-bg)',     color: 'var(--red)',      border: 'rgba(239,68,68,.2)' },
  success:   { bg: 'var(--green-bg)',   color: 'var(--green)',    border: 'rgba(34,197,94,.2)' },
  warning:   { bg: 'var(--yellow-bg)', color: 'var(--yellow)',   border: 'rgba(234,179,8,.2)' },
}
const BS = {
  xs: { h: 28, px: 10, fs: '.78rem' },
  sm: { h: 34, px: 14, fs: '.825rem' },
  md: { h: 40, px: 18, fs: '.9rem' },
  lg: { h: 48, px: 24, fs: '1rem' },
}

export function Button({ children, variant = 'primary', size = 'md', loading, disabled, icon, onClick, type = 'button', form, style }) {
  const v = BV[variant] || BV.primary
  const s = BS[size] || BS.md
  const off = disabled || loading
  const [hover, setHover] = useState(false)

  return (
    <button
      type={type} form={form}
      disabled={off}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
        height: s.h, padding: `0 ${s.px}px`, fontSize: s.fs, fontWeight: 600,
        background: v.bg, color: v.color,
        border: `1px solid ${v.border}`, borderRadius: 'var(--r)',
        cursor: off ? 'not-allowed' : 'pointer',
        opacity: off ? .55 : 1,
        transition: 'all var(--t)',
        transform: hover && !off ? 'translateY(-1px)' : 'none',
        boxShadow: hover && !off && variant === 'primary' ? '0 8px 24px rgba(240,180,41,.28)' : 'none',
        whiteSpace: 'nowrap', letterSpacing: '.01em',
        fontFamily: 'var(--f-body)',
        ...style,
      }}
    >
      {loading ? <Spinner size={14} color={variant === 'primary' ? '#0c0e14' : 'currentColor'} /> : icon}
      {children}
    </button>
  )
}

// ─── Input ────────────────────────────────────────────────────────────────────
export function Input({ label, error, hint, prefix, suffix, containerStyle, ...rest }) {
  const [focused, setFocused] = useState(false)
  const hasWrap = prefix || suffix

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, ...containerStyle }}>
      {label && (
        <label style={{ fontSize: '.78rem', fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase', color: focused ? 'var(--accent)' : 'var(--text-2)', transition: 'color var(--t)' }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {prefix && <span style={{ position:'absolute', left:12, color:'var(--text-3)', fontSize:'.9rem', pointerEvents:'none', display:'flex', alignItems:'center' }}>{prefix}</span>}
        <input
          {...rest}
          onFocus={(e) => { setFocused(true); rest.onFocus?.(e) }}
          onBlur={(e)  => { setFocused(false); rest.onBlur?.(e) }}
          style={{
            width: '100%', height: 40,
            background: 'var(--bg-3)',
            border: `1.5px solid ${error ? 'var(--red)' : focused ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: 'var(--r)',
            padding: `0 ${suffix ? '36px' : '13px'} 0 ${prefix ? '36px' : '13px'}`,
            color: 'var(--text-1)', fontSize: '.9rem', outline: 'none',
            transition: 'all var(--t)',
            boxShadow: focused ? (error ? '0 0 0 3px rgba(239,68,68,.15)' : '0 0 0 3px var(--accent-bg)') : 'none',
            fontFamily: 'var(--f-body)',
            ...rest.style,
          }}
        />
        {suffix && <span style={{ position:'absolute', right:12, color:'var(--text-3)', fontSize:'.85rem', pointerEvents:'none' }}>{suffix}</span>}
      </div>
      {error && <span style={{ fontSize:'.775rem', color:'var(--red)' }}>{error}</span>}
      {hint && !error && <span style={{ fontSize:'.775rem', color:'var(--text-3)' }}>{hint}</span>}
    </div>
  )
}

// ─── Select ───────────────────────────────────────────────────────────────────
export function Select({ label, error, options = [], containerStyle, ...rest }) {
  const [focused, setFocused] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, ...containerStyle }}>
      {label && (
        <label style={{ fontSize: '.78rem', fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase', color: focused ? 'var(--accent)' : 'var(--text-2)', transition: 'color var(--t)' }}>
          {label}
        </label>
      )}
      <select
        {...rest}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%', height: 40,
          background: 'var(--bg-3)',
          border: `1.5px solid ${error ? 'var(--red)' : focused ? 'var(--accent)' : 'var(--border)'}`,
          borderRadius: 'var(--r)',
          padding: '0 13px',
          color: rest.value ? 'var(--text-1)' : 'var(--text-3)',
          fontSize: '.9rem', outline: 'none',
          cursor: 'pointer',
          transition: 'all var(--t)',
          boxShadow: focused ? '0 0 0 3px var(--accent-bg)' : 'none',
          fontFamily: 'var(--f-body)',
          ...rest.style,
        }}
      >
        {options.map(o => (
          <option key={o.value} value={o.value} style={{ background: 'var(--bg-3)', color: 'var(--text-1)' }}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <span style={{ fontSize:'.775rem', color:'var(--red)' }}>{error}</span>}
    </div>
  )
}

// ─── Textarea ──────────────────────────────────────────────────────────────────
export function Textarea({ label, error, containerStyle, ...rest }) {
  const [focused, setFocused] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, ...containerStyle }}>
      {label && (
        <label style={{ fontSize: '.78rem', fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase', color: focused ? 'var(--accent)' : 'var(--text-2)', transition: 'color var(--t)' }}>
          {label}
        </label>
      )}
      <textarea
        {...rest}
        onFocus={(e) => { setFocused(true); rest.onFocus?.(e) }}
        onBlur={(e)  => { setFocused(false); rest.onBlur?.(e) }}
        style={{
          width: '100%', minHeight: 90,
          background: 'var(--bg-3)',
          border: `1.5px solid ${error ? 'var(--red)' : focused ? 'var(--accent)' : 'var(--border)'}`,
          borderRadius: 'var(--r)', padding: '10px 13px',
          color: 'var(--text-1)', fontSize: '.9rem', outline: 'none', resize: 'vertical',
          transition: 'all var(--t)',
          boxShadow: focused ? '0 0 0 3px var(--accent-bg)' : 'none',
          fontFamily: 'var(--f-body)',
          ...rest.style,
        }}
      />
      {error && <span style={{ fontSize:'.775rem', color:'var(--red)' }}>{error}</span>}
    </div>
  )
}

// ─── Badge ────────────────────────────────────────────────────────────────────
const BADGE_COLORS = {
  active:      { bg:'var(--green-bg)',  color:'var(--green)',  border:'rgba(34,197,94,.25)' },
  confirmed:   { bg:'var(--green-bg)',  color:'var(--green)',  border:'rgba(34,197,94,.25)' },
  completed:   { bg:'var(--blue-bg)',   color:'var(--blue)',   border:'rgba(59,130,246,.25)' },
  requested:   { bg:'var(--yellow-bg)', color:'var(--yellow)', border:'rgba(234,179,8,.25)' },
  new:         { bg:'var(--blue-bg)',   color:'var(--blue)',   border:'rgba(59,130,246,.25)' },
  contacted:   { bg:'var(--yellow-bg)', color:'var(--yellow)', border:'rgba(234,179,8,.25)' },
  converted:   { bg:'var(--green-bg)',  color:'var(--green)',  border:'rgba(34,197,94,.25)' },
  cancelled:   { bg:'var(--red-bg)',    color:'var(--red)',    border:'rgba(239,68,68,.25)' },
  spam:        { bg:'var(--bg-4)',      color:'var(--text-3)', border:'var(--border)' },
  inactive:    { bg:'var(--bg-4)',      color:'var(--text-3)', border:'var(--border)' },
  maintenance: { bg:'var(--yellow-bg)', color:'var(--yellow)', border:'rgba(234,179,8,.25)' },
  trial:       { bg:'var(--purple-bg)', color:'var(--purple)', border:'rgba(168,85,247,.25)' },
  expired:     { bg:'var(--red-bg)',    color:'var(--red)',    border:'rgba(239,68,68,.25)' },
}

export function Badge({ status = '', label, style }) {
  const c = BADGE_COLORS[status?.toLowerCase()] || { bg:'var(--bg-4)', color:'var(--text-2)', border:'var(--border)' }
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:5,
      padding:'3px 10px', borderRadius:99,
      fontSize:'.73rem', fontWeight:700, letterSpacing:'.04em',
      background:c.bg, color:c.color, border:`1px solid ${c.border}`,
      ...style,
    }}>
      <span style={{ width:5, height:5, borderRadius:'50%', background:'currentColor', flexShrink:0 }} />
      {label || status}
    </span>
  )
}

// ─── Card ──────────────────────────────────────────────────────────────────────
export function Card({ children, padding = 24, style }) {
  return (
    <div style={{
      background: 'linear-gradient(180deg, rgba(255,255,255,0.028), transparent 42%), var(--bg-2)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--r-lg)', padding,
      boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset',
      ...style,
    }}>
      {children}
    </div>
  )
}

// ─── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, footer, width = 500 }) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div
      style={{
        position:'fixed', inset:0, zIndex:1000,
        background:'rgba(0,0,0,.75)', backdropFilter:'blur(4px)',
        display:'flex', alignItems:'center', justifyContent:'center',
        padding:20, animation:'fadeIn .15s ease',
      }}
      onClick={e => e.target === e.currentTarget && onClose?.()}
    >
      <div style={{
        background:'var(--bg-3)', border:'1px solid var(--border-2)',
        borderRadius:'var(--r-xl)', width:'100%', maxWidth:width,
        maxHeight:'90vh', overflow:'auto',
        boxShadow:'var(--shadow-lg)', animation:'fadeUp .2s ease',
      }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 24px', borderBottom:'1px solid var(--border)' }}>
          <h3 style={{ fontSize:'1.05rem' }}>{title}</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', lineHeight:1, padding:4, borderRadius:'var(--r-sm)', transition:'color var(--t)' }}
            onMouseEnter={e => e.currentTarget.style.color='var(--text-1)'}
            onMouseLeave={e => e.currentTarget.style.color='var(--text-3)'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div style={{ padding:'22px 24px' }}>{children}</div>
        {footer && (
          <div style={{ padding:'16px 24px', borderTop:'1px solid var(--border)', display:'flex', justifyContent:'flex-end', gap:10 }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Confirm ───────────────────────────────────────────────────────────────────
export function Confirm({ open, onClose, onConfirm, title, message, loading }) {
  return (
    <Modal open={open} onClose={onClose} title={title || 'Konfirmo'} width={400}
      footer={<>
        <Button variant="secondary" onClick={onClose}>Anulo</Button>
        <Button variant="danger" loading={loading} onClick={onConfirm}>Konfirmo</Button>
      </>}
    >
      <p style={{ color:'var(--text-2)', lineHeight:1.7 }}>{message}</p>
    </Modal>
  )
}

// ─── Table ─────────────────────────────────────────────────────────────────────
export function Table({ cols, rows, loading, onRow }) {
  if (loading) return (
    <div style={{ padding:'16px 20px', display:'flex', flexDirection:'column', gap:8 }}>
      {[...Array(5)].map((_,i) => <div key={i} className="skeleton" style={{ height:48 }} />)}
    </div>
  )

  return (
    <div style={{ overflowX:'auto' }}>
      <table style={{ width:'100%', borderCollapse:'collapse' }}>
        <thead>
          <tr>
            {cols.map(c => (
              <th key={c.key} style={{
                padding:'10px 18px', textAlign:'left',
                fontSize:'.72rem', fontWeight:700, letterSpacing:'.06em', textTransform:'uppercase',
                color:'var(--text-3)', borderBottom:'1px solid var(--border)',
                fontFamily:'var(--f-body)', width:c.width,
              }}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id || i}
              onClick={() => onRow?.(row)}
              style={{ cursor: onRow ? 'pointer' : 'default', borderBottom:'1px solid var(--border)', transition:'background var(--t)' }}
              onMouseEnter={e => { if (onRow) e.currentTarget.style.background='var(--bg-3)' }}
              onMouseLeave={e => { e.currentTarget.style.background='transparent' }}
            >
              {cols.map(c => (
                <td key={c.key} style={{ padding:'13px 18px', fontSize:'.875rem', color:'var(--text-1)' }}>
                  {c.render ? c.render(row[c.key], row) : (row[c.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Pagination ────────────────────────────────────────────────────────────────
export function Pagination({ page, total, limit, onChange }) {
  const pages = Math.ceil((total || 0) / (limit || 20))
  if (pages <= 1) return null

  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, justifyContent:'center', marginTop:20 }}>
      <Button variant="secondary" size="sm" disabled={page<=1} onClick={() => onChange(page-1)}
        icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>}>
        Mbrapa
      </Button>
      <span style={{ fontSize:'.85rem', color:'var(--text-2)', padding:'0 8px' }}>{page} / {pages}</span>
      <Button variant="secondary" size="sm" disabled={page>=pages} onClick={() => onChange(page+1)}>
        Para
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg>
      </Button>
    </div>
  )
}

// ─── Empty ─────────────────────────────────────────────────────────────────────
export function Empty({ icon, title, desc, action }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'60px 24px', gap:16, textAlign:'center' }}>
      <div style={{ width:56, height:56, borderRadius:'50%', background:'var(--accent-bg)', border:'1px solid var(--accent-border)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--accent)' }}>
        {icon}
      </div>
      <div>
        <h3 style={{ fontSize:'1rem', marginBottom:4 }}>{title}</h3>
        {desc && <p style={{ color:'var(--text-3)', fontSize:'.85rem' }}>{desc}</p>}
      </div>
      {action}
    </div>
  )
}

// ─── PageHeader ─────────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, actions }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:28, gap:16, flexWrap:'wrap' }}>
      <div>
        <h1 style={{ fontSize:'1.7rem', marginBottom:6 }}>{title}</h1>
        {subtitle && <p style={{ color:'var(--text-2)', fontSize:'.9rem', maxWidth:520 }}>{subtitle}</p>}
      </div>
      {actions && <div style={{ display:'flex', gap:10, flexShrink:0 }}>{actions}</div>}
    </div>
  )
}

// ─── Stat Card ─────────────────────────────────────────────────────────────────
export function StatCard({ label, value, icon, color = 'var(--accent)', trend }) {
  return (
    <Card>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <span style={{ fontSize:'.72rem', color:'var(--text-3)', fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase' }}>{label}</span>
        <div style={{ width:38, height:38, borderRadius:12, background:`${color}18`, border:`1px solid ${color}30`, display:'flex', alignItems:'center', justifyContent:'center', color }}>{icon}</div>
      </div>
      <div style={{ fontSize:'2.05rem', fontFamily:'var(--f-display)', fontWeight:800, lineHeight:1, letterSpacing:'-0.03em' }}>{value ?? '—'}</div>
      {trend && <div style={{ fontSize:'.78rem', color:'var(--text-3)', marginTop:8 }}>{trend}</div>}
    </Card>
  )
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
export function Avatar({ name = '', src, size = 36 }) {
  const init = name.split(' ').slice(0,2).map(w => w[0] || '').join('').toUpperCase() || '?'
  if (src) return <img src={src} alt={name} style={{ width:size, height:size, borderRadius:'50%', objectFit:'cover', flexShrink:0 }} />
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', background:'var(--accent-bg)', border:'1px solid var(--accent-border)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--accent)', fontSize:size*.35, fontWeight:800, fontFamily:'var(--f-display)', flexShrink:0 }}>
      {init}
    </div>
  )
}

// ─── Search ───────────────────────────────────────────────────────────────────
export function Search({ value, onChange, placeholder = 'Kërko...' }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ position:'relative' }}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', color:'var(--text-3)', pointerEvents:'none' }}>
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
      <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          background:'var(--bg-3)', border:`1.5px solid ${focused ? 'var(--accent)' : 'var(--border)'}`,
          borderRadius:'var(--r)', padding:'0 13px 0 36px', height:38,
          color:'var(--text-1)', fontSize:'.875rem', outline:'none',
          transition:'all var(--t)', width:260,
          boxShadow: focused ? '0 0 0 3px var(--accent-bg)' : 'none',
          fontFamily:'var(--f-body)',
        }}
      />
    </div>
  )
}

// ─── Breadcrumb ──────────────────────────────────────────────────────────────
import { Link } from 'react-router-dom'
export function Breadcrumb({ items = [] }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:20, fontSize:'.83rem', color:'var(--text-3)' }}>
      {items.map((item, i) => (
        <span key={i} style={{ display:'flex', alignItems:'center', gap:6 }}>
          {i > 0 && <span style={{ opacity:.4 }}>›</span>}
          {item.to ? (
            <Link to={item.to} style={{ color:'var(--text-3)', transition:'color var(--t)' }}
              onMouseEnter={e => e.target.style.color='var(--accent)'}
              onMouseLeave={e => e.target.style.color='var(--text-3)'}
            >{item.label}</Link>
          ) : (
            <span style={{ color:'var(--text-2)' }}>{item.label}</span>
          )}
        </span>
      ))}
    </div>
  )
}

// ─── Error Alert ──────────────────────────────────────────────────────────────
export function ErrorAlert({ message }) {
  if (!message) return null
  return (
    <div style={{ background:'var(--red-bg)', border:'1px solid rgba(239,68,68,.3)', borderRadius:'var(--r)', padding:'11px 15px', color:'var(--red)', fontSize:'.875rem', marginBottom:16 }}>
      {message}
    </div>
  )
}
