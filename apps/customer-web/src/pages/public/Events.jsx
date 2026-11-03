import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { eventFormats } from '../../data/sampleContent.js'
import './Home.css'

function Events() {
  return (
    <main className="events-page">
      <section className="events-page-hero grain-surface">
        <h1>Make room<br /><em>for a good idea.</em></h1>
        <p>Study sessions, reading circles, and little ways to find your people. Community events are part of the Kitaab vision.</p>
      </section>
      <section className="events-page-list">
        <div className="events-page-grid">
          {eventFormats.map((event) => <article className="events-page-card" key={event.number}>
            <img src={event.image} alt="Students and neighbours taking part in a community activity" />
            <div><h2>{event.title}</h2><p>{event.description} Event scheduling will be added later.</p></div>
          </article>)}
        </div>
        <Link className="wide-black-button" to="/locations">Find your study space <ArrowRight size={19} aria-hidden="true" /></Link>
      </section>
    </main>
  )
}

export default Events
