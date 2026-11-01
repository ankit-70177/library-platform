import { Link } from 'react-router-dom'

const customerAppUrl = import.meta.env.VITE_CUSTOMER_APP_URL || 'http://localhost:5173'

function App() {
  return (
    <main className="owner-shell">
      <header className="owner-header">
        <Link to="/" className="owner-brand">Library Platform <span>Owner Portal</span></Link>
        <a href={customerAppUrl}>Customer website</a>
      </header>
      <section className="owner-intro">
        <p className="eyebrow">For library owners</p>
        <h1>A dedicated place to grow your study library.</h1>
        <p className="owner-copy">
          The owner application is being prepared. Owner registration, library onboarding,
          verification, and dashboard workflows are planned and are not available yet.
        </p>
      </section>
    </main>
  )
}

export default App
