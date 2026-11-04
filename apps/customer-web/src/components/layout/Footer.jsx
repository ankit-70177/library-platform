import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUp } from 'lucide-react'
import './Footer.css'

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-column footer-brand-column">
          <Link className="footer-brand" to="/"><span className="footer-mark">K</span><span>KITAAB<small>Find your focus</small></span></Link>
          <p>Find a library that fits your day.<br />Find your next good routine.</p>
        </div>
        <div className="footer-column"><h2>Explore</h2><Link to="/locations">Study libraries</Link><Link to="/events">Events & sessions</Link><Link to="/about">How it works</Link></div>
        <div className="footer-column"><h2>Your account</h2><Link to="/login">Sign in</Link><Link to="/register">Create an account</Link><Link to="/dashboard">Memberships</Link></div>
        <div className="footer-column footer-social"><h2>Find us around Sonipat</h2><p>Made for the hours you put in.</p><Link to="/locations">Explore local spaces <ArrowRight size={16} aria-hidden="true" /></Link></div>
      </div>
      <div className="footer-bottom"><span>© 2026 Kitaab · Student project</span><span>Discover · Compare · Study</span><a href="#home">Back to top <ArrowUp size={14} aria-hidden="true" /></a></div>
    </footer>
  )
}

export default Footer
