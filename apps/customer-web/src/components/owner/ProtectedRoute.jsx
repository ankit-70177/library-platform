import { Link, Navigate, useNavigate } from 'react-router-dom'
import { AlertCircle, LogOut } from 'lucide-react'

export default function ProtectedRoute({ children, requireRole = ['owner', 'admin'] }) {
  const navigate = useNavigate()
  const token = localStorage.getItem('kitaab-auth-token')
  const rawUser = localStorage.getItem('kitaab-demo-user')

  if (!token || !rawUser) {
    return <Navigate to="/owner/login" replace />
  }

  let user = null
  try {
    user = JSON.parse(rawUser)
  } catch {
    localStorage.removeItem('kitaab-auth-token')
    localStorage.removeItem('kitaab-demo-user')
    return <Navigate to="/owner/login" replace />
  }

  const allowedRoles = Array.isArray(requireRole) ? requireRole : [requireRole]

  if (!allowedRoles.includes(user.role)) {
    return (
      <main className="owner-auth-container" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f7f8f5' }}>
        <div className="kd-panel" style={{ maxWidth: 480, margin: '40px auto', textAlign: 'center', padding: 36 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#fff0ed', color: '#b34c3e', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
            <AlertCircle size={28} />
          </div>
          <h2 style={{ margin: '0 0 10px', fontSize: 20 }}>Owner Access Required</h2>
          <p style={{ color: '#5b5853', fontSize: 14, lineHeight: 1.6, margin: '0 0 24px' }}>
            You are signed in as <strong>{user.email}</strong> with role <strong>{user.role}</strong>. This portal is reserved for verified library owners and administrators.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link
              to="/"
              className="kd-primary-button"
              style={{ width: '100%' }}
            >
              Go to Customer App
            </Link>
            <button
              type="button"
              className="kd-secondary-button"
              onClick={() => {
                localStorage.removeItem('kitaab-auth-token')
                localStorage.removeItem('kitaab-demo-user')
                navigate('/owner/login')
              }}
              style={{ width: '100%' }}
            >
              <LogOut size={16} /> Sign out & use another account
            </button>
          </div>
        </div>
      </main>
    )
  }

  return children
}
