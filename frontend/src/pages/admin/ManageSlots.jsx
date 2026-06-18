import { useState, useEffect } from 'react'
import api from '../../api/axios'
import Toast from '../../components/Toast'

const emptyForm = { doctor: '', date: '', start_time: '', end_time: '' }

export default function ManageSlots() {
  const [slots, setSlots] = useState([])
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [filterDoctor, setFilterDoctor] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const load = () => {
    Promise.all([
      api.get('/slots/' + (filterDoctor ? `?doctor=${filterDoctor}` : '')),
      api.get('/doctors/'),
    ]).then(([s, d]) => {
      setSlots(s.data)
      setDoctors(d.data)
      setLoading(false)
    })
  }

  useEffect(() => { load() }, [filterDoctor])

  const handleSave = async () => {
    setError('')
    try {
      await api.post('/slots/', form)
      setMessage('Slot created successfully.')
      setModal(false)
      setForm(emptyForm)
      load()
    } catch (err) {
      const data = err.response?.data
      setError(data ? Object.values(data).flat().join(' ') : 'Could not create slot.')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this slot?')) return
    await api.delete(`/slots/${id}/`)
    setMessage('Slot deleted.')
    load()
  }

  const formatTime = (t) => {
    if (!t) return ''
    const [h, m] = t.split(':')
    const hour = parseInt(h)
    return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}`
  }

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  return (
    <>
      <div className="page">
        <div className="page-header">
          <div>
            <h1>Manage Appointment Slots</h1>
            <p className="text-muted mt-1">{slots.length} slot{slots.length !== 1 ? 's' : ''}</p>
          </div>
          <button className="btn btn-primary" onClick={() => { setForm(emptyForm); setError(''); setModal(true) }}>+ Add Slot</button>
        </div>

        {/* Filter */}
        <div className="card" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <label style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>Filter by doctor:</label>
          <select className="form-control" style={{ maxWidth: 250 }} value={filterDoctor} onChange={e => setFilterDoctor(e.target.value)}>
            <option value="">All Doctors</option>
            {doctors.map(d => <option key={d.id} value={d.id}>Dr. {d.name}</option>)}
          </select>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>Doctor</th><th>Date</th><th>Start</th><th>End</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {slots.map(slot => (
                <tr key={slot.id}>
                  <td>Dr. {slot.doctor_name}</td>
                  <td>{new Date(slot.date + 'T00:00:00').toLocaleDateString('en-NZ', { weekday: 'short', day: 'numeric', month: 'short' })}</td>
                  <td>{formatTime(slot.start_time)}</td>
                  <td>{formatTime(slot.end_time)}</td>
                  <td><span className={`badge ${slot.is_available ? 'badge-green' : 'badge-gray'}`}>{slot.is_available ? 'Available' : 'Booked'}</span></td>
                  <td>
                    {slot.is_available && (
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(slot.id)}>Delete</button>
                    )}
                  </td>
                </tr>
              ))}
              {slots.length === 0 && <tr><td colSpan={6} className="text-center text-muted" style={{ padding: '2rem' }}>No slots found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Toast & Modal rendered OUTSIDE .page to avoid animation stacking-context bug */}
      <Toast message={message} type="success" onClose={() => setMessage('')} />

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Add Appointment Slot</h2>
            {error && <div className="alert alert-error">{error}</div>}
            <div className="form-group">
              <label>Doctor *</label>
              <select className="form-control" value={form.doctor} onChange={e => setForm({ ...form, doctor: e.target.value })}>
                <option value="">Select a doctor</option>
                {doctors.map(d => <option key={d.id} value={d.id}>Dr. {d.name} — {d.specialization}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Date *</label>
              <input className="form-control" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} min={new Date().toISOString().split('T')[0]} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Start Time *</label>
                <input className="form-control" type="time" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} />
              </div>
              <div className="form-group">
                <label>End Time *</label>
                <input className="form-control" type="time" value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>Create Slot</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
