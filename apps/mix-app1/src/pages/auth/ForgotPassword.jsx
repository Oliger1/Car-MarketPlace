import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { authApi } from '../../api/client'
import { Button, Input } from '../../components/ui'
import toast from 'react-hot-toast'

export function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authApi.forgotPassword({ email })
      setSent(true)
      toast.success('Email u dërgua!')
    } catch {
      toast.error('Gabim. Kontrollo emailin.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <Link to="/login" className="inline-flex items-center gap-2 text-surface-500 hover:text-surface-300 text-sm mb-8 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kthehu
        </Link>

        <h1 className="font-display text-3xl font-bold text-surface-50 mb-2">Rivendos fjalëkalimin</h1>
        <p className="text-surface-500 mb-8">
          {sent ? 'Kontrollo emailin tënd për udhëzimet.' : 'Do të të dërgojmë një link rivendosjeje.'}
        </p>

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              placeholder="ju@shembull.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <Button type="submit" loading={loading} className="w-full" size="lg">
              Dërgo link-un
            </Button>
          </form>
        ) : (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5 text-sm text-emerald-400">
            Email-i u dërgua tek <strong>{email}</strong>. Kontrollo inbox-in tënd.
          </div>
        )}
      </div>
    </div>
  )
}

export function ResetPassword() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ token: params.get('token') || '', new_password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authApi.resetPassword(form)
      toast.success('Fjalëkalimi u ndryshua!')
      navigate('/login')
    } catch {
      toast.error('Token i pavlefshëm ose i skaduar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <h1 className="font-display text-3xl font-bold text-surface-50 mb-2">Fjalëkalim i ri</h1>
        <p className="text-surface-500 mb-8">Vendos fjalëkalimin tënd të ri.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {!params.get('token') && (
            <Input
              label="Token"
              value={form.token}
              onChange={e => setForm(f => ({ ...f, token: e.target.value }))}
              required
            />
          )}
          <Input
            label="Fjalëkalimi i ri"
            type="password"
            placeholder="Minimum 8 karaktere"
            value={form.new_password}
            onChange={e => setForm(f => ({ ...f, new_password: e.target.value }))}
            required
          />
          <Button type="submit" loading={loading} className="w-full" size="lg">
            Ndrysho fjalëkalimin
          </Button>
        </form>
      </div>
    </div>
  )
}
