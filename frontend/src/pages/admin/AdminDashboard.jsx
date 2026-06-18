import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'

// Animates a number from 0 to `target` over `duration` ms
function StatCard({ value, label, icon }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (value == null || value === 0) { setCount(0); return }
    const duration = 1200
    const increment = value / (duration / 16)
    let current = 0
    const timer = setInterval(() => {
      current = Math.min(current + increment, value)
      setCount(Math.floor(current))
      if (current >= value) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [value])

  return (
    <div className="stat-card">
      <span className="stat-icon">{icon}</span>
      <div className="value">{count}</div>
      <div className="label">{label}</div>
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    Promise.all([
      api.get('/doctors/'),
      api.get('/appointments/'),
      api.get('/patients/'),
      api.get('/slots/'),
    ]).then(([docs, appts, patients, slots]) => {
      setStats({
        doctors: docs.data.length,
        appointments: appts.data.filter(a => a.status === 'CONFIRMED').length,
        patients: patients.data.length,
        availableSlots: slots.data.filter(s => s.is_available).length,
      })
    })
  }, [])

  const statItems = stats ? [
    { value: stats.doctors,        label: 'Doctors',             icon: '👨‍⚕️' },
    { value: stats.appointments,   label: 'Active Appointments', icon: '📋' },
    { value: stats.patients,       label: 'Registered Patients', icon: '👥' },
    { value: stats.availableSlots, label: 'Available Slots',     icon: '🕐' },
  ] : []

  const links = [
    { to: '/admin/doctors',      icon: '👨‍⚕️', label: 'Manage Doctors',  desc: 'Add, edit, or remove doctor profiles',        color: 'var(--accent)' },
    { to: '/admin/slots',        icon: '🕐', label: 'Manage Slots',    desc: 'Create and manage appointment time slots',     color: 'var(--accent-2)' },
    { to: '/admin/appointments', icon: '📋', label: 'All Appointments', desc: 'View and manage all patient bookings',         color: 'var(--success)' },
    { to: '/admin/patients',     icon: '👥', label: 'Manage Patients',  desc: 'View and manage patient accounts',             color: '#d97706' },
  ]

  return (
    <div className="page">
      <h1>Admin Dashboard</h1>
      <p className="text-muted mt-1">Piki Ora Medical Centre — Administration Panel</p>

      {stats && (
        <div className="stat-grid mt-3">
          {statItems.map((s, i) => (
            <StatCard key={i} value={s.value} label={s.label} icon={s.icon} />
          ))}
        </div>
      )}

      <div className="card-grid">
        {links.map(l => (
          <Link key={l.to} to={l.to} style={{ textDecoration: 'none' }}>
            <div className="card" style={{ cursor: 'pointer', borderTop: `3px solid ${l.color}` }}>
              <div style={{ fontSize: '2.25rem', marginBottom: '0.6rem' }}>{l.icon}</div>
              <h2>{l.label}</h2>
              <p className="text-muted mt-1" style={{ fontSize: '0.875rem' }}>{l.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
