import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Button, Input } from '../../components/ui'
import toast from 'react-hot-toast'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    company_name: '',
    slug: '',
    city: '',
    email: '',
    password: '',
    phone: '',
    whatsapp: '',
  })
  const [errors, setErrors] = useState({})

  const generateSlug = (name) =>
    name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(f => {
      const updated = { ...f, [name]: value }
      if (name === 'company_name') updated.slug = generateSlug(value)
      return updated
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)
    try {
      await register(form)
      navigate('/dashboard')
      toast.success('Kompania u krijua me sukses!')
    } catch (err) {
      const detail = err.response?.data?.detail
      if (Array.isArray(detail)) {
        const errs = {}
        detail.forEach(d => { errs[d.loc?.[1]] = d.msg })
        setErrors(errs)
      } else {
        toast.error(detail || 'Gabim gjatë regjistrimit')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center p-8">
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-9 h-9 bg-brand-500 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/30">
            <span className="text-white font-display font-bold text-sm">M</span>
          </div>
          <span className="font-display font-bold text-surface-50 text-lg">Mix</span>
        </div>

        <h1 className="font-display text-3xl font-bold text-surface-50 mb-2">Krijo kompaninë</h1>
        <p className="text-surface-500 mb-8">Fillo menaxhimin e flotës sot.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Emri i kompanisë"
              name="company_name"
              placeholder="AutoRent Tirana"
              value={form.company_name}
              onChange={handleChange}
              error={errors.company_name}
              required
              className="col-span-2"
            />
            <Input
              label="Slug (URL)"
              name="slug"
              placeholder="autorent-tirana"
              value={form.slug}
              onChange={handleChange}
              error={errors.slug}
              hint="Vetëm shkronja të vogla, numra dhe vizë"
              required
              className="col-span-2"
            />
            <Input
              label="Qyteti"
              name="city"
              placeholder="Tiranë"
              value={form.city}
              onChange={handleChange}
              error={errors.city}
              required
            />
            <Input
              label="Telefon"
              name="phone"
              placeholder="+355 69 123 4567"
              value={form.phone}
              onChange={handleChange}
              error={errors.phone}
            />
          </div>

          <div className="border-t border-surface-800 pt-4 space-y-4">
            <p className="text-xs font-mono text-surface-500 uppercase tracking-wider">Llogaria</p>
            <Input
              label="Email"
              type="email"
              name="email"
              placeholder="ju@shembull.com"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              required
            />
            <Input
              label="Fjalëkalimi"
              type="password"
              name="password"
              placeholder="Minimum 8 karaktere"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              required
            />
          </div>

          <Button type="submit" loading={loading} className="w-full mt-2" size="lg">
            Krijo kompaninë
          </Button>
        </form>

        <p className="text-center text-surface-500 text-sm mt-6">
          Keni llogari?{' '}
          <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
            Hyr
          </Link>
        </p>
      </div>
    </div>
  )
}
