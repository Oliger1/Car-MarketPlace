import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { publicAPI, fileUrl } from '../../api/client'
import { safeList } from '../../hooks/useApi'
import { Button, Input, Textarea, Spinner } from '../../components/ui/index'

function PublicNav() {
  return (
    <header className="pub-nav">
      <Link to="/" style={{ display:'flex', alignItems:'center', gap:10, color:'var(--text-1)', textDecoration:'none' }}>
        <span className="logo-mark">M</span>
        <span style={{ fontFamily:'var(--f-display)', fontSize:'1.35rem', fontWeight:800 }}>Mix<span style={{ color:'var(--accent)' }}>.</span></span>
      </Link>
      <nav style={{ display:'flex', alignItems:'center', gap:8 }}>
        <Link to="/" style={{ color:'var(--text-2)', fontSize:'.875rem', padding:'8px 12px', borderRadius:10, textDecoration:'none' }}>Tregu</Link>
        <Link to="/login" style={{ color:'var(--text-2)', fontSize:'.875rem', padding:'8px 12px', borderRadius:10, textDecoration:'none' }}>Kyçu</Link>
        <Link to="/register" style={{ padding:'9px 16px', background:'var(--accent)', color:'#0c0e14', borderRadius:11, fontWeight:700, textDecoration:'none', fontSize:'.85rem' }}>
          Hap kompaninë
        </Link>
      </nav>
    </header>
  )
}

function PublicFooter() {
  return (
    <footer className="pub-footer">
      <div style={{ maxWidth:1200, margin:'0 auto', display:'flex', justifyContent:'space-between', gap:24, flexWrap:'wrap' }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
            <span className="logo-mark" style={{ width:28, height:28, fontSize:'.85rem', borderRadius:9 }}>M</span>
            <strong style={{ color:'var(--text-1)', fontFamily:'var(--f-display)' }}>Mix.</strong>
          </div>
          <p>Platforma për qiradhënie makinash në Shqipëri e Kosovë.</p>
        </div>
        <div style={{ display:'flex', gap:22, alignItems:'center' }}>
          <Link to="/" style={{ color:'var(--text-3)' }}>Tregu</Link>
          <Link to="/login" style={{ color:'var(--text-3)' }}>Kyçu</Link>
          <Link to="/register" style={{ color:'var(--text-3)' }}>Regjistrohu</Link>
        </div>
      </div>
    </footer>
  )
}

function CarIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="1.2">
      <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2"/>
      <circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>
    </svg>
  )
}

