
import { useState } from 'react'
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

  const [user, setUser] = useState(() =>
    getStorage('kitaab-demo-user', null)
  )

  const [section, setSection] = useState('Overview')
  const [mobileMenu, setMobileMenu] = useState(false)

  const [membershipState, setMembershipState] = useState(
    () => window.localStorage.getItem('kitaab-demo-membership') || 'active'
  )

  const [savedLibraries, setSavedLibraries] = useState(() =>
    getStorage('kitaab-demo-saved-libraries', user?.libraryId ? [Number(user.libraryId)] : [])
  )

  const [reviews, setReviews] = useState(() =>
    getStorage('kitaab-demo-reviews', [])
  )

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

  const updateMembership = (nextState) => {
    window.localStorage.setItem('kitaab-demo-membership', nextState)
    setMembershipState(nextState)

    setNotice(
      nextState === 'cancelled'
        ? 'Your demo membership selection has been cancelled.'
        : 'Your demo membership selection is active again.'
    )
  }

  const toggleSavedLibrary = (libraryId) => {
    const updated = savedLibraries.includes(libraryId)
      ? savedLibraries.filter((id) => id !== libraryId)
      : [...savedLibraries, libraryId]

    setSavedLibraries(updated)
    saveStorage('kitaab-demo-saved-libraries', updated)
  }

  const addReview = (event) => {
    event.preventDefault()

    if (!reviewLibrary || !reviewText.trim()) {
      setNotice('Please select a library and write your review.')
      return
    }

    const library = sampleLibraries.find(
      (item) => item.id === Number(reviewLibrary)
    )

    const newReview = {
      id: Date.now(),
      libraryName: library?.name || 'Library',
      rating: Number(reviewRating),
      comment: reviewText.trim(),
      date: new Date().toLocaleDateString()
    }

    const updated = [newReview, ...reviews]

    setReviews(updated)
    saveStorage('kitaab-demo-reviews', updated)

    setReviewText('')
    setReviewLibrary('')
    setReviewRating('5')
    setNotice('Your demo review has been added.')
  }

  const deleteReview = (reviewId) => {
    const updated = reviews.filter((review) => review.id !== reviewId)

    setReviews(updated)
    saveStorage('kitaab-demo-reviews', updated)
    setNotice('Review removed.')
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
          <h3>{selectedLibrary ? '01' : '00'}</h3>
          <p>{selectedLibrary ? 'Selected library' : 'No membership yet'}</p>
        </div>

        <div className="kd-stat-card">
          <span>Saved Libraries</span>
          <h3>{savedLibraries.length}</h3>
          <p>Your favorite study spaces</p>
        </div>

        <div className="kd-stat-card">
          <span>My Reviews</span>
          <h3>{reviews.length}</h3>
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

  const renderMembership = () => (
    <>
      <div className="kd-welcome">
        <div>
          <span className="kd-eyebrow">YOUR SUBSCRIPTION</span>
          <h1>My Membership</h1>
          <p>Manage your selected study space.</p>
        </div>
      </div>

      <section className="kd-panel">
        {selectedLibrary ? (
          <>
            <div className="kd-panel-heading">
              <div>
                <h2>{selectedLibrary.name}</h2>
                <p>Your selected library</p>
              </div>
              <span className={`kd-status ${membershipState === 'cancelled' ? 'cancelled' : ''}`}>
                {membershipState === 'active' ? 'Active' : 'Cancelled'}
              </span>
            </div>

            <div className="kd-membership-card">
              <h3>{selectedLibrary.name}</h3>
              <p><MapPin size={14} /> {selectedLibrary.area}</p>
              <p>Monthly starting price: ₹{selectedLibrary.price}</p>
              <p>This is a frontend demo selection. No real subscription or payment exists.</p>

              {membershipState === 'active' ? (
                <button
                  className="kd-danger-button"
                  onClick={() => updateMembership('cancelled')}
                >
                  <CirclePause size={15} /> Cancel Demo Selection
                </button>
              ) : (
                <button
                  className="kd-primary-button"
                  onClick={() => updateMembership('active')}
                >
                  <CheckCircle size={15} /> Restore Selection
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="kd-empty">
            <BookOpen size={35} />
            <h3>No membership found</h3>
            <p>Find a library that matches your study needs.</p>
            <Link to="/locations" className="kd-primary-button">
              Browse Libraries <ArrowRight size={15} />
            </Link>
          </div>
        )}
      </section>
    </>
  )

  const renderSavedLibraries = () => {
    const savedItems = sampleLibraries.filter((library) =>
      savedLibraries.includes(library.id)
    )

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
          {savedItems.length > 0 ? (
            <div className="kd-library-grid">
              {savedItems.map((library) => (
                <div className="kd-library-card" key={library.id}>
                  <div>
                    <h3>{library.name}</h3>
                    <p><MapPin size={13} /> {library.area}</p>
                    <p>₹{library.price}/month</p>
                    <button
                      className="kd-danger-button"
                      onClick={() => toggleSavedLibrary(library.id)}
                    >
                      <Bookmark size={14} /> Remove Saved
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
            <p>Reviews are saved locally in this demo.</p>
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
              {sampleLibraries.map((library) => (
                <option key={library.id} value={library.id}>
                  {library.name}
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

          <button className="kd-primary-button" type="submit">
            <Plus size={16} /> Submit Review
          </button>
        </form>
      </section>

      <section className="kd-panel">
        <div className="kd-panel-heading">
          <h2>Your Reviews ({reviews.length})</h2>
        </div>

        {reviews.length > 0 ? (
          <div className="kd-review-list">
            {reviews.map((review) => (
              <div className="kd-review-card" key={review.id}>
                <div className="kd-panel-heading">
                  <div>
                    <h3>{review.libraryName}</h3>
                    <span>{'★'.repeat(review.rating)} ({review.rating}/5)</span>
                  </div>

                  <button
                    className="kd-icon-button"
                    onClick={() => deleteReview(review.id)}
                    aria-label="Delete review"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <p>{review.comment}</p>
                <small>{review.date}</small>
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
        <div className="kd-empty">
          <CreditCard size={38} />
          <h3>No payment records</h3>
          <p>
            This is a frontend demo. No real payments have been collected
            or processed.
          </p>
        </div>
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

  const sectionContent = {
    Overview: renderOverview,
    'My Membership': renderMembership,
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
