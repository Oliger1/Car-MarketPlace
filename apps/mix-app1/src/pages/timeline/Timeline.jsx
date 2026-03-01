import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { bookingsAPI, carsAPI, fileUrl } from '../../api/client'
import { safeList } from '../../hooks/useApi'
import { PageHeader, Spinner, Badge, Button } from '../../components/ui/index'

const STATUS_COLORS = {
  confirmed:  { bg: 'rgba(34,197,94,.25)',  border: '#22c55e', text: '#22c55e' },
  active:     { bg: 'rgba(59,130,246,.25)', border: '#3b82f6', text: '#3b82f6' },
  requested:  { bg: 'rgba(234,179,8,.25)',  border: '#eab308', text: '#eab308' },
  completed:  { bg: 'rgba(99,102,241,.25)', border: '#6366f1', text: '#6366f1' },
}
const STATUS_L = { confirmed:'Konfirmuar', active:'Aktiv', requested:'Kërkuar', completed:'Kompletuar' }

const fmtDate  = d => new Date(d).toLocaleDateString('sq-AL', { day:'2-digit', month:'short' })
const fmtMoney = (v,c) => v ? `${parseFloat(v).toLocaleString()} ${c}` : null

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function addMonths(date, n) {
  const d = new Date(date)
  d.setMonth(d.getMonth() + n)
  return d
}

