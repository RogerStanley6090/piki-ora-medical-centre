import { useState, useEffect } from 'react'
import api from '../../api/axios'
import Toast from '../../components/Toast'

export default function ManageAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [message, setMessage] = useState('')

  const load = () => api.get('/appointments/').then(r => { setAppointments(r.data); setLoading(false) })
  useEffect(() => { load() }, [])

  const handleCancel = async (id) => {
    if (!confirm('Cancel this appointment and free the slot?')) return
    await api.patch(`/appointments/${id}/`, { status: 'CANCELLED' })
    setMessage('Appointment cancelled.')
    load()
  }

  const handleDelete = async (id) => {
    if (!confirm('Permanently delete this appointment?')) return
    await api.delete(`/appointments/${id}/`)
    setMessage('Appointment deleted.')
    load()
  }

  const formatDateTime = (slot) => {
    if (!slot) return '—'
    const date = new Date(slot.date + 'T00:00:00').toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' })
    const [h, m] = slot.start_time.split(':')
    const hour = parseInt(h)
    return `${date}, ${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}`
  }

  const filtered = filter === 'ALL' ? appointments : appointments.filter(a => a.status === filter)

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>All Appointments</h1>
          <p className="text-muted mt-1">{appointments.length} total appointments</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['ALL', 'CONFIRMED', 'CANCELLED'].map(f => (
            <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(f)}>
              {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <Toast message={message} type="success" onClose={() => setMessage('')} />

      <div className="table-wrapper">
        <table>
          <thead>
            <tr><th>Patient</th><th>Doctor</th><th>Date & Time</th><th>Reason</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map(appt => (
              <tr key={appt.id}>
                <td>
                  <strong>{appt.patient_name}</strong>
                  <br /><span className="text-muted" style={{ fontSize: '0.8rem' }}>@{appt.patient_username}</span>
                </td>
                <td>Dr. {appt.slot_details?.doctor_name}<br /><span className="text-muted" style={{ fontSize: '0.8rem' }}>{appt.slot_details?.doctor_specialization}</span></td>
                <td style={{ whiteSpace: 'nowrap' }}>{formatDateTime(appt.slot_details)}</td>
                <td style={{ maxWidth: 180 }}>{appt.reason || <span className="text-muted">—</span>}</td>
                <td><span className={`badge ${appt.status === 'CONFIRMED' ? 'badge-green' : 'badge-red'}`}>{appt.status}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    {appt.status === 'CONFIRMED' && (
                      <button className="btn btn-danger btn-sm" onClick={() => handleCancel(appt.id)}>Cancel</button>
                    )}
                    <button className="btn btn-secondary btn-sm" onClick={() => handleDelete(appt.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={6} className="text-center text-muted" style={{ padding: '2rem' }}>No appointments found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
