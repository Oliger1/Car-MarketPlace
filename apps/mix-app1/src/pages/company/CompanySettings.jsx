import { useState, useEffect, useRef } from 'react'
import { companyApi, fileUrl } from '../../api/client'
import { Button, Input, Textarea } from '../../components/ui'
import PageHeader from '../../components/PageHeader'
import toast from 'react-hot-toast'

export default function CompanySettings() {
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({})
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const logoRef = useRef()
  const coverRef = useRef()

  const fetchCompany = async () => {
    try {
      const res = await companyApi.get()
      setCompany(res.data)
      setForm({
        name: res.data.name,
        slug: res.data.slug,
        city: res.data.city,
        description: res.data.description || '',
        phone: res.data.phone || '',
        whatsapp: res.data.whatsapp || '',
        website_url: res.data.website_url || '',
        is_published: res.data.is_published,
      })
    } catch {
      toast.error('Gabim gjatë ngarkimit')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCompany() }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await companyApi.update(form)
      toast.success('Cilësimet u ruajtën!')
      fetchCompany()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Gabim')
    } finally {
      setSaving(false)
    }
  }

  const handleUploadLogo = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingLogo(true)
    try {
      await companyApi.uploadLogo(file)
      toast.success('Logo u ngarkua!')
      fetchCompany()
    } catch {
      toast.error('Gabim gjatë ngarkimit')
    } finally {
      setUploadingLogo(false)
      e.target.value = ''
    }
  }

  const handleUploadCover = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingCover(true)
    try {
      await companyApi.uploadCover(file)
      toast.success('Cover u ngarkua!')
      fetchCompany()
    } catch {
      toast.error('Gabim gjatë ngarkimit')
    } finally {
      setUploadingCover(false)
      e.target.value = ''
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-surface-500">Duke ngarkuar…</div>

  return (
    <div>
      <PageHeader title="Kompania" subtitle="Menaxho profilin e kompanisë tënde" />

      {/* Cover photo */}
      <div className="card overflow-hidden mb-6">
        <div
          className="h-40 bg-surface-800 relative cursor-pointer group"
          onClick={() => coverRef.current?.click()}
        >
          {company?.cover_path ? (
            <img
              src={fileUrl(company.cover_path)}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-surface-600 group-hover:text-surface-500 transition-colors">
              <div className="text-center">
                <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm">Kliko për cover foto</p>
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <Button size="sm" variant="secondary" loading={uploadingCover}>
              Ndrysho cover
            </Button>
          </div>
        </div>
        <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={handleUploadCover} />

        <div className="px-6 pb-6 -mt-8 flex items-end gap-4">
          {/* Logo */}
          <div className="relative">
            <div
              className="w-20 h-20 rounded-2xl bg-surface-800 border-2 border-surface-900 overflow-hidden cursor-pointer group"
              onClick={() => logoRef.current?.click()}
            >
              {company?.logo_path ? (
                <img src={fileUrl(company.logo_path)} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-brand-500 flex items-center justify-center">
                  <span className="text-white font-display font-bold text-2xl">
                    {company?.name?.charAt(0)}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-2xl">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                </svg>
              </div>
            </div>
            <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleUploadLogo} />
          </div>
          <div>
            <h2 className="font-display font-bold text-surface-100 text-lg">{company?.name}</h2>
            <p className="text-sm text-surface-500">{company?.city}</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSave}>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="card p-6 space-y-5">
              <h2 className="text-sm font-mono text-surface-500 uppercase tracking-wider">Informacioni bazë</h2>
              <Input
                label="Emri i kompanisë"
                name="name"
                value={form.name || ''}
                onChange={handleChange}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Slug (URL)"
                  name="slug"
                  value={form.slug || ''}
                  onChange={handleChange}
                  hint="mix.com/company/slug-juaj"
                  required
                />
                <Input
                  label="Qyteti"
                  name="city"
                  value={form.city || ''}
                  onChange={handleChange}
                  required
                />
              </div>
              <Textarea
                label="Përshkrimi"
                name="description"
                value={form.description || ''}
                onChange={handleChange}
                placeholder="Përshkruaj kompaninë tënde…"
                rows={4}
              />
            </div>

            <div className="card p-6 space-y-5">
              <h2 className="text-sm font-mono text-surface-500 uppercase tracking-wider">Kontakti</h2>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Telefon" name="phone" value={form.phone || ''} onChange={handleChange} placeholder="+355 69 000 0000" />
                <Input label="WhatsApp" name="whatsapp" value={form.whatsapp || ''} onChange={handleChange} placeholder="+355 69 000 0000" />
              </div>
              <Input label="Faqja e internetit" name="website_url" value={form.website_url || ''} onChange={handleChange} placeholder="https://kompania.al" />
            </div>
          </div>

          <div className="space-y-5">
            <div className="card p-6 space-y-4">
              <h2 className="text-sm font-mono text-surface-500 uppercase tracking-wider">Publikimi</h2>
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input type="checkbox" name="is_published" checked={form.is_published || false} onChange={handleChange} className="sr-only" />
                  <div className={`w-10 h-6 rounded-full transition-colors ${form.is_published ? 'bg-brand-500' : 'bg-surface-700'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full mt-1 transition-transform ${form.is_published ? 'translate-x-5' : 'translate-x-1'}`} />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-surface-200">Profil publik</p>
                  <p className="text-xs text-surface-500">Kompania shfaqet në kërkim</p>
                </div>
              </label>
            </div>

            <div className="card p-5">
              <p className="text-xs font-mono text-surface-500 uppercase tracking-wider mb-3">ID-ja</p>
              <p className="text-xs font-mono text-surface-600 break-all">{company?.id}</p>
            </div>

            <Button type="submit" loading={saving} className="w-full" size="lg">
              Ruaj cilësimet
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
