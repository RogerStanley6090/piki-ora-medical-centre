/**
 * Axios API client for Piki Ora Medical Centre.
 *
 * - baseURL switches automatically between local dev (localhost:8000)
 *   and production (Render) via the VITE_API_URL environment variable.
 * - Request interceptor: reads the DRF token from localStorage and
 *   attaches it as an Authorization header on every outgoing request.
 * - Response interceptor: if the server returns 401 (token expired or
 *   invalid), clears localStorage and redirects to /login automatically.
 */
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
})

// Automatically attach the auth token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Token ${token}`
  }
  return config
})

// Redirect to login on 401 Unauthorized (expired or invalid token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
