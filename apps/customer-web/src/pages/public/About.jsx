import './Home.css'

function About() {
  return (
    <main className="about-page">
      <section className="about-page-hero texture">
        <span className="eyebrow">A little about us</span>
        <h1>Room to think.<br /><em>Space to become.</em></h1>
        <p>Kitaab is being built to make finding a study library feel as natural as finding your favourite reading spot.</p>
        <a className="button button-yellow" href="/#locations">Explore locations <span aria-hidden="true">↗</span></a>
      </section>
      <section className="about-page-body">
        <span className="eyebrow">Our idea</span>
        <h2>Good spaces change the way a day feels.</h2>
        <p>We’re bringing local study spaces together so students can discover a place that works for them, and library owners can welcome the people looking for one. Kitaab starts with Sonipat and grows one neighbourhood at a time.</p>
        <p>We believe the right chair, a steady routine, and a little quiet can make room for big things.</p>
      </section>
    </main>
  )
}

export default About
