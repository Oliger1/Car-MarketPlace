import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { bookingsApi, carsApi, customersApi } from '../../api/client'
import { Button, Input, Select, Textarea, Badge, PageLoader, ConfirmDialog } from '../../components/ui'
import PageHeader from '../../components/PageHeader'
import toast from 'react-hot-toast'

// ─── Booking Detail ──────────────────────────────────────────────────────────
export function BookingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showCancel, setShowCancel] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [editStatus, setEditStatus] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [updating, setUpdating] = useState(false)

  const fetchBooking = async () => {
    try {
      const res = await bookingsApi.get(id)
      setBooking(res.data)
      setNewStatus(res.data.status)
    } catch {
      toast.error('Rezervimi nuk u gjet')
      navigate('/bookings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchBooking() }, [id])

  const handleCancel = async () => {
    setCancelling(true)
    try {
      await bookingsApi.cancel(id)
      toast.success('Rezervimi u anulua')
      navigate('/bookings')
    } catch {
      toast.error('Gabim gjatë anulimit')
    } finally {
      setCancelling(false)
    }
  }

  const handleUpdateStatus = async () => {
    setUpdating(true)
    try {
      await bookingsApi.update(id, { status: newStatus })
      toast.success('Statusi u përditësua')
      setEditStatus(false)
      fetchBooking()
    } catch {
      toast.error('Gabim')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) return <PageLoader />
  if (!booking) return null

  const days = Math.ceil((new Date(booking.date_to) - new Date(booking.date_from)) / (1000 * 60 * 60 * 24))

  return (
    <div>
      <PageHeader
        title={`Rezervimi #${booking.id?.slice(0, 8)}`}
        subtitle={`Krijuar: ${new Date(booking.created_at).toLocaleDateString('sq-AL')}`}
        action={
          <div className="flex gap-2">
            <Link to={`/bookings/${id}/edit`}>
              <Button variant="secondary">Ndrysho</Button>
            </Link>
            <Button variant="danger" onClick={() => setShowCancel(true)}>Anulo</Button>
          </div>
        }
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {/* Period */}
          <div className="card p-6">
            <h2 className="text-sm font-mono text-surface-500 uppercase tracking-wider mb-4">Periudha</h2>
            <div className="flex items-center gap-4">
              <div className="flex-1 bg-surface-800 rounded-xl p-4 text-center">
                <p className="text-xs text-surface-500 mb-1">Fillimi</p>
                <p className="text-lg font-display font-semibold text-surface-100">{booking.date_from}</p>
              </div>
              <div className="text-surface-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
              <div className="flex-1 bg-surface-800 rounded-xl p-4 text-center">
                <p className="text-xs text-surface-500 mb-1">Mbarimi</p>
                <p className="text-lg font-display font-semibold text-surface-100">{booking.date_to}</p>
              </div>
              <div className="flex-1 bg-brand-500/10 border border-brand-500/20 rounded-xl p-4 text-center">
                <p className="text-xs text-brand-500 mb-1">Ditë</p>
                <p className="text-2xl font-display font-bold text-brand-400">{days}</p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {booking.notes && (
            <div className="card p-5">
              <h2 className="text-sm font-mono text-surface-500 uppercase tracking-wider mb-3">Shënime</h2>
              <p className="text-sm text-surface-300 leading-relaxed">{booking.notes}</p>
            </div>
          )}

          {/* References */}
          <div className="card p-5 space-y-3">
            <h2 className="text-sm font-mono text-surface-500 uppercase tracking-wider">Lidhjet</h2>
            <div className="flex items-center justify-between">
              <span className="text-sm text-surface-500">Makina</span>
              {booking.car_id ? (
                <Link to={`/cars/${booking.car_id}`} className="text-sm text-brand-400 hover:text-brand-300 font-mono">
                  {booking.car_id.slice(0, 8)}… →
                </Link>
              ) : <span className="text-surface-600">—</span>}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-surface-500">Klienti</span>
              {booking.customer_id ? (
                <Link to={`/customers/${booking.customer_id}`} className="text-sm text-brand-400 hover:text-brand-300 font-mono">
                  {booking.customer_id.slice(0, 8)}… →
                </Link>
              ) : <span className="text-surface-600">—</span>}
            </div>
            {booking.request_id && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-surface-500">Kërkesa</span>
                <Link to={`/requests/${booking.request_id}`} className="text-sm text-brand-400 hover:text-brand-300 font-mono">
                  {booking.request_id.slice(0, 8)}… →
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {/* Status */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-mono text-surface-500 uppercase tracking-wider">Statusi</h2>
              <button onClick={() => setEditStatus(!editStatus)} className="text-xs text-brand-400 hover:text-brand-300">
                {editStatus ? 'Anulo' : 'Ndrysho'}
              </button>
            </div>
            {editStatus ? (
              <div className="space-y-3">
                <select
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value)}
                  className="input-base w-full"
                >
                  {['requested', 'confirmed', 'active', 'completed', 'cancelled'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <Button size="sm" loading={updating} onClick={handleUpdateStatus} className="w-full">
                  Ruaj
                </Button>
              </div>
            ) : (
              <Badge status={booking.status} className="text-sm" />
            )}
          </div>

          {/* Payment */}
          <div className="card p-5">
            <h2 className="text-sm font-mono text-surface-500 uppercase tracking-wider mb-4">Pagesa</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-surface-500">Total</span>
                <span className="text-lg font-display font-bold text-brand-400">
                  {booking.price_total || '—'} {booking.price_total ? booking.currency : ''}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-surface-500">Depozita</span>
                <span className="text-sm text-surface-300">
                  {booking.deposit_amount || '—'} {booking.deposit_amount ? booking.currency : ''}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showCancel}
        onClose={() => setShowCancel(false)}
        onConfirm={handleCancel}
        loading={cancelling}
        title="Anulo rezervimin"
        message="Jeni të sigurt që dëshironi ta anuloni këtë rezervim?"
      />
    </div>
  )
}

// ─── Booking Form ─────────────────────────────────────────────────────────────
export function BookingForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEdit)
  const [cars, setCars] = useState([])
  const [customers, setCustomers] = useState([])
  const [form, setForm] = useState({
    car_id: '',
    customer_id: '',
    date_from: '',
    date_to: '',
    price_total: '',
    deposit_amount: '',
    currency: 'EUR',
    status: 'requested',
    notes: '',
  })

  useEffect(() => {
    Promise.all([
      carsApi.list({ status: 'active', limit: 100 }),
      customersApi.list({ limit: 100 }),
    ]).then(([carsRes, custRes]) => {
      setCars(Array.isArray(carsRes.data) ? carsRes.data : carsRes.data?.items || [])
      setCustomers(Array.isArray(custRes.data) ? custRes.data : custRes.data?.items || [])
    })

    if (isEdit) {
      bookingsApi.get(id).then(res => {
        const b = res.data
        setForm({
          car_id: b.car_id || '',
          customer_id: b.customer_id || '',
          date_from: b.date_from || '',
          date_to: b.date_to || '',
          price_total: b.price_total || '',
          deposit_amount: b.deposit_amount || '',
          currency: b.currency || 'EUR',
          status: b.status || 'requested',
          notes: b.notes || '',
        })
      }).finally(() => setFetching(false))
    }
  }, [id])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        ...form,
        price_total: form.price_total ? parseFloat(form.price_total) : null,
        deposit_amount: form.deposit_amount ? parseFloat(form.deposit_amount) : null,
        customer_id: form.customer_id || null,
      }
      if (isEdit) {
        await bookingsApi.update(id, payload)
        toast.success('Rezervimi u përditësua!')
        navigate(`/bookings/${id}`)
      } else {
        const res = await bookingsApi.create(payload)
        toast.success('Rezervimi u krijua!')
        navigate(`/bookings/${res.data.id}`)
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Gabim')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return <PageLoader />

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Ndrysho rezervimin' : 'Rezervim i ri'}
        action={<Button variant="secondary" onClick={() => navigate(-1)}>Anulo</Button>}
      />

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="card p-6 space-y-5">
              <h2 className="text-sm font-mono text-surface-500 uppercase tracking-wider">Detajet</h2>
              <Select label="Makina" name="car_id" value={form.car_id} onChange={handleChange} required>
                <option value="">Zgjidh makinën…</option>
                {cars.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </Select>
              <Select label="Klienti (opsional)" name="customer_id" value={form.customer_id} onChange={handleChange}>
                <option value="">Pa klient…</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} — {c.phone}</option>
                ))}
              </Select>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Data e fillimit" name="date_from" type="date" value={form.date_from} onChange={handleChange} required />
                <Input label="Data e mbarimit" name="date_to" type="date" value={form.date_to} onChange={handleChange} required />
              </div>
              <Textarea label="Shënime" name="notes" placeholder="Shënime shtesë…" value={form.notes} onChange={handleChange} rows={3} />
            </div>
          </div>

          <div className="space-y-5">
            <div className="card p-6 space-y-5">
              <h2 className="text-sm font-mono text-surface-500 uppercase tracking-wider">Pagesa</h2>
              <Select label="Monedha" name="currency" value={form.currency} onChange={handleChange}>
                <option value="EUR">EUR</option>
                <option value="ALL">ALL</option>
                <option value="USD">USD</option>
              </Select>
              <Input label="Çmimi total" name="price_total" type="number" step="0.01" min={0} value={form.price_total} onChange={handleChange} />
              <Input label="Depozita" name="deposit_amount" type="number" step="0.01" min={0} value={form.deposit_amount} onChange={handleChange} />
              <Select label="Statusi" name="status" value={form.status} onChange={handleChange}>
                <option value="requested">Kërkuar</option>
                <option value="confirmed">Konfirmuar</option>
                <option value="active">Aktiv</option>
                <option value="completed">Përfunduar</option>
                <option value="cancelled">Anuluar</option>
              </Select>
            </div>
            <Button type="submit" loading={loading} className="w-full" size="lg">
              {isEdit ? 'Ruaj ndryshimet' : 'Krijo rezervimin'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
