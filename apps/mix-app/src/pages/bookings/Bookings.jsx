import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { bookingsAPI, carsAPI, customersAPI, getErrMsg } from '../../api/client'
import { safeList } from '../../hooks/useApi'
import { useToast } from '../../context/ToastContext'
import { PageHeader, Button, Badge, Table, Pagination, Select, Card, Empty, Spinner, Modal, Input, Textarea, Confirm, Breadcrumb } from '../../components/ui/index'
import { generateContract } from '../../utils/contract'

const STATUS_OPTS = [
  { value:'', label:'Të gjitha' },
  { value:'requested', label:'Kërkuar' },
  { value:'confirmed', label:'Konfirmuar' },
  { value:'active', label:'Aktiv' },
  { value:'completed', label:'Kompletuar' },
  { value:'cancelled', label:'Anuluar' },
]
const STATUS_L = { requested:'Kërkuar', confirmed:'Konfirmuar', active:'Aktiv', completed:'Kompletuar', cancelled:'Anuluar' }
const fmtDate  = d => d ? new Date(d).toLocaleDateString('sq-AL', { day:'2-digit', month:'short', year:'numeric' }) : '—'
const fmtMoney = (v,c='EUR') => v ? `${parseFloat(v).toLocaleString()} ${c}` : '—'
const days     = (a,b) => a&&b ? Math.ceil((new Date(b)-new Date(a))/(1000*86400)) : 0

// ─── Create Modal ─────────────────────────────────────────────────────────────
function CreateModal({ open, onClose, onDone }) {
  const toast = useToast()
  const [f, setF]     = useState({ car_id:'', customer_id:'', date_from:'', date_to:'', price_total:'', deposit_amount:'', currency:'EUR', notes:'', status:'confirmed' })
  const [cars, setCars]   = useState([])
  const [custs, setCusts] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    Promise.allSettled([carsAPI.list({ limit:100 }), customersAPI.list({ limit:100 })]).then(([c,cu]) => {
      setCars(c.status==='fulfilled' ? safeList(c.value?.data).items : [])
      setCusts(cu.status==='fulfilled' ? safeList(cu.value?.data).items : [])
    })
  }, [open])

  const set = k => e => setF(p => ({...p, [k]:e.target.value}))

  const submit = async e => {
    e.preventDefault(); setLoading(true)
    try {
      await bookingsAPI.create({ ...f, price_total: f.price_total||null, deposit_amount: f.deposit_amount||null, customer_id: f.customer_id||null })
      toast('Rezervimi u krijua!', 'success')
      onDone(); onClose()
    } catch(e) { toast(getErrMsg(e), 'error') }
    finally { setLoading(false) }
  }

  return (
    <Modal open={open} onClose={onClose} title="Rezervim i ri" width={560}
      footer={<><Button variant="secondary" onClick={onClose}>Anulo</Button><Button form="create-booking" type="submit" loading={loading}>Krijo</Button></>}
    >
      <form id="create-booking" onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
        <Select label="Makina *" value={f.car_id} onChange={set('car_id')} options={[{value:'',label:'— Zgjidh makinën —'}, ...cars.map(c=>({value:c.id, label:`${c.title} · ${c.price_per_day} ${c.currency}/ditë`}))]} />
        <Select label="Klienti (opsional)" value={f.customer_id} onChange={set('customer_id')} options={[{value:'',label:'— Pa klient —'}, ...custs.map(c=>({value:c.id, label:`${c.name} · ${c.phone}`}))]} />
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <Input label="Nga data *" type="date" value={f.date_from} onChange={set('date_from')} required />
          <Input label="Deri *" type="date" value={f.date_to} onChange={set('date_to')} required />
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14 }}>
          <Input label="Çmimi total" type="number" value={f.price_total} onChange={set('price_total')} placeholder="0" />
          <Input label="Depozitë" type="number" value={f.deposit_amount} onChange={set('deposit_amount')} placeholder="0" />
          <Select label="Valuta" value={f.currency} onChange={set('currency')} options={[{value:'EUR',label:'EUR'},{value:'ALL',label:'ALL'},{value:'USD',label:'USD'}]} />
        </div>
        <Select label="Statusi" value={f.status} onChange={set('status')} options={STATUS_OPTS.slice(1)} />
        <Textarea label="Shënime" value={f.notes} onChange={set('notes')} placeholder="..." />
      </form>
    </Modal>
  )
}

