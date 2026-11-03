import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import './Home.css'

function About() {
  return (
    <main className="about-page">
      <section className="about-page-hero grain-surface">
        <h1>Good spaces.<br /><em>Better study days.</em></h1>
        <p>Kitaab helps students discover local study libraries and find the space that fits the way they learn.</p>
      </section>
      <section className="about-page-copy">
        <h2>Finding a place to focus should feel simple.</h2>
        <p>We’re bringing study libraries in and around Sonipat into one place. Browse neighbourhoods, compare facilities and opening hours, and see starting prices before choosing a space.</p>
        <p>When you find a library that feels right, create a Kitaab account to keep your membership details together. This frontend preview uses sample listings and a local demo account; it does not connect to a payment or authentication service.</p>
        <div className="about-page-callout grain-surface"><h3>Ready to find your corner of calm?</h3><Link className="black-button" to="/locations">Explore study libraries <ArrowRight size={18} aria-hidden="true" /></Link></div>
      </section>
    </main>
  )
}

export default About
