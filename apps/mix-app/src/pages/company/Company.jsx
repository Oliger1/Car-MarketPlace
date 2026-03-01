import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { companyAPI, fileUrl, getErrMsg } from '../../api/client'
import { useToast } from '../../context/ToastContext'
import { PageHeader, Button, Card, Input, Textarea, Spinner, Badge } from '../../components/ui/index'

export default function Company() {
  const toast   = useToast()
  const logoRef = useRef()
  const coverRef= useRef()
  const [co, setCo]           = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [uploadingLogo, setUploadingLogo]   = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [form, setForm] = useState({})

  const load = useCallback(async () => {
    try { const r = await companyAPI.get(); setCo(r.data); setForm(r.data||{}) }
    catch {} finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const set = k => e => setForm(f=>({...f,[k]:e.target.value}))

  const save = async e => {
    e.preventDefault(); setSaving(true)
    try {
      const r = await companyAPI.update({ name:form.name, city:form.city, description:form.description||null, phone:form.phone||null, whatsapp:form.whatsapp||null, website_url:form.website_url||null, is_published:form.is_published })
      setCo(r.data); setForm(r.data)
      toast('Profili u ruajt!', 'success')
    } catch(e) { toast(getErrMsg(e), 'error') }
    finally { setSaving(false) }
  }

  const togglePublish = async () => {
    try {
      const r = await companyAPI.update({ is_published: !form.is_published })
      setCo(r.data); setForm(r.data)
      toast(r.data.is_published ? 'Kompania u publikua!' : 'U fsheh nga publiku!', 'success')
    } catch(e) { toast(getErrMsg(e), 'error') }
  }

  const uploadLogo = async e => {
    const f = e.target.files?.[0]; if (!f) return
    setUploadingLogo(true)
    try { await companyAPI.uploadLogo(f); await load(); toast('Logo u ngarkua!', 'success') }
    catch(e) { toast(getErrMsg(e), 'error') }
    finally { setUploadingLogo(false); logoRef.current.value='' }
  }

  const uploadCover = async e => {
    const f = e.target.files?.[0]; if (!f) return
    setUploadingCover(true)
    try { await companyAPI.uploadCover(f); await load(); toast('Cover photo u ngarkua!', 'success') }
    catch(e) { toast(getErrMsg(e), 'error') }
    finally { setUploadingCover(false); coverRef.current.value='' }
  }

  if (loading) return <div style={{ display:'flex', justifyContent:'center', padding:80 }}><Spinner size={36} /></div>

  return (
    <div className="fade-up">
      <PageHeader title="Profili i kompanisë" subtitle="Ndrysho informacionin dhe pamjen"
        actions={
          <Button variant={form.is_published ? 'secondary' : 'success'} size="sm" onClick={togglePublish}>
            {form.is_published ? 'Fshih nga publiku' : 'Publiko kompaninë'}
          </Button>
        }
      />

      <div style={{ display:'grid', gridTemplateColumns:'1fr 310px', gap:20 }}>
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          <Card>
            <h3 style={{ fontSize:'.95rem', marginBottom:18 }}>Informacioni bazë</h3>
            <form onSubmit={save} style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                <Input label="Emri i kompanisë *" value={form.name||''} onChange={set('name')} required />
                <Input label="Qyteti *" value={form.city||''} onChange={set('city')} required />
              </div>
              <Textarea label="Përshkrimi" value={form.description||''} onChange={set('description')} placeholder="Rreth kompanisë suaj..." />
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                <Input label="Telefon" value={form.phone||''} onChange={set('phone')} placeholder="+355 69..." />
                <Input label="WhatsApp" value={form.whatsapp||''} onChange={set('whatsapp')} placeholder="+355 69..." />
              </div>
              <Input label="Website" type="url" value={form.website_url||''} onChange={set('website_url')} placeholder="https://..." />
              <Button type="submit" loading={saving} style={{ alignSelf:'flex-start' }}>Ruaj ndryshimet</Button>
            </form>
          </Card>

          {/* Cover */}
          <Card>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
              <h3 style={{ fontSize:'.95rem' }}>Cover Photo</h3>
              <Button variant="secondary" size="sm" loading={uploadingCover} onClick={() => coverRef.current?.click()}
                icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>}>
                Ngarko
              </Button>
              <input ref={coverRef} type="file" accept="image/*" style={{ display:'none' }} onChange={uploadCover} />
            </div>
            <div onClick={() => coverRef.current?.click()} style={{ height:160, borderRadius:'var(--r)', background:co?.cover_path?'transparent':'var(--bg-3)', border:'2px dashed var(--border)', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-3)', cursor:'pointer', transition:'all var(--t)' }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--accent)'}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)'}}
            >
              {co?.cover_path ? <img src={fileUrl(co.cover_path)} alt="cover" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <span>Kliko për të ngarkuar cover photo</span>}
            </div>
          </Card>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {/* Logo */}
          <Card>
            <h3 style={{ fontSize:'.85rem', marginBottom:14, color:'var(--text-3)' }}>Logo</h3>
            <div onClick={() => logoRef.current?.click()} style={{ width:96, height:96, borderRadius:'var(--r-lg)', background:'var(--bg-3)', border:'2px dashed var(--border)', margin:'0 auto 14px', cursor:'pointer', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-3)', fontSize:'.75rem', transition:'all var(--t)' }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--accent)'}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)'}}
            >
              {co?.logo_path ? <img src={fileUrl(co.logo_path)} alt="logo" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : 'Logo'}
            </div>
            <input ref={logoRef} type="file" accept="image/*" style={{ display:'none' }} onChange={uploadLogo} />
            <Button variant="secondary" size="sm" loading={uploadingLogo} onClick={() => logoRef.current?.click()} style={{ width:'100%', justifyContent:'center' }}>
              {uploadingLogo ? 'Duke ngarkuar...' : 'Ndrysho logon'}
            </Button>
          </Card>

          {/* Details */}
          <Card>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {[
                ['Statusi', <Badge key="s" status={co?.is_published?'active':'inactive'} label={co?.is_published?'Publik':'Privat'} />],
                ['Slug', <code key="sl" style={{ fontSize:'.75rem', background:'var(--bg-4)', padding:'2px 8px', borderRadius:'var(--r-sm)' }}>{co?.slug}</code>],
              ].map(([l,v]) => (
                <div key={l} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:'.8rem', color:'var(--text-3)' }}>{l}</span>
                  {v}
                </div>
              ))}
            </div>
          </Card>

          {/* Public link */}
          <Card style={{ background:'var(--accent-bg)', border:'1px solid var(--accent-border)' }}>
            <div style={{ fontSize:'.75rem', color:'var(--accent)', fontWeight:700, marginBottom:8, letterSpacing:'.05em', textTransform:'uppercase' }}>Faqja publike</div>
            <p style={{ fontSize:'.8rem', color:'var(--text-3)', marginBottom:12, lineHeight:1.5 }}>
              Klientët mund të shohin kompaninë tuaj dhe të bëjnë kërkesa për rezervim.
            </p>
            <a href={`/p/${co?.slug}`} target="_blank" rel="noreferrer" style={{ display:'block', padding:'9px 13px', background:'var(--bg-3)', borderRadius:'var(--r)', border:'1px solid var(--accent-border)', color:'var(--accent)', fontSize:'.8rem', textDecoration:'none', textAlign:'center', fontWeight:600 }}>
              Shiko faqen publike →
            </a>
          </Card>
        </div>
      </div>
    </div>
  )
}
