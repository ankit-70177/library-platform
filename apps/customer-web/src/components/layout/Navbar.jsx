import { useState } from 'react'
import './Navbar.css'

const ownerAppUrl = import.meta.env.VITE_OWNER_APP_URL || 'http://localhost:5174'

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="site-header">
      <div className="header-topline">
        <span>Find your quiet corner.</span>
        <a href={ownerAppUrl}>For library owners <span aria-hidden="true">↗</span></a>
      </div>
      <nav className="navbar" aria-label="Main navigation">
        <a className="brand" href="/" aria-label="Kitaab home">
          <svg className="brand-mark" viewBox="0 0 44 44" role="img" aria-label="">
            <path d="M5 10.5c6.2-2 11.9-1.2 17 2.4v23c-5.1-3.6-10.8-4.4-17-2.4z" fill="currentColor" />
            <path d="M39 10.5c-6.2-2-11.9-1.2-17 2.4v23c5.1-3.6 10.8-4.4 17-2.4z" fill="currentColor" />
            <path d="M22 13v23" stroke="#f6f1e7" strokeWidth="1.5" />
            <path d="M10 17c3 .1 5.3.7 7 1.8M10 22c3 .1 5.3.7 7 1.8M34 17c-3 .1-5.3.7-7 1.8M34 22c-3 .1-5.3.7-7 1.8" fill="none" stroke="#f6f1e7" strokeWidth="1" />
          </svg>
          <span className="brand-word">Kitaab</span>
          <span className="brand-caption">A better place to study</span>
        </a>

        <button
          className={`menu-toggle ${menuOpen ? 'is-open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        >
          <span /><span />
        </button>

        <div className={`nav-content ${menuOpen ? 'is-open' : ''}`}>
          <ul className="nav-links">
            <li><a href="/#home" onClick={closeMenu}>Home</a></li>
            <li><a href="/locations" onClick={closeMenu}>Locations</a></li>
            <li><a href="/events" onClick={closeMenu}>Events</a></li>
            <li><a href="/about" onClick={closeMenu}>About</a></li>
          </ul>
          <a className="owner-login" href={ownerAppUrl}>Owner Login <span aria-hidden="true">↗</span></a>
        </div>
      </nav>
    </header>
  )
}

export default Navbar
