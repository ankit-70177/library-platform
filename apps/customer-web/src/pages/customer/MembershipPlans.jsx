import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle, CreditCard } from 'lucide-react'
import {
  getApprovedLibraryById,
  getMembershipPlans,
  createPayment,
} from '../../services/api.js'
import './MembershipPlans.css'

function MembershipPlans() {
  const { libraryId } = useParams()
  const navigate = useNavigate()

  const [library, setLibrary] = useState(null)
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [processingPlan, setProcessingPlan] = useState(null)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('kitaab-auth-token')

    if (!token) {
      navigate(`/login?library=${libraryId}`, { replace: true })
      return
    }

    let active = true

    const loadData = async () => {
      try {
        const [libraryResponse, plansResponse] = await Promise.all([
          getApprovedLibraryById(libraryId),
          getMembershipPlans(),
        ])

        if (!active) return

        setLibrary(libraryResponse.library)
        setPlans(plansResponse.plans || [])
      } catch (err) {
        if (active) setError(err.message || 'Unable to load membership plans.')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadData()

    return () => {
      active = false
    }
  }, [libraryId, navigate])

  const handlePurchase = async (plan) => {
    if (processingPlan) return

    const confirmed = window.confirm(
      `Start demo payment for ${plan.name} at ${library?.name}? No real money will be charged.`
    )

    if (!confirmed) return

    try {
      setProcessingPlan(plan.id)
      setError('')
      setSuccess('')

      const response = await createPayment({
        library_id: Number(libraryId),
        plan_id: Number(plan.id),
        payment_status: 'success',
      })

      setSuccess(response.message || 'Demo payment successful. Membership activated.')
    } catch (err) {
      setError(err.message || 'Payment could not be completed.')
    } finally {
      setProcessingPlan(null)
    }
  }

  if (loading) {
    return <main className="membership-page"><p>Loading membership plans...</p></main>
  }

  if (error && !library) {
    return (
      <main className="membership-page">
        <p className="membership-error">{error}</p>
        <Link to="/locations">Back to libraries</Link>
      </main>
    )
  }

  return (
    <main className="membership-page">
      <Link className="membership-back" to="/locations">
        <ArrowLeft size={17} /> Back to libraries
      </Link>

      <section className="membership-heading">
        <p className="membership-eyebrow">YOUR STUDY SPACE</p>
        <h1>Choose your membership</h1>
        <p>
          Select a plan for <strong>{library?.name}</strong>
          {library?.city ? ` · ${library.city}` : ''}
        </p>
      </section>

      {success && (
        <div className="membership-success">
          <CheckCircle size={20} />
          <div>
            <strong>Membership activated!</strong>
            <p>{success}</p>
            <Link to="/dashboard">Go to your dashboard</Link>
          </div>
        </div>
      )}

      {error && <p className="membership-error">{error}</p>}

      <section className="membership-plans">
        {plans.length === 0 && !error && (
          <p>No active membership plans are available right now.</p>
        )}

        {plans.map((plan) => (
          <article className="membership-card" key={plan.id}>
            <div>
              <h2>{plan.name}</h2>
              <p className="membership-duration">{plan.duration_days} days</p>
              <p className="membership-price">
                ₹{Number(plan.price).toLocaleString('en-IN')}
              </p>
              <p className="membership-description">
                {plan.description || `Access to ${library?.name} for ${plan.duration_days} days.`}
              </p>
            </div>

            <button
              type="button"
              className="membership-buy"
              disabled={Boolean(processingPlan) || Boolean(success)}
              onClick={() => handlePurchase(plan)}
            >
              <CreditCard size={17} />
              {processingPlan === plan.id
                ? 'Processing...'
                : 'Choose this plan'}
            </button>
          </article>
        ))}
      </section>

      <p className="membership-demo-note">
        Demo checkout only. No real money is charged.
      </p>
    </main>
  )
}

export default MembershipPlans
