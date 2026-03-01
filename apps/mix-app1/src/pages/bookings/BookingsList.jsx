import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { bookingsApi, carsApi } from '../../api/client'
import { Button, Badge, EmptyState, PageLoader, Pagination } from '../../components/ui'
import PageHeader from '../../components/PageHeader'
import toast from 'react-hot-toast'

const statusOptions = [
  { value: '', label: 'Të gjitha' },
  { value: 'requested', label: 'Kërkuar' },
  { value: 'confirmed', label: 'Konfirmuar' },
  { value: 'active', label: 'Aktiv' },
  { value: 'completed', label: 'Përfunduar' },
  { value: 'cancelled', label: 'Anuluar' },
]

export default function BookingsList() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 20

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const res = await bookingsApi.list({ status: status || undefined, page, limit })
      const data = res.data
      if (Array.isArray(data)) {
        setBookings(data)
        setTotal(data.length)
      } else {
        setBookings(data.items || [])
        setTotal(data.total || 0)
      }
    } catch {
      toast.error('Gabim gjatë ngarkimit')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchBookings() }, [status, page])

  return (
    <div>
      <PageHeader
        title="Rezervimet"
        subtitle={`${total} rezervime`}
        action={
          <Link to="/bookings/new">
            <Button>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Shto rezervim
            </Button>
          </Link>
        }
      />

      {/* Filters */}
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
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          title="Asnjë rezervim"
          description="Asnjë rezervim nuk u gjet me filtrat aktualë."
          action={status && (
            <Button variant="secondary" onClick={() => setStatus('')}>Pastro filtrat</Button>
          )}
        />
      ) : (
        <>
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-800">
                  <th className="text-left px-5 py-3.5 text-xs font-mono text-surface-500 uppercase tracking-wider">ID</th>
                  <th className="text-left px-5 py-3.5 text-xs font-mono text-surface-500 uppercase tracking-wider">Periudha</th>
                  <th className="text-left px-5 py-3.5 text-xs font-mono text-surface-500 uppercase tracking-wider">Çmimi</th>
                  <th className="text-left px-5 py-3.5 text-xs font-mono text-surface-500 uppercase tracking-wider">Statusi</th>
                  <th className="text-left px-5 py-3.5 text-xs font-mono text-surface-500 uppercase tracking-wider">Data</th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody>
                {bookings.map(booking => (
                  <tr key={booking.id} className="table-row">
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs text-surface-400">{booking.id?.slice(0, 8)}…</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-sm text-surface-200">
                        {booking.date_from} → {booking.date_to}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-semibold text-brand-400">
                        {booking.price_total ? `${booking.price_total} ${booking.currency}` : '—'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <Badge status={booking.status} />
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs text-surface-500">
                        {new Date(booking.created_at).toLocaleDateString('sq-AL')}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link to={`/bookings/${booking.id}`} className="text-sm text-brand-400 hover:text-brand-300 transition-colors">
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
