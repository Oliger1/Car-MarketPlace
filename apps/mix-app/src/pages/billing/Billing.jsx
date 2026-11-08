import { useState, useEffect } from 'react'
import { billingAPI, getErrMsg } from '../../api/client'
import { useToast } from '../../context/ToastContext'
import { PageHeader, Button, Badge, Card, Spinner } from '../../components/ui/index'

const fmtDate = d => d ? new Date(d).toLocaleDateString('sq-AL', { day:'2-digit', month:'long', year:'numeric' }) : '—'
const STATUS_L = { active:'Aktiv', trial:'Provë', expired:'Skaduar', cancelled:'Anuluar' }

function PlanCard({ plan, currentPlanId, status, onSelect, loadingId }) {
  const active = currentPlanId === plan.id
  const toast  = useToast()

  return (
    <div style={{
      background: active ? 'var(--accent-bg)' : 'var(--bg-2)',
      border: `2px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
      borderRadius: 'var(--r-xl)', padding: 28, position: 'relative',
      transition: 'all var(--t)',
      backgroundImage: active ? 'linear-gradient(180deg, rgba(240,180,41,0.08), transparent 50%)' : 'linear-gradient(180deg, rgba(255,255,255,0.03), transparent 40%)',
    }}>
      {active && (
        <div style={{ position:'absolute', top:-12, left:'50%', transform:'translateX(-50%)', background:'var(--accent)', color:'#0c0e14', padding:'3px 14px', borderRadius:99, fontSize:'.68rem', fontWeight:800, letterSpacing:'.06em', whiteSpace:'nowrap' }}>
          PLANI AKTUAL
        </div>
      )}
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:'1.05rem', fontWeight:700, fontFamily:'var(--f-display)', marginBottom:12 }}>{plan.name}</div>
        <div>
          <span style={{ fontSize:'2.2rem', fontWeight:800, fontFamily:'var(--f-display)', color: active ? 'var(--accent)' : 'var(--text-1)' }}>€{plan.price_monthly}</span>
          <span style={{ color:'var(--text-3)', fontSize:'.875rem' }}>/muaj</span>
        </div>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:9, marginBottom:24 }}>
        {[
          `Deri në ${plan.car_limit} makina`,
          'Rezervime të pakufizuara',
          'Faqe publike',
          'Menaxhim klientësh',
          'Kërkesat nga publiku',
        ].map(f => (
          <div key={f} style={{ display:'flex', alignItems:'center', gap:8, fontSize:'.875rem', color:'var(--text-2)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"/></svg>
            {f}
          </div>
        ))}
      </div>
      <Button
        variant={active ? 'secondary' : 'primary'}
        disabled={active}
        loading={loadingId === plan.id}
        onClick={() => !active && onSelect(plan.id)}
        style={{ width:'100%', justifyContent:'center' }}
      >
        {active ? 'Plani aktual' : 'Zgjedh planin'}
      </Button>
    </div>
  )
}

export default function Billing() {
  const toast = useToast()
  const [sub, setSub]         = useState(null)
  const [plans, setPlans]     = useState([])
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectingId, setSelectingId] = useState(null)

  useEffect(() => {
    let cancelled = false
    Promise.allSettled([billingAPI.getSubscription(), billingAPI.getPlans(), billingAPI.getInvoices()]).then(([s,p,i]) => {
      if (cancelled) return
      if (s.status==='fulfilled') setSub(s.value?.data)
      if (p.status==='fulfilled') setPlans(Array.isArray(p.value?.data) ? p.value.data : [])
      if (i.status==='fulfilled') setInvoices(Array.isArray(i.value?.data?.items) ? i.value.data.items : [])
    }).finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const selectPlan = async (planId) => {
    setSelectingId(planId)
    try { const r = await billingAPI.choosePlan(planId); setSub(r.data); toast('Plani u ndryshua!', 'success') }
    catch(e) { toast(getErrMsg(e), 'error') }
    finally { setSelectingId(null) }
  }

  if (loading) return <div style={{ display:'flex', justifyContent:'center', padding:80 }}><Spinner size={36} /></div>

  return (
    <div className="fade-up">
      <PageHeader title="Abonimi" subtitle="Menaxho planin dhe pagesat" />

      {sub && (
        <Card style={{ marginBottom:28, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
          <div>
            <div style={{ fontSize:'.72rem', color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:5, fontWeight:600 }}>Abonimi aktual</div>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <h2 style={{ fontSize:'1.4rem' }}>{sub.plan?.name}</h2>
              <Badge status={sub.status} label={STATUS_L[sub.status]||sub.status} />
            </div>
          </div>
          <div style={{ textAlign:'right' }}>
            {sub.trial_until && <div style={{ fontSize:'.875rem', color:'var(--yellow)' }}>Prova skadon: {fmtDate(sub.trial_until)}</div>}
            {sub.active_until && <div style={{ fontSize:'.875rem', color:'var(--text-3)' }}>Aktiv deri: {fmtDate(sub.active_until)}</div>}
          </div>
        </Card>
      )}

      {plans.length > 0 && (
        <>
          <h3 style={{ fontSize:'1.05rem', marginBottom:18 }}>Zgjedh planin</h3>
          <div className="plans-grid">
            {plans.map(plan => (
              <PlanCard key={plan.id} plan={plan} currentPlanId={sub?.plan_id} status={sub?.status} onSelect={selectPlan} loadingId={selectingId} />
            ))}
          </div>
        </>
      )}

      {invoices.length > 0 && (
        <>
          <h3 style={{ fontSize:'1.05rem', marginBottom:16 }}>Faturat</h3>
          <Card padding={0}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr>
                  {['Data','Shuma','Statusi'].map(h => (
                    <th key={h} style={{ padding:'10px 18px', textAlign:'left', fontSize:'.72rem', fontWeight:700, letterSpacing:'.06em', textTransform:'uppercase', color:'var(--text-3)', borderBottom:'1px solid var(--border)', fontFamily:'var(--f-body)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv,i) => (
                  <tr key={i} style={{ borderBottom:'1px solid var(--border)' }}>
                    <td style={{ padding:'12px 18px', fontSize:'.875rem' }}>{fmtDate(inv.created_at)}</td>
                    <td style={{ padding:'12px 18px', fontSize:'.875rem', fontWeight:600, color:'var(--accent)' }}>{inv.amount}</td>
                    <td style={{ padding:'12px 18px' }}><Badge status={inv.status} label={inv.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  )
}
