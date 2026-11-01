import { eventFormats } from '../../data/sampleContent.js'
import './Home.css'

function Events() {
  return (
    <main className="events-page">
      <section className="events-page-intro texture">
        <span className="eyebrow">Good things happen between the pages</span>
        <h1>Make a little<br /><em>room for people.</em></h1>
        <p>Study sessions, reading circles, and small ways to find your people. Kitaab community events are coming soon.</p>
      </section>
      <section className="events-page-list">
        <div className="section-topline"><span className="eyebrow">Things we’re dreaming up</span><span className="section-index">COMING SOON</span></div>
        <div className="event-grid">
          {eventFormats.map((event) => <article className={`event-card ${event.color} texture`} key={event.number}><span className="event-number">{event.number}</span><span className="event-stamp" aria-hidden="true">✳</span><div className="event-card-copy"><span>{event.tag}</span><h3>{event.title}</h3><p>{event.description}</p></div><span className="event-arrow" aria-hidden="true">↗</span></article>)}
        </div>
      </section>
    </main>
  )
}

export default Events