function CarCard({ car, to }) {
  return (
    <Link to={to} className="car-card">
      <div style={{ height:196, background:car.photos?.[0] ? `url(${fileUrl(car.photos[0].path)}) center/cover` : 'var(--bg-3)', display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
        {!car.photos?.[0] && <CarIcon />}
        <div style={{ position:'absolute', top:12, right:12, background:'rgba(8,9,13,.78)', border:'1px solid var(--accent-border)', borderRadius:99, padding:'5px 11px', backdropFilter:'blur(8px)' }}>
          <span style={{ fontFamily:'var(--f-display)', fontWeight:800, color:'var(--accent)', fontSize:'1rem' }}>{car.price_per_day}</span>
          <span style={{ fontSize:'.7rem', color:'var(--text-2)', marginLeft:4 }}>{car.currency}/ditë</span>
        </div>
        {car.company_name && (
          <div style={{ position:'absolute', bottom:10, left:10, display:'flex', alignItems:'center', gap:7, background:'rgba(8,9,13,.82)', backdropFilter:'blur(8px)', border:'1px solid var(--border)', borderRadius:99, padding:'4px 10px 4px 4px' }}>
            {car.company_logo ? (
              <img src={fileUrl(car.company_logo)} alt={car.company_name} style={{ width:22, height:22, borderRadius:'50%', objectFit:'cover' }} />
            ) : (
              <div style={{ width:22, height:22, borderRadius:'50%', background:'var(--accent-bg)', border:'1px solid var(--accent-border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.62rem', fontWeight:800, color:'var(--accent)' }}>
                {car.company_name[0]}
              </div>
            )}
            <span style={{ fontSize:'.72rem', color:'var(--text-2)', fontWeight:500, maxWidth:130, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{car.company_name}</span>
          </div>
        )}
      </div>
      <div style={{ padding:'16px 16px 18px' }}>
        <div style={{ fontWeight:700, fontSize:'1.02rem', color:'var(--text-1)', marginBottom:5 }}>{car.title}</div>
        <div style={{ fontSize:'.78rem', color:'var(--text-3)' }}>
          {car.year} · {car.transmission==='automatic'?'Automatik':'Manual'} · {car.seats} vende
          {car.location_text && ` · ${car.location_text}`}
        </div>
      </div>
    </Link>
  )
}

export function PublicHome() {
  const [q, setQ]               = useState('')
  const [city, setCity]         = useState('')
  const [tab, setTab]           = useState('cars')
  const [companies, setCompanies] = useState([])
  const [cars, setCars]           = useState([])
  const [loading, setLoading]   = useState(true)

  const loadAll = async (params = {}) => {
    setLoading(true)
    try {
      const [coRes, carRes] = await Promise.allSettled([
        publicAPI.searchCompanies(params),
        publicAPI.searchCars(params),
      ])
      if (coRes.status === 'fulfilled')  setCompanies(safeList(coRes.value?.data).items)
      if (carRes.status === 'fulfilled') setCars(safeList(carRes.value?.data).items)
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => { loadAll() }, [])

  const doSearch = e => {
    e?.preventDefault()
    loadAll({ ...(q ? {q} : {}), ...(city ? {city} : {}) })
  }

  const inputStyle = {
    background:'var(--bg-3)', border:'1.5px solid var(--border)',
    borderRadius:12, padding:'0 16px', height:50,
    color:'var(--text-1)', fontSize:'.95rem', outline:'none',
    fontFamily:'var(--f-body)', transition:'border-color var(--t)',
  }

  return (
    <div style={{ minHeight:'100vh' }}>
      <PublicNav />

      <div className="pub-hero">
        <div style={{ position:'relative' }}>
          <div style={{ display:'inline-block', background:'var(--accent-bg)', border:'1px solid var(--accent-border)', borderRadius:99, padding:'6px 14px', fontSize:'.72rem', fontWeight:700, color:'var(--accent)', letterSpacing:'.1em', textTransform:'uppercase', marginBottom:22 }}>
            Tregu i qiradhënies
          </div>
          <h1 style={{ fontSize:'clamp(2.4rem, 6vw, 4.2rem)', marginBottom:16, lineHeight:1.02 }}>
            Gjeni makinën<br />
            <span style={{ color:'var(--accent-2)' }}>që ju çon më larg.</span>
          </h1>
          <p style={{ color:'var(--text-2)', fontSize:'1.05rem', maxWidth:480, margin:'0 auto 40px', lineHeight:1.65 }}>
            Flota e kompanive rent-a-car, e hapur për kërkesa. Pa ndërmjetës, direkt te pronari.
          </p>
          <form onSubmit={doSearch} style={{
            display:'flex', gap:10, maxWidth:640, margin:'0 auto', flexWrap:'wrap', justifyContent:'center',
            background:'rgba(16,19,26,.72)', border:'1px solid var(--border-2)', borderRadius:18, padding:10,
            backdropFilter:'blur(16px)', boxShadow:'var(--shadow)',
          }}>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Makinë, markë ose kompani"
              style={{ ...inputStyle, flex:1, minWidth:200, border:'none', background:'var(--bg)' }}
            />
            <input value={city} onChange={e=>setCity(e.target.value)} placeholder="Qyteti"
              style={{ ...inputStyle, width:140, border:'none', background:'var(--bg)' }}
            />
            <Button type="submit" loading={loading} size="lg">Kërko</Button>
          </form>
          <div style={{ display:'flex', justifyContent:'center', gap:36, marginTop:36, color:'var(--text-3)', fontSize:'.82rem', flexWrap:'wrap' }}>
            <div><strong style={{ color:'var(--text-1)', fontFamily:'var(--f-display)', fontSize:'1.25rem', display:'block' }}>{cars.length}</strong>makina</div>
            <div><strong style={{ color:'var(--text-1)', fontFamily:'var(--f-display)', fontSize:'1.25rem', display:'block' }}>{companies.length}</strong>kompani</div>
            <div><strong style={{ color:'var(--text-1)', fontFamily:'var(--f-display)', fontSize:'1.25rem', display:'block' }}>24/7</strong>kërkesa</div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'44px 24px 0' }}>
        <div style={{ display:'flex', gap:4, marginBottom:28, background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:14, padding:5, width:'fit-content' }}>
          {[
            { key:'cars', label:'Makinat', count: cars.length },
            { key:'companies', label:'Kompanitë', count: companies.length },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              background: tab===t.key ? 'var(--bg-4)' : 'transparent',
              border: `1px solid ${tab===t.key ? 'var(--border-2)' : 'transparent'}`,
              borderRadius:11, padding:'9px 18px', cursor:'pointer',
              color: tab===t.key ? 'var(--text-1)' : 'var(--text-3)',
              fontWeight: tab===t.key ? 600 : 400, fontSize:'.875rem',
              fontFamily:'var(--f-body)', transition:'all var(--t)',
              display:'flex', alignItems:'center', gap:8,
            }}>
              {t.label}
              <span style={{ background:'var(--bg-5)', borderRadius:99, padding:'1px 8px', fontSize:'.7rem', fontWeight:700 }}>{t.count}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:80 }}><Spinner size={36} /></div>
        ) : tab === 'cars' ? (
          cars.length === 0 ? (
            <p style={{ textAlign:'center', color:'var(--text-3)', padding:60 }}>Asnjë makinë nuk u gjet.</p>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:20 }}>
              {cars.map(car => (
                <CarCard key={`${car.company_slug}-${car.slug}`} car={car} to={`/p/${car.company_slug}/car/${car.slug}`} />
              ))}
            </div>
          )
        ) : (
          companies.length === 0 ? (
            <p style={{ textAlign:'center', color:'var(--text-3)', padding:60 }}>Asnjë kompani nuk u gjet.</p>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:20 }}>
              {companies.map(co => (
                <Link key={co.slug} to={`/p/${co.slug}`} className="co-card">
                  <div style={{ height:140, background:co.cover_path?`url(${fileUrl(co.cover_path)}) center/cover`:'var(--bg-3)', position:'relative' }}>
                    <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, transparent 30%, rgba(8,9,13,.75) 100%)' }} />
                    {co.logo_path && <img src={fileUrl(co.logo_path)} alt={co.name} style={{ position:'absolute', bottom:-18, left:16, width:44, height:44, borderRadius:12, border:'2px solid var(--bg-2)', objectFit:'cover', background:'var(--bg-2)' }} />}
                  </div>
                  <div style={{ padding:'28px 18px 20px' }}>
                    <div style={{ fontWeight:700, fontSize:'1.08rem', color:'var(--text-1)', marginBottom:4 }}>{co.name}</div>
                    <div style={{ fontSize:'.78rem', color:'var(--text-3)', marginBottom:10 }}>{co.city}</div>
                    {co.description && <p style={{ fontSize:'.84rem', color:'var(--text-2)', lineHeight:1.55, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{co.description}</p>}
                  </div>
                </Link>
              ))}
            </div>
          )
        )}
      </div>
      <PublicFooter />
    </div>
  )
}

