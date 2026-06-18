import { useState, useEffect } from 'react'
import api from '../../api/axios'
import Toast from '../../components/Toast'

export default function ManagePatients() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [search, setSearch] = useState('')

  const load = () => api.get('/patients/').then(r => { setPatients(r.data); setLoading(false) })
  useEffect(() => { load() }, [])

  const handleDelete = async (id, username) => {
    if (!confirm(`Delete patient "${username}"? This will also remove all their appointments.`)) return
    await api.delete(`/patients/${id}/`)
    setMessage('Patient account deleted.')
    load()
  }

  const filtered = patients.filter(p =>
    p.username.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase()) ||
    `${p.first_name} ${p.last_name}`.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Manage Patients</h1>
          <p className="text-muted mt-1">{patients.length} registered patient{patients.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <Toast message={message} type="success" onClose={() => setMessage('')} />

      <div className="card" style={{ marginBottom: '1rem' }}>
        <input
          className="form-control"
          placeholder="Search by name, username, or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 400 }}
        />
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr><th>Username</th><th>Full Name</th><th>Email</th><th>Phone</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map(patient => (
              <tr key={patient.id}>
                <td>@{patient.username}</td>
                <td>{`${patient.first_name} ${patient.last_name}`.trim() || '—'}</td>
                <td>{patient.email || '—'}</td>
                <td>{patient.phone || '—'}</td>
                <td>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(patient.id, patient.username)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-muted" style={{ padding: '2rem' }}>
                  {search ? 'No patients match your search.' : 'No patients registered yet.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
