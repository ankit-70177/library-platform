import './Footer.css'

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <a className="footer-brand" href="/#home"><span className="footer-mark">K</span><span>Kitaab<small>A better place to study</small></span></a>
        <p>Find your focus.<br />Find your people.<br />Find your place.</p>
        <nav className="footer-nav" aria-label="Footer navigation">
          <a href="/#home">Home</a><a href="/locations">Locations</a><a href="/events">Events</a><a href="/about">About</a>
        </nav>
      </div>
      <div className="footer-bottom"><span>© 2026 Kitaab</span><span>Made for the study hours.</span><a href={import.meta.env.VITE_OWNER_APP_URL || 'http://localhost:5174'}>For library owners ↗</a></div>
    </footer>
  )
}

export default Footer
