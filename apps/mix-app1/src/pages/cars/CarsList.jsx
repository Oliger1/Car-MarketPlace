import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { carsApi, fileUrl } from '../../api/client'
import { Button, Badge, EmptyState, PageLoader, Pagination, ConfirmDialog } from '../../components/ui'
import PageHeader from '../../components/PageHeader'
import toast from 'react-hot-toast'

const statusOptions = [
  { value: '', label: 'Të gjitha' },
  { value: 'active', label: 'Aktive' },
  { value: 'inactive', label: 'Joaktive' },
  { value: 'maintenance', label: 'Mirëmbajtje' },
]

export default function CarsList() {
  const navigate = useNavigate()
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const limit = 20

  const fetchCars = async () => {
    setLoading(true)
    try {
      const res = await carsApi.list({ status: status || undefined, page, limit })
      const data = res.data
      if (Array.isArray(data)) {
        setCars(data)
        setTotal(data.length)
      } else {
        setCars(data.items || [])
        setTotal(data.total || 0)
      }
    } catch {
      toast.error('Gabim gjatë ngarkimit')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCars() }, [status, page])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await carsApi.delete(deleteId)
      toast.success('Makina u fshi')
      setDeleteId(null)
      fetchCars()
    } catch {
      toast.error('Gabim gjatë fshirjes')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Makinat"
        subtitle={`${total} makina në total`}
        action={
          <Link to="/cars/new">
            <Button>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Shto makinë
            </Button>
          </Link>
        }
      />

      {/* Filters */}
      <div className="flex gap-2 mb-6">
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
      ) : cars.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
          title="Asnjë makinë"
          description="Shto makinën e parë të flotës tënde."
          action={
            <Link to="/cars/new">
              <Button>Shto makinën e parë</Button>
            </Link>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cars.map(car => (
              <Link
                key={car.id}
                to={`/cars/${car.id}`}
                className="card overflow-hidden hover:border-surface-700 transition-all group"
              >
                {/* Photo */}
                <div className="aspect-[16/9] bg-surface-800 relative overflow-hidden">
                  {car.photos?.[0] ? (
                    <img
                      src={fileUrl(car.photos[0].path)}
                      alt={car.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-12 h-12 text-surface-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <Badge status={car.status} />
                  </div>
                  {!car.is_published && (
                    <div className="absolute top-3 right-3">
                      <span className="badge bg-surface-900/80 text-surface-400 border border-surface-700">
                        Jo publik
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-display font-semibold text-surface-100 group-hover:text-brand-400 transition-colors truncate">
                    {car.title}
                  </h3>
                  <p className="text-sm text-surface-500 mt-0.5">{car.make} {car.model} · {car.year}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex gap-3 text-xs text-surface-500">
                      <span>{car.transmission === 'automatic' ? 'Auto' : 'Manual'}</span>
                      <span>·</span>
                      <span>{car.seats} vende</span>
                      <span>·</span>
                      <span className="capitalize">{car.fuel}</span>
                    </div>
                    <span className="text-sm font-semibold text-brand-400">
                      {car.price_per_day} {car.currency}/dit
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <Pagination page={page} setPage={setPage} hasMore={page * limit < total} />
        </>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Fshi makinën"
        message="Jeni të sigurt që dëshironi ta fshini këtë makinë? Ky veprim nuk mund të zhbëhet."
      />
    </div>
  )
}