export function PublicCompany() {
  const { slug } = useParams()
  const [co, setCo]         = useState(null)
  const [cars, setCars]     = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    let cancelled = false
    Promise.allSettled([publicAPI.getCompany(slug), publicAPI.getCompanyCars(slug)]).then(([cr, car]) => {
      if (cancelled) return
      if (cr.status==='fulfilled') setCo(cr.value?.data)
      if (car.status==='fulfilled') setCars(safeList(car.value?.data).items)
    }).finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [slug])

  if (loading) return <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}><Spinner size={36} /></div>
  if (!co) return <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-3)' }}>Kompania nuk u gjet.</div>

  return (
    <div style={{ minHeight:'100vh' }}>
      <PublicNav />
      <div style={{ height:280, background:co.cover_path?`url(${fileUrl(co.cover_path)}) center/cover`:'var(--bg-2)', position:'relative' }}>
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, rgba(8,9,13,.15) 20%, rgba(8,9,13,.92) 100%)' }} />
      </div>
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 24px' }}>
        <div style={{ display:'flex', alignItems:'flex-end', gap:20, marginTop:-52, marginBottom:36, flexWrap:'wrap' }}>
          {co.logo_path
            ? <img src={fileUrl(co.logo_path)} alt={co.name} style={{ width:88, height:88, borderRadius:20, border:'3px solid var(--bg)', objectFit:'cover', background:'var(--bg-2)', boxShadow:'var(--shadow)' }} />
            : <span className="logo-mark" style={{ width:88, height:88, borderRadius:20, fontSize:'2rem' }}>{co.name?.[0]}</span>
          }
          <div style={{ flex:1 }}>
            <h1 style={{ fontSize:'2.1rem' }}>{co.name}</h1>
            <div style={{ color:'var(--text-2)', fontSize:'.95rem' }}>{co.city}</div>
          </div>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            {co.phone && <a href={`tel:${co.phone}`} style={{ padding:'10px 18px', background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:12, color:'var(--text-1)', textDecoration:'none', fontSize:'.875rem', fontWeight:500 }}>{co.phone}</a>}
            <Button onClick={() => setShowForm(true)}>Bëj kërkesë</Button>
          </div>
        </div>
        {co.description && <p style={{ color:'var(--text-2)', lineHeight:1.75, marginBottom:40, maxWidth:680, fontSize:'1.02rem' }}>{co.description}</p>}
        <h2 style={{ fontSize:'1.35rem', marginBottom:20 }}>Flota</h2>
        {cars.length === 0 ? (
          <p style={{ color:'var(--text-3)', paddingBottom:60 }}>Asnjë makinë e publikuar momentalisht.</p>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:18, paddingBottom:20 }}>
            {cars.map(car => (
              <CarCard key={car.slug} car={car} to={`/p/${slug}/car/${car.slug}`} />
            ))}
          </div>
        )}
      </div>
      <PublicFooter />
      <RequestForm open={showForm} onClose={() => setShowForm(false)} companySlug={slug} cars={cars} />
    </div>
  )
}

