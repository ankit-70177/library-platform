import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, CircleCheck, CirclePause } from 'lucide-react'
import { sampleLibraries } from '../../data/sampleContent.js'
import './Customer.css'

function Dashboard() {
  const navigate = useNavigate()
  const [user] = useState(() => {
    try { return JSON.parse(window.localStorage.getItem('kitaab-demo-user') || 'null') } catch { return null }
  })
  const [membershipState, setMembershipState] = useState(() => window.localStorage.getItem('kitaab-demo-membership') || 'active')
  const [notice, setNotice] = useState('')
  const selectedLibrary = user?.libraryId ? sampleLibraries.find((library) => library.id === Number(user.libraryId)) : null
  const updateMembership = (nextState) => {
    window.localStorage.setItem('kitaab-demo-membership', nextState)
    setMembershipState(nextState)
    setNotice(nextState === 'cancelled' ? 'Your demo membership selection has been cancelled.' : 'Your demo membership is active again.')
  }
  const signOut = () => {
    window.localStorage.removeItem('kitaab-demo-user')
    navigate('/')
  }

  if (!user) return (
    <main className="customer-page dashboard-page">
      <section className="dashboard-empty"><h1 className="serif-title">Your study spaces, together.</h1><p>Sign in or create an account to see your customer dashboard and membership details.</p><div className="dashboard-actions"><Link to="/login">Sign in</Link><Link className="secondary-action" to="/register">Create an account</Link></div></section>
    </main>
  )

  return (
    <main className="customer-page dashboard-page">
      <div className="dashboard-heading"><div><h1>Hello, {user.name || 'there'}.</h1></div><button className="dashboard-signout" type="button" onClick={signOut}>Sign out</button></div>
      <div className="dashboard-grid">
        <section className="dashboard-panel">
          <h2>Your membership</h2>
          {selectedLibrary ? <div className="dashboard-membership grain-surface">
            <p className="membership-state">{membershipState === 'active' ? <><CircleCheck size={14} aria-hidden="true" /> Active selection</> : <><CirclePause size={14} aria-hidden="true" /> Cancelled selection</>}</p>
            <h3>{selectedLibrary.name}</h3>
            <p>{selectedLibrary.area} · starting at ₹{selectedLibrary.price}/month</p>
            <p>This is a frontend demo selection. No payment or real membership has been created.</p>
            <div className="dashboard-actions">
              {membershipState === 'active' ? <button type="button" onClick={() => updateMembership('cancelled')}>Cancel demo selection</button> : <button type="button" onClick={() => updateMembership('active')}>Restore selection</button>}
              <Link className="secondary-action" to="/locations">Browse other libraries</Link>
            </div>
          </div> : <div className="dashboard-empty"><h2>No membership yet</h2><p>Browse libraries, compare their facilities and monthly prices, then choose a study space to keep here.</p><Link to="/locations">Explore libraries <ArrowRight size={17} aria-hidden="true" /></Link></div>}
          {notice && <p className="dashboard-notice" role="status">{notice}</p>}
        </section>
        <aside className="dashboard-panel">
          <h2>Account details</h2>
          <ul className="dashboard-list"><li><span>Name</span><strong>{user.name || 'Kitaab member'}</strong></li><li><span>Email</span><strong>{user.email}</strong></li><li><span>Account type</span><strong>Customer</strong></li></ul>
          <p className="demo-note">This profile is stored locally in this browser for the frontend preview.</p>
        </aside>
      </div>
    </main>
  )
}

export default Dashboard
