import axios from 'axios'

const http = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

http.interceptors.response.use(
  (r) => r,
  (err) => {
    const url = err.config?.url || ''
    const path = window.location.pathname
    const isPublic = path === '/' || path.startsWith('/p/') || path.startsWith('/login') || path.startsWith('/register') || path.startsWith('/forgot') || path.startsWith('/reset')
    const isMe = url.includes('/me')
    if (err.response?.status === 401 && !isPublic && !isMe) {
      window.location.replace('/login')
    }
    return Promise.reject(err)
  }
)

// Safely extract list data from various response shapes
export function extractList(data) {
  if (!data) return { items: [], total: 0 }
  if (Array.isArray(data)) return { items: data, total: data.length }
  if (Array.isArray(data.items)) return { items: data.items, total: data.total ?? data.items.length }
  if (Array.isArray(data.results)) return { items: data.results, total: data.total ?? data.results.length }
  return { items: [], total: 0 }
}

export const getErrMsg = (err) => {
  const detail = err?.response?.data?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg
  return 'Ndodhi një gabim. Provoni sërish.'
}

export const fileUrl = (path) => {
  if (!path) return null
  if (path.startsWith('http')) return path
  if (path.startsWith('/uploads') || path.startsWith('/api/files')) return path
  return `/uploads/${path.replace(/^\/+/, '')}`
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  register:       (d) => http.post('/auth/register', d),
  login:          (d) => http.post('/auth/login', d),
  logout:         ()  => http.post('/auth/logout'),
  forgotPassword: (e) => http.post('/auth/forgot-password', { email: e }),
  resetPassword:  (d) => http.post('/auth/reset-password', d),
}

// ─── Me ──────────────────────────────────────────────────────────────────────
export const meAPI = {
  get: () => http.get('/me/'),
}

// ─── Company ──────────────────────────────────────────────────────────────────
export const companyAPI = {
  get:        ()    => http.get('/company/'),
  update:     (d)   => http.patch('/company/', d),
  uploadLogo: (f)   => { const fd = new FormData(); fd.append('file', f); return http.post('/company/logo', fd, { headers: { 'Content-Type': 'multipart/form-data' } }) },
  uploadCover:(f)   => { const fd = new FormData(); fd.append('file', f); return http.post('/company/cover', fd, { headers: { 'Content-Type': 'multipart/form-data' } }) },
}

// ─── Cars ─────────────────────────────────────────────────────────────────────
export const carsAPI = {
  list:         (p) => http.get('/cars/', { params: p }),
  create:       (d) => http.post('/cars/', d),
  get:          (id)=> http.get(`/cars/${id}`),
  update:       (id,d)=> http.patch(`/cars/${id}`, d),
  delete:       (id)=> http.delete(`/cars/${id}`),
  uploadPhoto:  (id,f)=> { const fd = new FormData(); fd.append('file', f); return http.post(`/cars/${id}/photos`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }) },
  reorderPhotos:(id,ids)=> http.patch(`/cars/${id}/photos/reorder`, ids),
  deletePhoto:  (cid,pid)=> http.delete(`/cars/${cid}/photos/${pid}`),
}

// ─── Bookings ─────────────────────────────────────────────────────────────────
export const bookingsAPI = {
  list:   (p) => http.get('/bookings/', { params: p }),
  create: (d) => http.post('/bookings/', d),
  get:    (id)=> http.get(`/bookings/${id}`),
  update: (id,d)=> http.patch(`/bookings/${id}`, d),
  cancel: (id)=> http.delete(`/bookings/${id}`),
}

// ─── Booking Requests ──────────────────────────────────────────────────────────
export const requestsAPI = {
  list:    (p) => http.get('/booking-requests/', { params: p }),
  get:     (id)=> http.get(`/booking-requests/${id}`),
  update:  (id,d)=> http.patch(`/booking-requests/${id}`, d),
  convert: (id,d)=> http.post(`/booking-requests/${id}/convert`, d),
}

// ─── Customers ────────────────────────────────────────────────────────────────
export const customersAPI = {
  list:   (p) => http.get('/customers/', { params: p }),
  create: (d) => http.post('/customers/', d),
  get:    (id)=> http.get(`/customers/${id}`),
  update: (id,d)=> http.patch(`/customers/${id}`, d),
}

// ─── Billing ─────────────────────────────────────────────────────────────────
export const billingAPI = {
  getSubscription: ()   => http.get('/billing/subscription'),
  getPlans:        ()   => http.get('/billing/plans'),
  choosePlan:      (id) => http.post('/billing/choose-plan', { plan_id: id }),
  getInvoices:     (p)  => http.get('/billing/invoices', { params: p }),
}

// ─── Public ───────────────────────────────────────────────────────────────────
export const publicAPI = {
  searchCompanies:   (p)     => http.get('/public/companies', { params: p }),
  searchCars:        (p)     => http.get('/public/cars', { params: p }),
  getCompany:        (slug)  => http.get(`/public/company/${slug}`),
  getCompanyCars:    (slug,p)=> http.get(`/public/company/${slug}/cars`, { params: p }),
  getCar:            (cs,s)  => http.get(`/public/company/${cs}/car/${s}`),
  getCarAvailability:(cs,s,p)=> http.get(`/public/company/${cs}/car/${s}/availability`, { params: p }),
  createBookingRequest:(d)   => http.post('/public/booking-request', d),
}

export default http