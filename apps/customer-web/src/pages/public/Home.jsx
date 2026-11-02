import { useMemo, useState } from 'react'
import { Search, UserRound, CreditCard, Building2, CircleHelp, CalendarDays } from 'lucide-react'
import heroImage from '../../assets/library-hero.png'
import { eventFormats, sampleLibraries } from '../../data/sampleContent.js'
import './Home.css'

function Home() {
  const [search, setSearch] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const filteredLibraries = useMemo(() => {
    const query = appliedSearch.toLowerCase()
    if (!query) return sampleLibraries
    return sampleLibraries.filter((library) => `${library.name} ${library.area} ${library.facilities.join(' ')}`.toLowerCase().includes(query))
  }, [appliedSearch])

  const handleSearch = (event) => {
    event.preventDefault()
    setAppliedSearch(search.trim())
    document.getElementById('locations')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <main className="home" id="home">
      <section className="hero-banner" style={{ '--hero-image': `url(${heroImage})` }} aria-label="Welcome to Kitaab">
        <div className="hero-content">
          <h1>Kitaab</h1>
          <p className="hero-description">A quiet corner can change your day.<br />Make room for what matters.</p>
        </div>
      </section>

      <section className="hero-search-stage" aria-labelledby="search-title">
        <div className="hero-search-panel">
          <div className="search-panel-main">
            <h2 id="search-title">What can we help you find?</h2>
            <form className="search-form" onSubmit={handleSearch}>
              <label className="sr-only" htmlFor="library-search">Search by city, area, or library</label>
              <Search className="search-pin" aria-hidden="true" />
              <input id="library-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Type a city, area, or library name..." />
            </form>
            <div className="search-panel-actions">
              <button type="button" onClick={handleSearch}><span aria-hidden="true">▤</span> Search Libraries</button>
              <a href="/locations"><span aria-hidden="true">⌖</span> Browse Locations</a>
            </div>
          </div>
          <aside className="search-panel-links" aria-label="Quick links">
            <a href="/login"><UserRound aria-hidden="true" /> My Account</a>
            <a href="/register"><CreditCard aria-hidden="true" /> Memberships</a>
            <a href={import.meta.env.VITE_OWNER_APP_URL || 'http://localhost:5174'}><Building2 aria-hidden="true" /> Owner Login</a>
            <a href="/about"><CircleHelp aria-hidden="true" /> Get Help</a>
            <a href="/events"><CalendarDays aria-hidden="true" /> Community Events</a>
          </aside>
        </div>
      </section>

      <section className="texture-ribbon" aria-label="Explore Kitaab">
        <div className="ribbon-heading">
          <h2>Find, Focus &amp; Grow</h2>
        </div>
        <a className="ribbon-card ribbon-lime texture" href="#locations"><span className="ribbon-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 4h16v16H4z"/><path d="M8 8h8M8 12h8M8 16h5"/></svg></span><strong>Libraries near you</strong><span className="ribbon-arrow" aria-hidden="true">↗</span></a>
        <a className="ribbon-card ribbon-blue texture" href="#events"><span className="ribbon-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 5h16v11H4zM8 20h8M12 16v4"/><path d="M8 9h8M8 12h5"/></svg></span><strong>Study together</strong><span className="ribbon-arrow" aria-hidden="true">↗</span></a>
        <a className="ribbon-card ribbon-coral texture" href="#about"><span className="ribbon-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 4h14v16H5zM8 8h8M8 12h8M8 16h5"/></svg></span><strong>About Kitaab</strong><span className="ribbon-arrow" aria-hidden="true">↗</span></a>
      </section>

      <section className="locations-section zigzag-top" id="locations">

        <div className="section-heading-row">
          <h2>Places to settle in.</h2>
          <p>Thoughtful study spaces around Sonipat. Browse the neighbourhoods, compare the little details, and find your kind of quiet.</p>
        </div>
        <div className="location-tabs" aria-label="Popular locations"><span className="tab-active">All locations</span><span>Model Town</span><span>Kundli</span><span>Murthal Road</span></div>
        {appliedSearch && <div className="results-note">Showing sample spaces matching <strong>“{appliedSearch}”</strong><button type="button" onClick={() => { setSearch(''); setAppliedSearch('') }}>Clear search</button></div>}
        <div className="library-grid">
          {filteredLibraries.map((library, index) => (
            <article className={`library-card library-${library.color}`} key={library.id}>
              <div className="library-image texture" aria-hidden="true"><span className="image-index">K / 0{index + 1}</span><span className="image-mark">{index === 0 ? 'शांत' : index === 1 ? 'पढ़ें' : 'ध्यान'}</span><span className="image-corner">↗</span></div>
              <div className="library-card-body">
                <div className="library-title-row"><div><p className="card-kicker">{library.area}</p><h3>{library.name}</h3></div><span className="rating">✳ <span>New</span></span></div>
                <div className="facility-list">{library.facilities.map((facility) => <span key={facility}>{facility}</span>)}</div>
                <div className="library-card-bottom"><span><strong>₹{library.price}</strong> <small>/ month from</small></span><span className="seat-count">{library.seats} seats listed</span></div>
              </div>
            </article>
          ))}
        </div>
        {filteredLibraries.length === 0 && <div className="empty-results">No sample locations match that search. Try “Sonipat”, “Kundli”, or “AC”.</div>}
        <a className="text-link" href="/#locations">Explore all locations <span aria-hidden="true">↗</span></a>
      </section>

      <section className="events-section zigzag-top" id="events">

        <div className="section-heading-row events-heading"><h2>More than a desk.</h2><p>Study sessions, reading circles, and small ways to find your people. We’re shaping the calendar now.</p></div>
        <div className="event-grid">
          {eventFormats.map((event) => <article className={`event-card ${event.color} texture`} key={event.number}><span className="event-number">{event.number}</span><span className="event-stamp" aria-hidden="true">✳</span><div className="event-card-copy"><span>{event.tag}</span><h3>{event.title}</h3><p>{event.description}</p></div><span className="event-arrow" aria-hidden="true">↗</span></article>)}
        </div>

      </section>

      <section className="about-section zigzag-top" id="about">
        <div className="about-photo" style={{ '--hero-image': `url(${heroImage})` }} role="img" aria-label="Students studying together in a reading room"><span className="about-seal">STUDY<br />WELL<br /><b>✳</b></span></div>
        <div className="about-copy">

          <h2>Room to think.<br /><em>Space to become.</em></h2>
          <p>Kitaab helps you find a reading room that fits the way you study. We bring local spaces into one place, so the search for somewhere to focus feels a little less like a search.</p>
          <a className="text-link" href="/about">Get to know Kitaab <span aria-hidden="true">↗</span></a>
          <div className="about-scribble" aria-hidden="true">पढ़ते रहो</div>
        </div>
      </section>

      <section className="owner-banner texture">
        <div><h2>Your library has a place here.</h2><p>Meet the students looking for their next favourite study spot.</p></div>
        <a className="button button-dark" href={import.meta.env.VITE_OWNER_APP_URL || 'http://localhost:5174'}>For library owners <span aria-hidden="true">↗</span></a>
      </section>
    </main>
  )
}

export default Home
