import { useState } from 'react'
import './Navbar.css'

const ownerAppUrl = import.meta.env.VITE_OWNER_APP_URL || 'http://localhost:5174'

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="site-header">
      <div className="utility-nav">
        <div className="utility-links">
          <a className="utility-pill" href="/login"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="7" r="4" /><path d="M4 21a8 8 0 0 1 16 0z" /></svg> My Account</a>
          <button className="utility-pill" type="button"><span aria-hidden="true">↗</span> <span>Quick Links</span><b aria-hidden="true">⌄</b></button>
          <a className="utility-pill" href="/register"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="1" /><circle cx="9" cy="10" r="2.5" fill="#fff" /><path d="M5.5 17a3.5 3.5 0 0 1 7 0" fill="#fff" /><path d="M15 9h4M15 13h4" stroke="#fff" strokeWidth="1.5" /></svg> Memberships <b aria-hidden="true">⌄</b></a>
          <button className="utility-pill" type="button"><span aria-hidden="true">◎</span> <span>Languages</span><b aria-hidden="true">⌄</b></button>
        </div>
        <div className="utility-search">
          <a href="/locations"><span aria-hidden="true">▤</span> Search Libraries <span className="utility-magnify">⌕</span></a>
          <a href="/#locations"><span aria-hidden="true">⌖</span> Search Kitaab <span className="utility-magnify">⌕</span></a>
        </div>
      </div>

      <nav className="navbar" aria-label="Main navigation">
        <a className="brand" href="/" aria-label="Kitaab home">
          <svg className="brand-mark" viewBox="0 0 50 50" role="img" aria-label="">
            <path d="M5 11c7-2 13-1 20 4v27c-7-5-13-6-20-4z" fill="currentColor" />
            <path d="M45 11c-7-2-13-1-20 4v27c7-5 13-6 20-4z" fill="currentColor" />
            <path d="M25 15v27" stroke="#f6f1e7" strokeWidth="1.7" />
            <path d="M11 19c4 0 7 1 10 3M11 25c4 0 7 1 10 3M39 19c-4 0-7 1-10 3M39 25c-4 0-7 1-10 3" fill="none" stroke="#f6f1e7" strokeWidth="1.2" />
          </svg>
          <span className="brand-word">KITAAB</span>
        </a>

        <button
          className={`menu-toggle ${menuOpen ? 'is-open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        ><span /><span /></button>

        <div className={`nav-content ${menuOpen ? 'is-open' : ''}`}>
          <ul className="nav-links">
            <li><a href="/#home" onClick={closeMenu}>Home</a></li>
            <li><a href="/locations" onClick={closeMenu}>Locations <b aria-hidden="true">⌄</b></a></li>
            <li><a href="/events" onClick={closeMenu}>Events <b aria-hidden="true">⌄</b></a></li>
            <li><a href="/about" onClick={closeMenu}>About <b aria-hidden="true">⌄</b></a></li>
          </ul>
          <a className="owner-login" href={ownerAppUrl}>Owner Login <span aria-hidden="true">↗</span></a>
        </div>
      </nav>
    </header>
  )
}

export default Navbar
