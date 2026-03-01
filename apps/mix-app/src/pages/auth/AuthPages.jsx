import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { authAPI, getErrMsg } from '../../api/client'
import { Button, Input, ErrorAlert } from '../../components/ui/index'

function AuthShell({ title, subtitle, children }) {
  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', padding:'40px 20px' }}>
      <div style={{ width:'100%', maxWidth:420, animation:'fadeUp .3s ease' }}>
        <Link to="/" style={{ fontFamily:'var(--f-display)', fontSize:'1.8rem', fontWeight:800, color:'var(--text-1)', display:'block', marginBottom:32 }}>
          Mix<span style={{ color:'var(--accent)' }}>.</span>
        </Link>
        <div style={{ marginBottom:28 }}>
          <h1 style={{ fontSize:'1.5rem', marginBottom:4 }}>{title}</h1>
          <p style={{ color:'var(--text-3)', fontSize:'.9rem' }}>{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Login() {
  const { login }  = useAuth()
  const navigate   = useNavigate()
  const [form, setForm] = useState({ email:'', password:'' })
  const [loading, setLoading] = useState(false)
  const [err, setErr]         = useState('')

  const set = k => e => setForm(f => ({...f, [k]: e.target.value}))

  const submit = async e => {
    e.preventDefault()
    setLoading(true); setErr('')
    try { await login(form.email, form.password); navigate('/dashboard') }
    catch(e) { setErr(getErrMsg(e)) }
    finally { setLoading(false) }
  }

  return (
    <AuthShell title="Mirë se vini" subtitle="Hyni në llogarinë tuaj">
      <ErrorAlert message={err} />
      <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
        <Input label="Email" type="email" value={form.email} onChange={set('email')} placeholder="email@kompania.com" required autoFocus />
        <Input label="Fjalëkalimi" type="password" value={form.password} onChange={set('password')} placeholder="••••••••" required />
        <div style={{ textAlign:'right', marginTop:-8 }}>
          <Link to="/forgot-password" style={{ fontSize:'.8rem', color:'var(--text-3)' }}>Keni harruar fjalëkalimin?</Link>
        </div>
        <Button type="submit" size="lg" loading={loading} style={{ width:'100%' }}>Hyrje</Button>
      </form>
      <p style={{ textAlign:'center', marginTop:28, color:'var(--text-3)', fontSize:'.875rem' }}>
        Nuk keni llogari?{' '}<Link to="/register" style={{ color:'var(--accent)', fontWeight:600 }}>Regjistro kompaninë</Link>
      </p>
    </AuthShell>
  )
}

export function Register() {
  const { register } = useAuth()
  const navigate     = useNavigate()
  const [form, setForm] = useState({ company_name:'', slug:'', city:'', email:'', password:'', phone:'', whatsapp:'' })
  const [loading, setLoading] = useState(false)
  const [err, setErr]         = useState('')

  const set = k => e => {
    const v = e.target.value
    setForm(f => {
      const next = {...f, [k]:v}
      if (k==='company_name') next.slug = v.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'').replace(/^-+|-+$/g,'')
      return next
    })
  }

  const submit = async e => {
    e.preventDefault()
    setLoading(true); setErr('')
    try { await register(form); navigate('/dashboard') }
    catch(e) { setErr(getErrMsg(e)) }
    finally { setLoading(false) }
  }

  return (
    <AuthShell title="Regjistro kompaninë" subtitle="Fillo provën 14-ditore falas">
      <ErrorAlert message={err} />
      <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <Input label="Emri i kompanisë *" value={form.company_name} onChange={set('company_name')} placeholder="Auto Plus" required autoFocus />
          <Input label="Qyteti *" value={form.city} onChange={set('city')} placeholder="Tiranë" required />
        </div>
        <Input label="Slug (URL) *" value={form.slug} onChange={set('slug')} placeholder="auto-plus" required hint="Vetëm shkronja, numra dhe vizë" />
        <Input label="Email *" type="email" value={form.email} onChange={set('email')} placeholder="info@autoplus.al" required />
        <Input label="Fjalëkalimi *" type="password" value={form.password} onChange={set('password')} placeholder="Min. 8 karaktere" required />
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <Input label="Telefon" value={form.phone} onChange={set('phone')} placeholder="+355 69..." />
          <Input label="WhatsApp" value={form.whatsapp} onChange={set('whatsapp')} placeholder="+355 69..." />
        </div>
        <Button type="submit" size="lg" loading={loading} style={{ width:'100%', marginTop:4 }}>Krijo llogarinë</Button>
      </form>
      <p style={{ textAlign:'center', marginTop:24, color:'var(--text-3)', fontSize:'.875rem' }}>
        Keni llogari?{' '}<Link to="/login" style={{ color:'var(--accent)', fontWeight:600 }}>Hyrje</Link>
      </p>
    </AuthShell>
  )
}

export function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [err, setErr]   = useState('')

  const submit = async e => {
    e.preventDefault()
    setLoading(true); setErr('')
    try { await authAPI.forgotPassword(email); setSent(true) }
    catch(e) { setErr(getErrMsg(e)) }
    finally { setLoading(false) }
  }

  return (
    <AuthShell title="Fjalëkalim i harruar" subtitle="Do të dërgojmë udhëzimet në email">
      <Link to="/login" style={{ display:'inline-flex', alignItems:'center', gap:5, color:'var(--text-3)', fontSize:'.85rem', marginBottom:20 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
        Kthehu
      </Link>
      {sent ? (
        <div style={{ background:'var(--green-bg)', border:'1px solid rgba(34,197,94,.3)', borderRadius:'var(--r)', padding:16, color:'var(--green)', textAlign:'center' }}>
          ✓ Udhëzimet u dërguan! Kontrolloni emailin.
        </div>
      ) : (
        <>
          <ErrorAlert message={err} />
          <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <Input label="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="email@kompania.com" required autoFocus />
            <Button type="submit" size="lg" loading={loading} style={{ width:'100%' }}>Dërgo udhëzimet</Button>
          </form>
        </>
      )}
    </AuthShell>
  )
}

export function ResetPassword() {
  const [sp] = useSearchParams()
  const token = sp.get('token') || ''
  const [pwd, setPwd] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [err, setErr]   = useState('')

  const submit = async e => {
    e.preventDefault()
    setLoading(true); setErr('')
    try { await authAPI.resetPassword({ token, new_password: pwd }); setDone(true) }
    catch(e) { setErr(getErrMsg(e)) }
    finally { setLoading(false) }
  }

  return (
    <AuthShell title="Rivendos fjalëkalimin" subtitle="Shkruani fjalëkalimin tuaj të ri">
      {done ? (
        <div style={{ background:'var(--green-bg)', border:'1px solid rgba(34,197,94,.3)', borderRadius:'var(--r)', padding:16, color:'var(--green)', textAlign:'center' }}>
          ✓ Fjalëkalimi u ndryshua!{' '}<Link to="/login" style={{ color:'var(--green)', textDecoration:'underline' }}>Hyni tani</Link>
        </div>
      ) : (
        <>
          <ErrorAlert message={err} />
          <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <Input label="Fjalëkalimi i ri" type="password" value={pwd} onChange={e=>setPwd(e.target.value)} placeholder="Min. 8 karaktere" required autoFocus />
            <Button type="submit" size="lg" loading={loading} style={{ width:'100%' }}>Ndrysho fjalëkalimin</Button>
          </form>
        </>
      )}
    </AuthShell>
  )
}
