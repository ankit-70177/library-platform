
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import './Customer.css'

function Auth({ mode }) {
  const isRegister = mode === 'register'

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()

  const selectedLibrary = new URLSearchParams(location.search).get('library')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setNotice('')
    setLoading(true)

    try {
      const endpoint = isRegister
        ? 'http://localhost:5001/api/auth/register'
        : 'http://localhost:5001/api/auth/login'

      const requestBody = isRegister
        ? { name: name.trim(), email: email.trim(), password }
        : { email: email.trim(), password }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong')
      }

      if (isRegister) {
        navigate('/login', {
          state: {
            notice: 'Account created successfully! Please sign in.',
          },
        })
        return
      }

      // Save authentication details after successful login
      window.localStorage.setItem('kitaab-auth-token', data.token)

      window.localStorage.setItem(
        'kitaab-demo-user',
        JSON.stringify({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          libraryId: selectedLibrary,
        })
      )

      navigate('/dashboard')
    } catch (error) {
      setNotice(error.message || 'Unable to connect to the server')
    } finally {
      setLoading(false)
    }
  }

  const initialNotice = location.state?.notice

  return (
    <main className="customer-page auth-page">
      <section className="auth-card">
        <h1>{isRegister ? 'Create your account.' : 'Sign in to Kitaab.'}</h1>

        <p className="auth-intro">
          {selectedLibrary
            ? 'Create an account to continue exploring this library.'
            : 'Keep your library and membership details together.'}
        </p>

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

          <button
            className="auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading
              ? 'Please wait...'
              : isRegister
                ? 'Create account'
                : 'Sign in'}

            {!loading && (
              <ArrowRight size={19} aria-hidden="true" />
            )}
          </button>
        </form>

        {(notice || initialNotice) && (
          <p className="auth-notice" role="status">
            {notice || initialNotice}
          </p>
        )}

        <p className="auth-switch">
          {isRegister ? 'Already have an account?' : 'New to Kitaab?'}{' '}
          <Link to={isRegister ? '/login' : '/register'}>
            {isRegister ? 'Sign in' : 'Create an account'}
          </Link>
        </p>

        <p className="demo-note">
          {isRegister
            ? 'Your account details will be securely saved on our server.'
            : 'Sign in to access your Kitaab account.'}
        </p>
      </section>

      <aside
        className="auth-side"
        style={{
          backgroundImage:
            "linear-gradient(0deg,#080a10a8,#080a1028),url('/images/study-community.webp')",
        }}
      >
        <h2>Your place to<br />get things done.</h2>

        <Link to="/locations">
          Browse study libraries <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </aside>
    </main>
  )
}

export default Auth
