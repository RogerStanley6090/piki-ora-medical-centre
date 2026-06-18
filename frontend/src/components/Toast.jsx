import { useEffect } from 'react'

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    if (!message) return
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [message])

  if (!message) return null

  const icon = type === 'success' ? '✅' : '❌'

  return (
    <div className={`toast toast-${type}`}>
      <span>{icon} {message}</span>
      <button onClick={onClose}>×</button>
    </div>
  )
}
