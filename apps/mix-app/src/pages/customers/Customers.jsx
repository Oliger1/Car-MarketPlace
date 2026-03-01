import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { customersAPI, getErrMsg } from '../../api/client'
import { safeList } from '../../hooks/useApi'
import { useToast } from '../../context/ToastContext'
import { PageHeader, Button, Table, Pagination, Search, Card, Empty, Spinner, Modal, Input, Textarea, Breadcrumb, Avatar } from '../../components/ui/index'

const fmtDate = d => d ? new Date(d).toLocaleDateString('sq-AL', { day:'2-digit', month:'short', year:'numeric' }) : '—'

function CreateModal({ open, onClose, onDone }) {
  const toast = useToast()
  const [f, setF] = useState({ name:'', phone:'', id_number:'', notes:'' })
  const [loading, setLoading] = useState(false)
  const set = k => e => setF(p=>({...p,[k]:e.target.value}))

  const submit = async e => {
    e.preventDefault(); setLoading(true)
    try { await customersAPI.create(f); toast('Klienti u krijua!', 'success'); setF({name:'',phone:'',id_number:'',notes:''}); onDone(); onClose() }
    catch(e) { toast(getErrMsg(e), 'error') }
    finally { setLoading(false) }
  }

  return (
    <Modal open={open} onClose={onClose} title="Klient i ri" width={460}
      footer={<><Button variant="secondary" onClick={onClose}>Anulo</Button><Button form="create-cust" type="submit" loading={loading}>Krijo</Button></>}
    >
      <form id="create-cust" onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:13 }}>
        <Input label="Emri *" value={f.name} onChange={set('name')} placeholder="Artan Hoxha" required autoFocus />
        <Input label="Telefoni *" value={f.phone} onChange={set('phone')} placeholder="+355 69 123 4567" required />
        <Input label="Nr. ID / Pasaportë" value={f.id_number} onChange={set('id_number')} placeholder="A12345678" />
        <Textarea label="Shënime" value={f.notes} onChange={set('notes')} placeholder="..." />
      </form>
    </Modal>
  )
}

export function CustomersList() {
  const navigate = useNavigate()
  const [rows, setRows]     = useState([])
  const [total, setTotal]   = useState(0)
  const [page, setPage]     = useState(1)
  const [q, setQ]           = useState('')
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await customersAPI.list({ page, limit:20, ...(q ? {q} : {}) })
      const { items, total } = safeList(r?.data)
      setRows(items); setTotal(total)
    } catch {} finally { setLoading(false) }
  }, [page, q])

  useEffect(() => { load() }, [load])

  const cols = [
    { key:'name', label:'Klienti', render:(v,r) => (
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <Avatar name={v} size={34} />
        <div>
          <div style={{ fontWeight:500 }}>{v}</div>
          <div style={{ fontSize:'.75rem', color:'var(--text-3)' }}>{r.phone}</div>
        </div>
      </div>
    )},
    { key:'id_number', label:'ID / Pasaportë', render:v=>v||'—' },
    { key:'notes', label:'Shënime', width:200, render:v => v ? <span className="truncate" style={{ display:'block', maxWidth:180, fontSize:'.8rem', color:'var(--text-3)' }}>{v}</span> : '—' },
    { key:'created_at', label:'Shtuar', render:v=>fmtDate(v) },
  ]

  return (
    <div className="fade-up">
      <PageHeader title="Klientët" subtitle={`${total} klientë gjithsej`}
        actions={<Button onClick={() => setShowCreate(true)} icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14"/></svg>}>Klient i ri</Button>}
      />
      <Card padding={0}>
        <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--border)' }}>
          <Search value={q} onChange={v=>{setQ(v);setPage(1)}} placeholder="Kërko sipas emrit ose telefonit..." />
        </div>
        <Table cols={cols} rows={rows} loading={loading} onRow={r=>navigate(`/customers/${r.id}`)} />
        {!loading && rows.length===0 && <Empty icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>} title={q?'Asnjë rezultat':'Asnjë klient'} desc={q?`Nuk u gjet për "${q}"`:'Shtoni klientin e parë.'} action={!q&&<Button onClick={()=>setShowCreate(true)}>Shto klient</Button>} />}
        <div style={{ padding:'14px 18px' }}><Pagination page={page} total={total} limit={20} onChange={setPage} /></div>
      </Card>
      <CreateModal open={showCreate} onClose={() => setShowCreate(false)} onDone={load} />
    </div>
  )
}

export function CustomerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast    = useToast()
  const [cust, setCust]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [form, setForm]       = useState({})

  const load = useCallback(async () => {
    try { const r = await customersAPI.get(id); setCust(r.data); setForm(r.data) }
    catch { navigate('/customers') }
    finally { setLoading(false) }
  }, [id])

  useEffect(() => { load() }, [load])

  const set = k => e => setForm(f=>({...f,[k]:e.target.value}))

  const save = async e => {
    e.preventDefault(); setSaving(true)
    try { const r = await customersAPI.update(id, { name:form.name, phone:form.phone, id_number:form.id_number||null, notes:form.notes||null }); setCust(r.data); setForm(r.data); toast('Ndryshimet u ruajtën!','success') }
    catch(e) { toast(getErrMsg(e),'error') }
    finally { setSaving(false) }
  }

  if (loading) return <div style={{ display:'flex', justifyContent:'center', padding:80 }}><Spinner size={36} /></div>

  return (
    <div className="fade-up">
      <Breadcrumb items={[{label:'Klientët', to:'/customers'}, {label:cust?.name}]} />
      <PageHeader title={cust?.name} />
      <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:20 }}>
        <Card>
          <form onSubmit={save} style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <Input label="Emri *" value={form.name||''} onChange={set('name')} required />
              <Input label="Telefoni *" value={form.phone||''} onChange={set('phone')} required />
            </div>
            <Input label="Nr. ID / Pasaportë" value={form.id_number||''} onChange={set('id_number')} />
            <Textarea label="Shënime" value={form.notes||''} onChange={set('notes')} />
            <Button type="submit" loading={saving} style={{ alignSelf:'flex-start' }}>Ruaj ndryshimet</Button>
          </form>
        </Card>
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <Card style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10, padding:'24px 20px' }}>
            <Avatar name={cust?.name} size={64} />
            <div style={{ textAlign:'center' }}>
              <div style={{ fontWeight:700, fontSize:'1.05rem' }}>{cust?.name}</div>
              <a href={`tel:${cust?.phone}`} style={{ color:'var(--accent)', fontSize:'.875rem' }}>{cust?.phone}</a>
            </div>
            {cust?.id_number && <div style={{ fontSize:'.8rem', color:'var(--text-3)', background:'var(--bg-3)', padding:'4px 10px', borderRadius:'var(--r-sm)' }}>{cust.id_number}</div>}
          </Card>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <a href={`tel:${cust?.phone}`} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'10px', background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:'var(--r)', color:'var(--text-1)', textDecoration:'none', fontSize:'.875rem', fontWeight:500 }}>Telefono</a>
            <a href={`https://wa.me/${(cust?.phone||'').replace(/\D/g,'')}`} target="_blank" rel="noreferrer" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'10px', background:'rgba(37,211,102,.08)', border:'1px solid rgba(37,211,102,.2)', borderRadius:'var(--r)', color:'#25d366', textDecoration:'none', fontSize:'.875rem', fontWeight:500 }}>WhatsApp</a>
          </div>
        </div>
      </div>
    </div>
  )
}
