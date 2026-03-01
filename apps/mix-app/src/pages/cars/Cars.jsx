import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { carsAPI, fileUrl, getErrMsg } from '../../api/client'
import { safeList } from '../../hooks/useApi'
import { useToast } from '../../context/ToastContext'
import { PageHeader, Button, Badge, Table, Pagination, Select, Card, Empty, Spinner, Modal, Input, Textarea, Confirm, Breadcrumb, ErrorAlert } from '../../components/ui/index'

const TRANS = [{ value:'manual', label:'Manual' }, { value:'automatic', label:'Automatik' }]
const FUEL  = [{ value:'petrol', label:'Benzinë' }, { value:'diesel', label:'Dizël' }, { value:'hybrid', label:'Hibrid' }, { value:'electric', label:'Elektrik' }]
const CURR  = [{ value:'EUR', label:'EUR' }, { value:'ALL', label:'ALL' }, { value:'USD', label:'USD' }]
const STATUS= [{ value:'active', label:'Aktive' }, { value:'inactive', label:'Jo aktive' }, { value:'maintenance', label:'Mirëmbajtje' }]

const FUEL_L  = { petrol:'Benzinë', diesel:'Dizël', hybrid:'Hibrid', electric:'Elektrik' }
const TRANS_L = { manual:'Manual', automatic:'Automatik' }
const STATUS_L= { active:'Aktive', inactive:'Jo aktive', maintenance:'Mirëmbajtje' }

function CarForm({ initial, onSubmit, loading }) {
  const [f, setF] = useState(initial)
  const set = k => e => {
    const v = e.target.value
    setF(prev => {
      const next = {...prev, [k]:v}
      if (k==='title' && !prev._slugTouched) next.slug = v.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'').replace(/^-+|-+$/g,'')
      return next
    })
  }

  const handleSubmit = e => {
    e.preventDefault()
    onSubmit({...f, year:parseInt(f.year)||2020, seats:parseInt(f.seats)||5, price_per_day:parseFloat(f.price_per_day)||0, deposit_amount:parseFloat(f.deposit_amount)||0 })
  }

  return (
    <form id="car-form" onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <Input label="Titulli *" value={f.title||''} onChange={set('title')} placeholder="Toyota Corolla 2023" required />
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
        <Input label="Marka *" value={f.make||''} onChange={set('make')} placeholder="Toyota" required />
        <Input label="Modeli *" value={f.model||''} onChange={set('model')} placeholder="Corolla" required />
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
        <Input label="Viti *" type="number" value={f.year||''} onChange={set('year')} min="1900" max="2100" required />
        <Select label="Transmisioni" value={f.transmission||'automatic'} onChange={set('transmission')} options={TRANS} />
        <Select label="Karburanti" value={f.fuel||'petrol'} onChange={set('fuel')} options={FUEL} />
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
        <Input label="Vendet *" type="number" value={f.seats||''} onChange={set('seats')} min="1" max="20" required />
        <Input label="Çmim/ditë *" type="number" value={f.price_per_day||''} onChange={set('price_per_day')} placeholder="50" required suffix={f.currency} />
        <Input label="Depozitë *" type="number" value={f.deposit_amount||''} onChange={set('deposit_amount')} placeholder="200" required suffix={f.currency} />
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
        <Select label="Valuta" value={f.currency||'EUR'} onChange={set('currency')} options={CURR} />
        <Input label="Vendndodhja" value={f.location_text||''} onChange={set('location_text')} placeholder="Tiranë" />
      </div>
      <Input label="Slug *" value={f.slug||''} onChange={e => setF(p=>({...p, slug:e.target.value, _slugTouched:true}))} placeholder="toyota-corolla-2023" required hint="Vetëm shkronja të vogla, numra dhe vizë" />
      <Textarea label="Përshkrimi" value={f.description||''} onChange={set('description')} placeholder="Makinë e komfortshme..." />
    </form>
  )
}

