import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register, login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    username: '', email: '', first_name: '', last_name: '',
    phone: '', password: '', password2: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.password2) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      await register(form)
      // Auto-login after registration
      await login(form.username, form.password)
      navigate('/')
    } catch (err) {
      const data = err.response?.data
      if (data) {
        const msgs = Object.values(data).flat().join(' ')
        setError(msgs)
      } else {
        setError('Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-split">
      {/* Left: brand panel */}
      <div className="auth-brand-panel">
        <div className="auth-brand-content">
          <div className="auth-brand-logo">🏥 Piki Ora</div>
          <div className="auth-brand-tagline">Medical Centre — Join our community</div>
          <div className="auth-brand-features">
            <div className="auth-brand-feature">✅ Free to register</div>
            <div className="auth-brand-feature">📅 Online appointment booking</div>
            <div className="auth-brand-feature">🔔 Appointment reminders</div>
            <div className="auth-brand-feature">🏥 Multiple specialists</div>
          </div>
        </div>
      </div>

      {/* Right: form panel */}
      <div className="auth-form-panel" style={{ alignItems: 'flex-start', paddingTop: '2.5rem', paddingBottom: '2.5rem' }}>
        <div className="auth-form-inner">
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Register as a patient at Piki Ora Medical Centre</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
              <div className="form-group">
                <label>First Name</label>
                <input className="form-control" name="first_name" value={form.first_name} onChange={handleChange} placeholder="John" />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input className="form-control" name="last_name" value={form.last_name} onChange={handleChange} placeholder="Doe" />
              </div>
            </div>
            <div className="form-group">
              <label>Username *</label>
              <input className="form-control" name="username" value={form.username} onChange={handleChange} placeholder="Choose a username" required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input className="form-control" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input className="form-control" name="phone" value={form.phone} onChange={handleChange} placeholder="021 000 0000" />
            </div>
            <div className="form-group">
              <label>Password *</label>
              <input className="form-control" type="password" name="password" value={form.password} onChange={handleChange} placeholder="At least 6 characters" required />
            </div>
            <div className="form-group">
              <label>Confirm Password *</label>
              <input className="form-control" type="password" name="password2" value={form.password2} onChange={handleChange} placeholder="Repeat password" required />
            </div>
            <button className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
              {loading ? 'Creating account…' : 'Create Account →'}
            </button>
          </form>

          <p className="text-center mt-2 text-muted">
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
