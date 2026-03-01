import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { bookingsAPI, carsAPI, requestsAPI, customersAPI } from '../../api/client'
import { safeList } from '../../hooks/useApi'
import { StatCard, Card, Badge, PageHeader, Spinner } from '../../components/ui/index'

const fmtDate = d => d ? new Date(d).toLocaleDateString('sq-AL', { day:'2-digit', month:'short', year:'numeric' }) : '—'
const fmtMoney = (v,c='EUR') => v ? `${parseFloat(v).toLocaleString()} ${c}` : '—'

function RecentList({ title, to, items, renderItem, empty }) {
  return (
    <Card>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
        <h3 style={{ fontSize:'.95rem' }}>{title}</h3>
        <Link to={to} style={{ fontSize:'.78rem', color:'var(--accent)' }}>Shiko të gjitha →</Link>
      </div>
      {items.length === 0 ? (
        <p style={{ color:'var(--text-3)', fontSize:'.85rem', textAlign:'center', padding:'24px 0' }}>{empty}</p>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {items.map(item => renderItem(item))}
        </div>
      )}
    </Card>
  )
}

function ItemRow({ to, children }) {
  return (
    <Link to={to} style={{
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'11px 13px', borderRadius:'var(--r)',
      background:'var(--bg-3)', border:'1px solid var(--border)',
      textDecoration:'none', transition:'all var(--t)',
    }}
      onMouseEnter={e => { e.currentTarget.style.background='var(--bg-4)'; e.currentTarget.style.borderColor='var(--accent-border)' }}
      onMouseLeave={e => { e.currentTarget.style.background='var(--bg-3)'; e.currentTarget.style.borderColor='var(--border)' }}
    >
      {children}
    </Link>
  )
}

export default function Dashboard() {
  const [data, setData] = useState({ cars:0, bookings:0, requests:0, customers:0 })
  const [recentBookings, setRecentBookings] = useState([])
  const [recentRequests, setRecentRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const [cRes, bRes, rRes, cuRes] = await Promise.allSettled([
          carsAPI.list({ limit:100 }),
          bookingsAPI.list({ limit:5 }),
          requestsAPI.list({ status:'new', limit:5 }),
          customersAPI.list({ limit:100 }),
        ])
        if (cancelled) return

        const cars  = cRes.status==='fulfilled' ? safeList(cRes.value?.data) : { items:[], total:0 }
        const books = bRes.status==='fulfilled' ? safeList(bRes.value?.data) : { items:[], total:0 }
        const reqs  = rRes.status==='fulfilled' ? safeList(rRes.value?.data) : { items:[], total:0 }
        const cust  = cuRes.status==='fulfilled' ? safeList(cuRes.value?.data) : { items:[], total:0 }

        setData({ cars: cars.total, bookings: books.total, requests: reqs.total, customers: cust.total })
        setRecentBookings(books.items.slice(0,5))
        setRecentRequests(reqs.items.slice(0,5))
      } catch {}
      finally { if (!cancelled) setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const h = new Date().getHours()
  const greet = h < 12 ? 'Mirëmëngjes' : h < 18 ? 'Mirëdita' : 'Mirëmbrëma'

  const statColors = ['var(--accent)', 'var(--blue)', 'var(--yellow)', 'var(--green)']

  const statIcons = [
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>,
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>,
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  ]

  const statsRows = [
    { label:'Makina', value:data.cars, to:'/cars' },
    { label:'Rezervime', value:data.bookings, to:'/bookings' },
    { label:'Kërkesa të reja', value:data.requests, to:'/booking-requests' },
    { label:'Klientë', value:data.customers, to:'/customers' },
  ]

  return (
    <div className="fade-up">
      <PageHeader title={`${greet}!`} subtitle="Ja çfarë po ndodh me flotën tuaj sot."
        actions={
          <Link to="/bookings" style={{ display:'inline-flex', alignItems:'center', gap:7, height:40, padding:'0 18px', background:'var(--accent)', color:'#0c0e14', borderRadius:'var(--r)', fontWeight:700, fontSize:'.875rem', textDecoration:'none' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14"/></svg>
            Rezervim i ri
          </Link>
        }
      />

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:60 }}><Spinner size={36} /></div>
      ) : (
        <>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:16, marginBottom:24 }}>
            {statsRows.map((s, i) => (
              <Link key={s.label} to={s.to} style={{ textDecoration:'none' }}>
                <StatCard label={s.label} value={s.value} icon={statIcons[i]} color={statColors[i]} />
              </Link>
            ))}
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
            <RecentList title="Rezervimet e fundit" to="/bookings" items={recentBookings} empty="Asnjë rezervim ende"
              renderItem={b => (
                <ItemRow key={b.id} to={`/bookings/${b.id}`}>
                  <div>
                    <div style={{ fontSize:'.875rem', fontWeight:500 }}>{fmtDate(b.date_from)} → {fmtDate(b.date_to)}</div>
                    <div style={{ fontSize:'.75rem', color:'var(--text-3)', marginTop:2 }}>{fmtMoney(b.price_total, b.currency)}</div>
                  </div>
                  <Badge status={b.status} label={b.status} />
                </ItemRow>
              )}
            />
            <RecentList title="Kërkesa të reja" to="/booking-requests" items={recentRequests} empty="Asnjë kërkesë e re"
              renderItem={r => (
                <ItemRow key={r.id} to={`/booking-requests/${r.id}`}>
                  <div>
                    <div style={{ fontSize:'.875rem', fontWeight:500 }}>{r.requester_name}</div>
                    <div style={{ fontSize:'.75rem', color:'var(--text-3)', marginTop:2 }}>{r.requester_phone}{r.date_from ? ` · ${fmtDate(r.date_from)}` : ''}</div>
                  </div>
                  <Badge status={r.status} label={r.status} />
                </ItemRow>
              )}
            />
          </div>
        </>
      )}
    </div>
  )
}
