import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { requestsAPI, customersAPI, getErrMsg } from '../../api/client'
import { safeList } from '../../hooks/useApi'
import { useToast } from '../../context/ToastContext'
import { PageHeader, Button, Badge, Table, Pagination, Select, Card, Empty, Spinner, Modal, Input, Breadcrumb } from '../../components/ui/index'

const STATUS_L = { new:'E re', contacted:'Kontaktuar', converted:'Konvertuar', spam:'Spam' }
const STATUS_OPTS = [{ value:'', label:'Të gjitha' }, ...Object.entries(STATUS_L).map(([v,l])=>({value:v,label:l}))]
const fmtDate = d => d ? new Date(d).toLocaleDateString('sq-AL', { day:'2-digit', month:'short', year:'numeric' }) : '—'

function ConvertModal({ open, onClose, req, onDone }) {
  const toast = useToast()
  const [custs, setCusts] = useState([])
  const [f, setF] = useState({ date_from:'', date_to:'', price_total:'', deposit_amount:'', customer_id:'' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setF({ date_from:req?.date_from||'', date_to:req?.date_to||'', price_total:'', deposit_amount:'', customer_id:'' })
    customersAPI.list({ limit:100 }).then(r => setCusts(safeList(r?.data).items)).catch(()=>{})
  }, [open, req])

  const set = k => e => setF(p=>({...p,[k]:e.target.value}))

  const submit = async e => {
    e.preventDefault(); setLoading(true)
    try {
      await requestsAPI.convert(req.id, { date_from:f.date_from, date_to:f.date_to, price_total:f.price_total||null, deposit_amount:f.deposit_amount||null, customer_id:f.customer_id||null })
      toast('Kërkesa u konvertua në rezervim!', 'success')
      onDone(); onClose()
    } catch(e) { toast(getErrMsg(e), 'error') }
    finally { setLoading(false) }
  }

  return (
    <Modal open={open} onClose={onClose} title="Konverto në rezervim" width={480}
      footer={<><Button variant="secondary" onClick={onClose}>Anulo</Button><Button form="convert-form" type="submit" loading={loading}>Konverto</Button></>}
    >
      <div style={{ background:'var(--bg-3)', border:'1px solid var(--border)', borderRadius:'var(--r)', padding:'12px 14px', marginBottom:16 }}>
        <div style={{ fontWeight:600 }}>{req?.requester_name}</div>
        <div style={{ fontSize:'.8rem', color:'var(--text-3)', marginTop:2 }}>{req?.requester_phone}</div>
        {req?.message && <div style={{ fontSize:'.8rem', color:'var(--text-2)', marginTop:8, lineHeight:1.5 }}>{req.message}</div>}
      </div>
      <form id="convert-form" onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
        <Select label="Klienti ekzistues" value={f.customer_id} onChange={set('customer_id')} options={[{value:'',label:'— Krijoni klient të ri —'}, ...custs.map(c=>({value:c.id,label:`${c.name} · ${c.phone}`}))]} />
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <Input label="Nga data *" type="date" value={f.date_from} onChange={set('date_from')} required />
          <Input label="Deri *" type="date" value={f.date_to} onChange={set('date_to')} required />
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <Input label="Çmimi total" type="number" value={f.price_total} onChange={set('price_total')} placeholder="0" />
          <Input label="Depozitë" type="number" value={f.deposit_amount} onChange={set('deposit_amount')} placeholder="0" />
        </div>
      </form>
    </Modal>
  )
}

export function RequestsList() {
  const navigate = useNavigate()
  const [rows, setRows]     = useState([])
  const [total, setTotal]   = useState(0)
  const [page, setPage]     = useState(1)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await requestsAPI.list({ page, limit:20, ...(status ? {status} : {}) })
      const { items, total } = safeList(r?.data)
      setRows(items); setTotal(total)
    } catch {} finally { setLoading(false) }
  }, [page, status])

  useEffect(() => { load() }, [load])

  const cols = [
    { key:'requester_name', label:'Klienti', render:(v,r) => (
      <div>
        <div style={{ fontWeight:500 }}>{v}</div>
        <div style={{ fontSize:'.75rem', color:'var(--text-3)' }}>{r.requester_phone}</div>
      </div>
    )},
    { key:'date_from', label:'Data', render:(v,r) => v ? `${fmtDate(v)} → ${fmtDate(r.date_to)}` : '—' },
    { key:'message', label:'Mesazhi', width:220, render:(v) => v ? <span className="truncate" style={{ display:'block', maxWidth:200, fontSize:'.8rem', color:'var(--text-3)' }}>{v}</span> : '—' },
    { key:'status', label:'Statusi', render:(v) => <Badge status={v} label={STATUS_L[v]||v} /> },
    { key:'created_at', label:'Krijuar', render:(v) => fmtDate(v) },
  ]

  return (
    <div className="fade-up">
      <PageHeader title="Kërkesat" subtitle={`${total} kërkesa gjithsej`} />
      <Card padding={0}>
        <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--border)' }}>
          <Select value={status} onChange={e=>{setStatus(e.target.value);setPage(1)}} options={STATUS_OPTS} style={{ width:180 }} />
        </div>
        <Table cols={cols} rows={rows} loading={loading} onRow={r=>navigate(`/booking-requests/${r.id}`)} />
        {!loading && rows.length===0 && <Empty icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>} title="Asnjë kërkesë" desc="Kërkesat nga faqja publike shfaqen këtu." />}
        <div style={{ padding:'14px 18px' }}><Pagination page={page} total={total} limit={20} onChange={setPage} /></div>
      </Card>
    </div>
  )
}

