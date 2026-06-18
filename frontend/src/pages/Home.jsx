import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { user } = useAuth()
  const name = user?.first_name || user?.username || 'there'

  return (
    <>
      {/* Hero banner */}
      <div className="hero">
        <p className="hero-title">Welcome back, {name}! 👋</p>
        <p className="hero-subtitle">
          Piki Ora Medical Centre — Your health, our priority
        </p>
        <div className="hero-actions">
          <Link to="/doctors" className="btn-hero-primary">
            📅 Book an Appointment
          </Link>
          <Link to="/my-appointments" className="btn-hero-secondary">
            📋 My Appointments
          </Link>
        </div>
      </div>

      {/* Quick info cards */}
      <div className="page">
        <h2 style={{ marginBottom: '1rem' }}>What would you like to do?</h2>
        <div className="card-grid">
          <Link to="/doctors" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ cursor: 'pointer', borderTop: '3px solid var(--accent)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🩺</div>
              <h2>Browse Doctors</h2>
              <p className="text-muted mt-1">
                View our team of qualified specialists and see their available time slots.
              </p>
            </div>
          </Link>

          <Link to="/my-appointments" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ cursor: 'pointer', borderTop: '3px solid var(--accent-2)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📋</div>
              <h2>My Appointments</h2>
              <p className="text-muted mt-1">
                View, edit, or cancel your upcoming bookings at any time.
              </p>
            </div>
          </Link>

          <div className="card" style={{ borderTop: '3px solid var(--success)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🏥</div>
            <h2>About Us</h2>
            <p className="text-muted mt-1">
              Piki Ora Medical Centre provides quality healthcare for the whole family.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
