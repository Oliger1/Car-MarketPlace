import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import AppLayout from './components/layout/AppLayout'
import { Spinner } from './components/ui/index'

// Auth pages
import { Login, Register, ForgotPassword, ResetPassword } from './pages/auth/AuthPages'

// Dashboard
import Dashboard from './pages/dashboard/Dashboard'

// Cars
import { CarsList, CarDetail } from './pages/cars/Cars'

// Bookings
import { BookingsList, BookingDetail } from './pages/bookings/Bookings'

// Requests
import { RequestsList, RequestDetail } from './pages/requests/Requests'

// Customers
import { CustomersList, CustomerDetail } from './pages/customers/Customers'

// Company
import Company from './pages/company/Company'

// Billing
import Billing from './pages/billing/Billing'

// Public
import { PublicHome, PublicCompany, PublicCar } from './pages/public/Public'

// ─── Guards ────────────────────────────────────────────────────────────────────
function Protected({ children }) {
  const { user, ready } = useAuth()
  if (!ready) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <Spinner size={38} />
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  return <AppLayout>{children}</AppLayout>
}

function Guest({ children }) {
  const { user, ready } = useAuth()
  if (!ready) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <Spinner size={38} />
    </div>
  )
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

// ─── Routes ────────────────────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"                        element={<PublicHome />} />
      <Route path="/p/:slug"                 element={<PublicCompany />} />
      <Route path="/p/:slug/car/:carSlug"    element={<PublicCar />} />

      {/* Auth */}
      <Route path="/login"           element={<Guest><Login /></Guest>} />
      <Route path="/register"        element={<Guest><Register /></Guest>} />
      <Route path="/forgot-password" element={<Guest><ForgotPassword /></Guest>} />
      <Route path="/reset-password"  element={<ResetPassword />} />

      {/* App */}
      <Route path="/dashboard"           element={<Protected><Dashboard /></Protected>} />
      <Route path="/cars"                element={<Protected><CarsList /></Protected>} />
      <Route path="/cars/:id"            element={<Protected><CarDetail /></Protected>} />
      <Route path="/bookings"            element={<Protected><BookingsList /></Protected>} />
      <Route path="/bookings/:id"        element={<Protected><BookingDetail /></Protected>} />
      <Route path="/booking-requests"    element={<Protected><RequestsList /></Protected>} />
      <Route path="/booking-requests/:id"element={<Protected><RequestDetail /></Protected>} />
      <Route path="/customers"           element={<Protected><CustomersList /></Protected>} />
      <Route path="/customers/:id"       element={<Protected><CustomerDetail /></Protected>} />
      <Route path="/company"             element={<Protected><Company /></Protected>} />
      <Route path="/billing"             element={<Protected><Billing /></Protected>} />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
