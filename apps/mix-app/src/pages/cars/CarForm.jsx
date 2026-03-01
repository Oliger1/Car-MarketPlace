import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { carsApi } from '../../api/client'
import { Button, Input, Select, Textarea } from '../../components/ui'
import PageHeader from '../../components/PageHeader'
import toast from 'react-hot-toast'

const generateSlug = (t) => t.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

const defaultForm = {
  title: '',
  make: '',
  model: '',
  year: new Date().getFullYear(),
  transmission: 'automatic',
  fuel: 'petrol',
  seats: 5,
  price_per_day: '',
  deposit_amount: '',
  currency: 'EUR',
  description: '',
  location_text: '',
  slug: '',
  status: 'active',
  is_published: true,
}

export default function CarForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id
  const [form, setForm] = useState(defaultForm)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEdit)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isEdit) {
      carsApi.get(id).then(res => {
        const car = res.data
        setForm({
          title: car.title,
          make: car.make,
          model: car.model,
          year: car.year,
          transmission: car.transmission,
          fuel: car.fuel,
          seats: car.seats,
          price_per_day: car.price_per_day,
          deposit_amount: car.deposit_amount,
          currency: car.currency,
          description: car.description || '',
          location_text: car.location_text || '',
          slug: car.slug,
          status: car.status,
          is_published: car.is_published,
        })
      }).catch(() => toast.error('Makina nuk u gjet')).finally(() => setFetching(false))
    }
  }, [id])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(f => {
      const updated = { ...f, [name]: type === 'checkbox' ? checked : value }
      if (name === 'title' && !isEdit) updated.slug = generateSlug(value)
      return updated
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)
    try {
      const payload = {
        ...form,
        year: parseInt(form.year),
        seats: parseInt(form.seats),
        price_per_day: parseFloat(form.price_per_day),
        deposit_amount: parseFloat(form.deposit_amount),
      }
      if (isEdit) {
        await carsApi.update(id, payload)
        toast.success('Makina u përditësua!')
        navigate(`/cars/${id}`)
      } else {
        const res = await carsApi.create(payload)
        toast.success('Makina u krijua!')
        navigate(`/cars/${res.data.id}`)
      }
    } catch (err) {
      const detail = err.response?.data?.detail
      if (Array.isArray(detail)) {
        const errs = {}
        detail.forEach(d => { errs[d.loc?.[1]] = d.msg })
        setErrors(errs)
        toast.error('Kontrollo fushat')
      } else {
        toast.error(detail || 'Gabim. Provo sërish.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return <div className="flex items-center justify-center h-64 text-surface-500">Duke ngarkuar…</div>

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Ndrysho makinën' : 'Makina e re'}
        subtitle={isEdit ? `ID: ${id}` : 'Shto makinë të re në flotë'}
        action={
          <Button variant="secondary" onClick={() => navigate(-1)}>Anulo</Button>
        }
      />

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main info */}
          <div className="lg:col-span-2 space-y-5">
            <div className="card p-6 space-y-5">
              <h2 className="font-display font-semibold text-surface-100 text-sm uppercase tracking-wider text-surface-500">Informacioni bazë</h2>
              <Input
                label="Titulli"
                name="title"
                placeholder="p.sh. Toyota Corolla 2022"
                value={form.title}
                onChange={handleChange}
                error={errors.title}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Marka" name="make" placeholder="Toyota" value={form.make} onChange={handleChange} error={errors.make} required />
                <Input label="Modeli" name="model" placeholder="Corolla" value={form.model} onChange={handleChange} error={errors.model} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Viti" name="year" type="number" min={1900} max={2100} value={form.year} onChange={handleChange} error={errors.year} required />
                <Input label="Vendndodhja" name="location_text" placeholder="Tiranë, Shqipëri" value={form.location_text} onChange={handleChange} />
              </div>
              <Input
                label="Slug (URL)"
                name="slug"
                placeholder="toyota-corolla-2022"
                value={form.slug}
                onChange={handleChange}
                error={errors.slug}
                hint="Vetëm shkronja të vogla, numra dhe vizë"
                required
              />
              <Textarea
                label="Përshkrimi"
                name="description"
                placeholder="Përshkrim i makinës..."
                value={form.description}
                onChange={handleChange}
                rows={4}
              />
            </div>

            {/* Specs */}
            <div className="card p-6 space-y-5">
              <h2 className="text-sm font-mono uppercase tracking-wider text-surface-500">Specifikimet</h2>
              <div className="grid grid-cols-2 gap-4">
                <Select label="Transmisioni" name="transmission" value={form.transmission} onChange={handleChange}>
                  <option value="automatic">Automatik</option>
                  <option value="manual">Manual</option>
                </Select>
                <Select label="Karburanti" name="fuel" value={form.fuel} onChange={handleChange}>
                  <option value="petrol">Benzinë</option>
                  <option value="diesel">Diesel</option>
                  <option value="hybrid">Hibrid</option>
                  <option value="electric">Elektrik</option>
                </Select>
              </div>
              <Input label="Vendet" name="seats" type="number" min={1} max={20} value={form.seats} onChange={handleChange} error={errors.seats} required />
            </div>
          </div>

          {/* Side panel */}
          <div className="space-y-5">
            <div className="card p-6 space-y-5">
              <h2 className="text-sm font-mono uppercase tracking-wider text-surface-500">Çmimi</h2>
              <Select label="Monedha" name="currency" value={form.currency} onChange={handleChange}>
                <option value="EUR">EUR</option>
                <option value="ALL">ALL</option>
                <option value="USD">USD</option>
              </Select>
              <Input
                label="Çmimi / ditë"
                name="price_per_day"
                type="number"
                step="0.01"
                min={0}
                placeholder="0.00"
                value={form.price_per_day}
                onChange={handleChange}
                error={errors.price_per_day}
                required
              />
              <Input
                label="Depozita"
                name="deposit_amount"
                type="number"
                step="0.01"
                min={0}
                placeholder="0.00"
                value={form.deposit_amount}
                onChange={handleChange}
                error={errors.deposit_amount}
                required
              />
            </div>

            <div className="card p-6 space-y-5">
              <h2 className="text-sm font-mono uppercase tracking-wider text-surface-500">Statusi</h2>
              <Select label="Statusi" name="status" value={form.status} onChange={handleChange}>
                <option value="active">Aktiv</option>
                <option value="inactive">Joaktiv</option>
                <option value="maintenance">Mirëmbajtje</option>
              </Select>
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    name="is_published"
                    checked={form.is_published}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className={`w-10 h-6 rounded-full transition-colors ${form.is_published ? 'bg-brand-500' : 'bg-surface-700'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full mt-1 transition-transform ${form.is_published ? 'translate-x-5' : 'translate-x-1'}`} />
                  </div>
                </div>
                <span className="text-sm text-surface-300">Publik</span>
              </label>
            </div>

            <Button type="submit" loading={loading} className="w-full" size="lg">
              {isEdit ? 'Ruaj ndryshimet' : 'Krijo makinën'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
