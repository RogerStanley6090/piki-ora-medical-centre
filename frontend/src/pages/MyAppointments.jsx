import { useState, useEffect } from 'react'
import api from '../api/axios'
import Toast from '../components/Toast'

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [editReason, setEditReason] = useState('')
  const [message, setMessage] = useState(null)

  const load = async () => {
    const res = await api.get('/appointments/')
    setAppointments(res.data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleCancel = async (id) => {
    if (!confirm('Cancel this appointment?')) return
    try {
      await api.patch(`/appointments/${id}/`, { status: 'CANCELLED' })
      setMessage({ type: 'success', text: 'Appointment cancelled.' })
      load()
    } catch {
      setMessage({ type: 'error', text: 'Could not cancel appointment.' })
    }
  }

  const handleEdit = async () => {
    try {
      await api.patch(`/appointments/${editing.id}/`, { reason: editReason })
      setMessage({ type: 'success', text: 'Appointment updated.' })
      setEditing(null)
      load()
    } catch {
      setMessage({ type: 'error', text: 'Could not update appointment.' })
    }
  }

  const formatDateTime = (slot) => {
    const date = new Date(slot.date + 'T00:00:00').toLocaleDateString('en-NZ', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    })
    const [h, m] = slot.start_time.split(':')
    const hour = parseInt(h)
    const time = `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}`
    return `${date} at ${time}`
  }

  const upcoming = appointments.filter(a => a.status === 'CONFIRMED')
  const past = appointments.filter(a => a.status === 'CANCELLED')

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  return (
    <>
      <div className="page">
        <h1>My Appointments</h1>

        <h2 style={{ marginTop: '1.5rem', marginBottom: '0.75rem' }}>Upcoming ({upcoming.length})</h2>
        {upcoming.length === 0 ? (
          <div className="card text-center" style={{ padding: '2rem' }}>
            <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📅</p>
            <p className="text-muted">No upcoming appointments.</p>
            <a href="/doctors" className="btn btn-primary mt-2">Book an Appointment</a>
          </div>
        ) : (
          <div className="card-grid">
            {upcoming.map(appt => (
              <div key={appt.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h3 style={{ color: 'var(--accent)' }}>Dr. {appt.slot_details?.doctor_name}</h3>
                  <span className="badge badge-green">Confirmed</span>
                </div>
                <p className="text-muted" style={{ fontSize: '0.85rem' }}>{appt.slot_details?.doctor_specialization}</p>
                <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                  🕐 {appt.slot_details && formatDateTime(appt.slot_details)}
                </p>
                {appt.reason && (
                  <p style={{ marginTop: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    📝 {appt.reason}
                  </p>
                )}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => { setEditing(appt); setEditReason(appt.reason) }}>
                    Edit
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleCancel(appt.id)}>
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {past.length > 0 && (
          <>
            <h2 style={{ marginTop: '2rem', marginBottom: '0.75rem' }}>Cancelled ({past.length})</h2>
            <div className="card-grid">
              {past.map(appt => (
                <div key={appt.id} className="card" style={{ opacity: 0.7 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <h3>Dr. {appt.slot_details?.doctor_name}</h3>
                    <span className="badge badge-red">Cancelled</span>
                  </div>
                  <p className="text-muted" style={{ fontSize: '0.85rem' }}>{appt.slot_details?.doctor_specialization}</p>
                  <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                    🕐 {appt.slot_details && formatDateTime(appt.slot_details)}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Toast & modal outside .page to avoid stacking-context bug */}
      <Toast message={message?.text} type={message?.type} onClose={() => setMessage(null)} />

      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Edit Appointment</h2>
            <div className="form-group">
              <label>Reason for visit</label>
              <textarea
                className="form-control"
                value={editReason}
                onChange={e => setEditReason(e.target.value)}
                placeholder="Update your reason for visit..."
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleEdit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
