import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  GraduationCap,
  Building2,
  ShieldCheck,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import './Customer.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

const ROLE_CONFIG = {
  customer: {
    label: 'Customer / Student',
    icon: GraduationCap,
    desc: 'Access your library memberships, seat reservations, and saved study spaces.',
    demoEmail: 'ankit.ui.test@example.com',
    demoPass: 'password123',
    demoLabel: 'Use Demo Customer'
  },
  owner: {
    label: 'Library Owner',
    icon: Building2,
    desc: 'Manage your library listings, seat availability, and visitor bookings.',
    demoEmail: 'owner.test@example.com',
    demoPass: 'password123',
    demoLabel: 'Use Demo Owner'
  },
  admin: {
    label: 'Admin',
    icon: ShieldCheck,
    desc: 'Access the administrative control center to review and approve libraries.',
    demoEmail: 'test@example.com',
    demoPass: 'password123',
    demoLabel: 'Use Demo Admin'
  }
}

function Auth({ mode }) {
  const isRegister = mode === 'register'

  const [selectedRole, setSelectedRole] = useState('customer')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [notice, setNotice] = useState('')
  const [errorNotice, setErrorNotice] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()

  const selectedLibrary = new URLSearchParams(location.search).get('library')

  const handleFillDemo = (roleKey) => {
    const config = ROLE_CONFIG[roleKey]
    if (!config) return
    setEmail(config.demoEmail)
    setPassword(config.demoPass)
    setErrorNotice('')
    setNotice(`Loaded demo credentials for ${config.label}.`)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setNotice('')
    setErrorNotice('')
    setLoading(true)

    try {
      const endpoint = isRegister
        ? `${API_BASE_URL}/auth/register`
        : `${API_BASE_URL}/auth/login`

      const requestBody = isRegister
        ? { name: name.trim(), email: email.trim(), password }
        : { email: email.trim(), password }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Authentication request failed.')
      }

      if (isRegister) {
        navigate(
          selectedLibrary ? `/login?library=${selectedLibrary}` : '/login',
          {
            state: {
              notice: 'Account created successfully! Please sign in.'
            }
          }
        )
        return
      }

      // Backend role validation: Ensure actual backend role matches selected role
      const actualRole = data.user.role
      if (actualRole !== selectedRole) {
        const expectedName = ROLE_CONFIG[selectedRole]?.label || selectedRole
        const actualName = ROLE_CONFIG[actualRole]?.label || actualRole

        setErrorNotice(
          `Role mismatch: You selected "${expectedName}", but this account is registered as "${actualName}". Please switch to the ${actualName} tab to sign in.`
        )
        setLoading(false)
        return
      }

      // Route and redirect based on actual verified role
      if (actualRole === 'customer') {
        window.localStorage.setItem('kitaab-auth-token', data.token)
        window.localStorage.setItem(
          'kitaab-demo-user',
          JSON.stringify({
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
            libraryId: selectedLibrary
          })
        )
        navigate(
          selectedLibrary
            ? `/membership-plans/${selectedLibrary}`
            : '/dashboard'
        )
      } else if (actualRole === 'owner') {
        window.localStorage.setItem('kitaab-auth-token', data.token)
        window.localStorage.setItem('kitaab-demo-user', JSON.stringify(data.user))
        navigate('/owner/dashboard')
      } else if (actualRole === 'admin') {
        window.localStorage.setItem('kitaab-auth-token', data.token)
        window.localStorage.setItem('kitaab-demo-user', JSON.stringify(data.user))
        navigate('/owner/dashboard?section=admin')
      }
    } catch (error) {
      setErrorNotice(error.message || 'Unable to connect to the server')
    } finally {
      setLoading(false)
    }
  }

  const initialNotice = location.state?.notice

  return (
    <main className="customer-page auth-page">
      <section className="auth-card">
        <span className="auth-role-badge">KITAAB · UNIFIED LOGIN</span>
        <h1>{isRegister ? 'Create your account.' : 'Sign in to Kitaab.'}</h1>

        <p className="auth-intro">
          {isRegister
            ? 'Create an account to join the Kitaab student study community.'
            : 'Select your role to access your dedicated workspace.'}
        </p>

        {/* Role Selector Tabs (Only on Login mode) */}
        {!isRegister && (
          <>
            <div className="auth-role-selector" role="tablist" aria-label="Select role">
              {Object.entries(ROLE_CONFIG).map(([roleKey, cfg]) => {
                const IconComponent = cfg.icon
                const isActive = selectedRole === roleKey
                return (
                  <button
                    key={roleKey}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    className={`auth-role-tab ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedRole(roleKey)
                      setErrorNotice('')
                      setNotice('')
                    }}
                  >
                    <IconComponent size={15} />
                    <span>{cfg.label}</span>
                  </button>
                )
              })}
            </div>

            <div className="auth-role-desc">
              {ROLE_CONFIG[selectedRole]?.desc}
            </div>
          </>
        )}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <label>
              Your name
              <input
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Name you go by"
                required
              />
            </label>
          )}

          <label>
            Email address
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 6 characters"
              minLength="6"
              required
            />
          </label>

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading
              ? 'Authenticating...'
              : isRegister
              ? 'Create student account'
              : `Sign in as ${ROLE_CONFIG[selectedRole]?.label || 'User'}`}

            {!loading && <ArrowRight size={19} aria-hidden="true" />}
          </button>
        </form>

        {/* Notices and Alerts */}
        {(notice || initialNotice) && (
          <div
            style={{
              marginTop: 14,
              padding: '10px 14px',
              background: '#e6f5eb',
              border: '1px solid #c2e8ce',
              borderRadius: 6,
              color: '#1e5c35',
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <CheckCircle size={16} />
            <span>{notice || initialNotice}</span>
          </div>
        )}

        {errorNotice && (
          <div
            style={{
              marginTop: 14,
              padding: '10px 14px',
              background: '#fff0ed',
              border: '1px solid #ffd5ce',
              borderRadius: 6,
              color: '#b34c3e',
              fontSize: 12,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
              lineHeight: 1.5
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
            <span>{errorNotice}</span>
          </div>
        )}

        {/* Role Demo Credential Pill */}
        {!isRegister && (
          <div className="auth-demo-pill">
            <div>
              <strong>Demo {ROLE_CONFIG[selectedRole]?.label}:</strong>
              <div style={{ color: '#315c45', fontFamily: 'monospace', fontSize: 11 }}>
                {ROLE_CONFIG[selectedRole]?.demoEmail} / {ROLE_CONFIG[selectedRole]?.demoPass}
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleFillDemo(selectedRole)}
            >
              {ROLE_CONFIG[selectedRole]?.demoLabel}
            </button>
          </div>
        )}

        <p className="auth-switch">
          {isRegister ? 'Already have an account?' : 'New student or member?'}{' '}
          <Link to={isRegister ? '/login' : '/register'}>
            {isRegister ? 'Sign in' : 'Create an account'}
          </Link>
        </p>

        {!isRegister && selectedRole === 'owner' && (
          <p style={{ marginTop: 12, fontSize: 12, color: '#5b5853' }}>
            Want to partner and list your library space?{' '}
            <Link
              to="/owner/apply"
              style={{ color: '#315c45', fontWeight: 600, textDecoration: 'underline' }}
            >
              Apply as a Library Owner
            </Link>
          </p>
        )}
      </section>

      <aside
        className="auth-side"
        style={{
          backgroundImage:
            "linear-gradient(0deg,#080a10a8,#080a1028),url('/images/study-community.webp')"
        }}
      >
        <h2>
          Your place to
          <br />
          get things done.
        </h2>

        <Link to="/locations">
          Browse study libraries <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </aside>
    </main>
  )
}

export default Auth