// ─── Bookings List ────────────────────────────────────────────────────────────
export function BookingsList() {
  const navigate = useNavigate()
  const [rows, setRows]     = useState([])
  const [total, setTotal]   = useState(0)
  const [page, setPage]     = useState(1)
  const [status, setStatus] = useState('')
  const [loading, setLoading]   = useState(true)
  const [showCreate, setShowCreate] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await bookingsAPI.list({ page, limit:20, ...(status ? {status} : {}) })
      const { items, total } = safeList(r?.data)
      setRows(items); setTotal(total)
    } catch {} finally { setLoading(false) }
  }, [page, status])

  useEffect(() => { load() }, [load])

  const cols = [
    { key:'date_from', label:'Periudha', render:(v,r) => (
      <div>
        <div style={{ fontWeight:500 }}>{fmtDate(v)} → {fmtDate(r.date_to)}</div>
        <div style={{ fontSize:'.75rem', color:'var(--text-3)' }}>{days(v,r.date_to)} ditë</div>
      </div>
    )},
    { key:'price_total', label:'Çmimi', render:(v,r) => <span style={{ fontWeight:600, color:'var(--accent)' }}>{fmtMoney(v,r.currency)}</span> },
    { key:'status', label:'Statusi', render:(v) => <Badge status={v} label={STATUS_L[v]||v} /> },
    { key:'created_at', label:'Krijuar', render:(v) => fmtDate(v) },
  ]

  return (
    <div className="fade-up">
      <PageHeader title="Rezervimet" subtitle={`${total} gjithsej`}
        actions={<Button onClick={() => setShowCreate(true)} icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14"/></svg>}>Rezervim i ri</Button>}
      />
      <Card padding={0}>
        <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--border)' }}>
          <Select value={status} onChange={e=>{setStatus(e.target.value);setPage(1)}} options={STATUS_OPTS} style={{ width:180 }} />
        </div>
        <Table cols={cols} rows={rows} loading={loading} onRow={r=>navigate(`/bookings/${r.id}`)} />
        {!loading && rows.length===0 && <Empty icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>} title="Asnjë rezervim" desc="Krijoni rezervimin e parë." action={<Button onClick={() => setShowCreate(true)}>Shto rezervim</Button>} />}
        <div style={{ padding:'14px 18px' }}><Pagination page={page} total={total} limit={20} onChange={setPage} /></div>
      </Card>
      <CreateModal open={showCreate} onClose={() => setShowCreate(false)} onDone={load} />
    </div>
  )
}

