import { useState, useEffect } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const [dark, setDark] = useState(
    () => (localStorage.getItem('theme') || 'dark') === 'dark'
  )

  useEffect(() => {
    const theme = dark ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [dark])

  const getInitials = (u) => {
    if (u.first_name && u.last_name) return (u.first_name[0] + u.last_name[0]).toUpperCase()
    if (u.first_name) return u.first_name.slice(0, 2).toUpperCase()
    return u.username.slice(0, 2).toUpperCase()
  }

  const displayName = user?.first_name || user?.username || ''

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        🏥 Piki Ora Medical Centre
      </Link>

      {user && (
        <ul className="navbar-links">
          {user.is_admin_staff ? (
            <>
              <li><NavLink to="/admin">📊 Dashboard</NavLink></li>
              <li><NavLink to="/admin/doctors">👨‍⚕️ Doctors</NavLink></li>
              <li><NavLink to="/admin/slots">🕐 Slots</NavLink></li>
              <li><NavLink to="/admin/appointments">📋 Appointments</NavLink></li>
              <li><NavLink to="/admin/patients">👥 Patients</NavLink></li>
            </>
          ) : (
            <>
              <li><NavLink to="/">Home</NavLink></li>
              <li><NavLink to="/doctors">Book Appointment</NavLink></li>
              <li><NavLink to="/my-appointments">My Appointments</NavLink></li>
            </>
          )}

          {/* User avatar + name */}
          <li>
            <div className="navbar-user">
              <div className="navbar-avatar">{getInitials(user)}</div>
              <span className="navbar-username">{displayName}</span>
            </div>
          </li>

          {/* Theme toggle */}
          <li>
            <button className="theme-toggle" onClick={() => setDark(d => !d)} title="Toggle dark mode">
              {dark ? '☀️' : '🌙'}
            </button>
          </li>

          {/* Logout */}
          <li>
            <button className="btn-logout" onClick={logout}>Logout</button>
          </li>
        </ul>
      )}
    </nav>
  )
}
