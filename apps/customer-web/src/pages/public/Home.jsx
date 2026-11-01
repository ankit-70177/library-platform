import { useMemo, useState } from 'react'
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
          <p className="eyebrow light-eyebrow">Your city, a little quieter</p>
          <h1>A good place<br />to get somewhere.</h1>
          <p className="hero-description">Find your next study space. Discover the reading rooms, routines, and people that make focus feel natural.</p>
          <a className="button button-yellow" href="#locations">Find your library <span aria-hidden="true">↗</span></a>
        </div>
        <div className="hero-note"><span className="note-dot" /> SONIPAT, HARYANA <span className="note-divider">/</span> MADE FOR THE STUDY HOURS
        </div>
      </section>

      <section className="quick-search" aria-labelledby="search-title">
        <div className="search-copy">
          <span className="eyebrow">Start close to home</span>
          <h2 id="search-title">What are you looking for?</h2>
        </div>
        <form className="search-form" onSubmit={handleSearch}>
          <label className="sr-only" htmlFor="library-search">Search by city, area, or library</label>
          <span className="search-pin" aria-hidden="true">⌖</span>
          <input id="library-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="City, locality, or library name" />
          <button type="submit" aria-label="Search libraries">Search <span aria-hidden="true">↗</span></button>
        </form>
        <div className="search-hint"><span>TRY</span><button type="button" onClick={() => { setSearch('Sonipat'); setAppliedSearch('Sonipat'); document.getElementById('locations')?.scrollIntoView({ behavior: 'smooth' }) }}>Sonipat</button><i /> <span>NEAR YOU</span></div>
      </section>

      <section className="texture-ribbon" aria-label="Explore Kitaab">
        <a className="ribbon-card ribbon-lime texture" href="#locations"><span className="ribbon-icon" aria-hidden="true">⌕</span><span className="ribbon-label">Find a place</span><strong>Libraries near you</strong><span className="ribbon-arrow" aria-hidden="true">↗</span></a>
        <a className="ribbon-card ribbon-blue texture" href="#events"><span className="ribbon-icon" aria-hidden="true">✳</span><span className="ribbon-label">Make a little time</span><strong>Study together</strong><span className="ribbon-arrow" aria-hidden="true">↗</span></a>
        <a className="ribbon-card ribbon-coral texture" href="#about"><span className="ribbon-icon" aria-hidden="true">✺</span><span className="ribbon-label">A note from us</span><strong>About Kitaab</strong><span className="ribbon-arrow" aria-hidden="true">↗</span></a>
      </section>

      <section className="locations-section zigzag-top" id="locations">
        <div className="section-topline"><span className="eyebrow">A good seat is closer than you think</span><span className="section-index">01 — FIND YOUR SPACE</span></div>
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
        <div className="section-topline"><span className="eyebrow">Good things happen between the pages</span><span className="section-index">02 — MAKE IT A MOMENT</span></div>
        <div className="section-heading-row events-heading"><h2>More than a desk.</h2><p>Study sessions, reading circles, and small ways to find your people. We’re shaping the calendar now.</p></div>
        <div className="event-grid">
          {eventFormats.map((event) => <article className={`event-card ${event.color} texture`} key={event.number}><span className="event-number">{event.number}</span><span className="event-stamp" aria-hidden="true">✳</span><div className="event-card-copy"><span>{event.tag}</span><h3>{event.title}</h3><p>{event.description}</p></div><span className="event-arrow" aria-hidden="true">↗</span></article>)}
        </div>
        <p className="coming-soon"><span /> COMMUNITY EVENTS ARE COMING SOON</p>
      </section>

      <section className="about-section zigzag-top" id="about">
        <div className="about-photo" style={{ '--hero-image': `url(${heroImage})` }} role="img" aria-label="Students studying together in a reading room"><span className="about-seal">STUDY<br />WELL<br /><b>✳</b></span></div>
        <div className="about-copy">
          <div className="section-topline"><span className="eyebrow">A little about us</span><span className="section-index">03 — OUR IDEA</span></div>
          <h2>Room to think.<br /><em>Space to become.</em></h2>
          <p>Kitaab helps you find a reading room that fits the way you study. We bring local spaces into one place, so the search for somewhere to focus feels a little less like a search.</p>
          <a className="text-link" href="/about">Get to know Kitaab <span aria-hidden="true">↗</span></a>
          <div className="about-scribble" aria-hidden="true">पढ़ते रहो</div>
        </div>
      </section>

      <section className="owner-banner texture">
        <div><span className="eyebrow">For the people who make space</span><h2>Your library has a place here.</h2><p>Meet the students looking for their next favourite study spot.</p></div>
        <a className="button button-dark" href={import.meta.env.VITE_OWNER_APP_URL || 'http://localhost:5174'}>For library owners <span aria-hidden="true">↗</span></a>
      </section>
    </main>
  )
}

export default Home
