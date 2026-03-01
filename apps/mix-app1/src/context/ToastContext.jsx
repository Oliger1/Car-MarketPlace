import { createContext, useContext, useState, useCallback } from 'react'

const Ctx = createContext(null)

const COLORS = {
  success: { bg: 'var(--green-bg)',  border: 'rgba(34,197,94,.3)',  color: 'var(--green)',  icon: '✓' },
  error:   { bg: 'var(--red-bg)',    border: 'rgba(239,68,68,.3)',  color: 'var(--red)',    icon: '✕' },
  warning: { bg: 'var(--yellow-bg)', border: 'rgba(234,179,8,.3)',  color: 'var(--yellow)', icon: '!' },
  info:    { bg: 'var(--blue-bg)',   border: 'rgba(59,130,246,.3)', color: 'var(--blue)',   icon: 'i' },
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback((msg, type = 'success', ms = 3500) => {
    const id = Date.now() + Math.random()
    setToasts(p => [...p, { id, msg, type }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), ms)
  }, [])

  return (
    <Ctx.Provider value={toast}>
      {children}
      <div style={{ position:'fixed', bottom:24, right:24, zIndex:9999, display:'flex', flexDirection:'column', gap:8, maxWidth:360 }}>
        {toasts.map(t => {
          const c = COLORS[t.type] || COLORS.success
          return (
            <div key={t.id} style={{
              display:'flex', alignItems:'center', gap:12,
              background:'var(--bg-3)', border:`1px solid ${c.border}`,
              borderRadius:'var(--r)', padding:'12px 16px',
              boxShadow:'var(--shadow)', animation:'fadeUp .2s ease both',
            }}>
              <span style={{ width:26, height:26, borderRadius:'50%', background:c.bg, color:c.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.75rem', fontWeight:700, flexShrink:0 }}>
                {c.icon}
              </span>
              <span style={{ fontSize:'.875rem', flex:1 }}>{t.msg}</span>
              <button onClick={() => setToasts(p => p.filter(x => x.id !== t.id))}
                style={{ background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', lineHeight:1, fontSize:'1rem' }}>✕</button>
            </div>
          )
        })}
      </div>
    </Ctx.Provider>
  )
}

export const useToast = () => useContext(Ctx)
