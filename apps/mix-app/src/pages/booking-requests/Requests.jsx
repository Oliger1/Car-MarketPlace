import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { requestsApi, carsApi, customersApi } from '../../api/client'
import { Button, Badge, EmptyState, PageLoader, Pagination, Modal, Input, Select } from '../../components/ui'
import PageHeader from '../../components/PageHeader'
import toast from 'react-hot-toast'

// ─── Requests List ────────────────────────────────────────────────────────────
export function RequestsList() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 20

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const res = await requestsApi.list({ status: status || undefined, page, limit })
      const data = res.data
      if (Array.isArray(data)) {
        setRequests(data)
        setTotal(data.length)
      } else {
        setRequests(data.items || [])
        setTotal(data.total || 0)
      }
    } catch {
      toast.error('Gabim gjatë ngarkimit')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRequests() }, [status, page])

  const statusOptions = [
    { value: '', label: 'Të gjitha' },
    { value: 'new', label: 'Të reja' },
    { value: 'contacted', label: 'Kontaktuar' },
    { value: 'converted', label: 'Konvertuar' },
    { value: 'spam', label: 'Spam' },
  ]

  return (
    <div>
      <PageHeader title="Kërkesat" subtitle={`${total} kërkesa`} />

      <div className="flex flex-wrap gap-2 mb-6">
        {statusOptions.map(opt => (
          <button
            key={opt.value}
            onClick={() => { setStatus(opt.value); setPage(1) }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              status === opt.value
                ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                : 'text-surface-500 hover:text-surface-300 hover:bg-surface-800'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {loading ? (
        <PageLoader />
      ) : requests.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          }
          title="Asnjë kërkesë"
          description="Kur klientët dërgojnë kërkesa rezervimi, do të shfaqen këtu."
        />
      ) : (
        <>
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-800">
                  <th className="text-left px-5 py-3.5 text-xs font-mono text-surface-500 uppercase tracking-wider">Klienti</th>
                  <th className="text-left px-5 py-3.5 text-xs font-mono text-surface-500 uppercase tracking-wider">Telefon</th>
                  <th className="text-left px-5 py-3.5 text-xs font-mono text-surface-500 uppercase tracking-wider">Periudha</th>
                  <th className="text-left px-5 py-3.5 text-xs font-mono text-surface-500 uppercase tracking-wider">Statusi</th>
                  <th className="text-left px-5 py-3.5 text-xs font-mono text-surface-500 uppercase tracking-wider">Data</th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody>
                {requests.map(r => (
                  <tr key={r.id} className="table-row">
                    <td className="px-5 py-4">
                      <div className="font-medium text-surface-200">{r.requester_name}</div>
                    </td>
                    <td className="px-5 py-4">
                      <a href={`tel:${r.requester_phone}`} className="text-sm text-brand-400 hover:text-brand-300 font-mono">
                        {r.requester_phone}
                      </a>
                    </td>
                    <td className="px-5 py-4 text-sm text-surface-400">
                      {r.date_from && r.date_to ? `${r.date_from} → ${r.date_to}` : '—'}
                    </td>
                    <td className="px-5 py-4">
                      <Badge status={r.status} />
                    </td>
                    <td className="px-5 py-4 text-xs text-surface-500">
                      {new Date(r.created_at).toLocaleDateString('sq-AL')}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link to={`/requests/${r.id}`} className="text-sm text-brand-400 hover:text-brand-300">
                        Detajet →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} setPage={setPage} hasMore={page * limit < total} />
        </>
      )}
    </div>
  )
}

// ─── Request Detail ───────────────────────────────────────────────────────────
export function RequestDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [request, setRequest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [showConvert, setShowConvert] = useState(false)
  const [cars, setCars] = useState([])
  const [customers, setCustomers] = useState([])
  const [converting, setConverting] = useState(false)
  const [convertForm, setConvertForm] = useState({
    date_from: '',
    date_to: '',
    price_total: '',
    deposit_amount: '',
    customer_id: '',
  })

  const fetchRequest = async () => {
    try {
      const res = await requestsApi.get(id)
      setRequest(res.data)
      setConvertForm(f => ({
        ...f,
        date_from: res.data.date_from || '',
        date_to: res.data.date_to || '',
      }))
    } catch {
      toast.error('Kërkesa nuk u gjet')
      navigate('/requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequest()
    Promise.all([
      carsApi.list({ limit: 100 }),
      customersApi.list({ limit: 100 }),
    ]).then(([carsRes, custRes]) => {
      setCars(Array.isArray(carsRes.data) ? carsRes.data : carsRes.data?.items || [])
      setCustomers(Array.isArray(custRes.data) ? custRes.data : custRes.data?.items || [])
    })
  }, [id])

  const handleUpdateStatus = async (status) => {
    setUpdating(true)
    try {
      await requestsApi.update(id, { status })
      toast.success('Statusi u përditësua')
      fetchRequest()
    } catch {
      toast.error('Gabim')
    } finally {
      setUpdating(false)
    }
  }

  const handleConvert = async (e) => {
    e.preventDefault()
    setConverting(true)
    try {
      const payload = {
        date_from: convertForm.date_from,
        date_to: convertForm.date_to,
        price_total: convertForm.price_total ? parseFloat(convertForm.price_total) : null,
        deposit_amount: convertForm.deposit_amount ? parseFloat(convertForm.deposit_amount) : null,
        customer_id: convertForm.customer_id || null,
      }
      const res = await requestsApi.convert(id, payload)
      toast.success('Kërkesa u konvertua në rezervim!')
      navigate(`/bookings/${res.data.id}`)
    } catch {
      toast.error('Gabim gjatë konvertimit')
    } finally {
      setConverting(false)
    }
  }

  if (loading) return <PageLoader />
  if (!request) return null

  const statusActions = [
    { status: 'new', label: 'E re', disabled: request.status === 'new' },
    { status: 'contacted', label: 'Kontaktuar', disabled: request.status === 'contacted' },
    { status: 'spam', label: 'Spam', disabled: request.status === 'spam' },
  ]

  return (
    <div>
      <PageHeader
        title={`Kërkesë nga ${request.requester_name}`}
        subtitle={new Date(request.created_at).toLocaleString('sq-AL')}
        action={
          <div className="flex gap-2">
            {request.status !== 'converted' && (
              <Button onClick={() => setShowConvert(true)}>Konverto në rezervim</Button>
            )}
          </div>
        }
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="card p-6">
            <h2 className="text-sm font-mono text-surface-500 uppercase tracking-wider mb-4">Informacioni</h2>
            <div className="space-y-4">
              <Row label="Emri" value={request.requester_name} />
              <Row label="Telefon" value={
                <a href={`tel:${request.requester_phone}`} className="text-brand-400 hover:text-brand-300 font-mono">
                  {request.requester_phone}
                </a>
              } />
              {request.date_from && <Row label="Data e fillimit" value={request.date_from} />}
              {request.date_to && <Row label="Data e mbarimit" value={request.date_to} />}
            </div>
          </div>

          {request.message && (
            <div className="card p-6">
              <h2 className="text-sm font-mono text-surface-500 uppercase tracking-wider mb-3">Mesazhi</h2>
              <p className="text-sm text-surface-300 leading-relaxed italic">"{request.message}"</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="text-sm font-mono text-surface-500 uppercase tracking-wider mb-4">Statusi</h2>
            <Badge status={request.status} className="mb-4 text-sm" />
            <div className="space-y-2 mt-4">
              {statusActions.map(a => (
                <Button
                  key={a.status}
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  disabled={a.disabled || updating}
                  onClick={() => handleUpdateStatus(a.status)}
                >
                  {a.label}
                </Button>
              ))}
              <Button
                variant="danger"
                size="sm"
                className="w-full"
                disabled={request.status === 'spam' || updating}
                onClick={() => handleUpdateStatus('spam')}
              >
                Shëno si spam
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Convert Modal */}
      <Modal open={showConvert} onClose={() => setShowConvert(false)} title="Konverto në rezervim" size="md">
        <form onSubmit={handleConvert} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Data e fillimit"
              type="date"
              value={convertForm.date_from}
              onChange={e => setConvertForm(f => ({ ...f, date_from: e.target.value }))}
              required
            />
            <Input
              label="Data e mbarimit"
              type="date"
              value={convertForm.date_to}
              onChange={e => setConvertForm(f => ({ ...f, date_to: e.target.value }))}
              required
            />
          </div>
          <Select
            label="Klienti (opsional)"
            value={convertForm.customer_id}
            onChange={e => setConvertForm(f => ({ ...f, customer_id: e.target.value }))}
          >
            <option value="">Pa klient…</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Çmimi total"
              type="number"
              step="0.01"
              value={convertForm.price_total}
              onChange={e => setConvertForm(f => ({ ...f, price_total: e.target.value }))}
            />
            <Input
              label="Depozita"
              type="number"
              step="0.01"
              value={convertForm.deposit_amount}
              onChange={e => setConvertForm(f => ({ ...f, deposit_amount: e.target.value }))}
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" type="button" onClick={() => setShowConvert(false)}>Anulo</Button>
            <Button type="submit" loading={converting}>Konverto</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-sm text-surface-500 shrink-0">{label}</span>
      <span className="text-sm text-surface-200 text-right">{value}</span>
    </div>
  )
}
