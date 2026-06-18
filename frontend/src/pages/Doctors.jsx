import { useState, useEffect } from 'react'
import api from '../api/axios'
import Toast from '../components/Toast'

export default function Doctors() {
  const [doctors, setDoctors] = useState([])
  const [slots, setSlots] = useState({})          // { doctorId: [slots] }
  const [expanded, setExpanded] = useState(null)   // which doctor is expanded
  const [loading, setLoading] = useState(true)
  const [slotLoading, setSlotLoading] = useState(false)
  const [booking, setBooking] = useState(null)     // slot being booked
  const [reason, setReason] = useState('')
  const [message, setMessage] = useState(null)     // { type, text }

  useEffect(() => {
    api.get('/doctors/').then(res => {
      setDoctors(res.data)
      setLoading(false)
    })
  }, [])

  const loadSlots = async (doctorId) => {
    if (expanded === doctorId) { setExpanded(null); return }
    setExpanded(doctorId)
    if (slots[doctorId]) return
    setSlotLoading(true)
    const res = await api.get(`/slots/?doctor=${doctorId}&available=true`)
    setSlots(prev => ({ ...prev, [doctorId]: res.data }))
    setSlotLoading(false)
  }

  const handleBook = async (slot) => {
    try {
      await api.post('/appointments/', { slot: slot.id, reason })
      setMessage({ type: 'success', text: `✅ Appointment confirmed for ${slot.date} at ${slot.start_time}! We'll see you then.` })
      setBooking(null)
      setReason('')
      // Refresh slots for this doctor
      const res = await api.get(`/slots/?doctor=${slot.doctor}&available=true`)
      setSlots(prev => ({ ...prev, [slot.doctor]: res.data }))
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.slot?.[0] || 'Booking failed. Please try again.' })
      setBooking(null)
    }
  }

  const formatTime = (t) => {
    const [h, m] = t.split(':')
    const hour = parseInt(h)
    return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}`
  }

  const avatarColors = ['#4f46e5','#0891b2','#16a34a','#d97706','#7c3aed','#db2777']
  const getInitials = (name) => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  const getAvatarColor = (name) => avatarColors[name.charCodeAt(0) % avatarColors.length]

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  return (
    <>
    <div className="page">
      <h1>Our Doctors</h1>
      <p className="text-muted mt-1 mb-1">Click on a doctor to see available appointment slots</p>

      <div className="card-grid">
        {doctors.map(doctor => (
          <div key={doctor.id} className="doctor-card">
            <div className="doctor-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div
                  className="doctor-avatar"
                  style={{ background: getAvatarColor(doctor.name) }}
                >
                  {getInitials(doctor.name)}
                </div>
                <div>
                  <h2 style={{ fontSize: '1.05rem', margin: 0, color: 'white' }}>Dr. {doctor.name}</h2>
                  <p style={{ opacity: 0.85, fontSize: '0.85rem', marginTop: '0.2rem' }}>{doctor.specialization}</p>
                </div>
              </div>
              <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.75rem', fontSize: '0.78rem', opacity: 0.85 }}>
                <span>📧 {doctor.email}</span>
                {doctor.phone && <span>📞 {doctor.phone}</span>}
              </div>
            </div>
            <div className="doctor-card-body">
              {doctor.bio && <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>{doctor.bio}</p>}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                  {doctor.available_slots} slot{doctor.available_slots !== 1 ? 's' : ''} available
                </span>
                <button className="btn btn-primary btn-sm" onClick={() => loadSlots(doctor.id)}>
                  {expanded === doctor.id ? 'Hide Slots ▲' : 'View Slots ▼'}
                </button>
              </div>

              {expanded === doctor.id && (
                <div>
                  {slotLoading ? (
                    <div style={{ textAlign: 'center', padding: '1rem' }}><div className="spinner" /></div>
                  ) : slots[doctor.id]?.length === 0 ? (
                    <p className="text-muted" style={{ fontSize: '0.85rem', textAlign: 'center', padding: '0.75rem' }}>
                      No available slots at this time.
                    </p>
                  ) : (
                    <>
                      {/* Group slots by date */}
                      {Object.entries(
                        (slots[doctor.id] || []).reduce((acc, s) => {
                          (acc[s.date] = acc[s.date] || []).push(s)
                          return acc
                        }, {})
                      ).map(([date, dateSlots]) => (
                        <div key={date} style={{ marginBottom: '0.75rem' }}>
                          <div className="date-chip">
                            📅 {new Date(date + 'T00:00:00').toLocaleDateString('en-NZ', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </div>
                          <div className="slot-grid">
                            {dateSlots.map(slot => (
                              <button
                                key={slot.id}
                                className="slot-btn"
                                onClick={() => setBooking(slot)}
                              >
                                {formatTime(slot.start_time)}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>

    {/* Toast & modal outside .page to avoid stacking-context bug */}
    <Toast message={message?.text} type={message?.type} onClose={() => setMessage(null)} />

    {booking && (
      <div className="modal-overlay" onClick={() => setBooking(null)}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <h2 className="modal-title">Confirm Appointment</h2>
          <div className="alert alert-info">
            <strong>Dr. {booking.doctor_name}</strong> ({booking.doctor_specialization})<br />
            📅 {new Date(booking.date + 'T00:00:00').toLocaleDateString('en-NZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br />
            🕐 {formatTime(booking.start_time)} – {formatTime(booking.end_time)}
          </div>
          <div className="form-group">
            <label>Reason for visit (optional)</label>
            <textarea
              className="form-control"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="E.g. Annual check-up, flu symptoms, follow-up..."
            />
          </div>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => setBooking(null)}>Cancel</button>
            <button className="btn btn-success" onClick={() => handleBook(booking)}>Confirm Booking</button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}
