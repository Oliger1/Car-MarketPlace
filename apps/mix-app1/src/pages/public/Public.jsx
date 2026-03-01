import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { publicAPI, fileUrl } from '../../api/client'
import { safeList } from '../../hooks/useApi'
import { Button, Input, Textarea, Spinner } from '../../components/ui/index'

function PublicNav() {
  return (
    <header style={{ background:'var(--bg-2)', borderBottom:'1px solid var(--border)', padding:'0 40px', height:58, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100 }}>
      <Link to="/" style={{ fontFamily:'var(--f-display)', fontSize:'1.4rem', fontWeight:800, color:'var(--text-1)', textDecoration:'none' }}>
        Mix<span style={{ color:'var(--accent)' }}>.</span>
      </Link>
      <Link to="/login" style={{ padding:'8px 18px', background:'var(--accent)', color:'#0c0e14', borderRadius:'var(--r)', fontWeight:700, textDecoration:'none', fontSize:'.875rem' }}>
        Kyçu
      </Link>
    </header>
  )
}

// ─── Home ─────────────────────────────────────────────────────────────────────
export function PublicHome() {
  const [q, setQ]               = useState('')
  const [city, setCity]         = useState('')
  const [tab, setTab]           = useState('cars') // 'cars' | 'companies'
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
    borderRadius:'var(--r)', padding:'0 14px', height:46,
    color:'var(--text-1)', fontSize:'.9rem', outline:'none',
    fontFamily:'var(--f-body)', transition:'border-color var(--t)',
  }

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>
      <PublicNav />

      {/* Hero */}
      <div style={{ textAlign:'center', padding:'80px 20px 56px', background:'linear-gradient(180deg, var(--bg-2) 0%, var(--bg) 100%)', borderBottom:'1px solid var(--border)' }}>
        <div style={{ display:'inline-block', background:'var(--accent-bg)', border:'1px solid var(--accent-border)', borderRadius:99, padding:'5px 16px', fontSize:'.75rem', fontWeight:700, color:'var(--accent)', letterSpacing:'.06em', textTransform:'uppercase', marginBottom:20 }}>
          Platforma #1 e qiradhënies
        </div>
        <h1 style={{ fontSize:'3rem', marginBottom:14, lineHeight:1.1 }}>
          Gjeni makinën<br /><span style={{ color:'var(--accent)' }}>perfekte</span> për ju
        </h1>
        <p style={{ color:'var(--text-3)', fontSize:'1rem', marginBottom:40, maxWidth:480, margin:'0 auto 40px' }}>
          Qindra makina nga kompanitë më të mira të qiradhënies
        </p>
        <form onSubmit={doSearch} style={{ display:'flex', gap:10, maxWidth:580, margin:'0 auto', flexWrap:'wrap', justifyContent:'center' }}>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Kërko makinë ose kompani..."
            style={{ ...inputStyle, flex:1, minWidth:220 }}
            onFocus={e=>{e.target.style.borderColor='var(--accent)'}}
            onBlur={e=>{e.target.style.borderColor='var(--border)'}}
          />
          <input value={city} onChange={e=>setCity(e.target.value)} placeholder="Qyteti..."
            style={{ ...inputStyle, width:150 }}
            onFocus={e=>{e.target.style.borderColor='var(--accent)'}}
            onBlur={e=>{e.target.style.borderColor='var(--border)'}}
          />
          <Button type="submit" loading={loading} size="lg">Kërko</Button>
        </form>
      </div>

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'40px 24px' }}>
        {/* Tabs */}
        <div style={{ display:'flex', gap:4, marginBottom:28, background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:5, width:'fit-content' }}>
          {[
            { key:'cars', label:'🚗 Makinat', count: cars.length },
            { key:'companies', label:'🏢 Kompanitë', count: companies.length },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              background: tab===t.key ? 'var(--bg-4)' : 'transparent',
              border: `1px solid ${tab===t.key ? 'var(--border-2)' : 'transparent'}`,
              borderRadius:'var(--r)', padding:'8px 18px', cursor:'pointer',
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
          <>
            {cars.length === 0 ? (
              <p style={{ textAlign:'center', color:'var(--text-3)', padding:60 }}>Asnjë makinë u gjet.</p>
            ) : (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:20 }}>
                {cars.map(car => (
                  <Link key={`${car.company_slug}-${car.slug}`} to={`/p/${car.company_slug}/car/${car.slug}`}
                    style={{ background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', overflow:'hidden', textDecoration:'none', display:'block', transition:'all var(--t)' }}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--accent)';e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 8px 32px rgba(0,0,0,.4)'}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none'}}
                  >
                    {/* Car photo */}
                    <div style={{ height:170, background:car.photos?.[0] ? `url(${fileUrl(car.photos[0].path)}) center/cover` : 'var(--bg-3)', display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
                      {!car.photos?.[0] && <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="1"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>}
                      {/* Company badge */}
                      {car.company_name && (
                        <div style={{ position:'absolute', bottom:8, left:8, display:'flex', alignItems:'center', gap:6, background:'rgba(12,14,20,.85)', backdropFilter:'blur(6px)', border:'1px solid var(--border)', borderRadius:99, padding:'4px 10px 4px 4px' }}>
                          {car.company_logo ? (
                            <img src={fileUrl(car.company_logo)} alt={car.company_name} style={{ width:20, height:20, borderRadius:'50%', objectFit:'cover' }} />
                          ) : (
                            <div style={{ width:20, height:20, borderRadius:'50%', background:'var(--accent-bg)', border:'1px solid var(--accent-border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.6rem', fontWeight:800, color:'var(--accent)' }}>
                              {car.company_name[0]}
                            </div>
                          )}
                          <span style={{ fontSize:'.7rem', color:'var(--text-2)', fontWeight:500, maxWidth:120, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{car.company_name}</span>
                        </div>
                      )}
                    </div>
                    {/* Info */}
                    <div style={{ padding:'14px 16px 16px' }}>
                      <div style={{ fontWeight:700, fontSize:'.975rem', color:'var(--text-1)', marginBottom:4 }}>{car.title}</div>
                      <div style={{ fontSize:'.75rem', color:'var(--text-3)', marginBottom:12 }}>
                        {car.year} · {car.transmission==='automatic'?'Automatik':'Manual'} · {car.seats} vende
                        {car.location_text && ` · 📍 ${car.location_text}`}
                      </div>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <div>
                          <span style={{ fontSize:'1.3rem', fontWeight:800, color:'var(--accent)', fontFamily:'var(--f-display)' }}>{car.price_per_day}</span>
                          <span style={{ fontSize:'.78rem', color:'var(--text-3)', marginLeft:4 }}>{car.currency}/ditë</span>
                        </div>
                        <span style={{ fontSize:'.75rem', color:'var(--accent)', fontWeight:600 }}>Shiko →</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {companies.length === 0 ? (
              <p style={{ textAlign:'center', color:'var(--text-3)', padding:60 }}>Asnjë kompani u gjet.</p>
            ) : (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:20 }}>
                {companies.map(co => (
                  <Link key={co.slug} to={`/p/${co.slug}`}
                    style={{ background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', overflow:'hidden', textDecoration:'none', display:'block', transition:'all var(--t)' }}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--accent)';e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 8px 32px rgba(0,0,0,.4)'}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none'}}
                  >
                    <div style={{ height:120, background:co.cover_path?`url(${fileUrl(co.cover_path)}) center/cover`:'var(--bg-3)', position:'relative' }}>
                      <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, transparent 40%, rgba(12,14,20,.7) 100%)' }} />
                      {co.logo_path && <img src={fileUrl(co.logo_path)} alt={co.name} style={{ position:'absolute', bottom:-16, left:14, width:38, height:38, borderRadius:'var(--r-sm)', border:'2px solid var(--bg-2)', objectFit:'cover', background:'var(--bg-2)' }} />}
                    </div>
                    <div style={{ padding:'24px 16px 18px' }}>
                      <div style={{ fontWeight:700, fontSize:'1rem', color:'var(--text-1)', marginBottom:4 }}>{co.name}</div>
                      <div style={{ fontSize:'.75rem', color:'var(--text-3)', marginBottom:10 }}>📍 {co.city}</div>
                      {co.description && <p style={{ fontSize:'.8rem', color:'var(--text-2)', lineHeight:1.5, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{co.description}</p>}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ─── Company Profile ──────────────────────────────────────────────────────────
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

  if (loading) return <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center' }}><Spinner size={36} /></div>
  if (!co) return <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-3)' }}>Kompania nuk u gjet.</div>

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>
      <PublicNav />
      <div style={{ height:240, background:co.cover_path?`url(${fileUrl(co.cover_path)}) center/cover`:'var(--bg-2)', position:'relative' }}>
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, transparent 40%, rgba(12,14,20,.9) 100%)' }} />
      </div>
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 24px' }}>
        <div style={{ display:'flex', alignItems:'flex-end', gap:18, marginTop:-44, marginBottom:32, flexWrap:'wrap' }}>
          {co.logo_path && <img src={fileUrl(co.logo_path)} alt={co.name} style={{ width:72, height:72, borderRadius:'var(--r-lg)', border:'3px solid var(--bg)', objectFit:'cover', background:'var(--bg-2)' }} />}
          <div style={{ flex:1 }}>
            <h1 style={{ fontSize:'1.9rem' }}>{co.name}</h1>
            <div style={{ color:'var(--text-3)', fontSize:'.9rem' }}>📍 {co.city}</div>
          </div>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            {co.phone && <a href={`tel:${co.phone}`} style={{ padding:'9px 18px', background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:'var(--r)', color:'var(--text-1)', textDecoration:'none', fontSize:'.875rem', fontWeight:500 }}>📞 {co.phone}</a>}
            <Button onClick={() => setShowForm(true)}>Bëj kërkesë</Button>
          </div>
        </div>
        {co.description && <p style={{ color:'var(--text-2)', lineHeight:1.7, marginBottom:40, maxWidth:700 }}>{co.description}</p>}
        <h2 style={{ fontSize:'1.2rem', marginBottom:20 }}>Flota jonë</h2>
        {cars.length === 0 ? (
          <p style={{ color:'var(--text-3)', paddingBottom:60 }}>Asnjë makinë disponueshme momentalisht.</p>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:18, paddingBottom:60 }}>
            {cars.map(car => (
              <Link key={car.slug} to={`/p/${slug}/car/${car.slug}`} style={{ background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', overflow:'hidden', textDecoration:'none', transition:'all var(--t)' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--accent)';e.currentTarget.style.transform='translateY(-2px)'}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.transform='translateY(0)'}}>
                <div style={{ height:150, background:car.photos?.[0]?`url(${fileUrl(car.photos[0].path)}) center/cover`:'var(--bg-3)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {!car.photos?.[0] && <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="1"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>}
                </div>
                <div style={{ padding:16 }}>
                  <div style={{ fontWeight:600, marginBottom:6, color:'var(--text-1)' }}>{car.title}</div>
                  <div style={{ fontSize:'.75rem', color:'var(--text-3)', marginBottom:12 }}>{car.year} · {car.transmission==='automatic'?'Automatik':'Manual'} · {car.seats} vende</div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontSize:'1.2rem', fontWeight:800, color:'var(--accent)', fontFamily:'var(--f-display)' }}>{car.price_per_day} <span style={{ fontSize:'.8rem', fontWeight:400, color:'var(--text-3)' }}>{car.currency}/ditë</span></span>
                    <span style={{ fontSize:'.78rem', color:'var(--accent)' }}>Detajet →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <RequestForm open={showForm} onClose={() => setShowForm(false)} companySlug={slug} cars={cars} />
    </div>
  )
}

// ─── Car Public Detail ─────────────────────────────────────────────────────────
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

  if (loading) return <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center' }}><Spinner size={36} /></div>
  if (!car) return <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-3)' }}>Makina nuk u gjet.</div>

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>
      <PublicNav />
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'36px 24px' }}>
        <Link to={`/p/${slug}`} style={{ display:'inline-flex', alignItems:'center', gap:5, color:'var(--text-3)', fontSize:'.85rem', marginBottom:24 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
          Kthehu te kompania
        </Link>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:36 }}>
          <div>
            <div style={{ borderRadius:'var(--r-lg)', overflow:'hidden', height:340, background:'var(--bg-2)', backgroundImage:car.photos?.[activePhoto]?`url(${fileUrl(car.photos[activePhoto].path)})`:'none', backgroundSize:'cover', backgroundPosition:'center', marginBottom:10, display:'flex', alignItems:'center', justifyContent:'center' }}>
              {!car.photos?.[activePhoto] && <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="1"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>}
            </div>
            {car.photos?.length > 1 && (
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {car.photos.map((p,i) => (
                  <div key={p.id} onClick={() => setActivePhoto(i)} style={{ width:64, height:44, borderRadius:'var(--r-sm)', overflow:'hidden', cursor:'pointer', border:`2px solid ${activePhoto===i?'var(--accent)':'transparent'}`, backgroundImage:`url(${fileUrl(p.path)})`, backgroundSize:'cover', backgroundPosition:'center' }} />
                ))}
              </div>
            )}
            {car.description && <div style={{ marginTop:24 }}><h3 style={{ fontSize:'1rem', marginBottom:10 }}>Rreth makinës</h3><p style={{ color:'var(--text-2)', lineHeight:1.7, fontSize:'.9rem' }}>{car.description}</p></div>}
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div>
              <h1 style={{ fontSize:'1.6rem', marginBottom:6 }}>{car.title}</h1>
              {car.location_text && <div style={{ color:'var(--text-3)', fontSize:'.875rem' }}>📍 {car.location_text}</div>}
            </div>
            <div style={{ background:'var(--accent-bg)', border:'1px solid var(--accent-border)', borderRadius:'var(--r-lg)', padding:20 }}>
              <div style={{ fontSize:'.75rem', color:'var(--text-3)', marginBottom:4 }}>Çmim ditor</div>
              <div style={{ fontSize:'2rem', fontFamily:'var(--f-display)', fontWeight:800, color:'var(--accent)' }}>{car.price_per_day} <span style={{ fontSize:'.85rem' }}>{car.currency}</span></div>
              <div style={{ fontSize:'.8rem', color:'var(--text-3)', marginTop:8 }}>Depozitë: {car.deposit_amount} {car.currency}</div>
            </div>
            <div style={{ background:'var(--bg-2)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:'16px 18px' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                {[
                  ['Marka', car.make], ['Modeli', car.model],
                  ['Viti', car.year], ['Vendet', `${car.seats} vende`],
                  ['Transmisioni', car.transmission==='automatic'?'Automatik':'Manual'],
                  ['Karburanti', FUEL_L[car.fuel]||car.fuel],
                ].map(([l,v]) => (
                  <div key={l}>
                    <div style={{ fontSize:'.68rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:2, fontWeight:700 }}>{l}</div>
                    <div style={{ fontSize:'.875rem', fontWeight:500 }}>{v}</div>
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
      <RequestForm open={showForm} onClose={() => setShowForm(false)} companySlug={slug} carSlug={carSlug} />
    </div>
  )
}

// ─── Request Form Modal ───────────────────────────────────────────────────────
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
    <div style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(0,0,0,.78)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', padding:20, animation:'fadeIn .15s ease' }}
      onClick={e => e.target===e.currentTarget && reset()}>
      <div style={{ background:'var(--bg-3)', border:'1px solid var(--border-2)', borderRadius:'var(--r-xl)', width:'100%', maxWidth:460, animation:'fadeUp .2s ease', boxShadow:'var(--shadow-lg)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'18px 22px', borderBottom:'1px solid var(--border)' }}>
          <h3>Kërkesë rezervimi</h3>
          <button onClick={reset} style={{ background:'none', border:'none', color:'var(--text-3)', cursor:'pointer', fontSize:'1.1rem' }}>✕</button>
        </div>
        <div style={{ padding:'22px' }}>
          {done ? (
            <div style={{ textAlign:'center', padding:'20px 0' }}>
              <div style={{ fontSize:'3rem', marginBottom:14 }}>✓</div>
              <h3 style={{ marginBottom:8 }}>Kërkesa u dërgua!</h3>
              <p style={{ color:'var(--text-3)', marginBottom:22, fontSize:'.9rem' }}>Kompania do t'ju kontaktojë së shpejti.</p>
              <Button onClick={reset} variant="secondary">Mbyll</Button>
            </div>
          ) : (
            <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:13 }}>
              {error && <div style={{ background:'var(--red-bg)', border:'1px solid rgba(239,68,68,.3)', borderRadius:'var(--r)', padding:'10px 13px', color:'var(--red)', fontSize:'.875rem' }}>{error}</div>}
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
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:13 }}>
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
