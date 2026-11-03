import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, BookOpen, CircleHelp, Clock3, Mail, MapPin, Search, Star, UserPlus, UserRound } from 'lucide-react'
import heroImage from '../../assets/library-hero.png'
import { customerUpdates, eventFormats, sampleLibraries, studyCategories } from '../../data/sampleContent.js'
import './Home.css'

function Arrow() {
  return <span className="arrow-circle" aria-hidden="true"><ArrowRight size={24} strokeWidth={2} /></span>
}

function Home() {
  const [location, setLocation] = useState('')
  const navigate = useNavigate()
  const searchLibraries = (event) => {
    event.preventDefault()
    navigate(`/locations${location.trim() ? `?search=${encodeURIComponent(location.trim())}` : ''}`)
  }

  return (
    <main className="home" id="home">
      <section className="home-hero" style={{ '--hero-image': `url(${heroImage})` }}>
        <div className="hero-heading">
          <h1>Find Your<br />Focus</h1>
        </div>
      </section>

      <section className="search-stage" aria-labelledby="search-title">
        <div className="search-panel">
          <div className="search-main">
            <h2 id="search-title">What can we help you find?</h2>
            <form className="location-search" onSubmit={searchLibraries}>
              <label className="sr-only" htmlFor="library-search">Search by city, neighbourhood, or library</label>
              <Search size={25} strokeWidth={2} aria-hidden="true" />
              <input id="library-search" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="City, neighbourhood, or library name" />
              <button type="submit">Find a library <ArrowRight size={19} aria-hidden="true" /></button>
            </form>
            <div className="search-actions">
              <Link className="black-button" to="/locations">Browse libraries <ArrowRight size={19} aria-hidden="true" /></Link>
              <Link className="black-button" to="/locations">Explore Sonipat <ArrowUpRight size={19} aria-hidden="true" /></Link>
            </div>
          </div>
          <aside className="search-shortcuts" aria-label="Customer shortcuts">
            <Link to="/login"><UserRound size={20} aria-hidden="true" /> My account</Link>
            <Link to="/register"><UserPlus size={20} aria-hidden="true" /> Join Kitaab</Link>
            <Link to="/locations"><MapPin size={20} aria-hidden="true" /> Find a library</Link>
            <Link to="/about"><CircleHelp size={20} aria-hidden="true" /> How it works</Link>
            <a href="mailto:hello@kitaab.example"><Mail size={20} aria-hidden="true" /> Get in touch</a>
          </aside>
        </div>
      </section>

      <section className="discover-section content-width">
        <h2 className="serif-title">Find your study rhythm</h2>
        <div className="category-grid">
          {studyCategories.map((category) => (
            <Link className={`category-card category-${category.color} grain-surface`} to={`/locations?search=${encodeURIComponent(category.search)}`} key={category.title}>
              <span className="category-icon" aria-hidden="true">{category.icon === 'BookOpen' ? <BookOpen size={25} /> : category.icon === 'Clock3' ? <Clock3 size={25} /> : <MapPin size={25} />}</span>
              <h3>{category.title}</h3>
              <span className="category-action">Explore spaces <ArrowRight size={17} aria-hidden="true" /></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="featured-section content-width" id="libraries">
        <div className="section-title-row">
          <div><h2>Featured libraries</h2></div>
          <Link className="section-link" to="/locations">Browse all libraries <ArrowRight size={18} aria-hidden="true" /></Link>
        </div>
        <div className="featured-grid">
          {sampleLibraries.slice(0, 3).map((library) => (
            <article className="featured-card" key={library.id}>
              <Link className="featured-image-link" to={`/locations?search=${encodeURIComponent(library.name)}`} aria-label={`View ${library.name}`}>
                <img src={library.image} alt="A welcoming community study space" />
                <span className="image-badge">{library.area.split(',')[0]}</span>
              </Link>
              <div className="featured-card-copy">
                <p className="library-meta">{library.area}</p>
                <h3><Link to={`/locations?search=${encodeURIComponent(library.name)}`}>{library.name}</Link></h3>
                <div className="library-facts"><span><Star size={15} aria-hidden="true" /> {library.rating}</span><span><Clock3 size={15} aria-hidden="true" /> {library.hours}</span></div>
                <div className="featured-card-bottom"><span><strong>₹{library.price}</strong> <small>/ month</small></span><span>{library.seats} seats listed</span></div>
              </div>
            </article>
          ))}
        </div>
        <Link className="wide-black-button" to="/locations">See every study space <ArrowRight size={19} aria-hidden="true" /></Link>
      </section>

      <section className="spotlight-section content-width">
        <h2 className="serif-title">Spotlight</h2>
        <div className="spotlight-feature">
          <img src="/images/sonipat-study-space.webp" alt="A library building in a leafy neighbourhood" />
          <div className="spotlight-copy grain-surface">
            <h3>Meet your next favourite study spot</h3>
            <p>Explore welcoming local libraries, compare what’s included, and choose a membership that works for you.</p>
            <Link className="black-button" to="/locations">Explore nearby spaces <ArrowRight size={19} aria-hidden="true" /></Link>
          </div>
        </div>
        <div className="spotlight-feature spotlight-feature-reverse">
          <img src="/images/study-session.webp" alt="A student settling in for a focused study session" />
          <div className="spotlight-copy spotlight-copy-blue grain-surface">
            <h3>Make room for your next big idea</h3>
            <p>Find a welcoming seat, a steady routine, and the little details that make a study space feel right.</p>
            <Link className="black-button" to="/locations">Find your study space <ArrowRight size={19} aria-hidden="true" /></Link>
          </div>
        </div>
      </section>

      <section className="perks-section content-width">
        <div className="section-title-row">
          <div><h2>Space for your plans</h2></div>
        </div>
        <div className="perks-grid">
          <article className="perk-card perk-lime grain-surface"><h3>Compare local libraries</h3><p>See the facilities, timings, neighbourhood, and monthly price before you decide.</p><Link to="/locations">Find your fit <ArrowRight size={18} /></Link></article>
          <article className="perk-card perk-orange grain-surface"><h3>Memberships that fit</h3><p>Pick a study plan that fits your routine. Your account keeps its details in one place.</p><Link to="/register">Get started <ArrowRight size={18} /></Link></article>
          <article className="perk-card perk-sky grain-surface"><h3>Build a steady routine</h3><p>Find a welcoming seat, settle in, and give your goals the time they need.</p><Link to="/about">How Kitaab works <ArrowRight size={18} /></Link></article>
        </div>
      </section>

      <section className="branch-section grain-surface">
        <div className="branch-copy">
          <h2>Study closer<br />to home.</h2>
          <p>Start with an area in Sonipat and see the study spaces nearby.</p>
          <form className="branch-search" onSubmit={searchLibraries}>
            <label className="sr-only" htmlFor="area-search">Enter an area</label>
            <input id="area-search" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Enter an area or PIN code" />
            <button type="submit">Find libraries <MapPin size={18} aria-hidden="true" /></button>
          </form>
        </div>
        <div className="branch-image" role="img" aria-label="Study spaces and neighbourhoods around Sonipat" />
      </section>

      <section className="events-section content-width" id="events">
        <div className="section-title-row"><div><h2>Events & study sessions</h2></div><Link className="section-link" to="/events">See what’s on <ArrowRight size={18} aria-hidden="true" /></Link></div>
        <div className="event-feature-grid">
          {eventFormats.map((event) => <Link to="/events" className="event-feature-card" key={event.number}>
            <img src={event.image} alt="Students and neighbours taking part in a library activity" />
            <div className={`event-feature-title ${event.color} grain-surface`}><span>{event.title}</span><Arrow /></div>
          </Link>)}
        </div>
      </section>

      <section className="stories-section content-width">
        <h2 className="serif-title">Notes for your next study day</h2>
        <div className="story-grid">
          {customerUpdates.map((story) => <article className="story-card" key={story.title}>
            <img src={story.image} alt="A bright, welcoming learning space" />
            <h3>{story.title}</h3>
          </article>)}
        </div>
        <Link className="wide-black-button story-button" to="/about">A little more about Kitaab <ArrowRight size={19} aria-hidden="true" /></Link>
      </section>

      <section className="pride-section content-width">
        <h2 className="serif-title">A space for every kind of learner</h2>
        <div className="pride-photo-strip">
          <img src="/images/community-study.webp" alt="Learners spending time together" />
          <img src="/images/study-session.webp" alt="A student working at a table" />
          <img src="/images/student-community.webp" alt="A community activity at a library" />
        </div>
        <div className="pride-grid">
          <article className="pride-card pride-lime grain-surface"><span><BookOpen size={21} /></span><h3>Room to concentrate</h3><p>Find quieter spaces where your study time can feel like your own.</p></article>
          <article className="pride-card pride-orange grain-surface"><span><Clock3 size={21} /></span><h3>A routine that sticks</h3><p>Choose a place close to your everyday route and show up for your goals.</p></article>
          <article className="pride-card pride-sky grain-surface"><span><Star size={21} /></span><h3>Clear monthly pricing</h3><p>Compare membership starting prices upfront, before you visit.</p></article>
          <article className="pride-card pride-blue grain-surface"><span><MapPin size={21} /></span><h3>Spaces across Sonipat</h3><p>Discover study libraries across neighbourhoods in one place.</p></article>
        </div>
      </section>
    </main>
  )
}

export default Home
