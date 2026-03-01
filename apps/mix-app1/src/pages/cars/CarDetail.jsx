import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { carsApi, fileUrl } from '../../api/client'
import { Button, Badge, PageLoader, ConfirmDialog } from '../../components/ui'
import PageHeader from '../../components/PageHeader'
import toast from 'react-hot-toast'

export default function CarDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [car, setCar] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deletingPhotoId, setDeletingPhotoId] = useState(null)
  const fileRef = useRef()

  const fetchCar = async () => {
    try {
      const res = await carsApi.get(id)
      setCar(res.data)
    } catch {
      toast.error('Makina nuk u gjet')
      navigate('/cars')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCar() }, [id])

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      await carsApi.uploadPhoto(id, file)
      toast.success('Foto u ngarkua!')
      fetchCar()
    } catch {
      toast.error('Gabim gjatë ngarkimit')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleDeletePhoto = async (photoId) => {
    setDeletingPhotoId(photoId)
    try {
      await carsApi.deletePhoto(id, photoId)
      toast.success('Foto u fshi')
      fetchCar()
    } catch {
      toast.error('Gabim gjatë fshirjes')
    } finally {
      setDeletingPhotoId(null)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await carsApi.delete(id)
      toast.success('Makina u fshi')
      navigate('/cars')
    } catch {
      toast.error('Gabim gjatë fshirjes')
    } finally {
      setDeleting(false)
    }
  }

  const handleTogglePublish = async () => {
    try {
      await carsApi.update(id, { is_published: !car.is_published })
      toast.success(car.is_published ? 'Makina u fsheh' : 'Makina u publikua')
      fetchCar()
    } catch {
      toast.error('Gabim')
    }
  }

  if (loading) return <PageLoader />
  if (!car) return null

  return (
    <div>
      <PageHeader
        title={car.title}
        subtitle={`${car.make} ${car.model} · ${car.year}`}
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleTogglePublish}>
              {car.is_published ? 'Fshih' : 'Publiko'}
            </Button>
            <Link to={`/cars/${id}/edit`}>
              <Button variant="outline">Ndrysho</Button>
            </Link>
            <Button variant="danger" onClick={() => setShowDelete(true)}>Fshi</Button>
          </div>
        }
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Photos */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-surface-100">Fotot</h2>
              <div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                <Button
                  size="sm"
                  loading={uploading}
                  onClick={() => fileRef.current?.click()}
                  variant="secondary"
                >
                  + Shto foto
                </Button>
              </div>
            </div>

            {car.photos?.length === 0 ? (
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-surface-700 rounded-xl aspect-video flex flex-col items-center justify-center text-surface-600 cursor-pointer hover:border-surface-600 hover:text-surface-500 transition-colors"
              >
                <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm">Kliko për të ngarkuar foto</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {car.photos.map((photo, i) => (
                  <div key={photo.id} className="relative group aspect-square">
                    <img
                      src={fileUrl(photo.path)}
                      alt={photo.alt_text || car.title}
                      className="w-full h-full object-cover rounded-xl"
                    />
                    {i === 0 && (
                      <span className="absolute top-2 left-2 badge bg-brand-500/80 text-white text-xs">Kryesore</span>
                    )}
                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      disabled={deletingPhotoId === photo.id}
                      className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-red-500/80 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                <div
                  onClick={() => fileRef.current?.click()}
                  className="aspect-square border-2 border-dashed border-surface-700 rounded-xl flex flex-col items-center justify-center text-surface-600 cursor-pointer hover:border-surface-600 hover:text-surface-500 transition-colors"
                >
                  <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-xs">Shto foto</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-4">
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-surface-500">Statusi</span>
              <Badge status={car.status} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-surface-500">Publikuar</span>
              <span className={`text-sm font-medium ${car.is_published ? 'text-emerald-400' : 'text-surface-500'}`}>
                {car.is_published ? 'Po' : 'Jo'}
              </span>
            </div>
            <div className="border-t border-surface-800 pt-4 space-y-3">
              <InfoRow label="Transmisioni" value={car.transmission === 'automatic' ? 'Automatik' : 'Manual'} />
              <InfoRow label="Karburanti" value={car.fuel} />
              <InfoRow label="Vendet" value={car.seats} />
              <InfoRow label="Vendndodhja" value={car.location_text || '—'} />
            </div>
          </div>

          <div className="card p-5">
            <p className="text-xs font-mono text-surface-500 uppercase tracking-wider mb-3">Çmimi</p>
            <div className="text-3xl font-display font-bold text-brand-400">
              {car.price_per_day} <span className="text-lg text-surface-500">{car.currency}</span>
            </div>
            <p className="text-xs text-surface-500 mt-1">Depozita: {car.deposit_amount} {car.currency}</p>
          </div>

          {car.description && (
            <div className="card p-5">
              <p className="text-xs font-mono text-surface-500 uppercase tracking-wider mb-3">Përshkrimi</p>
              <p className="text-sm text-surface-300 leading-relaxed">{car.description}</p>
            </div>
          )}

          <div className="card p-5">
            <p className="text-xs font-mono text-surface-500 uppercase tracking-wider mb-3">Detajet</p>
            <div className="space-y-2">
              <InfoRow label="Slug" value={<span className="font-mono text-xs">{car.slug}</span>} />
              <InfoRow label="ID" value={<span className="font-mono text-xs">{car.id?.slice(0, 8)}…</span>} />
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Fshi makinën"
        message={`Jeni të sigurt që dëshironi ta fshini "${car.title}"?`}
      />
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-surface-500">{label}</span>
      <span className="text-sm text-surface-200 capitalize">{value}</span>
    </div>
  )
}
