import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/auth.store'
import ProtectedRoute from './components/ProtectedRoute'

// Auth
import Login from './pages/Login'
import Register from './pages/Register'

// Cliente
import ClientHome from './pages/client/ClientHome'
import ClientRide from './pages/client/ClientRide'
import ClientRides from './pages/client/ClientRides'
import ClientProfile from './pages/client/ClientProfile'

// Motorista
import DriverHome from './pages/driver/DriverHome'
import DriverEarnings from './pages/driver/DriverEarnings'
import DriverProfile from './pages/driver/DriverProfile'

// Admin
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminDrivers from './pages/admin/AdminDrivers'
import AdminRides from './pages/admin/AdminRides'
import AdminZones from './pages/admin/AdminZones'

export default function App() {
  const { loadFromStorage, user } = useAuthStore()

  useEffect(() => {
    loadFromStorage()
  }, [])

  // Redireciona a raiz para a área correta
  function getDefaultRoute() {
    if (!user) return '/login'
    if (user.role === 'DRIVER') return '/driver'
    if (user.role === 'ADMIN') return '/admin'
    return '/client'
  }

  return (
    <Routes>
      {/* Raiz — redireciona */}
      <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />

      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Cliente */}
      <Route path="/client" element={
        <ProtectedRoute allowedRoles={['CLIENT']}><ClientHome /></ProtectedRoute>
      } />
      <Route path="/client/ride" element={
        <ProtectedRoute allowedRoles={['CLIENT']}><ClientRide /></ProtectedRoute>
      } />
      <Route path="/client/rides" element={
        <ProtectedRoute allowedRoles={['CLIENT']}><ClientRides /></ProtectedRoute>
      } />
      <Route path="/client/profile" element={
        <ProtectedRoute allowedRoles={['CLIENT']}><ClientProfile /></ProtectedRoute>
      } />

      {/* Motorista */}
      <Route path="/driver" element={
        <ProtectedRoute allowedRoles={['DRIVER']}><DriverHome /></ProtectedRoute>
      } />
      <Route path="/driver/earnings" element={
        <ProtectedRoute allowedRoles={['DRIVER']}><DriverEarnings /></ProtectedRoute>
      } />
      <Route path="/driver/profile" element={
        <ProtectedRoute allowedRoles={['DRIVER']}><DriverProfile /></ProtectedRoute>
      } />

      {/* Admin */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>
      } />
      <Route path="/admin/drivers" element={
        <ProtectedRoute allowedRoles={['ADMIN']}><AdminDrivers /></ProtectedRoute>
      } />
      <Route path="/admin/rides" element={
        <ProtectedRoute allowedRoles={['ADMIN']}><AdminRides /></ProtectedRoute>
      } />
      <Route path="/admin/zones" element={
        <ProtectedRoute allowedRoles={['ADMIN']}><AdminZones /></ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
