import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'

// Patient pages
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Doctors from './pages/Doctors'
import MyAppointments from './pages/MyAppointments'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'
import ManageDoctors from './pages/admin/ManageDoctors'
import ManageSlots from './pages/admin/ManageSlots'
import ManageAppointments from './pages/admin/ManageAppointments'
import ManagePatients from './pages/admin/ManagePatients'

function Layout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Patient routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout><Home /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/doctors" element={
            <ProtectedRoute>
              <Layout><Doctors /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/my-appointments" element={
            <ProtectedRoute>
              <Layout><MyAppointments /></Layout>
            </ProtectedRoute>
          } />

          {/* Admin routes */}
          <Route path="/admin" element={
            <ProtectedRoute adminOnly>
              <Layout><AdminDashboard /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/doctors" element={
            <ProtectedRoute adminOnly>
              <Layout><ManageDoctors /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/slots" element={
            <ProtectedRoute adminOnly>
              <Layout><ManageSlots /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/appointments" element={
            <ProtectedRoute adminOnly>
              <Layout><ManageAppointments /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/admin/patients" element={
            <ProtectedRoute adminOnly>
              <Layout><ManagePatients /></Layout>
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
