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
  const navigate = useNavigate()
  const location = useLocation()
  const selectedLibrary = new URLSearchParams(location.search).get('library')

  const handleSubmit = (event) => {
    event.preventDefault()
    const displayName = isRegister ? name.trim() : email.split('@')[0]
    window.localStorage.setItem('kitaab-demo-user', JSON.stringify({ name: displayName, email: email.trim(), libraryId: selectedLibrary }))
    setNotice('Demo account ready. Your account is saved in this browser only.')
    navigate('/dashboard')
  }

  return (
    <main className="customer-page auth-page">
      <section className="auth-card">
        <h1>{isRegister ? 'Create your account.' : 'Sign in to Kitaab.'}</h1>
        <p className="auth-intro">{selectedLibrary ? 'Create an account to continue exploring this library.' : 'Keep your library and membership details together.'}</p>
        <form onSubmit={handleSubmit}>
          {isRegister && <label>Your name<input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Name you go by" required /></label>}
          <label>Email address<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required /></label>
          <label>Password<input type="password" autoComplete={isRegister ? 'new-password' : 'current-password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" minLength="6" required /></label>
          <button className="auth-submit" type="submit">{isRegister ? 'Create account' : 'Sign in'} <ArrowRight size={19} aria-hidden="true" /></button>
        </form>
        {notice && <p className="auth-notice" role="status">{notice}</p>}
        <p className="auth-switch">{isRegister ? 'Already have an account?' : 'New to Kitaab?'} <Link to={isRegister ? '/login' : '/register'}>{isRegister ? 'Sign in' : 'Create an account'}</Link></p>
        <p className="demo-note">Frontend preview only. This form saves a demo profile in your browser; it does not contact a server.</p>
      </section>
      <aside className="auth-side" style={{ backgroundImage: "linear-gradient(0deg,#080a10a8,#080a1028),url('/images/study-community.webp')" }}><h2>Your place to<br />get things done.</h2><Link to="/locations">Browse study libraries <ArrowRight size={17} aria-hidden="true" /></Link></aside>
    </main>
  )
}

export default Auth
