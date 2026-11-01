import { Link } from 'react-router-dom'
import './Footer.css'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-main">
        <div>
          <Link to="/" className="footer-logo">
            Library Platform
          </Link>
          <p>Find the right place to read, learn and grow.</p>
        </div>

        <div className="footer-links">
          <Link to="/">Home</Link>
          <Link to="/libraries">Libraries</Link>
          <Link to="/about">About</Link>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 Library Platform</span>
        <span>Made for better study spaces.</span>
      </div>
    </footer>
  )
}

export default Footer