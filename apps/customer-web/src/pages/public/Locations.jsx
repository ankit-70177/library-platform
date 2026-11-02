import { useMemo, useState } from 'react'
import { sampleLibraries } from '../../data/sampleContent.js'
import './Home.css'

function Locations() {
  const [query, setQuery] = useState('')
  const results = useMemo(() => {
    const value = query.trim().toLowerCase()
    return sampleLibraries.filter((library) => `${library.name} ${library.area} ${library.facilities.join(' ')}`.toLowerCase().includes(value))
  }, [query])

  return (
    <main className="locations-page">
      <section className="locations-page-intro texture">
        <h1>Good spaces,<br /><em>close to home.</em></h1>
        <p>Browse local study libraries by neighbourhood. These listings are examples while Kitaab is being built.</p>
        <label className="location-page-search"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search an area or amenity" aria-label="Search locations" /></label>
      </section>
      <section className="locations-page-list">
        <div className="section-topline"></div>
        <div className="library-grid">
          {results.map((library, index) => (
            <article className={`library-card library-${library.color}`} key={library.id}>
              <div className="library-image texture"><span className="image-index">K / 0{index + 1}</span><span className="image-mark">{index === 0 ? 'शांत' : index === 1 ? 'पढ़ें' : 'ध्यान'}</span><span className="image-corner">↗</span></div>
              <div className="library-card-body"><div className="library-title-row"><div><p className="card-kicker">{library.area}</p><h3>{library.name}</h3></div><span className="rating">✳ <span>Sample</span></span></div><div className="facility-list">{library.facilities.map((facility) => <span key={facility}>{facility}</span>)}</div><div className="library-card-bottom"><span><strong>₹{library.price}</strong> <small>/ month from</small></span><span className="seat-count">{library.seats} sample seats</span></div></div>
            </article>
          ))}
        </div>
        {results.length === 0 && <p className="empty-results">No sample locations match that search.</p>}
      </section>
    </main>
  )
}

export default Locations
