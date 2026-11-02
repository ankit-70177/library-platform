import { useState } from 'react'
import { UserRound, CreditCard, Search, BookOpen, ArrowUpRight, MapPin, CalendarDays, Info } from 'lucide-react'
import './Navbar.css'

const ownerAppUrl = import.meta.env.VITE_OWNER_APP_URL || 'http://localhost:5174'

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="site-header">
      <div className="utility-nav">
        <div className="utility-links">
          <a className="utility-pill" href="/login"><UserRound aria-hidden="true" /> My Account</a>
          <a className="utility-pill" href="/register"><CreditCard aria-hidden="true" /> Memberships</a>
        </div>
        <div className="utility-search">
          <a href="/locations"><BookOpen aria-hidden="true" /> Search Libraries</a>
          <a href="/#locations"><Search aria-hidden="true" /> Search Kitaab</a>
        </div>
      </div>
      <nav className="navbar" aria-label="Main navigation">
        <a className="brand" href="/" aria-label="Kitaab home"><span className="brand-mark" aria-hidden="true"><BookOpen /></span><span className="brand-word">KITAAB</span></a>
        <button className={`menu-toggle ${menuOpen ? 'is-open' : ''}`} onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}><span /><span /></button>
        <div className={`nav-content ${menuOpen ? 'is-open' : ''}`}>
          <ul className="nav-links">
            <li><a href="/#home" onClick={closeMenu}>Home</a></li>
            <li><a href="/locations" onClick={closeMenu}><MapPin aria-hidden="true" /> Locations</a></li>
            <li><a href="/events" onClick={closeMenu}><CalendarDays aria-hidden="true" /> Events</a></li>
            <li><a href="/about" onClick={closeMenu}><Info aria-hidden="true" /> About</a></li>
          </ul>
          <a className="owner-login" href={ownerAppUrl}>For library owners <ArrowUpRight aria-hidden="true" /></a>
        </div>
      </nav>
    </header>
  )
}

export default Navbar
