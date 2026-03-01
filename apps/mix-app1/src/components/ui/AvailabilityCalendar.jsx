import { useState, useEffect, useCallback } from 'react'
import { bookingsAPI } from '../../api/client'
import { safeList } from '../../hooks/useApi'
import { Spinner } from '../../components/ui/index'
import { useNavigate } from 'react-router-dom'

const MONTHS_SQ = ['Janar','Shkurt','Mars','Prill','Maj','Qershor','Korrik','Gusht','Shtator','Tetor','Nëntor','Dhjetor']
const DAYS_SQ   = ['Hë','Ma','Më','En','Pr','Sh','Di']

function getDaysInMonth(y, m) { return new Date(y, m + 1, 0).getDate() }
function getFirstDayOfMonth(y, m) {
  const d = new Date(y, m, 1).getDay()
  return d === 0 ? 6 : d - 1 // Monday=0
}

export function AvailabilityCalendar({ carId }) {
  const navigate = useNavigate()
  const [viewDate, setViewDate]   = useState(new Date())
  const [bookings, setBookings]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [hovered, setHovered]     = useState(null)

  const year  = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const load = useCallback(async () => {
    if (!carId) return
    setLoading(true)
    try {
      const r = await bookingsAPI.list({ car_id: carId, limit: 200 })
      setBookings(safeList(r?.data).items.filter(b => b.status !== 'cancelled'))
    } catch {}
    finally { setLoading(false) }
  }, [carId])

  useEffect(() => { load() }, [load])

  const isBooked = (day) => {
    const d = new Date(year, month, day)
    return bookings.find(b => {
      const from = new Date(b.date_from)
      const to   = new Date(b.date_to)
      from.setHours(0,0,0,0); to.setHours(23,59,59,999)
      return d >= from && d <= to
    })
  }

  const today   = new Date()
  const isToday = (d) => today.getFullYear()===year && today.getMonth()===month && today.getDate()===d
  const isPast  = (d) => new Date(year, month, d) < new Date(today.getFullYear(), today.getMonth(), today.getDate())

  const daysInMonth  = getDaysInMonth(year, month)
  const firstDay     = getFirstDayOfMonth(year, month)

  const prevMonth = () => setViewDate(d => { const n = new Date(d); n.setMonth(n.getMonth()-1); return n })
  const nextMonth = () => setViewDate(d => { const n = new Date(d); n.setMonth(n.getMonth()+1); return n })

  const bookedDays   = bookings.filter(b => b.status !== 'cancelled').length
  const freeInMonth  = Array.from({length:daysInMonth},(_,i)=>i+1).filter(d=>!isBooked(d)&&!isPast(d)).length

  return (
    <div>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <h3 style={{ fontSize:'.95rem' }}>Disponueshmëria</h3>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <button onClick={prevMonth} style={{ background:'var(--bg-3)', border:'1px solid var(--border)', borderRadius:'var(--r-sm)', color:'var(--text-2)', cursor:'pointer', width:28, height:28, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <span style={{ fontSize:'.85rem', fontWeight:600, minWidth:130, textAlign:'center' }}>
            {MONTHS_SQ[month]} {year}
          </span>
          <button onClick={nextMonth} style={{ background:'var(--bg-3)', border:'1px solid var(--border)', borderRadius:'var(--r-sm)', color:'var(--text-2)', cursor:'pointer', width:28, height:28, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:32 }}><Spinner size={24} /></div>
      ) : (
        <>
          {/* Day headers */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2, marginBottom:4 }}>
            {DAYS_SQ.map(d => (
              <div key={d} style={{ textAlign:'center', fontSize:'.65rem', fontWeight:700, letterSpacing:'.06em', color:'var(--text-3)', padding:'4px 0', textTransform:'uppercase' }}>{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:3 }}>
            {/* Empty cells before first day */}
            {Array.from({length: firstDay}).map((_,i) => <div key={`e${i}`} />)}

            {/* Day cells */}
            {Array.from({length: daysInMonth}, (_,i) => i+1).map(d => {
              const booking = isBooked(d)
              const past    = isPast(d)
              const today_  = isToday(d)

              let bg, color, cursor = 'default', border = '1px solid transparent'
              if (booking) {
                const STATUS_BG = { confirmed:'rgba(34,197,94,.15)', active:'rgba(59,130,246,.15)', requested:'rgba(234,179,8,.15)', completed:'rgba(99,102,241,.15)' }
                bg = STATUS_BG[booking.status] || 'rgba(34,197,94,.15)'
                color = 'var(--text-1)'
                cursor = 'pointer'
                border = `1px solid ${booking.status==='confirmed'?'rgba(34,197,94,.3)':booking.status==='active'?'rgba(59,130,246,.3)':'rgba(234,179,8,.3)'}`
              } else if (past) {
                bg = 'transparent'; color = 'var(--text-3)'
              } else {
                bg = 'var(--bg-3)'; color = 'var(--text-2)'
              }

              if (today_) border = '1.5px solid var(--accent)'

              return (
                <div key={d}
                  onClick={() => booking && navigate(`/bookings/${booking.id}`)}
                  onMouseEnter={() => booking && setHovered(d)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    aspectRatio:'1', display:'flex', alignItems:'center', justifyContent:'center',
                    borderRadius:'var(--r-sm)', background:bg, border, color,
                    fontSize:'.78rem', fontWeight: today_ ? 800 : 400,
                    cursor, transition:'all var(--t)',
                    opacity: past && !booking ? .4 : 1,
                    position:'relative',
                  }}
                >
                  {d}
                  {booking && hovered===d && (
                    <div style={{
                      position:'absolute', bottom:'calc(100% + 6px)', left:'50%', transform:'translateX(-50%)',
                      background:'var(--bg-3)', border:'1px solid var(--border-2)', borderRadius:'var(--r-sm)',
                      padding:'6px 10px', whiteSpace:'nowrap', fontSize:'.72rem', zIndex:99,
                      boxShadow:'var(--shadow)',
                    }}>
                      {booking.customer_name || 'Rezervim'}
                      <div style={{ color:'var(--accent)', fontWeight:600, marginTop:2 }}>
                        {new Date(booking.date_from).toLocaleDateString('sq-AL',{day:'2-digit',month:'short'})} →{' '}
                        {new Date(booking.date_to).toLocaleDateString('sq-AL',{day:'2-digit',month:'short'})}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Legend + stats */}
          <div style={{ marginTop:16, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10 }}>
            <div style={{ display:'flex', gap:12 }}>
              {[
                {color:'rgba(34,197,94,.15)', border:'rgba(34,197,94,.3)', label:'E zënë'},
                {color:'var(--bg-3)', border:'transparent', label:'E lirë'},
              ].map(({color,border,label}) => (
                <div key={label} style={{ display:'flex', alignItems:'center', gap:5, fontSize:'.72rem', color:'var(--text-3)' }}>
                  <div style={{ width:10, height:10, borderRadius:3, background:color, border:`1px solid ${border}` }} />
                  {label}
                </div>
              ))}
            </div>
            <div style={{ fontSize:'.75rem', color:'var(--text-3)' }}>
              <span style={{ color:'var(--green)', fontWeight:600 }}>{freeInMonth} ditë të lira</span>
              {' '}këtë muaj
            </div>
          </div>
        </>
      )}
    </div>
  )
}
