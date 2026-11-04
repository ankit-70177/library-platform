import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, ChevronDown, CircleHelp, MapPin, Search, UserPlus, UserRound } from 'lucide-react'
import './Navbar.css'

function BookMark() {
  return (
    <svg className="brand-mark" viewBox="0 0 50 50" aria-hidden="true">
      <path d="M5 11c7-2 13-1 20 4v27c-7-5-13-6-20-4z" fill="currentColor" />
      <path d="M45 11c-7-2-13-1-20 4v27c7-5 13-6 20-4z" fill="currentColor" />
      <path d="M25 15v27" stroke="#f6f1e8" strokeWidth="1.7" />
      <path d="M11 19c4 0 7 1 10 3M11 25c4 0 7 1 10 3M39 19c-4 0-7 1-10 3M39 25c-4 0-7 1-10 3" fill="none" stroke="#f6f1e8" strokeWidth="1.2" />
    </svg>
  )
}

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="site-header">
      <div className="utility-nav">
        <div className="utility-links">
          <Link className="utility-pill" to="/dashboard"><UserRound size={17} aria-hidden="true" /> My account</Link>
          <Link className="utility-pill" to="/register"><UserPlus size={17} aria-hidden="true" /> Join Kitaab</Link>
          <Link className="utility-pill" to="/about"><CircleHelp size={17} aria-hidden="true" /> How it works</Link>
        </div>
        <div className="utility-search">
          <Link to="/locations"><MapPin size={16} aria-hidden="true" /> Search libraries <Search className="utility-magnify" size={19} aria-hidden="true" /></Link>
          <Link to="/locations">Explore Sonipat <ArrowRight className="utility-magnify" size={19} aria-hidden="true" /></Link>
        </div>
      </div>
      <nav className="navbar" aria-label="Main navigation">
        <Link className="brand" to="/" aria-label="Kitaab home" onClick={closeMenu}>
          <BookMark /><span className="brand-word">KITAAB</span>
        </Link>
        <button className={`menu-toggle ${menuOpen ? 'is-open' : ''}`} type="button" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}><span /><span /></button>
        <div className={`nav-content ${menuOpen ? 'is-open' : ''}`}>
          <ul className="nav-links">
            <li><Link to="/locations" onClick={closeMenu}>Find a library <ChevronDown size={15} aria-hidden="true" /></Link></li>
            <li><Link to="/register" onClick={closeMenu}>Memberships <ChevronDown size={15} aria-hidden="true" /></Link></li>
            <li><Link to="/events" onClick={closeMenu}>Events <ChevronDown size={15} aria-hidden="true" /></Link></li>
            <li><Link to="/about" onClick={closeMenu}>About Kitaab <ChevronDown size={15} aria-hidden="true" /></Link></li>
          </ul>
          <Link className="account-button" to="/login" onClick={closeMenu}>Sign in <ArrowUpRight size={16} aria-hidden="true" /></Link>
        </div>
      </nav>
    </header>
  )
}

export default Navbar