// ─── Cars List ────────────────────────────────────────────────────────────────
export function CarsList() {
  const navigate = useNavigate()
  const toast    = useToast()
  const [cars, setCars]     = useState([])
  const [total, setTotal]   = useState(0)
  const [page, setPage]     = useState(1)
  const [status, setStatus] = useState('')
  const [loading, setLoading]   = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating]     = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await carsAPI.list({ page, limit:20, ...(status ? {status} : {}) })
      const { items, total } = safeList(r?.data)
      setCars(items)
      setTotal(total)
    } catch { }
    finally { setLoading(false) }
  }, [page, status])

  useEffect(() => { load() }, [load])

  const handleCreate = async (data) => {
    setCreating(true)
    try {
      await carsAPI.create(data)
      toast('Makina u krijua!', 'success')
      setShowCreate(false)
      load()
    } catch(e) { toast(getErrMsg(e), 'error') }
    finally { setCreating(false) }
  }

  const cols = [
    { key:'title', label:'Makina', render:(v,r) => (
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ width:54, height:36, borderRadius:'var(--r-sm)', background:'var(--bg-4)', overflow:'hidden', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
          {r.photos?.[0] ? <img src={fileUrl(r.photos[0].path)} alt={v} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="1.5"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>}
        </div>
        <div>
          <div style={{ fontWeight:500 }}>{v}</div>
          <div style={{ fontSize:'.75rem', color:'var(--text-3)' }}>{r.make} {r.model} · {r.year}</div>
        </div>
      </div>
    )},
    { key:'transmission', label:'Trans.', render:(v) => TRANS_L[v]||v },
    { key:'fuel', label:'Karburant', render:(v) => FUEL_L[v]||v },
    { key:'price_per_day', label:'Çmim/ditë', render:(v,r) => <span style={{ fontWeight:600, color:'var(--accent)' }}>{v} {r.currency}</span> },
    { key:'seats', label:'Vende', render:(v) => `${v}` },
    { key:'status', label:'Statusi', render:(v) => <Badge status={v} label={STATUS_L[v]||v} /> },
    { key:'is_published', label:'Publikuar', render:(v) => <Badge status={v?'active':'inactive'} label={v?'Po':'Jo'} /> },
  ]

  return (
    <div className="fade-up">
      <PageHeader title="Makinat" subtitle={`${total} makina gjithsej`}
        actions={
          <Button onClick={() => setShowCreate(true)}
            icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14"/></svg>}>
            Makina e re
          </Button>
        }
      />

      <Card padding={0}>
        <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--border)', display:'flex', gap:10 }}>
          <Select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}
            options={[{value:'',label:'Të gjitha'}, ...STATUS]} style={{ width:170 }} />
        </div>
        <Table cols={cols} rows={cars} loading={loading} onRow={r => navigate(`/cars/${r.id}`)} />
        {!loading && cars.length===0 && (
          <Empty icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>}
            title="Asnjë makinë" desc="Shtoni makinën e parë të flotës."
            action={<Button onClick={() => setShowCreate(true)}>Shto makinë</Button>} />
        )}
        <div style={{ padding:'14px 18px' }}>
          <Pagination page={page} total={total} limit={20} onChange={setPage} />
        </div>
      </Card>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Makina e re" width={600}
        footer={<>
          <Button variant="secondary" onClick={() => setShowCreate(false)}>Anulo</Button>
          <Button form="car-form" type="submit" loading={creating}>Krijo makinën</Button>
        </>}
      >
        <CarForm initial={{ title:'', make:'', model:'', year:new Date().getFullYear(), transmission:'automatic', fuel:'petrol', seats:5, price_per_day:'', deposit_amount:'', currency:'EUR', description:'', location_text:'', slug:'' }}
          onSubmit={handleCreate} loading={creating} />
      </Modal>
    </div>
  )
}