// ─── Booking Detail ───────────────────────────────────────────────────────────
export function BookingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast    = useToast()
  const [booking, setBooking] = useState(null)
  const [car, setCar]         = useState(null)
  const [customer, setCustomer] = useState(null)
  const [company, setCompany]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [showCancel, setShowCancel] = useState(false)
  const [form, setForm] = useState({})

  const load = useCallback(async () => {
    try {
      const r = await bookingsAPI.get(id)
      setBooking(r.data)
      setForm(r.data)
      // Load related data for contract
      if (r.data?.car_id) carsAPI.get(r.data.car_id).then(cr => setCar(cr.data)).catch(()=>{})
      if (r.data?.customer_id) customersAPI.get(r.data.customer_id).then(cr => setCustomer(cr.data)).catch(()=>{})
      // Company from localStorage or me endpoint
      try { const me = await fetch('/api/me/', {credentials:'include'}).then(r=>r.json()); setCompany(me?.company) } catch {}
    }
    catch { navigate('/bookings') }
    finally { setLoading(false) }
  }, [id])

  useEffect(() => { load() }, [load])

  const set = k => e => setForm(f => ({...f, [k]:e.target.value}))

  const save = async e => {
    e.preventDefault(); setSaving(true)
    try {
      const r = await bookingsAPI.update(id, { date_from:form.date_from, date_to:form.date_to, status:form.status, notes:form.notes||null, price_total:form.price_total||null, deposit_amount:form.deposit_amount||null })
      setBooking(r.data); setForm(r.data)
      toast('Ndryshimet u ruajtën!', 'success')
    } catch(e) { toast(getErrMsg(e), 'error') }
    finally { setSaving(false) }
  }

  const cancel = async () => {
    setCancelling(true)
    try { await bookingsAPI.cancel(id); toast('Rezervimi u anulua!', 'success'); navigate('/bookings') }
    catch(e) { toast(getErrMsg(e), 'error'); setCancelling(false) }
  }

  const printContract = () => {
    generateContract(booking, car, customer, company)
  }

  if (loading) return <div style={{ display:'flex', justifyContent:'center', padding:80 }}><Spinner size={36} /></div>

  return (
    <div className="fade-up">
      <Breadcrumb items={[{label:'Rezervimet', to:'/bookings'}, {label:'Detajet'}]} />
      <PageHeader title={`${fmtDate(booking?.date_from)} — ${fmtDate(booking?.date_to)}`}
        actions={<div style={{ display:'flex', gap:10 }}>
          <Button variant="secondary" size="sm" onClick={printContract}
            icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>}>
            Printo Kontratë
          </Button>
          {booking?.status !== 'cancelled' && <Button variant="danger" size="sm" onClick={() => setShowCancel(true)}>Anulo</Button>}
        </div>}
      />
      <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:20 }}>
        <Card>
          <h3 style={{ fontSize:'.95rem', marginBottom:18 }}>Ndrysho</h3>
          <form onSubmit={save} style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <Input label="Nga data" type="date" value={form.date_from||''} onChange={set('date_from')} />
              <Input label="Deri" type="date" value={form.date_to||''} onChange={set('date_to')} />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <Input label="Çmimi total" type="number" value={form.price_total||''} onChange={set('price_total')} />
              <Input label="Depozitë" type="number" value={form.deposit_amount||''} onChange={set('deposit_amount')} />
            </div>
            <Select label="Statusi" value={form.status||''} onChange={set('status')} options={STATUS_OPTS.slice(1)} />
            <Textarea label="Shënime" value={form.notes||''} onChange={set('notes')} />
            <Button type="submit" loading={saving} style={{ alignSelf:'flex-start' }}>Ruaj</Button>
          </form>
        </Card>
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <Card>
            <div style={{ fontSize:'.75rem', color:'var(--text-3)', marginBottom:6, fontWeight:600, textTransform:'uppercase', letterSpacing:'.05em' }}>Statusi</div>
            <Badge status={booking?.status} label={STATUS_L[booking?.status]||booking?.status} />
          </Card>
          <Card style={{ background:'var(--accent-bg)', border:'1px solid var(--accent-border)' }}>
            <div style={{ fontSize:'.75rem', color:'var(--text-3)', marginBottom:4 }}>Çmimi total</div>
            <div style={{ fontSize:'1.8rem', fontFamily:'var(--f-display)', fontWeight:800, color:'var(--accent)' }}>{fmtMoney(booking?.price_total, booking?.currency)}</div>
            <div style={{ fontSize:'.8rem', color:'var(--text-3)', marginTop:6 }}>Depozitë: {fmtMoney(booking?.deposit_amount, booking?.currency)}</div>
            <div style={{ fontSize:'.8rem', color:'var(--text-3)', marginTop:4 }}>{days(booking?.date_from, booking?.date_to)} ditë</div>
          </Card>
          {booking?.notes && <Card><div style={{ fontSize:'.8rem', color:'var(--text-3)', marginBottom:8, fontWeight:600, textTransform:'uppercase', letterSpacing:'.05em' }}>Shënime</div><p style={{ fontSize:'.875rem', color:'var(--text-2)', lineHeight:1.6 }}>{booking.notes}</p></Card>}
        </div>
      </div>
      <Confirm open={showCancel} onClose={() => setShowCancel(false)} onConfirm={cancel} loading={cancelling} title="Anulo rezervimin" message="Jeni i sigurt që doni të anuloni këtë rezervim?" />
    </div>
  )
}