export default function Timeline() {
  const navigate = useNavigate()
  const [viewDate, setViewDate] = useState(new Date())
  const [cars, setCars]         = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading]   = useState(true)
  const [tooltip, setTooltip]   = useState(null)
  const tooltipRef = useRef(null)

  const year  = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const daysInMonth = getDaysInMonth(year, month)

  const dateFrom = `${year}-${String(month+1).padStart(2,'0')}-01`
  const dateTo   = `${year}-${String(month+1).padStart(2,'0')}-${daysInMonth}`

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [cRes, bRes] = await Promise.allSettled([
        carsAPI.list({ limit: 100 }),
        fetch(`/api/bookings/timeline?date_from=${dateFrom}&date_to=${dateTo}`, {
          credentials: 'include'
        }).then(r => r.json()),
      ])
      if (cRes.status === 'fulfilled') setCars(safeList(cRes.value?.data).items)
      if (bRes.status === 'fulfilled') setBookings(Array.isArray(bRes.value?.data) ? bRes.value.data : [])
    } catch {}
    finally { setLoading(false) }
  }, [dateFrom, dateTo])

  useEffect(() => { load() }, [load])

  // Calculate booking position within the month grid
  const getBookingSpan = (b) => {
    const start = new Date(Math.max(new Date(b.date_from), new Date(dateFrom)))
    const end   = new Date(Math.min(new Date(b.date_to),   new Date(dateTo)))
    const startDay = start.getDate()
    const endDay   = end.getDate()
    return { startDay, endDay, span: endDay - startDay + 1 }
  }

  const today = new Date()
  const isToday = (day) =>
    today.getFullYear() === year && today.getMonth() === month && today.getDate() === day

  const CELL = 36  // px per day cell
  const LEFT = 200 // sidebar width
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const monthName = viewDate.toLocaleDateString('sq-AL', { month: 'long', year: 'numeric' })

  return (
    <div className="fade-up">
      <PageHeader title="Timeline" subtitle="Shiko rezervimet sipas makinës dhe datës"
        actions={
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <Button variant="secondary" size="sm" onClick={() => setViewDate(d => addMonths(d,-1))}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
            </Button>
            <span style={{ fontSize:'.9rem', fontWeight:600, minWidth:160, textAlign:'center', textTransform:'capitalize' }}>{monthName}</span>
            <Button variant="secondary" size="sm" onClick={() => setViewDate(d => addMonths(d,1))}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg>
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setViewDate(new Date())}>Sot</Button>
          </div>
        }
      />

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:80 }}><Spinner size={36} /></div>
      ) : (
        <div style={{ background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', overflow:'hidden' }}>
          {/* Scrollable container */}
          <div style={{ overflowX:'auto' }}>
            <div style={{ minWidth: LEFT + CELL * daysInMonth }}>

              {/* Header — days */}
              <div style={{ display:'flex', borderBottom:'1px solid var(--border)', position:'sticky', top:0, background:'var(--bg-2)', zIndex:10 }}>
                <div style={{ width:LEFT, flexShrink:0, padding:'10px 16px', fontSize:'.72rem', fontWeight:700, letterSpacing:'.06em', textTransform:'uppercase', color:'var(--text-3)', borderRight:'1px solid var(--border)' }}>
                  Makina
                </div>
                {days.map(d => {
                  const dow = new Date(year, month, d).getDay()
                  const isWknd = dow === 0 || dow === 6
                  return (
                    <div key={d} style={{
                      width: CELL, flexShrink:0, textAlign:'center', padding:'8px 0',
                      fontSize:'.7rem', fontWeight: isToday(d) ? 800 : 500,
                      color: isToday(d) ? 'var(--accent)' : isWknd ? 'var(--text-2)' : 'var(--text-3)',
                      background: isToday(d) ? 'var(--accent-bg)' : 'transparent',
                      borderRight: '1px solid var(--border)',
                    }}>
                      <div>{d}</div>
                      <div style={{ fontSize:'.6rem', opacity:.6 }}>
                        {new Date(year,month,d).toLocaleDateString('sq-AL',{weekday:'short'}).slice(0,2)}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Rows — one per car */}
              {cars.length === 0 ? (
                <div style={{ padding:48, textAlign:'center', color:'var(--text-3)' }}>Asnjë makinë.</div>
              ) : cars.map((car, ci) => {
                const carBookings = bookings.filter(b => b.car_id === car.id)
                return (
                  <div key={car.id} style={{
                    display:'flex', borderBottom:`1px solid var(--border)`,
                    background: ci % 2 === 0 ? 'transparent' : 'rgba(255,255,255,.015)',
                    minHeight: 52,
                  }}>
                    {/* Car sidebar */}
                    <div style={{ width:LEFT, flexShrink:0, display:'flex', alignItems:'center', gap:10, padding:'8px 12px', borderRight:'1px solid var(--border)', cursor:'pointer' }}
                      onClick={() => navigate(`/cars/${car.id}`)}>
                      <div style={{ width:34, height:26, borderRadius:'var(--r-sm)', background:'var(--bg-3)', overflow:'hidden', flexShrink:0 }}>
                        {car.photos?.[0]
                          ? <img src={fileUrl(car.photos[0].path)} alt={car.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                          : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="1.5"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>
                            </div>
                        }
                      </div>
                      <div style={{ minWidth:0 }}>
                        <div className="truncate" style={{ fontSize:'.8rem', fontWeight:600, color:'var(--text-1)' }}>{car.title}</div>
                        <div style={{ fontSize:'.68rem', color:'var(--text-3)' }}>{car.price_per_day} {car.currency}/ditë</div>
                      </div>
                    </div>

                    {/* Days grid with bookings */}
                    <div style={{ flex:1, position:'relative', display:'flex' }}>
                      {/* Day columns */}
                      {days.map(d => {
                        const dow = new Date(year, month, d).getDay()
                        const isWknd = dow === 0 || dow === 6
                        return (
                          <div key={d} style={{ width:CELL, flexShrink:0, borderRight:'1px solid var(--border)', background: isToday(d) ? 'var(--accent-bg)' : isWknd ? 'rgba(255,255,255,.01)' : 'transparent', minHeight:52 }} />
                        )
                      })}

                      {/* Booking bars */}
                      {carBookings.map(b => {
                        const { startDay, endDay, span } = getBookingSpan(b)
                        if (span <= 0) return null
                        const c = STATUS_COLORS[b.status] || STATUS_COLORS.confirmed
                        return (
                          <div key={b.id}
                            onClick={() => navigate(`/bookings/${b.id}`)}
                            onMouseEnter={(e) => setTooltip({ booking:b, x:e.clientX, y:e.clientY })}
                            onMouseLeave={() => setTooltip(null)}
                            style={{
                              position:'absolute',
                              left: (startDay - 1) * CELL + 3,
                              width: span * CELL - 6,
                              top: 8, height: 36,
                              background: c.bg,
                              border: `1.5px solid ${c.border}`,
                              borderRadius: 'var(--r-sm)',
                              cursor: 'pointer',
                              display:'flex', alignItems:'center', padding:'0 8px',
                              overflow:'hidden', transition:'opacity var(--t)',
                              zIndex:2,
                            }}
                            onMouseOver={e => e.currentTarget.style.opacity='.85'}
                            onMouseOut={e => e.currentTarget.style.opacity='1'}
                          >
                            <span className="truncate" style={{ fontSize:'.68rem', fontWeight:700, color:c.text, whiteSpace:'nowrap' }}>
                              {b.customer_name || fmtDate(b.date_from)+' → '+fmtDate(b.date_to)}
                              {fmtMoney(b.price_total, b.currency) && ` · ${fmtMoney(b.price_total, b.currency)}`}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Legend */}
          <div style={{ padding:'12px 16px', borderTop:'1px solid var(--border)', display:'flex', gap:16, flexWrap:'wrap' }}>
            {Object.entries(STATUS_COLORS).map(([s, c]) => (
              <div key={s} style={{ display:'flex', alignItems:'center', gap:6, fontSize:'.75rem', color:'var(--text-3)' }}>
                <div style={{ width:12, height:12, borderRadius:3, background:c.bg, border:`1.5px solid ${c.border}` }} />
                {STATUS_L[s]}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tooltip */}
      {tooltip && (
        <div ref={tooltipRef} style={{
          position:'fixed', left:tooltip.x+14, top:tooltip.y-10,
          background:'var(--bg-3)', border:'1px solid var(--border-2)',
          borderRadius:'var(--r)', padding:'10px 14px',
          boxShadow:'var(--shadow-lg)', zIndex:9999, minWidth:180,
          animation:'fadeIn .1s ease', pointerEvents:'none',
        }}>
          <div style={{ fontWeight:700, fontSize:'.875rem', marginBottom:4 }}>{tooltip.booking.car_title}</div>
          <div style={{ fontSize:'.78rem', color:'var(--text-3)', marginBottom:2 }}>
            {fmtDate(tooltip.booking.date_from)} → {fmtDate(tooltip.booking.date_to)}
          </div>
          {tooltip.booking.customer_name && <div style={{ fontSize:'.78rem', color:'var(--text-2)' }}>👤 {tooltip.booking.customer_name}</div>}
          {tooltip.booking.price_total && <div style={{ fontSize:'.78rem', color:'var(--accent)', fontWeight:600, marginTop:4 }}>{fmtMoney(tooltip.booking.price_total, tooltip.booking.currency)}</div>}
          <div style={{ marginTop:6 }}><Badge status={tooltip.booking.status} label={STATUS_L[tooltip.booking.status]||tooltip.booking.status} /></div>
        </div>
      )}
    </div>
  )
}
