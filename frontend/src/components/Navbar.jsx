import { useState } from 'react';
import './Navbar.css';

function Navbar() {
  // true = mobile menu is open, false = closed
  const [menuOpen, setMenuOpen] = useState(false);

  // Open or close the menu when the hamburger button is clicked
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Close the menu after a link is clicked
  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className="navbar">
      <nav className="navbar-inner">
        {/* Logo + name */}
        <a className="brand" href="/">
          <svg className="brand-mark" viewBox="0 0 32 32" width="32" height="32">
            <rect width="32" height="32" rx="8" fill="#1B2A4A" />
            <path d="M11 7h10v18l-5-4.2L11 25z" fill="#E8A33D" />
          </svg>
          <span>Kitaab</span>
        </a>

        {/* Hamburger button (only visible on small screens) */}
        <button
          className={menuOpen ? 'nav-toggle open' : 'nav-toggle'}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Links and buttons. The "open" class shows it on mobile */}
        <div className={menuOpen ? 'nav-menu open' : 'nav-menu'}>
          <ul className="nav-links">
            <li>
              <a href="#libraries" onClick={closeMenu}>Libraries</a>
            </li>
            <li>
              <a href="#how-it-works" onClick={closeMenu}>How it works</a>
            </li>
            <li>
              <a href="#about" onClick={closeMenu}>About</a>
            </li>
            <li>
              <a href="#owners" onClick={closeMenu}>For owners</a>
            </li>
          </ul>

          <div className="nav-actions">
            <a className="nav-login" href="/login">Log in</a>
            <a className="nav-signup" href="/signup">Sign up</a>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;