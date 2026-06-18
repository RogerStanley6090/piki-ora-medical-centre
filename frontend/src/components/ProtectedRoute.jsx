/**
 * ProtectedRoute — wraps any route that requires authentication.
 *
 * Props:
 *   children   — the page component to render if access is granted
 *   adminOnly  — if true, also requires the user to have role=ADMIN
 *
 * Behaviour:
 *   - No user in context (not logged in) → redirect to /login
 *   - adminOnly=true but user is a PATIENT → redirect to home /
 *   - Otherwise → render the protected page
 *
 * Used in App.jsx to guard all routes except /login and /register.
 */
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user } = useAuth()

  // Not logged in — send to login page
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Logged in as a patient trying to access an admin-only route
  if (adminOnly && !user.is_admin_staff) {
    return <Navigate to="/" replace />
  }

  return children
}