// ─── Car Detail ───────────────────────────────────────────────────────────────
export function CarDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast    = useToast()
  const logoRef  = useRef()
  const [car, setCar]         = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDel, setShowDel] = useState(false)
  const [form, setForm]       = useState({})
  const [uploading, setUploading] = useState(false)
  const [deletingPhoto, setDeletingPhoto] = useState(null)

  const load = useCallback(async () => {
    try {
      const r = await carsAPI.get(id)
      setCar(r.data)
      setForm(r.data)
    } catch { navigate('/cars') }
    finally { setLoading(false) }
  }, [id])

  useEffect(() => { load() }, [load])

  const set = k => e => setForm(f => ({...f, [k]: e.target.value}))

  const save = async e => {
    e.preventDefault(); setSaving(true)
    try {
      const r = await carsAPI.update(id, {
        title:form.title, make:form.make, model:form.model, year:parseInt(form.year),
        transmission:form.transmission, fuel:form.fuel, seats:parseInt(form.seats),
        price_per_day:parseFloat(form.price_per_day), deposit_amount:parseFloat(form.deposit_amount),
        currency:form.currency, description:form.description||null, location_text:form.location_text||null,
        status:form.status, is_published:form.is_published,
      })
      setCar(r.data); setForm(r.data)
      toast('Ndryshimet u ruajtën!', 'success')
    } catch(e) { toast(getErrMsg(e), 'error') }
    finally { setSaving(false) }
  }

  const deleteCar = async () => {
    setDeleting(true)
    try { await carsAPI.delete(id); toast('Makina u fshi!', 'success'); navigate('/cars') }
    catch(e) { toast(getErrMsg(e), 'error'); setDeleting(false) }
  }

  const uploadPhoto = async e => {
    const file = e.target.files?.[0]; if (!file) return
    setUploading(true)
    try { await carsAPI.uploadPhoto(id, file); toast('Foto u ngarkua!', 'success'); load() }
    catch(e) { toast(getErrMsg(e), 'error') }
    finally { setUploading(false); logoRef.current.value='' }
  }

  const deletePhoto = async (pid) => {
    setDeletingPhoto(pid)
    try { await carsAPI.deletePhoto(id, pid); toast('Foto u fshi!', 'success'); load() }
    catch(e) { toast(getErrMsg(e), 'error') }
    finally { setDeletingPhoto(null) }
  }

  const togglePublish = async () => {
    try {
      const r = await carsAPI.update(id, { is_published: !form.is_published })
      setCar(r.data); setForm(r.data)
      toast(r.data.is_published ? 'U publikua!' : 'U fsheh!', 'success')
    } catch(e) { toast(getErrMsg(e), 'error') }
  }

  if (loading) return <div style={{ display:'flex', justifyContent:'center', padding:80 }}><Spinner size={36} /></div>

  return (
    <div className="fade-up">
      <Breadcrumb items={[{label:'Makinat', to:'/cars'}, {label:car?.title}]} />
      <PageHeader title={car?.title}
        actions={<div style={{ display:'flex', gap:10 }}>
          <Button variant={form.is_published ? 'secondary' : 'success'} size="sm" onClick={togglePublish}>
            {form.is_published ? 'Fshih' : 'Publiko'}
          </Button>
          <Button variant="danger" size="sm" onClick={() => setShowDel(true)}>Fshi</Button>
        </div>}
      />

      <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:20 }}>
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          <Card>
            <h3 style={{ fontSize:'.95rem', marginBottom:18 }}>Informacioni</h3>
            <form id="car-edit-form" onSubmit={save} style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <Input label="Titulli *" value={form.title||''} onChange={set('title')} required />
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                <Input label="Marka *" value={form.make||''} onChange={set('make')} required />
                <Input label="Modeli *" value={form.model||''} onChange={set('model')} required />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
                <Input label="Viti" type="number" value={form.year||''} onChange={set('year')} />
                <Select label="Transmisioni" value={form.transmission||''} onChange={set('transmission')} options={TRANS} />
                <Select label="Karburanti" value={form.fuel||''} onChange={set('fuel')} options={FUEL} />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
                <Input label="Vendet" type="number" value={form.seats||''} onChange={set('seats')} />
                <Input label="Çmim/ditë" type="number" value={form.price_per_day||''} onChange={set('price_per_day')} suffix={form.currency} />
                <Input label="Depozitë" type="number" value={form.deposit_amount||''} onChange={set('deposit_amount')} suffix={form.currency} />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                <Select label="Valuta" value={form.currency||'EUR'} onChange={set('currency')} options={CURR} />
                <Input label="Vendndodhja" value={form.location_text||''} onChange={set('location_text')} />
              </div>
              <Select label="Statusi" value={form.status||''} onChange={set('status')} options={STATUS} />
              <Textarea label="Përshkrimi" value={form.description||''} onChange={set('description')} />
              <Button type="submit" loading={saving} style={{ alignSelf:'flex-start' }}>Ruaj ndryshimet</Button>
            </form>
          </Card>

          {/* Photos */}
          <Card>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <h3 style={{ fontSize:'.95rem' }}>Fotot ({car?.photos?.length || 0})</h3>
              <Button variant="secondary" size="sm" loading={uploading} onClick={() => logoRef.current?.click()}
                icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>}>
                Ngarko foto
              </Button>
              <input ref={logoRef} type="file" accept="image/*" style={{ display:'none' }} onChange={uploadPhoto} />
            </div>
            {(!car?.photos || car.photos.length===0) ? (
              <div onClick={() => logoRef.current?.click()} style={{ border:'2px dashed var(--border)', borderRadius:'var(--r)', padding:40, textAlign:'center', cursor:'pointer', color:'var(--text-3)', fontSize:'.875rem', transition:'all var(--t)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.color='var(--accent)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-3)' }}
              >
                Kliko për të ngarkuar fotot e makinës
              </div>
            ) : (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
                {car.photos.map((p, i) => (
                  <div key={p.id} style={{ position:'relative', aspectRatio:'16/9', borderRadius:'var(--r-sm)', overflow:'hidden', background:'var(--bg-3)', border:`2px solid ${i===0 ? 'var(--accent)' : 'transparent'}` }}>
                    <img src={fileUrl(p.path)} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    {i===0 && <span style={{ position:'absolute', top:5, left:5, background:'var(--accent)', color:'#0c0e14', fontSize:'.6rem', fontWeight:800, padding:'2px 7px', borderRadius:99, letterSpacing:'.05em' }}>KRYESORE</span>}
                    <button onClick={() => deletePhoto(p.id)} disabled={deletingPhoto===p.id}
                      style={{ position:'absolute', top:5, right:5, background:'rgba(0,0,0,.7)', border:'none', borderRadius:'var(--r-sm)', color:'white', cursor:'pointer', padding:4, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      {deletingPhoto===p.id ? <Spinner size={12} color="white" /> : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6 6 18M6 6l12 12"/></svg>}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <Card>
            <div style={{ fontSize:'.75rem', color:'var(--text-3)', marginBottom:4 }}>Çmim ditor</div>
            <div style={{ fontSize:'2rem', fontFamily:'var(--f-display)', fontWeight:800, color:'var(--accent)' }}>
              {car?.price_per_day} <span style={{ fontSize:'.9rem' }}>{car?.currency}</span>
            </div>
            <div style={{ fontSize:'.8rem', color:'var(--text-3)', marginTop:6 }}>Depozitë: {car?.deposit_amount} {car?.currency}</div>
          </Card>

          <Card>
            <div style={{ fontSize:'.8rem', color:'var(--text-3)', marginBottom:14, fontWeight:600, letterSpacing:'.04em', textTransform:'uppercase' }}>Detajet</div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {[
                ['Statusi', <Badge key="s" status={car?.status} label={STATUS_L[car?.status]||car?.status} />],
                ['Publikuar', <Badge key="p" status={car?.is_published?'active':'inactive'} label={car?.is_published?'Po':'Jo'} />],
                ['Slug', <code key="sl" style={{ fontSize:'.75rem', background:'var(--bg-4)', padding:'2px 7px', borderRadius:'var(--r-sm)' }}>{car?.slug}</code>],
              ].map(([label, val]) => (
                <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:'.8rem', color:'var(--text-3)' }}>{label}</span>
                  {val}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Confirm open={showDel} onClose={() => setShowDel(false)} onConfirm={deleteCar} loading={deleting}
        title="Fshi makinën" message={`Jeni i sigurt? Makina "${car?.title}" do të fshihet përfundimisht.`} />
    </div>
  )
}
