
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  BookOpen,
  Bookmark,
  Star,
  CreditCard,
  Bell,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  MapPin,
  Clock,
  CheckCircle,
  CirclePause,
  Edit,
  Trash2,
  Plus,
  ArrowRight,
  Save,
  XCircle
} from 'lucide-react'

import { sampleLibraries } from '../../data/sampleContent.js'
import './Customer.css'
import './Dashboard.css'
import {
  getCustomerDashboard,
  getMyPayments,
  getMySubscriptions,
  cancelMySubscription,
  getMyReviews,
  createMyReview,
  deleteMyReview,
  getMyBookings,
  cancelMyBooking,
  getMySavedLibraries,
  removeMySavedLibrary
} from '../../services/api.js'

const getStorage = (key, fallback) => {
  try {
    const value = window.localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

const saveStorage = (key, value) => {
  window.localStorage.setItem(key, JSON.stringify(value))
}

function Dashboard() {
  const navigate = useNavigate()

  const [dashboardData, setDashboardData] = useState(null)
  const [dashboardLoading, setDashboardLoading] = useState(true)
  const [dashboardError, setDashboardError] = useState('')
  const [payments, setPayments] = useState([])
  const [paymentsLoading, setPaymentsLoading] = useState(true)
  const [paymentsError, setPaymentsError] = useState('')
  const [subscriptions, setSubscriptions] = useState([])
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(true)
  const [subscriptionsError, setSubscriptionsError] = useState('')
  const [subscriptionActionLoading, setSubscriptionActionLoading] = useState(null)
  const [bookings, setBookings] = useState([])
  const [bookingsLoading, setBookingsLoading] = useState(true)
  const [bookingsError, setBookingsError] = useState('')
  const [bookingActionLoading, setBookingActionLoading] = useState(null)


  useEffect(() => {
    let isMounted = true

    const loadDashboard = async () => {
      try {
        setDashboardLoading(true)
        setDashboardError('')

        const response = await getCustomerDashboard()

        if (isMounted) {
          setDashboardData(response.dashboard)
        }
      } catch (error) {
        if (isMounted) {
          setDashboardError(error.message || 'Unable to load dashboard.')
        }
      } finally {
        if (isMounted) {
          setDashboardLoading(false)
        }
      }
    }

    loadDashboard()

    return () => {
      isMounted = false
    }
  }, [])


  useEffect(() => {
    let isMounted = true

    const loadPayments = async () => {
      try {
        setPaymentsLoading(true)
        setPaymentsError('')

        const response = await getMyPayments()

        if (isMounted) {
          setPayments(response.payments || [])
        }
      } catch (error) {
        if (isMounted) {
          setPaymentsError(error.message || 'Unable to load payments.')
        }
      } finally {
        if (isMounted) {
          setPaymentsLoading(false)
        }
      }
    }

    loadPayments()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const loadSubscriptions = async () => {
      try {
        setSubscriptionsLoading(true)
        setSubscriptionsError('')

        const response = await getMySubscriptions()

        if (isMounted) {
          setSubscriptions(response.subscriptions || [])
        }
      } catch (error) {
        if (isMounted) {
          setSubscriptionsError(error.message || 'Unable to load subscriptions.')
        }
      } finally {
        if (isMounted) {
          setSubscriptionsLoading(false)
        }
      }
    }

    loadSubscriptions()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const loadReviews = async () => {
      try {
        setReviewsLoading(true)
        setReviewsError('')
        const response = await getMyReviews()

        if (isMounted) {
          setReviews(response.reviews || [])
        }
      } catch (error) {
        if (isMounted) {
          setReviewsError(error.message || 'Unable to load reviews.')
        }
      } finally {
        if (isMounted) {
          setReviewsLoading(false)
        }
      }
    }

    loadReviews()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const loadBookings = async () => {
      try {
        setBookingsLoading(true)
        setBookingsError('')

        const response = await getMyBookings()

        if (isMounted) {
          setBookings(response.bookings || [])
        }
      } catch (error) {
        if (isMounted) {
          setBookingsError(error.message || 'Unable to load bookings.')
        }
      } finally {
        if (isMounted) {
          setBookingsLoading(false)
        }
      }
    }

    loadBookings()

    return () => {
      isMounted = false
    }
  }, [])

  const [user, setUser] = useState(() =>
    getStorage('kitaab-demo-user', null)
  )

  const [section, setSection] = useState('Overview')
  const [mobileMenu, setMobileMenu] = useState(false)

  const [membershipState, setMembershipState] = useState(
    () => window.localStorage.getItem('kitaab-demo-membership') || 'active'
  )

  const [savedLibraries, setSavedLibraries] = useState([])
  const [savedLibrariesLoading, setSavedLibrariesLoading] = useState(true)
  const [savedLibrariesError, setSavedLibrariesError] = useState('')
  const [savedLibraryActionLoading, setSavedLibraryActionLoading] = useState(null)

  useEffect(() => {
    let isMounted = true

    const loadSavedLibraries = async () => {
      try {
        setSavedLibrariesLoading(true)
        setSavedLibrariesError('')

        const response = await getMySavedLibraries()

        if (isMounted) {
          setSavedLibraries(response.libraries || [])
        }
      } catch (error) {
        if (isMounted) {
          setSavedLibrariesError(error.message || 'Unable to load saved libraries.')
        }
      } finally {
        if (isMounted) {
          setSavedLibrariesLoading(false)
        }
      }
    }

    loadSavedLibraries()

    return () => {
      isMounted = false
    }
  }, [])


  const [notifications, setNotifications] = useState(() =>
    getStorage('kitaab-demo-notifications', [
      {
        id: 1,
        title: 'Welcome to Kitaab!',
        message: 'Explore libraries and find your perfect study space.',
        read: false
      },
      {
        id: 2,
        title: 'Complete your profile',
        message: 'Add your details to personalize your account.',
        read: false
      }
    ])
  )

  const [profile, setProfile] = useState(() => ({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    city: user?.city || 'Sonipat'
  }))

  const [reviews, setReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [reviewsError, setReviewsError] = useState('')
  const [reviewActionLoading, setReviewActionLoading] = useState(false)
  const [deletingReviewId, setDeletingReviewId] = useState(null)

  const [reviewText, setReviewText] = useState('')
  const [reviewRating, setReviewRating] = useState('5')
  const [reviewLibrary, setReviewLibrary] = useState('')

  const [notice, setNotice] = useState('')

  const selectedLibrary = user?.libraryId
    ? sampleLibraries.find(
        (library) => library.id === Number(user.libraryId)
      )
    : null

  const activeNotifications = notifications.filter(
    (notification) => !notification.read
  ).length

  const navigationItems = [
    { name: 'Overview', icon: LayoutDashboard },
    { name: 'My Membership', icon: BookOpen },
    { name: 'My Bookings', icon: Clock },
    { name: 'Saved Libraries', icon: Bookmark },
    { name: 'My Reviews', icon: Star },
    { name: 'Payment History', icon: CreditCard },
    { name: 'Notifications', icon: Bell, count: activeNotifications },
    { name: 'My Profile', icon: User },
    { name: 'Settings', icon: Settings }
  ]

  const changeSection = (name) => {
    setSection(name)
    setMobileMenu(false)
    setNotice('')
  }

  const handleCancelBooking = async (bookingId) => {
    const confirmed = window.confirm(
      'Are you sure you want to cancel this booking?'
    )

    if (!confirmed) return

    try {
      setBookingActionLoading(bookingId)
      const response = await cancelMyBooking(bookingId)

      setBookings((current) =>
        current.map((booking) =>
          booking.id === bookingId
            ? { ...booking, status: 'cancelled' }
            : booking
        )
      )

      setNotice(response.message || 'Booking cancelled successfully.')
    } catch (error) {
      setNotice(error.message || 'Unable to cancel booking.')
    } finally {
      setBookingActionLoading(null)
    }
  }

  const updateMembership = (nextState) => {
    window.localStorage.setItem('kitaab-demo-membership', nextState)
    setMembershipState(nextState)

    setNotice(
      nextState === 'cancelled'
        ? 'Your demo membership selection has been cancelled.'
        : 'Your demo membership selection is active again.'
    )
  }

  const toggleSavedLibrary = async (libraryId) => {
    try {
      setSavedLibraryActionLoading(libraryId)

      const response = await removeMySavedLibrary(libraryId)

      setSavedLibraries((current) =>
        current.filter((library) => library.id !== libraryId)
      )

      setNotice(response.message || 'Library removed from saved list.')
    } catch (error) {
      setNotice(error.message || 'Unable to remove saved library.')
    } finally {
      setSavedLibraryActionLoading(null)
    }
  }

  const addReview = async (event) => {
    event.preventDefault()

    if (!reviewLibrary || !reviewText.trim()) {
      setNotice('Please select a library and write your review.')
      return
    }

    try {
      setReviewActionLoading(true)
      setNotice('')

      await createMyReview({
        library_id: Number(reviewLibrary),
        rating: Number(reviewRating),
        comment: reviewText.trim()
      })

      const response = await getMyReviews()
      setReviews(response.reviews || [])
      setReviewText('')
      setReviewLibrary('')
      setReviewRating('5')
      setNotice('Review submitted successfully.')
    } catch (error) {
      setNotice(error.message || 'Unable to submit review.')
    } finally {
      setReviewActionLoading(false)
    }
  }

  const deleteReview = async (reviewId) => {
    try {
      setDeletingReviewId(reviewId)
      setNotice('')

      await deleteMyReview(reviewId)
      setReviews((current) => current.filter((review) => review.id !== reviewId))
      setNotice('Review deleted successfully.')
    } catch (error) {
      setNotice(error.message || 'Unable to delete review.')
    } finally {
      setDeletingReviewId(null)
    }
  }

  const markNotificationRead = (notificationId) => {
    const updated = notifications.map((notification) =>
      notification.id === notificationId
        ? { ...notification, read: true }
        : notification
    )

    setNotifications(updated)
    saveStorage('kitaab-demo-notifications', updated)
  }

  const markAllRead = () => {
    const updated = notifications.map((notification) => ({
      ...notification,
      read: true
    }))

    setNotifications(updated)
    saveStorage('kitaab-demo-notifications', updated)
  }

  const saveProfile = (event) => {
    event.preventDefault()

    const updatedUser = {
      ...user,
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      city: profile.city
    }

    setUser(updatedUser)
    saveStorage('kitaab-demo-user', updatedUser)

    setNotice('Your profile has been updated successfully.')
  }

  const signOut = () => {
    window.localStorage.removeItem('kitaab-demo-user')
    navigate('/')
  }

  const renderOverview = () => (
    <>
      <div className="kd-welcome">
        <div>
          <span className="kd-eyebrow">CUSTOMER DASHBOARD</span>
          <h1>Hello, {user.name || 'there'}!</h1>
          <p>Welcome back. Your study journey starts here.</p>
        </div>

        <Link to="/locations" className="kd-primary-button">
          <Search size={16} />
          Explore Libraries
        </Link>
      </div>

      <div className="kd-stats-grid">
        <div className="kd-stat-card">
          <span>My Membership</span>
          <h3>{dashboardData?.statistics?.subscriptions?.active ?? 0}</h3>
          <p>Active subscriptions</p>
        </div>

        <div className="kd-stat-card">
          <span>Saved Libraries</span>
          <h3>{savedLibraries.length}</h3>
          <p>Your favorite study spaces</p>
        </div>

        <div className="kd-stat-card">
          <span>My Reviews</span>
          <h3>{dashboardData?.statistics?.reviews?.total ?? 0}</h3>
          <p>Reviews submitted</p>
        </div>

        <div className="kd-stat-card">
          <span>Notifications</span>
          <h3>{activeNotifications}</h3>
          <p>Unread notifications</p>
        </div>
      </div>

      <div className="kd-content-grid">
        <section className="kd-panel">
          <div className="kd-panel-heading">
            <div>
              <h2>My Membership</h2>
              <p>Your currently selected study space</p>
            </div>
            <BookOpen size={21} />
          </div>

          {selectedLibrary ? (
            <div className="kd-library-summary">
              <div>
                <h3>{selectedLibrary.name}</h3>
                <p>
                  <MapPin size={13} /> {selectedLibrary.area}
                </p>
                <p>Starting at ₹{selectedLibrary.price}/month</p>
                <span className="kd-status">
                  {membershipState === 'active' ? 'Active selection' : 'Cancelled'}
                </span>
              </div>
            </div>
          ) : (
            <div className="kd-empty">
              <BookOpen size={30} />
              <h3>No membership yet</h3>
              <p>Explore libraries and choose your favorite study space.</p>
              <Link to="/locations" className="kd-primary-button">
                Explore Libraries <ArrowRight size={15} />
              </Link>
            </div>
          )}
        </section>

        <section className="kd-panel">
          <div className="kd-panel-heading">
            <div>
              <h2>Quick Actions</h2>
              <p>Manage your Kitaab account</p>
            </div>
          </div>

          <div className="kd-quick-actions">
            <button onClick={() => changeSection('Saved Libraries')}>
              <Bookmark size={19} /> Saved Libraries
            </button>

            <button onClick={() => changeSection('My Reviews')}>
              <Star size={19} /> My Reviews
            </button>

            <button onClick={() => changeSection('My Profile')}>
              <User size={19} /> Edit Profile
            </button>

            <button onClick={() => changeSection('Payment History')}>
              <CreditCard size={19} /> Payments
            </button>
          </div>
        </section>
      </div>

      <section className="kd-panel">
        <div className="kd-panel-heading">
          <div>
            <h2>Account Information</h2>
            <p>Your registered customer details</p>
          </div>
          <button
            className="kd-icon-button"
            onClick={() => changeSection('My Profile')}
            aria-label="Edit profile"
          >
            <Edit size={16} />
          </button>
        </div>

        <div className="kd-profile-details">
          <div><span>Name</span><strong>{user.name || 'Kitaab member'}</strong></div>
          <div><span>Email</span><strong>{user.email || 'Not provided'}</strong></div>
          <div><span>Account Type</span><strong>Customer</strong></div>
        </div>
      </section>
    </>
  )

  const handleCancelSubscription = async (subscriptionId) => {
    try {
      setSubscriptionActionLoading(subscriptionId)
      setNotice('')

      await cancelMySubscription(subscriptionId)

      const response = await getMySubscriptions()
      setSubscriptions(response.subscriptions || [])
      setNotice('Subscription cancelled successfully.')
    } catch (error) {
      setNotice(error.message || 'Unable to cancel subscription.')
    } finally {
      setSubscriptionActionLoading(null)
    }
  }

  const renderBookings = () => (
    <>
      <div className="kd-welcome">
        <div>
          <span className="kd-eyebrow">YOUR RESERVATIONS</span>
          <h1>My Bookings</h1>
          <p>View your library seat bookings and manage upcoming visits.</p>
        </div>
      </div>

      <section className="kd-panel">
        {bookingsLoading ? (
          <div className="kd-empty">
            <Clock size={35} />
            <h3>Loading bookings...</h3>
          </div>
        ) : bookingsError ? (
          <div className="kd-empty">
            <Clock size={35} />
            <h3>Unable to load bookings</h3>
            <p>{bookingsError}</p>
          </div>
        ) : bookings.length > 0 ? (
          <div className="kd-review-list">
            {bookings.map((booking) => {
              const isUpcoming =
                booking.status === 'confirmed' &&
                new Date(booking.start_time) > new Date()

              return (
                <div className="kd-review-card" key={booking.id}>
                  <div className="kd-panel-heading">
                    <div>
                      <h3>{booking.library_name}</h3>
                      <p>
                        <MapPin size={14} /> {booking.library_city}
                      </p>
                    </div>
                    <span className={`kd-status ${
                      booking.status === 'cancelled' ? 'cancelled' : ''
                    }`}>
                      {booking.status}
                    </span>
                  </div>

                  <p><strong>Booking ID:</strong> #{booking.id}</p>
                  <p><strong>Seats booked:</strong> {booking.seats_booked}</p>
                  <p>
                    <strong>Start:</strong>{' '}
                    {new Date(booking.start_time).toLocaleString()}
                  </p>
                  <p>
                    <strong>End:</strong>{' '}
                    {new Date(booking.end_time).toLocaleString()}
                  </p>
                  <p><strong>Address:</strong> {booking.library_address}</p>

                  {isUpcoming && (
                    <button
                      className="kd-danger-button"
                      disabled={bookingActionLoading === booking.id}
                      onClick={() => handleCancelBooking(booking.id)}
                    >
                      <XCircle size={15} />
                      {bookingActionLoading === booking.id
                        ? 'Cancelling...'
                        : 'Cancel Booking'}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="kd-empty">
            <Clock size={35} />
            <h3>No bookings found</h3>
            <p>Your library seat reservations will appear here.</p>
            <Link to="/locations" className="kd-primary-button">
              Browse Libraries <ArrowRight size={15} />
            </Link>
          </div>
        )}
      </section>
    </>
  )

  const renderMembership = () => (
    <>
      <div className="kd-welcome">
        <div>
          <span className="kd-eyebrow">YOUR SUBSCRIPTION</span>
          <h1>My Membership</h1>
          <p>View and manage your library subscriptions.</p>
        </div>
      </div>

      <section className="kd-panel">
        {subscriptionsLoading ? (
          <div className="kd-empty">
            <BookOpen size={35} />
            <h3>Loading memberships...</h3>
          </div>
        ) : subscriptionsError ? (
          <div className="kd-empty">
            <BookOpen size={35} />
            <h3>Unable to load memberships</h3>
            <p>{subscriptionsError}</p>
          </div>
        ) : subscriptions.length > 0 ? (
          <div className="kd-review-list">
            {subscriptions.map((subscription) => (
              <div className="kd-membership-card" key={subscription.id}>
                <div className="kd-panel-heading">
                  <div>
                    <h3>{subscription.library_name}</h3>
                    <p>
                      <MapPin size={14} /> {subscription.library_city}
                    </p>
                  </div>
                  <span className={`kd-status ${
                    subscription.status === 'cancelled' ||
                    subscription.status === 'expired' ? 'cancelled' : ''
                  }`}>
                    {subscription.status}
                  </span>
                </div>

                <p><strong>Plan:</strong> {subscription.plan_name}</p>
                <p><strong>Price:</strong> ₹{subscription.price}</p>
                <p><strong>Duration:</strong> {subscription.duration_days} days</p>
                <p>
                  <strong>Start date:</strong>{' '}
                  {new Date(subscription.start_date).toLocaleDateString()}
                </p>
                <p>
                  <strong>End date:</strong>{' '}
                  {new Date(subscription.end_date).toLocaleDateString()}
                </p>

                {subscription.status === 'active' && (
                  <button
                    className="kd-danger-button"
                    disabled={subscriptionActionLoading === subscription.id}
                    onClick={() => handleCancelSubscription(subscription.id)}
                  >
                    <CirclePause size={15} />
                    {subscriptionActionLoading === subscription.id
                      ? 'Cancelling...'
                      : 'Cancel Subscription'}
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="kd-empty">
            <BookOpen size={35} />
            <h3>No membership found</h3>
            <p>Find a library and choose a membership plan.</p>
            <Link to="/locations" className="kd-primary-button">
              Browse Libraries <ArrowRight size={15} />
            </Link>
          </div>
        )}
      </section>
    </>
  )

  const renderSavedLibraries = () => {
    return (
      <>
        <div className="kd-welcome">
          <div>
            <span className="kd-eyebrow">YOUR FAVORITES</span>
            <h1>Saved Libraries</h1>
            <p>Keep your favorite study spaces in one place.</p>
          </div>

          <Link to="/locations" className="kd-primary-button">
            <Plus size={16} /> Find Libraries
          </Link>
        </div>

        <section className="kd-panel">
          {savedLibrariesLoading ? (
            <div className="kd-empty">
              <p>Loading your saved libraries...</p>
            </div>
          ) : savedLibrariesError ? (
            <div className="kd-empty">
              <p>{savedLibrariesError}</p>
            </div>
          ) : savedLibraries.length > 0 ? (
            <div className="kd-library-grid">
              {savedLibraries.map((library) => (
                <div className="kd-library-card" key={library.id}>
                  <div>
                    <h3>{library.name}</h3>
                    <p>
                      <MapPin size={13} /> {library.locality || library.address}
                    </p>
                    <p>{library.city}</p>
                    <button
                      className="kd-danger-button"
                      onClick={() => toggleSavedLibrary(library.id)}
                      disabled={savedLibraryActionLoading === library.id}
                    >
                      <Bookmark size={14} />
                      {savedLibraryActionLoading === library.id
                        ? 'Removing...'
                        : 'Remove Saved'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="kd-empty">
              <Bookmark size={35} />
              <h3>No saved libraries</h3>
              <p>Browse available libraries and save the ones you like.</p>
              <Link to="/locations" className="kd-primary-button">
                Explore Libraries
              </Link>
            </div>
          )}
        </section>
      </>
    )
  }

  const renderReviews = () => (
    <>
      <div className="kd-welcome">
        <div>
          <span className="kd-eyebrow">YOUR FEEDBACK</span>
          <h1>My Reviews</h1>
          <p>Share your experience with the Kitaab community.</p>
        </div>
      </div>

      <section className="kd-panel">
        <div className="kd-panel-heading">
          <div>
            <h2>Write a Review</h2>
            <p>Share feedback about a library you are subscribed to.</p>
          </div>
          <Star size={21} />
        </div>

        <form className="kd-review-form" onSubmit={addReview}>
          <label>
            Select Library
            <select
              value={reviewLibrary}
              onChange={(event) => setReviewLibrary(event.target.value)}
              required
            >
              <option value="">Choose a library</option>
              {subscriptions
                .filter((subscription) => subscription.status === 'active')
                .map((subscription) => (
                  <option key={subscription.library_id} value={subscription.library_id}>
                    {subscription.library_name}
                  </option>
                ))}
            </select>
          </label>

          <label>
            Rating
            <select
              value={reviewRating}
              onChange={(event) => setReviewRating(event.target.value)}
            >
              <option value="5">5 - Excellent</option>
              <option value="4">4 - Very Good</option>
              <option value="3">3 - Good</option>
              <option value="2">2 - Average</option>
              <option value="1">1 - Poor</option>
            </select>
          </label>

          <label>
            Your Review
            <textarea
              value={reviewText}
              onChange={(event) => setReviewText(event.target.value)}
              placeholder="Write about your experience..."
              required
            />
          </label>

          <button
            className="kd-primary-button"
            type="submit"
            disabled={reviewActionLoading}
          >
            <Plus size={16} />
            {reviewActionLoading ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </section>

      <section className="kd-panel">
        <div className="kd-panel-heading">
          <h2>Your Reviews ({reviews.length})</h2>
        </div>

        {reviewsLoading ? (
          <div className="kd-empty">
            <p>Loading your reviews...</p>
          </div>
        ) : reviewsError ? (
          <div className="kd-empty">
            <h3>Unable to load reviews</h3>
            <p>{reviewsError}</p>
          </div>
        ) : reviews.length > 0 ? (
          <div className="kd-review-list">
            {reviews.map((review) => (
              <div className="kd-review-card" key={review.id}>
                <div className="kd-panel-heading">
                  <div>
                    <h3>{review.library_name}</h3>
                    <span>{'★'.repeat(review.rating)} ({review.rating}/5)</span>
                  </div>

                  <button
                    className="kd-icon-button"
                    onClick={() => deleteReview(review.id)}
                    aria-label="Delete review"
                    disabled={deletingReviewId === review.id}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <p>{review.comment}</p>
                <small>
                  {review.created_at
                    ? new Date(review.created_at).toLocaleDateString()
                    : ''}
                </small>
              </div>
            ))}
          </div>
        ) : (
          <div className="kd-empty">
            <Star size={30} />
            <h3>No reviews yet</h3>
            <p>Your submitted reviews will appear here.</p>
          </div>
        )}
      </section>
    </>
  )

  const renderPayments = () => (
    <>
      <div className="kd-welcome">
        <div>
          <span className="kd-eyebrow">TRANSACTION RECORDS</span>
          <h1>Payment History</h1>
          <p>View your membership payment records.</p>
        </div>
      </div>

      <section className="kd-panel">
        {paymentsLoading ? (
          <div className="kd-empty">
            <CreditCard size={38} />
            <h3>Loading payments...</h3>
          </div>
        ) : paymentsError ? (
          <div className="kd-empty">
            <CreditCard size={38} />
            <h3>Unable to load payments</h3>
            <p>{paymentsError}</p>
          </div>
        ) : payments.length > 0 ? (
          <div className="kd-review-list">
            {payments.map((payment) => (
              <div className="kd-review-card" key={payment.id}>
                <div className="kd-panel-heading">
                  <div>
                    <h3>{payment.library_name}</h3>
                    <p>{payment.plan_name} Membership</p>
                  </div>
                  <span className="kd-status">
                    {payment.status}
                  </span>
                </div>

                <p><strong>Amount:</strong> ₹{payment.amount}</p>
                <p><strong>Transaction ID:</strong> {payment.transaction_id}</p>
                <small>
                  {new Date(payment.created_at).toLocaleString()}
                </small>
              </div>
            ))}
          </div>
        ) : (
          <div className="kd-empty">
            <CreditCard size={38} />
            <h3>No payment records</h3>
            <p>Your payment transactions will appear here.</p>
          </div>
        )}
      </section>
    </>
  )

  const renderNotifications = () => (
    <>
      <div className="kd-welcome">
        <div>
          <span className="kd-eyebrow">UPDATES</span>
          <h1>Notifications</h1>
          <p>Stay informed about your account.</p>
        </div>

        <button className="kd-primary-button" onClick={markAllRead}>
          <CheckCircle size={16} /> Mark All Read
        </button>
      </div>

      <section className="kd-panel">
        {notifications.length > 0 ? (
          <div className="kd-notification-list">
            {notifications.map((notification) => (
              <div
                className={`kd-notification ${notification.read ? '' : 'unread'}`}
                key={notification.id}
              >
                <Bell size={19} />

                <div style={{ flex: 1 }}>
                  <h3>{notification.title}</h3>
                  <p>{notification.message}</p>
                </div>

                {!notification.read && (
                  <button
                    className="kd-icon-button"
                    onClick={() => markNotificationRead(notification.id)}
                    aria-label="Mark as read"
                  >
                    <CheckCircle size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="kd-empty">
            <Bell size={30} />
            <h3>No notifications</h3>
          </div>
        )}
      </section>
    </>
  )

  const renderProfile = () => (
    <>
      <div className="kd-welcome">
        <div>
          <span className="kd-eyebrow">PERSONAL INFORMATION</span>
          <h1>My Profile</h1>
          <p>Update your customer account details.</p>
        </div>
      </div>

      <section className="kd-panel">
        <div className="kd-panel-heading">
          <h2>Edit Profile</h2>
          <User size={21} />
        </div>

        <form className="kd-profile-form" onSubmit={saveProfile}>
          <label>
            Full Name
            <input
              value={profile.name}
              onChange={(event) =>
                setProfile({ ...profile, name: event.target.value })
              }
              placeholder="Your name"
              required
            />
          </label>

          <label>
            Email Address
            <input
              type="email"
              value={profile.email}
              onChange={(event) =>
                setProfile({ ...profile, email: event.target.value })
              }
              placeholder="your@email.com"
              required
            />
          </label>

          <label>
            Phone Number
            <input
              value={profile.phone}
              onChange={(event) =>
                setProfile({ ...profile, phone: event.target.value })
              }
              placeholder="Your phone number"
            />
          </label>

          <label>
            City
            <input
              value={profile.city}
              onChange={(event) =>
                setProfile({ ...profile, city: event.target.value })
              }
              placeholder="Your city"
            />
          </label>

          <div className="kd-form-actions">
            <button className="kd-primary-button" type="submit">
              <Save size={16} /> Save Changes
            </button>
          </div>
        </form>
      </section>
    </>
  )

  const renderSettings = () => (
    <>
      <div className="kd-welcome">
        <div>
          <span className="kd-eyebrow">ACCOUNT PREFERENCES</span>
          <h1>Settings</h1>
          <p>Manage your account and dashboard preferences.</p>
        </div>
      </div>

      <section className="kd-panel">
        <div className="kd-settings-item">
          <div>
            <h3>Profile Settings</h3>
            <p>Update your personal information.</p>
          </div>
          <button
            className="kd-primary-button"
            onClick={() => changeSection('My Profile')}
          >
            Edit Profile <ArrowRight size={15} />
          </button>
        </div>

        <div className="kd-settings-item">
          <div>
            <h3>Notifications</h3>
            <p>View your latest account updates.</p>
          </div>
          <button
            className="kd-primary-button"
            onClick={() => changeSection('Notifications')}
          >
            View <ArrowRight size={15} />
          </button>
        </div>

        <div className="kd-settings-item">
          <div>
            <h3>Sign Out</h3>
            <p>Sign out from your current demo session.</p>
          </div>
          <button className="kd-danger-button" onClick={signOut}>
            <LogOut size={15} /> Sign Out
          </button>
        </div>

        <div className="kd-demo-note">
          Demo mode: account preferences and dashboard data are stored
          in this browser. This is not a production authentication system.
        </div>
      </section>
    </>
  )

  if (!user) {
    return (
      <main className="customer-page dashboard-page">
        <section className="dashboard-empty">
          <h1 className="serif-title">Your study spaces, together.</h1>
          <p>
            Sign in or create an account to see your customer dashboard.
          </p>
          <div className="dashboard-actions">
            <Link to="/login">Sign in</Link>
            <Link className="secondary-action" to="/register">
              Create an account
            </Link>
          </div>
        </section>
      </main>
    )
  }

  const ownerAppUrl = import.meta.env.VITE_OWNER_APP_URL || 'http://localhost:5174'

  if (user.role && user.role !== 'customer') {
    const currentToken = localStorage.getItem('kitaab-auth-token') || ''
    return (
      <main className="customer-page dashboard-page">
        <section className="dashboard-empty" style={{ maxWidth: 640, margin: '40px auto', textAlign: 'center' }}>
          <h1 className="serif-title" style={{ fontSize: 32 }}>Owner Account Detected</h1>
          <p style={{ margin: '14px auto 24px', maxWidth: 480 }}>
            You are signed in as <strong>{user.email}</strong> with role <strong>{user.role}</strong>. Please use the dedicated Owner Portal to manage your library listings and settings.
          </p>
          <div className="dashboard-actions" style={{ justifyContent: 'center' }}>
            <a
              href={`${ownerAppUrl}/login?auth_token=${encodeURIComponent(currentToken)}&auth_user=${encodeURIComponent(JSON.stringify(user))}`}
            >
              Go to Owner Portal
            </a>
            <button
              type="button"
              className="secondary-action"
              onClick={signOut}
            >
              Sign out
            </button>
          </div>
        </section>
      </main>
    )
  }

  const sectionContent = {
    Overview: renderOverview,
    'My Membership': renderMembership,
    'My Bookings': renderBookings,
    'Saved Libraries': renderSavedLibraries,
    'My Reviews': renderReviews,
    'Payment History': renderPayments,
    Notifications: renderNotifications,
    'My Profile': renderProfile,
    Settings: renderSettings
  }

  return (
    <main className="kd-dashboard">
      <div className="kd-mobile-header">
        <strong>KITAAB</strong>
        <button
          onClick={() => setMobileMenu(!mobileMenu)}
          aria-label="Toggle navigation"
        >
          {mobileMenu ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <div className="kd-layout">
        <aside className={`kd-sidebar ${mobileMenu ? 'kd-sidebar-open' : ''}`}>
          <div className="kd-brand">
            KITAAB<span>.</span>
          </div>

          <div className="kd-user-summary">
            <div className="kd-avatar">
              {(user.name || 'K').charAt(0).toUpperCase()}
            </div>
            <div>
              <strong>{user.name || 'Kitaab Member'}</strong>
              <small>Customer Account</small>
            </div>
          </div>

          <nav className="kd-navigation">
            <span className="kd-nav-label">CUSTOMER MENU</span>

            {navigationItems.map((item) => {
              const Icon = item.icon

              return (
                <button
                  key={item.name}
                  className={section === item.name ? 'active' : ''}
                  onClick={() => changeSection(item.name)}
                >
                  <Icon size={18} />
                  {item.name}
                  {item.count > 0 && (
                    <span className="kd-count">{item.count}</span>
                  )}
                </button>
              )
            })}
          </nav>

          <button className="kd-signout" onClick={signOut}>
            <LogOut size={18} />
            Sign Out
          </button>
        </aside>

        <div className="kd-main">
          <header className="kd-topbar">
            <h2>{section}</h2>

            <button
              className="kd-notification-button"
              onClick={() => changeSection('Notifications')}
              aria-label="Open notifications"
            >
              <Bell size={19} />
            </button>
          </header>

          <div className="kd-page-content">
            {sectionContent[section]?.()}

            {notice && (
              <p className="kd-demo-note" role="status">
                {notice}
              </p>
            )}
          </div>

          <footer className="kd-footer">
            © {new Date().getFullYear()} Kitaab. Customer Dashboard Demo.
          </footer>
        </div>
      </div>
    </main>
  )
}

export default Dashboard
