import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Button, Input } from '../../components/ui'
import toast from 'react-hot-toast'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)
    try {
      await login(form)
      navigate('/dashboard')
      toast.success('Mirë se erdhe!')
    } catch (err) {
      const msg = err.response?.data?.detail || 'Kredencialet janë të gabuara'
      toast.error(msg)
      setErrors({ general: msg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-950 flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-[45%] bg-surface-900 border-r border-surface-800 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 via-transparent to-transparent" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/30">
              <span className="text-white font-display font-bold">M</span>
            </div>
            <span className="font-display font-bold text-surface-50 text-xl tracking-tight">Mix</span>
          </div>
          <h2 className="font-display text-4xl font-bold text-surface-50 leading-tight mb-4">
            Platforma e<br />qiradhënies<br /><span className="text-brand-400">profesionale</span>
          </h2>
          <p className="text-surface-500 leading-relaxed">
            Menaxho flotën tënde, rezervimet dhe klientët nga një vend i vetëm.
          </p>
        </div>
        <div className="relative grid grid-cols-2 gap-3">
          {[
            { label: 'Makina', icon: '🚗' },
            { label: 'Rezervime', icon: '📅' },
            { label: 'Klientë', icon: '👥' },
            { label: 'Raporte', icon: '📊' },
          ].map((item) => (
            <div key={item.label} className="bg-surface-800/60 border border-surface-700/50 rounded-xl p-4">
              <div className="text-2xl mb-2">{item.icon}</div>
              <div className="text-sm font-medium text-surface-300">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-9 h-9 bg-brand-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-display font-bold text-sm">M</span>
            </div>
            <span className="font-display font-bold text-surface-50 text-lg">Mix</span>
          </div>

          <h1 className="font-display text-3xl font-bold text-surface-50 mb-2">Hyr në llogari</h1>
          <p className="text-surface-500 mb-8">Mirë se u ktheve!</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              placeholder="ju@shembull.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
            />
            <div>
              <Input
                label="Fjalëkalimi"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
              />
              <div className="text-right mt-2">
                <Link to="/forgot-password" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
                  Keni harruar fjalëkalimin?
                </Link>
              </div>
            </div>

            {errors.general && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">
                {errors.general}
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Hyr
            </Button>
          </form>

          <p className="text-center text-surface-500 text-sm mt-8">
            Nuk keni llogari?{' '}
            <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
              Regjistrohu
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
