import { useState, useEffect } from 'react'
import api from '../../api/axios'
import Toast from '../../components/Toast'

const emptyForm = { name: '', specialization: '', email: '', phone: '', bio: '' }

export default function ManageDoctors() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)  // null | 'add' | 'edit'
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const load = () => api.get('/doctors/').then(r => { setDoctors(r.data); setLoading(false) })
  useEffect(() => { load() }, [])

  const openAdd = () => { setForm(emptyForm); setEditId(null); setError(''); setModal('add') }
  const openEdit = (doc) => { setForm({ name: doc.name, specialization: doc.specialization, email: doc.email, phone: doc.phone || '', bio: doc.bio || '' }); setEditId(doc.id); setError(''); setModal('edit') }

  const handleSave = async () => {
    setError('')
    try {
      if (modal === 'add') await api.post('/doctors/', form)
      else await api.put(`/doctors/${editId}/`, form)
      setMessage(modal === 'add' ? 'Doctor added successfully.' : 'Doctor updated.')
      setModal(null)
      load()
    } catch (err) {
      const data = err.response?.data
      setError(data ? Object.values(data).flat().join(' ') : 'Save failed.')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this doctor? This will also remove all their appointment slots.')) return
    await api.delete(`/doctors/${id}/`)
    setMessage('Doctor deleted.')
    load()
  }

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  return (
    <>
      <div className="page">
        <div className="page-header">
          <div>
            <h1>Manage Doctors</h1>
            <p className="text-muted mt-1">{doctors.length} doctor{doctors.length !== 1 ? 's' : ''} registered</p>
          </div>
          <button className="btn btn-primary" onClick={openAdd}>+ Add Doctor</button>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th><th>Specialization</th><th>Email</th><th>Phone</th><th>Available Slots</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map(doc => (
                <tr key={doc.id}>
                  <td><strong>Dr. {doc.name}</strong></td>
                  <td>{doc.specialization}</td>
                  <td>{doc.email}</td>
                  <td>{doc.phone || '—'}</td>
                  <td><span className="badge badge-blue">{doc.available_slots}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(doc)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(doc.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {doctors.length === 0 && <tr><td colSpan={6} className="text-center text-muted" style={{ padding: '2rem' }}>No doctors yet. Add one to get started.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Toast & Modal rendered OUTSIDE .page to avoid animation stacking-context bug */}
      <Toast message={message} type="success" onClose={() => setMessage('')} />

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">{modal === 'add' ? 'Add New Doctor' : 'Edit Doctor'}</h2>
            {error && <div className="alert alert-error">{error}</div>}
            {['name', 'specialization', 'email', 'phone'].map(field => (
              <div className="form-group" key={field}>
                <label style={{ textTransform: 'capitalize' }}>{field}{field === 'name' || field === 'specialization' || field === 'email' ? ' *' : ''}</label>
                <input className="form-control" value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })}
                  type={field === 'email' ? 'email' : 'text'} />
              </div>
            ))}
            <div className="form-group">
              <label>Bio</label>
              <textarea className="form-control" value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Short biography..." />
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
