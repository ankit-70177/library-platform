import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, MapPin, Search, Star } from 'lucide-react'
import { sampleLibraries } from '../../data/sampleContent.js'
import './Home.css'

function Locations() {
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('search') || '')
  const results = useMemo(() => {
    const value = query.trim().toLowerCase()
    if (!value) return sampleLibraries
    return sampleLibraries.filter((library) => `${library.name} ${library.area} ${library.facilities.join(' ')} ${library.hours}`.toLowerCase().includes(value))
  }, [query])

  return (
    <main className="directory-page">
      <section className="directory-hero grain-surface">
        <h1>Find your<br /><em>study space.</em></h1>
        <p>Search neighbourhoods and compare local study libraries by price, facilities, and timings.</p>
        <label className="directory-search"><Search size={22} aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try Model Town, Wi-Fi, or 24 hours" aria-label="Search libraries by neighbourhood or facility" /></label>
      </section>
      <section className="directory-results content-width">
        <div className="section-title-row"><div><h2>{results.length} spaces to explore</h2></div></div>
        <div className="directory-grid">
          {results.map((library) => <article className="directory-card" key={library.id}>
            <img src={library.image} alt="A community study space" />
            <div className="directory-card-copy"><p className="library-meta"><MapPin size={14} aria-hidden="true" /> {library.area}</p><h3>{library.name}</h3><p className="directory-hours">{library.hours}</p><div className="directory-tags">{library.facilities.map((facility) => <span key={facility}>{facility}</span>)}</div><div className="directory-card-bottom"><span><strong>₹{library.price}</strong> <small>/ month</small></span><span><Star size={14} aria-hidden="true" /> {library.rating} · {library.seats} seats</span></div><Link className="directory-cta" to={`/register?library=${library.id}`}>Choose this space <ArrowRight size={17} aria-hidden="true" /></Link></div>
          </article>)}
        </div>
        {results.length === 0 && <div className="directory-empty"><h3>No spaces match that search yet.</h3><p>Try a neighbourhood such as Model Town, Kundli, or Murthal Road.</p><button type="button" onClick={() => setQuery('')}>Show all libraries</button></div>}
      </section>
    </main>
  )
}

export default Locations
