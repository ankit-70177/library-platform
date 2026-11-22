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
import { applyAsOwner, loginUser } from '../../services/api.js'

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

export default function Auth({ initialMode = 'login' }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [mode, setMode] = useState(initialMode) // 'login' | 'apply'
  const [selectedRole, setSelectedRole] = useState('owner')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Application fields
  const [name, setName] = useState('')
  const [libraryName, setLibraryName] = useState('')
  const [libraryAddress, setLibraryAddress] = useState('')
  const [phone, setPhone] = useState('')

  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState(location.state?.notice || '')
  const [errorNotice, setErrorNotice] = useState('')

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
      if (mode === 'login') {
        const response = await loginUser({
          email: email.trim(),
          password
        })

        if (!response.token || !response.user) {
          throw new Error('Invalid response from server.')
        }

        // Validate backend role against user selection
        const actualRole = response.user.role
        if (actualRole !== selectedRole) {
          const expectedName = ROLE_CONFIG[selectedRole]?.label || selectedRole
          const actualName = ROLE_CONFIG[actualRole]?.label || actualRole

          setErrorNotice(
            `Role mismatch: You selected "${expectedName}", but this account is registered as "${actualName}". Please switch to the ${actualName} tab to sign in.`
          )
          setLoading(false)
          return
        }

        // Direct and redirect based on actual verified role
        if (actualRole === 'owner') {
          localStorage.setItem('kitaab-auth-token', response.token)
          localStorage.setItem('kitaab-demo-user', JSON.stringify(response.user))
          navigate('/owner/dashboard')
        } else if (actualRole === 'admin') {
          localStorage.setItem('kitaab-auth-token', response.token)
          localStorage.setItem('kitaab-demo-user', JSON.stringify(response.user))
          navigate('/owner/dashboard?section=admin')
        } else if (actualRole === 'customer') {
          localStorage.setItem('kitaab-auth-token', response.token)
          localStorage.setItem('kitaab-demo-user', JSON.stringify(response.user))
          navigate('/dashboard')
        }
      } else {
        // Apply as owner
        const response = await applyAsOwner({
          name: name.trim(),
          email: email.trim(),
          password,
          libraryName: libraryName.trim(),
          libraryAddress: libraryAddress.trim(),
          phone: phone.trim()
        })

        navigate('/owner/login', {
          replace: true,
          state: {
            notice:
              response.message ||
              'Your application has been submitted! Our admin team will review it shortly. Once approved, you can sign in with your email and password.'
          }
        })
      }
    } catch (err) {
      setErrorNotice(err.message || 'Authentication request failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="owner-auth-container">
      <section className="owner-auth-card">
        <div style={{ marginBottom: 18 }}>
          <span className="kd-eyebrow">KITAAB · UNIFIED LOGIN</span>
          <h1>{mode === 'login' ? 'Sign in to Kitaab.' : 'Partner with Kitaab'}</h1>
          <p className="auth-intro">
            {mode === 'login'
              ? 'Select your role to access your dedicated workspace.'
              : 'Submit an application to list your study library on the Kitaab platform.'}
          </p>
        </div>

        {/* Top Switcher: Sign In vs Apply as Owner */}
        <div className="owner-auth-tabs">
          <button
            type="button"
            className={mode === 'login' ? 'active' : ''}
            onClick={() => {
              setMode('login')
              setErrorNotice('')
              setNotice('')
              navigate('/owner/login')
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={mode === 'apply' ? 'active' : ''}
            onClick={() => {
              setMode('apply')
              setErrorNotice('')
              setNotice('')
              navigate('/owner/apply')
            }}
          >
            Apply as Owner
          </button>
        </div>

        {/* Role Selector Tabs (Only on Login mode) */}
        {mode === 'login' && (
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

        {notice && (
          <div className="kd-banner success" style={{ marginBottom: 16 }}>
            <CheckCircle size={16} />
            <span>{notice}</span>
          </div>
        )}

        {errorNotice && (
          <div className="kd-banner error" style={{ marginBottom: 16 }}>
            <AlertCircle size={16} />
            <span>{errorNotice}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === 'apply' && (
            <>
              <label>
                Your Full Name
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Vikram Sharma"
                />
              </label>

              <label>
                Library / Space Name
                <input
                  type="text"
                  required
                  value={libraryName}
                  onChange={(e) => setLibraryName(e.target.value)}
                  placeholder="e.g. Scholar's Nest Library"
                />
              </label>

              <label>
                Library Address
                <textarea
                  required
                  value={libraryAddress}
                  onChange={(e) => setLibraryAddress(e.target.value)}
                  placeholder="Street address, locality, city"
                />
              </label>

              <label>
                Contact Phone
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </label>
            </>
          )}

          <label>
            Email Address
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              required
              minLength={6}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
            />
          </label>

          <button
            type="submit"
            className="owner-auth-submit"
            disabled={loading}
          >
            {loading
              ? 'Authenticating...'
              : mode === 'login'
              ? `Sign in as ${ROLE_CONFIG[selectedRole]?.label || 'User'}`
              : 'Submit Owner Application'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        {/* Demo Credentials Pill */}
        {mode === 'login' && (
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

        <div style={{ marginTop: 24, fontSize: 13, color: '#69655f' }}>
          Explore study libraries as a student?{' '}
          <Link
            to="/"
            style={{ color: '#315c45', fontWeight: 600, textDecoration: 'underline' }}
          >
            Visit Customer Website
          </Link>
        </div>
      </section>

      <aside className="owner-auth-side">
        <h2>Grow your study library with Kitaab.</h2>
        <p>
          Connect with dedicated students and researchers looking for quiet, comfortable workspaces. Manage listings, track seat availability, and grow your community.
        </p>
        <Link to="/">
          Preview Customer Directory <ArrowRight size={15} />
        </Link>
      </aside>
    </main>
  )
}