export function RequestDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast    = useToast()
  const [req, setReq]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [showConvert, setShowConvert] = useState(false)

  const load = useCallback(async () => {
    try { const r = await requestsAPI.get(id); setReq(r.data) }
    catch { navigate('/booking-requests') }
    finally { setLoading(false) }
  }, [id])

  useEffect(() => { load() }, [load])

  const updateStatus = async (s) => {
    setUpdating(true)
    try { const r = await requestsAPI.update(id, { status:s }); setReq(r.data); toast('Statusi u përditësua!', 'success') }
    catch(e) { toast(getErrMsg(e), 'error') }
    finally { setUpdating(false) }
  }

  const fmtDate = d => d ? new Date(d).toLocaleDateString('sq-AL', { day:'2-digit', month:'short', year:'numeric' }) : '—'

  if (loading) return <div style={{ display:'flex', justifyContent:'center', padding:80 }}><Spinner size={36} /></div>

  return (
    <div className="fade-up">
      <Breadcrumb items={[{label:'Kërkesat', to:'/booking-requests'}, {label:req?.requester_name}]} />
      <PageHeader title={req?.requester_name}
        actions={req?.status !== 'converted' && (
          <Button variant="success" size="sm" onClick={() => setShowConvert(true)}
            icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>}>
            Konverto në rezervim
          </Button>
        )}
      />
      <div className="split-layout">
        <Card>
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
              {[
                ['Emri', req?.requester_name],
                ['Telefoni', <a key="p" href={`tel:${req?.requester_phone}`} style={{ color:'var(--accent)' }}>{req?.requester_phone}</a>],
                ['Nga data', fmtDate(req?.date_from)],
                ['Deri', fmtDate(req?.date_to)],
              ].map(([l,v]) => (
                <div key={l}>
                  <div style={{ fontSize:'.72rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:4, fontWeight:600 }}>{l}</div>
                  <div style={{ fontSize:'.9rem' }}>{v}</div>
                </div>
              ))}
            </div>
            {req?.message && (
              <div>
                <div style={{ fontSize:'.72rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:8, fontWeight:600 }}>Mesazhi</div>
                <div style={{ background:'var(--bg-3)', border:'1px solid var(--border)', borderRadius:'var(--r)', padding:'13px 15px', fontSize:'.9rem', color:'var(--text-2)', lineHeight:1.6 }}>
                  {req.message}
                </div>
              </div>
            )}
          </div>
        </Card>

        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <Card>
            <div style={{ fontSize:'.72rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:10, fontWeight:600 }}>Statusi</div>
            <Badge status={req?.status} label={STATUS_L[req?.status]||req?.status} style={{ marginBottom:14 }} />
            <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
              {Object.keys(STATUS_L).filter(s=>s!==req?.status&&s!=='converted').map(s => (
                <Button key={s} variant="secondary" size="sm" loading={updating} onClick={() => updateStatus(s)} style={{ width:'100%', justifyContent:'center' }}>
                  Shëno: {STATUS_L[s]}
                </Button>
              ))}
            </div>
          </Card>

          <Card>
            <div style={{ fontSize:'.72rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:12, fontWeight:600 }}>Kontakto</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <a href={`tel:${req?.requester_phone}`} style={{ display:'flex', alignItems:'center', gap:9, padding:'9px 13px', background:'var(--bg-3)', border:'1px solid var(--border)', borderRadius:'var(--r)', color:'var(--text-1)', textDecoration:'none', fontSize:'.875rem', fontWeight:500 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.24h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.83a16 16 0 0 0 6.29 6.29l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                Telefono
              </a>
              <a href={`https://wa.me/${(req?.requester_phone||'').replace(/\D/g,'')}`} target="_blank" rel="noreferrer" style={{ display:'flex', alignItems:'center', gap:9, padding:'9px 13px', background:'rgba(37,211,102,.1)', border:'1px solid rgba(37,211,102,.2)', borderRadius:'var(--r)', color:'#25d366', textDecoration:'none', fontSize:'.875rem', fontWeight:500 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                WhatsApp
              </a>
            </div>
          </Card>
        </div>
      </div>
      <ConvertModal open={showConvert} onClose={() => setShowConvert(false)} req={req} onDone={() => { load(); navigate('/bookings') }} />
    </div>
  )
}