export function PublicCar() {
  const { slug, carSlug } = useParams()
  const [car, setCar]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [activePhoto, setActivePhoto] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const FUEL_L = { petrol:'Benzinë', diesel:'Dizël', hybrid:'Hibrid', electric:'Elektrik' }

  useEffect(() => {
    publicAPI.getCar(slug, carSlug).then(r => setCar(r.data)).catch(()=>{}).finally(() => setLoading(false))
  }, [slug, carSlug])

  if (loading) return <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}><Spinner size={36} /></div>
  if (!car) return <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-3)' }}>Makina nuk u gjet.</div>

  return (
    <div style={{ minHeight:'100vh' }}>
      <PublicNav />
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'36px 24px 0' }}>
        <Link to={`/p/${slug}`} style={{ display:'inline-flex', alignItems:'center', gap:5, color:'var(--text-3)', fontSize:'.85rem', marginBottom:24 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
          Kthehu te kompania
        </Link>
        <div className="split-layout wide-aside">
          <div>
            <div style={{ borderRadius:22, overflow:'hidden', height:380, background:'var(--bg-2)', backgroundImage:car.photos?.[activePhoto]?`url(${fileUrl(car.photos[activePhoto].path)})`:'none', backgroundSize:'cover', backgroundPosition:'center', marginBottom:12, display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid var(--border)' }}>
              {!car.photos?.[activePhoto] && <CarIcon />}
            </div>
            {car.photos?.length > 1 && (
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {car.photos.map((p,i) => (
                  <div key={p.id} onClick={() => setActivePhoto(i)} style={{ width:72, height:50, borderRadius:10, overflow:'hidden', cursor:'pointer', border:`2px solid ${activePhoto===i?'var(--accent)':'transparent'}`, backgroundImage:`url(${fileUrl(p.path)})`, backgroundSize:'cover', backgroundPosition:'center' }} />
                ))}
              </div>
            )}
            {car.description && (
              <div style={{ marginTop:28 }}>
                <h3 style={{ fontSize:'1.1rem', marginBottom:10 }}>Rreth makinës</h3>
                <p style={{ color:'var(--text-2)', lineHeight:1.75, fontSize:'.98rem' }}>{car.description}</p>
              </div>
            )}
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:16, position:'sticky', top:88 }}>
            <div>
              <h1 style={{ fontSize:'1.85rem', marginBottom:6 }}>{car.title}</h1>
              {car.location_text && <div style={{ color:'var(--text-3)', fontSize:'.875rem' }}>{car.location_text}</div>}
            </div>
            <div style={{ background:'var(--accent-bg)', border:'1px solid var(--accent-border)', borderRadius:20, padding:22 }}>
              <div style={{ fontSize:'.72rem', color:'var(--text-3)', marginBottom:4, letterSpacing:'.08em', textTransform:'uppercase', fontWeight:700 }}>Çmim ditor</div>
              <div style={{ fontSize:'2.2rem', fontFamily:'var(--f-display)', fontWeight:800, color:'var(--accent-2)' }}>{car.price_per_day} <span style={{ fontSize:'.85rem' }}>{car.currency}</span></div>
              <div style={{ fontSize:'.82rem', color:'var(--text-3)', marginTop:8 }}>Depozitë: {car.deposit_amount} {car.currency}</div>
            </div>
            <div style={{ background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:20, padding:'18px 20px' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                {[
                  ['Marka', car.make], ['Modeli', car.model],
                  ['Viti', car.year], ['Vendet', `${car.seats} vende`],
                  ['Transmisioni', car.transmission==='automatic'?'Automatik':'Manual'],
                  ['Karburanti', FUEL_L[car.fuel]||car.fuel],
                ].map(([l,v]) => (
                  <div key={l}>
                    <div style={{ fontSize:'.68rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:3, fontWeight:700 }}>{l}</div>
                    <div style={{ fontSize:'.9rem', fontWeight:550 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
            <Button size="lg" onClick={() => setShowForm(true)} style={{ width:'100%', justifyContent:'center' }}>
              Bëj kërkesë rezervimi
            </Button>
          </div>
        </div>
      </div>
      <PublicFooter />
      <RequestForm open={showForm} onClose={() => setShowForm(false)} companySlug={slug} carSlug={carSlug} />
    </div>
  )
}

function RequestForm({ open, onClose, companySlug, carSlug, cars = [] }) {
  const [f, setF] = useState({ name:'', phone:'', date_from:'', date_to:'', car_slug:carSlug||'', message:'' })
  const [loading, setLoading] = useState(false)
  const [done, setDone]   = useState(false)
  const [error, setError] = useState('')
  const set = k => e => setF(p=>({...p,[k]:e.target.value}))

  const submit = async e => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      await publicAPI.createBookingRequest({ company_slug:companySlug, car_slug:f.car_slug||null, requester_name:f.name, requester_phone:f.phone, date_from:f.date_from||null, date_to:f.date_to||null, message:f.message||null })
      setDone(true)
    } catch(e) {
      const d = e?.response?.data?.detail
      setError(typeof d==='string' ? d : Array.isArray(d) ? d[0]?.msg : 'Gabim. Provoni sërish.')
    }
    finally { setLoading(false) }
  }

  const reset = () => { setDone(false); setF({name:'',phone:'',date_from:'',date_to:'',car_slug:carSlug||'',message:''}); onClose() }

  if (!open) return null
  return (
    <div style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(0,0,0,.78)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', padding:20, animation:'fadeIn .15s ease' }}
      onClick={e => e.target===e.currentTarget && reset()}>
      <div style={{ background:'var(--bg-3)', border:'1px solid var(--border-2)', borderRadius:24, width:'100%', maxWidth:460, animation:'fadeUp .2s ease', boxShadow:'var(--shadow-lg)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'20px 24px', borderBottom:'1px solid var(--border)' }}>
          <h3>Kërkesë rezervimi</h3>
          <button onClick={reset} style={{ background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', fontSize:'1.1rem' }}>✕</button>
        </div>
        <div style={{ padding:24 }}>
          {done ? (
            <div style={{ textAlign:'center', padding:'20px 0' }}>
              <div style={{ width:56, height:56, borderRadius:'50%', background:'var(--green-bg)', color:'var(--green)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.6rem', margin:'0 auto 16px' }}>✓</div>
              <h3 style={{ marginBottom:8 }}>Kërkesa u dërgua</h3>
              <p style={{ color:'var(--text-3)', marginBottom:22, fontSize:'.9rem' }}>Kompania do t’ju kontaktojë së shpejti.</p>
              <Button onClick={reset} variant="secondary">Mbyll</Button>
            </div>
          ) : (
            <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:13 }}>
              {error && <div style={{ background:'var(--red-bg)', border:'1px solid rgba(248,113,113,.3)', borderRadius:'var(--r)', padding:'10px 13px', color:'var(--red)', fontSize:'.875rem' }}>{error}</div>}
              <Input label="Emri juaj *" value={f.name} onChange={set('name')} placeholder="Artan Hoxha" required />
              <Input label="Telefoni *" value={f.phone} onChange={set('phone')} placeholder="+355 69..." required />
              {cars.length > 0 && (
                <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                  <label style={{ fontSize:'.78rem', fontWeight:600, letterSpacing:'.04em', textTransform:'uppercase', color:'var(--text-2)' }}>Makina (opsional)</label>
                  <select value={f.car_slug} onChange={set('car_slug')} style={{ background:'var(--bg-3)', border:'1.5px solid var(--border)', borderRadius:'var(--r)', padding:'0 13px', height:40, color:'var(--text-1)', fontSize:'.9rem', outline:'none', fontFamily:'var(--f-body)' }}>
                    <option value="">— Pa preferencë —</option>
                    {cars.map(c=><option key={c.slug} value={c.slug}>{c.title}</option>)}
                  </select>
                </div>
              )}
              <div className="form-grid-2">
                <Input label="Nga data" type="date" value={f.date_from} onChange={set('date_from')} />
                <Input label="Deri" type="date" value={f.date_to} onChange={set('date_to')} />
              </div>
              <Textarea label="Mesazhi (opsional)" value={f.message} onChange={set('message')} placeholder="Çfarë dëshironi të pyesni..." />
              <Button type="submit" loading={loading} size="lg" style={{ width:'100%', justifyContent:'center', marginTop:4 }}>Dërgo kërkesën</Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
