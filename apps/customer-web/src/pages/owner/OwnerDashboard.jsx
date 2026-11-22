import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  User,
  LogOut,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Trash2,
  Edit,
  Eye,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  Search,
  Users
} from 'lucide-react'

import {
  getOwnerDashboard,
  getAdminDashboard,
  getMyLibraries,
  createLibrary,
  updateLibrary,
  deleteLibrary,
  getAdminPendingLibraries,
  approveAdminLibrary,
  rejectAdminLibrary,
  getAdminOwnerApplications,
  approveAdminOwnerApplication,
  rejectAdminOwnerApplication
} from '../../services/api.js'

import './OwnerDashboard.css'

const AVAILABLE_FACILITIES = [
  'Wi-Fi',
  'Air Conditioning',
  'Power Outlets',
  'Silent Zone',
  'Discussion Room',
  'Cafeteria',
  'Personal Lockers',
  'Parking Space',
  'RO Drinking Water',
  'CCTV Surveillance'
]

const SAMPLE_PHOTO_PRESETS = [
  { label: 'Study Community', url: '/images/study-community.webp' },
  { label: 'Sonipat Study Space', url: '/images/sonipat-study-space.webp' },
  { label: 'Community Study', url: '/images/community-study.webp' },
  { label: 'Student Gathering', url: '/images/student-community.webp' }
]

export default function OwnerDashboard() {
  const navigate = useNavigate()

  // User state
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('kitaab-demo-user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  // Navigation section
  const [section, setSection] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('section') === 'admin') return 'Admin Approvals'
    try {
      const stored = localStorage.getItem('kitaab-demo-user')
      const u = stored ? JSON.parse(stored) : null
      if (u?.role === 'admin') return 'Overview'
    } catch {}
    return 'Overview'
  }) // 'Overview' | 'My Libraries' | 'Add Library' | 'Admin Approvals' | 'Profile'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Libraries state
  const [libraries, setLibraries] = useState([])
  const [librariesLoading, setLibrariesLoading] = useState(true)
  const [librariesError, setLibrariesError] = useState('')

  // Dashboard metrics
  const [dashboardStats, setDashboardStats] = useState(null)
  const [dashboardLoading, setDashboardLoading] = useState(true)

  // Filter in My Libraries
  const [libraryFilter, setLibraryFilter] = useState('all') // 'all' | 'pending' | 'approved' | 'rejected'
  const [searchQuery, setSearchQuery] = useState('')

  // Active view modal
  const [selectedLibrary, setSelectedLibrary] = useState(null)

  // Edit mode state
  const [editingLibrary, setEditingLibrary] = useState(null)

  // Admin state (applications & pending libraries)
  const [adminPending, setAdminPending] = useState([])
  const [adminApplications, setAdminApplications] = useState([])
  const [adminLoading, setAdminLoading] = useState(false)
  const [adminActionId, setAdminActionId] = useState(null)
  const [adminAppActionId, setAdminAppActionId] = useState(null)
  const [adminApprovalTab, setAdminApprovalTab] = useState('applications') // 'applications' | 'libraries'
  const [adminAppFilter, setAdminAppFilter] = useState('pending') // 'pending' | 'all'

  // Form inputs for Add / Edit Library
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    locality: '',
    phone: '',
    total_seats: 50,
    available_seats: 50,
    opening_hours: 'Monday - Sunday: 8:00 AM - 10:00 PM',
    facilities: ['Wi-Fi', 'Air Conditioning', 'Power Outlets', 'Silent Zone'],
    photos: ['/images/sonipat-study-space.webp']
  })
  const [customPhotoUrl, setCustomPhotoUrl] = useState('')
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  // Global banners / notices
  const [notice, setNotice] = useState('')
  const [bannerType, setBannerType] = useState('info') // 'success' | 'error' | 'info'

  const showBanner = (message, type = 'info') => {
    setNotice(message)
    setBannerType(type)
  }

  // Load dashboard stats and libraries (role-aware: never call getMyLibraries for admin)
  const fetchOwnerData = async () => {
    setDashboardLoading(true)
    setLibrariesError('')

    try {
      if (user?.role === 'admin') {
        // Admin: do not call getMyLibraries (which is restricted to owner role)
        setLibrariesLoading(false)
        setLibraries([])
        const dashResponse = await getAdminDashboard()
        if (dashResponse?.dashboard?.statistics) {
          setDashboardStats(dashResponse.dashboard.statistics)
        }
      } else {
        // Owner: load personal libraries and owner dashboard
        setLibrariesLoading(true)
        const [libResponse, dashResponse] = await Promise.allSettled([
          getMyLibraries(),
          getOwnerDashboard()
        ])

        if (libResponse.status === 'fulfilled') {
          setLibraries(libResponse.value.libraries || [])
        } else {
          setLibrariesError(libResponse.reason?.message || 'Unable to load libraries.')
        }

        if (dashResponse.status === 'fulfilled') {
          setDashboardStats(dashResponse.value.dashboard?.statistics || null)
        }
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err.message)
    } finally {
      setLibrariesLoading(false)
      setDashboardLoading(false)
    }
  }

  // Load admin verification data (owner applications and pending library submissions)
  const fetchAdminData = async () => {
    if (user?.role !== 'admin') return
    setAdminLoading(true)
    try {
      const [libsRes, appsRes] = await Promise.allSettled([
        getAdminPendingLibraries(),
        getAdminOwnerApplications()
      ])
      if (libsRes.status === 'fulfilled') {
        setAdminPending(libsRes.value.libraries || [])
      }
      if (appsRes.status === 'fulfilled') {
        setAdminApplications(appsRes.value.applications || [])
      }
    } catch (err) {
      console.error('Failed to load admin verification data:', err.message)
    } finally {
      setAdminLoading(false)
    }
  }

  useEffect(() => {
    fetchOwnerData()
    if (user?.role === 'admin') {
      fetchAdminData()
    }
  }, [user?.role])

  // Prevent admin from staying on owner-only routes
  useEffect(() => {
    if (user?.role === 'admin' && (section === 'My Libraries' || section === 'Add Library')) {
      setSection('Overview')
    }
  }, [user?.role, section])

  // Sign out
  const handleSignOut = () => {
    localStorage.removeItem('kitaab-auth-token')
    localStorage.removeItem('kitaab-demo-user')
    navigate('/owner/login')
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      address: '',
      city: '',
      locality: '',
      phone: '',
      total_seats: 50,
      available_seats: 50,
      opening_hours: 'Monday - Sunday: 8:00 AM - 10:00 PM',
      facilities: ['Wi-Fi', 'Air Conditioning', 'Power Outlets', 'Silent Zone'],
      photos: ['/images/sonipat-study-space.webp']
    })
    setCustomPhotoUrl('')
    setEditingLibrary(null)
    setFormError('')
  }

  // Start editing a library
  const handleStartEdit = (library) => {
    setEditingLibrary(library)
    setFormData({
      name: library.name || '',
      description: library.description || '',
      address: library.address || '',
      city: library.city || '',
      locality: library.locality || '',
      phone: library.phone || '',
      total_seats: library.total_seats ?? 50,
      available_seats: library.available_seats ?? 50,
      opening_hours:
        typeof library.opening_hours === 'string'
          ? library.opening_hours
          : library.opening_hours?.general || 'Monday - Sunday: 8:00 AM - 10:00 PM',
      facilities: Array.isArray(library.facilities) ? library.facilities : [],
      photos: Array.isArray(library.photos) && library.photos.length > 0 ? library.photos : ['/images/sonipat-study-space.webp']
    })
    setSection('Add Library')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Toggle facility in form
  const handleToggleFacility = (facility) => {
    setFormData((prev) => {
      const exists = prev.facilities.includes(facility)
      return {
        ...prev,
        facilities: exists
          ? prev.facilities.filter((f) => f !== facility)
          : [...prev.facilities, facility]
      }
    })
  }

  // Toggle photo in form
  const handleSelectPresetPhoto = (url) => {
    setFormData((prev) => {
      if (prev.photos.includes(url)) {
        if (prev.photos.length === 1) return prev // keep at least 1 photo
        return { ...prev, photos: prev.photos.filter((p) => p !== url) }
      }
      return { ...prev, photos: [...prev.photos, url] }
    })
  }

  const handleAddCustomPhoto = () => {
    if (!customPhotoUrl.trim()) return
    const url = customPhotoUrl.trim()
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.includes(url) ? prev.photos : [...prev.photos, url]
    }))
    setCustomPhotoUrl('')
  }

  // Handle Form Submit (Add or Edit)
  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    setFormSubmitting(true)

    // Validation
    if (!formData.name.trim()) {
      setFormError('Library name is required.')
      setFormSubmitting(false)
      return
    }
    if (!formData.address.trim()) {
      setFormError('Library address is required.')
      setFormSubmitting(false)
      return
    }
    if (!formData.city.trim()) {
      setFormError('City is required.')
      setFormSubmitting(false)
      return
    }
    if (Number(formData.total_seats) < 0) {
      setFormError('Total seats must be a positive number.')
      setFormSubmitting(false)
      return
    }
    if (Number(formData.available_seats) > Number(formData.total_seats)) {
      setFormError('Available seats cannot exceed total seats.')
      setFormSubmitting(false)
      return
    }

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        address: formData.address.trim(),
        city: formData.city.trim(),
        locality: formData.locality.trim() || null,
        phone: formData.phone.trim() || null,
        total_seats: Number(formData.total_seats),
        available_seats: Number(formData.available_seats),
        opening_hours: { general: formData.opening_hours.trim() },
        facilities: formData.facilities,
        photos: formData.photos.length > 0 ? formData.photos : ['/images/sonipat-study-space.webp']
      }

      if (editingLibrary) {
        // Update library
        const response = await updateLibrary(editingLibrary.id, payload)
        showBanner(`Library "${formData.name}" updated successfully.`, 'success')
        setLibraries((prev) =>
          prev.map((lib) => (lib.id === editingLibrary.id ? response.library : lib))
        )
      } else {
        // Create new library
        const response = await createLibrary(payload)
        showBanner(
          response.message || 'Library created successfully. Awaiting admin approval.',
          'success'
        )
        setLibraries((prev) => [response.library, ...prev])
      }

      // Re-fetch dashboard stats
      getOwnerDashboard().then((dash) => {
        setDashboardStats(dash?.dashboard?.statistics || null)
      }).catch(() => {})

      // If user is admin, also refresh admin pending list
      if (user?.role === 'admin') {
        fetchAdminPending()
      }

      resetForm()
      setSection('My Libraries')
    } catch (err) {
      setFormError(err.message || 'Failed to save library.')
    } finally {
      setFormSubmitting(false)
    }
  }

  // Delete Library
  const handleDeleteLibrary = async (libraryId, libraryName) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${libraryName}"? This cannot be undone.`)
    if (!confirmed) return

    try {
      await deleteLibrary(libraryId)
      showBanner(`Library "${libraryName}" was deleted.`, 'info')
      setLibraries((prev) => prev.filter((lib) => lib.id !== libraryId))
      if (selectedLibrary?.id === libraryId) {
        setSelectedLibrary(null)
      }
      // Re-fetch dashboard stats
      getOwnerDashboard().then((dash) => {
        setDashboardStats(dash?.dashboard?.statistics || null)
      }).catch(() => {})
    } catch (err) {
      showBanner(err.message || 'Unable to delete library.', 'error')
    }
  }

  // Admin approval actions for owner applications
  const handleAdminApproveApplication = async (appId) => {
    setAdminAppActionId(appId)
    try {
      const response = await approveAdminOwnerApplication(appId)
      showBanner(
        `Application #${appId} approved successfully! Owner account created for ${response.owner?.name || 'applicant'}.`,
        'success'
      )
      setAdminApplications((prev) =>
        prev.map((app) => (app.id === appId ? { ...app, status: 'approved' } : app))
      )
      getAdminDashboard().then((dash) => {
        setDashboardStats(dash?.dashboard?.statistics || null)
      }).catch(() => {})
    } catch (err) {
      showBanner(err.message || 'Failed to approve application.', 'error')
    } finally {
      setAdminAppActionId(null)
    }
  }

  const handleAdminRejectApplication = async (appId) => {
    setAdminAppActionId(appId)
    try {
      await rejectAdminOwnerApplication(appId)
      showBanner(`Application #${appId} has been rejected.`, 'info')
      setAdminApplications((prev) =>
        prev.map((app) => (app.id === appId ? { ...app, status: 'rejected' } : app))
      )
      getAdminDashboard().then((dash) => {
        setDashboardStats(dash?.dashboard?.statistics || null)
      }).catch(() => {})
    } catch (err) {
      showBanner(err.message || 'Failed to reject application.', 'error')
    } finally {
      setAdminAppActionId(null)
    }
  }

  // Admin approval actions for libraries (for MVP demo)
  const handleAdminApprove = async (libraryId) => {
    setAdminActionId(libraryId)
    try {
      await approveAdminLibrary(libraryId)
      showBanner(`Library #${libraryId} approved successfully! It is now live on Customer Discover.`, 'success')
      setAdminPending((prev) => prev.filter((item) => item.id !== libraryId))
      setLibraries((prev) =>
        prev.map((lib) => (lib.id === libraryId ? { ...lib, status: 'approved' } : lib))
      )
      getAdminDashboard().then((dash) => {
        setDashboardStats(dash?.dashboard?.statistics || null)
      }).catch(() => {})
    } catch (err) {
      showBanner(err.message || 'Failed to approve library.', 'error')
    } finally {
      setAdminActionId(null)
    }
  }

  const handleAdminReject = async (libraryId) => {
    setAdminActionId(libraryId)
    try {
      await rejectAdminLibrary(libraryId)
      showBanner(`Library #${libraryId} was rejected.`, 'info')
      setAdminPending((prev) => prev.filter((item) => item.id !== libraryId))
      setLibraries((prev) =>
        prev.map((lib) => (lib.id === libraryId ? { ...lib, status: 'rejected' } : lib))
      )
      getAdminDashboard().then((dash) => {
        setDashboardStats(dash?.dashboard?.statistics || null)
      }).catch(() => {})
    } catch (err) {
      showBanner(err.message || 'Failed to reject library.', 'error')
    } finally {
      setAdminActionId(null)
    }
  }

  const isAdmin = user?.role === 'admin'

  const pendingOwnerApps = useMemo(() => {
    return adminApplications.filter((a) => a.status === 'pending')
  }, [adminApplications])

  const totalPendingAdminCount = pendingOwnerApps.length + adminPending.length

  // Filtered libraries calculation (for owner view)
  const filteredLibraries = useMemo(() => {
    return libraries.filter((lib) => {
      const matchesFilter =
        libraryFilter === 'all' ? true : lib.status?.toLowerCase() === libraryFilter.toLowerCase()

      const query = searchQuery.trim().toLowerCase()
      if (!query) return matchesFilter

      const searchable = [
        lib.name,
        lib.city,
        lib.locality,
        lib.address,
        ...(lib.facilities || [])
      ].filter(Boolean).join(' ').toLowerCase()

      return matchesFilter && searchable.includes(query)
    })
  }, [libraries, libraryFilter, searchQuery])

  // Count aggregates
  const counts = useMemo(() => {
    const total = libraries.length
    const approved = libraries.filter((l) => l.status === 'approved').length
    const pending = libraries.filter((l) => l.status === 'pending').length
    const rejected = libraries.filter((l) => l.status === 'rejected').length
    return {
      total: dashboardStats?.libraries?.total ?? total,
      approved: dashboardStats?.libraries?.approved ?? approved,
      pending: dashboardStats?.libraries?.pending ?? pending,
      rejected: dashboardStats?.libraries?.rejected ?? rejected
    }
  }, [libraries, dashboardStats])

  return (
    <div className="kd-dashboard">
      <div className="kd-layout">
        {/* Mobile Header */}
        <header className="kd-mobile-header">
          <div className="kd-brand" style={{ padding: 0, margin: 0, fontSize: 20 }}>
            Kitaab <span>{isAdmin ? 'Admin' : 'Owner'}</span>
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        {/* Sidebar */}
        <aside className={`kd-sidebar ${mobileMenuOpen ? 'kd-sidebar-open' : ''}`}>
          <div className="kd-brand">
            Kitaab
            <span>{isAdmin ? 'Admin Desk' : 'Owner Portal'}</span>
          </div>

          <div className="kd-user-summary">
            <div className="kd-avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : isAdmin ? 'A' : 'O'}
            </div>
            <div>
              <strong>{user?.name || (isAdmin ? 'Administrator' : 'Library Owner')}</strong>
              <small>{user?.email || (isAdmin ? 'admin@example.com' : 'owner@example.com')}</small>
              <div style={{ marginTop: 2 }}>
                <span
                  style={{
                    fontSize: 10,
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    color: isAdmin ? '#ffdf3e' : '#aebfb3',
                    letterSpacing: 1
                  }}
                >
                  {isAdmin ? 'Administrator' : 'Verified Owner'}
                </span>
              </div>
            </div>
          </div>

          <nav className="kd-navigation">
            <span className="kd-nav-label">{isAdmin ? 'ADMIN MENU' : 'PORTAL MENU'}</span>

            <button
              type="button"
              className={section === 'Overview' ? 'active' : ''}
              onClick={() => {
                setSection('Overview')
                setMobileMenuOpen(false)
              }}
            >
              <LayoutDashboard size={18} />
              Overview
            </button>

            {/* Owner-only navigation items */}
            {!isAdmin && (
              <>
                <button
                  type="button"
                  className={section === 'My Libraries' ? 'active' : ''}
                  onClick={() => {
                    setSection('My Libraries')
                    setMobileMenuOpen(false)
                  }}
                >
                  <BookOpen size={18} />
                  My Libraries
                  {counts.total > 0 && <span className="kd-count">{counts.total}</span>}
                </button>

                <button
                  type="button"
                  className={section === 'Add Library' ? 'active' : ''}
                  onClick={() => {
                    resetForm()
                    setSection('Add Library')
                    setMobileMenuOpen(false)
                  }}
                >
                  <PlusCircle size={18} />
                  {editingLibrary ? 'Edit Library' : 'Add Library'}
                </button>
              </>
            )}

            {/* Admin-only navigation items */}
            {isAdmin && (
              <button
                type="button"
                className={section === 'Admin Approvals' ? 'active' : ''}
                onClick={() => {
                  fetchAdminData()
                  setSection('Admin Approvals')
                  setMobileMenuOpen(false)
                }}
              >
                <ShieldCheck size={18} />
                Admin Approvals
                {totalPendingAdminCount > 0 && (
                  <span className="kd-count" style={{ background: '#ffdf3e', color: '#111' }}>
                    {totalPendingAdminCount}
                  </span>
                )}
              </button>
            )}

            <button
              type="button"
              className={section === 'Profile' ? 'active' : ''}
              onClick={() => {
                setSection('Profile')
                setMobileMenuOpen(false)
              }}
            >
              <User size={18} />
              {isAdmin ? 'Admin Account' : 'Owner Account'}
            </button>
          </nav>

          <div className="kd-sidebar-footer">
            <a
              href="/locations"
              target="_blank"
              rel="noreferrer"
              className="kd-sidebar-link"
            >
              <ExternalLink size={15} />
              View Customer Discover
            </a>

            <button type="button" className="kd-signout" onClick={handleSignOut}>
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="kd-main">
          {/* Topbar */}
          <div className="kd-topbar">
            <h2>
              {isAdmin
                ? section === 'Admin Approvals'
                  ? 'Admin Verification Desk'
                  : section === 'Profile'
                  ? 'Admin Account'
                  : 'Administrator Overview'
                : section === 'Add Library' && editingLibrary
                ? 'Edit Library'
                : section}
            </h2>
            <div className="kd-topbar-actions">
              {!isAdmin && section !== 'Add Library' && (
                <button
                  type="button"
                  className="kd-primary-button"
                  onClick={() => {
                    resetForm()
                    setSection('Add Library')
                  }}
                >
                  <PlusCircle size={15} />
                  Add New Library
                </button>
              )}
              {isAdmin && section === 'Overview' && (
                <button
                  type="button"
                  className="kd-primary-button"
                  onClick={() => {
                    fetchAdminData()
                    setSection('Admin Approvals')
                  }}
                >
                  <ShieldCheck size={15} />
                  Review Approvals ({totalPendingAdminCount})
                </button>
              )}
            </div>
          </div>

          <div className="kd-page-content">
            {/* Global Notice Banner */}
            {notice && (
              <div className={`kd-banner ${bannerType}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {bannerType === 'success' && <CheckCircle size={18} />}
                  {bannerType === 'error' && <AlertCircle size={18} />}
                  {bannerType === 'info' && <CheckCircle size={18} />}
                  <span>{notice}</span>
                </div>
                <button type="button" onClick={() => setNotice('')} aria-label="Close notification">
                  <X size={16} />
                </button>
              </div>
            )}

            {/* SECTION 1: OVERVIEW */}
            {section === 'Overview' && (
              isAdmin ? (
                <>
                  <div className="kd-welcome">
                    <div>
                      <span className="kd-eyebrow">ADMIN CONTROL CENTER</span>
                      <h1>Hello, {user?.name || 'Administrator'}!</h1>
                      <p>Oversee Kitaab operations, verify partner applications, and review study space listings.</p>
                    </div>
                    <button
                      type="button"
                      className="kd-primary-button"
                      onClick={() => {
                        fetchAdminData()
                        setSection('Admin Approvals')
                      }}
                    >
                      <ShieldCheck size={16} />
                      Review Approvals ({totalPendingAdminCount})
                    </button>
                  </div>

                  {/* Admin 4 Summary Stat Cards */}
                  <div className="kd-stats-grid">
                    <div className="kd-stat-card" style={{ borderLeft: '4px solid #89652c' }}>
                      <span>Pending Owner Applications</span>
                      <h3 style={{ color: '#89652c' }}>{pendingOwnerApps.length}</h3>
                      <p>Awaiting admin verification</p>
                    </div>

                    <div className="kd-stat-card" style={{ borderLeft: '4px solid #89652c' }}>
                      <span>Pending Library Listings</span>
                      <h3 style={{ color: '#89652c' }}>{adminPending.length}</h3>
                      <p>Awaiting space review</p>
                    </div>

                    <div className="kd-stat-card" style={{ borderLeft: '4px solid #277343' }}>
                      <span>Approved Libraries Live</span>
                      <h3 style={{ color: '#277343' }}>{dashboardStats?.libraries?.approved ?? 0}</h3>
                      <p>Visible on Customer Discover</p>
                    </div>

                    <div className="kd-stat-card" style={{ borderLeft: '4px solid #315c45' }}>
                      <span>Registered Platform Users</span>
                      <h3 style={{ color: '#315c45' }}>{dashboardStats?.users?.total ?? 0}</h3>
                      <p>Customers, owners & staff</p>
                    </div>
                  </div>

                  {/* Admin Quick Actions */}
                  <section className="kd-panel">
                    <div className="kd-panel-heading">
                      <div>
                        <h2>Verification Quick Actions</h2>
                        <p>Process pending applications or check live customer spaces</p>
                      </div>
                    </div>

                    <div className="kd-quick-actions">
                      <div
                        className="kd-quick-action-card"
                        onClick={() => {
                          setAdminApprovalTab('applications')
                          setSection('Admin Approvals')
                        }}
                      >
                        <div className="kd-quick-action-icon">
                          <Users size={22} />
                        </div>
                        <div>
                          <h4>Review Owner Applications</h4>
                          <p>{pendingOwnerApps.length} partner application(s) pending</p>
                        </div>
                      </div>

                      <div
                        className="kd-quick-action-card"
                        onClick={() => {
                          setAdminApprovalTab('libraries')
                          setSection('Admin Approvals')
                        }}
                      >
                        <div className="kd-quick-action-icon">
                          <BookOpen size={22} />
                        </div>
                        <div>
                          <h4>Review Library Listings</h4>
                          <p>{adminPending.length} library space(s) awaiting approval</p>
                        </div>
                      </div>

                      <a
                        href="/locations"
                        target="_blank"
                        rel="noreferrer"
                        className="kd-quick-action-card"
                        style={{ textDecoration: 'none' }}
                      >
                        <div className="kd-quick-action-icon">
                          <ExternalLink size={22} />
                        </div>
                        <div>
                          <h4>Customer Discover View</h4>
                          <p>Verify live study spaces on the student portal</p>
                        </div>
                      </a>
                    </div>
                  </section>

                  {/* Pending review status desk */}
                  <section className="kd-panel">
                    <div className="kd-panel-heading">
                      <div>
                        <h2>Platform Verification Status</h2>
                        <p>Current pending requests requiring administrative action</p>
                      </div>
                      {totalPendingAdminCount > 0 && (
                        <button
                          type="button"
                          className="kd-secondary-button"
                          onClick={() => {
                            fetchAdminData()
                            setSection('Admin Approvals')
                          }}
                        >
                          Open Verification Desk
                        </button>
                      )}
                    </div>

                    {totalPendingAdminCount === 0 ? (
                      <div className="kd-empty">
                        <CheckCircle size={36} color="#277343" />
                        <h3>All verification queues are clear!</h3>
                        <p>There are no pending owner applications or library listings awaiting review right now.</p>
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                        <div
                          style={{
                            padding: 18,
                            background: '#fdfbf7',
                            border: '1px solid #f0e6d6',
                            borderRadius: 10
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <strong style={{ fontSize: 15, color: '#89652c' }}>Owner Applications</strong>
                            <span className="kd-status pending">{pendingOwnerApps.length} Pending</span>
                          </div>
                          <p style={{ margin: '8px 0 14px', fontSize: 13, color: '#68776f' }}>
                            Prospective library owners waiting for account credentials.
                          </p>
                          <button
                            type="button"
                            className="kd-primary-button"
                            style={{ width: '100%' }}
                            onClick={() => {
                              setAdminApprovalTab('applications')
                              setSection('Admin Approvals')
                            }}
                          >
                            Review Applications
                          </button>
                        </div>

                        <div
                          style={{
                            padding: 18,
                            background: '#fdfbf7',
                            border: '1px solid #f0e6d6',
                            borderRadius: 10
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <strong style={{ fontSize: 15, color: '#89652c' }}>Library Submissions</strong>
                            <span className="kd-status pending">{adminPending.length} Pending</span>
                          </div>
                          <p style={{ margin: '8px 0 14px', fontSize: 13, color: '#68776f' }}>
                            Study spaces submitted by owners waiting to go live.
                          </p>
                          <button
                            type="button"
                            className="kd-primary-button"
                            style={{ width: '100%' }}
                            onClick={() => {
                              setAdminApprovalTab('libraries')
                              setSection('Admin Approvals')
                            }}
                          >
                            Review Library Listings
                          </button>
                        </div>
                      </div>
                    )}
                  </section>
                </>
              ) : (
                <>
                  <div className="kd-welcome">
                    <div>
                      <span className="kd-eyebrow">OWNER DASHBOARD</span>
                      <h1>Hello, {user?.name || 'Owner'}!</h1>
                      <p>Manage your study library listings, check approval status, and update seating capacity.</p>
                    </div>
                    <button
                      type="button"
                      className="kd-primary-button"
                      onClick={() => {
                        resetForm()
                        setSection('Add Library')
                      }}
                    >
                      <PlusCircle size={16} />
                      Submit Library
                    </button>
                  </div>

                  {/* 4 Summary Stat Cards */}
                  <div className="kd-stats-grid">
                    <div className="kd-stat-card">
                      <span>Total Libraries Owned</span>
                      <h3>{counts.total}</h3>
                      <p>Listed on Kitaab</p>
                    </div>

                    <div className="kd-stat-card" style={{ borderLeft: '4px solid #89652c' }}>
                      <span>Pending Approval</span>
                      <h3 style={{ color: '#89652c' }}>{counts.pending}</h3>
                      <p>Awaiting admin review</p>
                    </div>

                    <div className="kd-stat-card" style={{ borderLeft: '4px solid #277343' }}>
                      <span>Approved & Live</span>
                      <h3 style={{ color: '#277343' }}>{counts.approved}</h3>
                      <p>Visible to students</p>
                    </div>

                    <div className="kd-stat-card" style={{ borderLeft: '4px solid #b34c3e' }}>
                      <span>Rejected</span>
                      <h3 style={{ color: '#b34c3e' }}>{counts.rejected}</h3>
                      <p>Needs attention or update</p>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <section className="kd-panel">
                    <div className="kd-panel-heading">
                      <div>
                        <h2>Quick Actions</h2>
                        <p>Manage your listings and discover how students see your library</p>
                      </div>
                    </div>

                    <div className="kd-quick-actions">
                      <div
                        className="kd-quick-action-card"
                        onClick={() => {
                          resetForm()
                          setSection('Add Library')
                        }}
                      >
                        <div className="kd-quick-action-icon">
                          <PlusCircle size={22} />
                        </div>
                        <div>
                          <h4>Submit New Library</h4>
                          <p>Fill out onboarding details to list another branch</p>
                        </div>
                      </div>

                      <div
                        className="kd-quick-action-card"
                        onClick={() => setSection('My Libraries')}
                      >
                        <div className="kd-quick-action-icon">
                          <BookOpen size={22} />
                        </div>
                        <div>
                          <h4>View My Libraries</h4>
                          <p>Review and edit status, seats, or facilities</p>
                        </div>
                      </div>

                      <a
                        href="/locations"
                        target="_blank"
                        rel="noreferrer"
                        className="kd-quick-action-card"
                        style={{ textDecoration: 'none' }}
                      >
                        <div className="kd-quick-action-icon">
                          <ExternalLink size={22} />
                        </div>
                        <div>
                          <h4>Customer Discover View</h4>
                          <p>Verify how approved study spaces look to users</p>
                        </div>
                      </a>
                    </div>
                  </section>

                  {/* Recent Libraries List in Overview */}
                  <section className="kd-panel">
                    <div className="kd-panel-heading">
                      <div>
                        <h2>Recent Study Spaces</h2>
                        <p>Your recently registered spaces</p>
                      </div>
                      {libraries.length > 0 && (
                        <button
                          type="button"
                          className="kd-secondary-button"
                          onClick={() => setSection('My Libraries')}
                        >
                          View All ({libraries.length})
                        </button>
                      )}
                    </div>

                    {librariesLoading ? (
                      <div className="kd-empty">
                        <Clock size={32} />
                        <h3>Loading your libraries...</h3>
                      </div>
                    ) : libraries.length === 0 ? (
                      <div className="kd-empty">
                        <BookOpen size={36} />
                        <h3>No libraries registered yet</h3>
                        <p>Get started by listing your study space to connect with students and job aspirants.</p>
                        <button
                          type="button"
                          className="kd-primary-button"
                          onClick={() => {
                            resetForm()
                            setSection('Add Library')
                          }}
                        >
                          <PlusCircle size={15} />
                          Add Your First Library
                        </button>
                      </div>
                    ) : (
                      <div className="kd-library-grid">
                        {libraries.slice(0, 3).map((library) => (
                          <div className="kd-owner-library-card" key={library.id}>
                            <div className="kd-card-header-image">
                              <img
                                src={library.photos?.[0] || '/images/sonipat-study-space.webp'}
                                alt={library.name}
                              />
                              <div className="kd-card-status-badge">
                                <span className={`kd-status ${library.status}`}>
                                  {library.status === 'pending'
                                    ? 'Pending Review'
                                    : library.status}
                                </span>
                              </div>
                            </div>

                            <div className="kd-card-body">
                              <h3>{library.name}</h3>
                              <div className="kd-card-location">
                                <MapPin size={13} />
                                <span>
                                  {[library.locality, library.city].filter(Boolean).join(', ')}
                                </span>
                              </div>

                              <div className="kd-specs-row">
                                <span>
                                  <strong>{library.available_seats}</strong> available
                                </span>
                                <span>
                                  <strong>{library.total_seats}</strong> total seats
                                </span>
                              </div>

                              <div className="kd-card-actions">
                                <button
                                  type="button"
                                  className="kd-secondary-button"
                                  onClick={() => setSelectedLibrary(library)}
                                >
                                  <Eye size={14} /> View
                                </button>
                                <button
                                  type="button"
                                  className="kd-secondary-button"
                                  onClick={() => handleStartEdit(library)}
                                >
                                  <Edit size={14} /> Edit
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                </>
              )
            )}

            {/* SECTION 2: MY LIBRARIES */}
            {section === 'My Libraries' && (
              isAdmin ? (
                <section className="kd-panel">
                  <div className="kd-empty">
                    <ShieldCheck size={36} color="#89652c" />
                    <h3>Administrator Access</h3>
                    <p>My Libraries is reserved for Library Owners managing their personal study spaces.</p>
                    <button
                      type="button"
                      className="kd-primary-button"
                      onClick={() => setSection('Admin Approvals')}
                    >
                      Go to Admin Approvals
                    </button>
                  </div>
                </section>
              ) : (
                <>
                <div className="kd-welcome">
                  <div>
                    <span className="kd-eyebrow">PORTFOLIO</span>
                    <h1>My Libraries</h1>
                    <p>Track approval status, update seating, and manage your spaces.</p>
                  </div>
                  <button
                    type="button"
                    className="kd-primary-button"
                    onClick={() => {
                      resetForm()
                      setSection('Add Library')
                    }}
                  >
                    <PlusCircle size={15} />
                    Add Library
                  </button>
                </div>

                {/* Filter and Search Bar */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 16,
                    marginBottom: 20
                  }}
                >
                  <div className="kd-filter-tabs" style={{ margin: 0, padding: 0, border: 0 }}>
                    <button
                      type="button"
                      className={`kd-tab ${libraryFilter === 'all' ? 'active' : ''}`}
                      onClick={() => setLibraryFilter('all')}
                    >
                      All ({counts.total})
                    </button>
                    <button
                      type="button"
                      className={`kd-tab ${libraryFilter === 'pending' ? 'active' : ''}`}
                      onClick={() => setLibraryFilter('pending')}
                    >
                      Pending ({counts.pending})
                    </button>
                    <button
                      type="button"
                      className={`kd-tab ${libraryFilter === 'approved' ? 'active' : ''}`}
                      onClick={() => setLibraryFilter('approved')}
                    >
                      Approved ({counts.approved})
                    </button>
                    <button
                      type="button"
                      className={`kd-tab ${libraryFilter === 'rejected' ? 'active' : ''}`}
                      onClick={() => setLibraryFilter('rejected')}
                    >
                      Rejected ({counts.rejected})
                    </button>
                  </div>

                  <div style={{ position: 'relative', width: 280 }}>
                    <Search
                      size={16}
                      style={{ position: 'absolute', left: 12, top: 12, color: '#7d8981' }}
                    />
                    <input
                      type="text"
                      placeholder="Search my libraries..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px 9px 36px',
                        border: '1px solid #e8ece7',
                        borderRadius: 8,
                        fontSize: 13,
                        outline: 'none',
                        background: 'white'
                      }}
                    />
                  </div>
                </div>

                {librariesLoading ? (
                  <div className="kd-panel">
                    <div className="kd-empty">
                      <Clock size={36} />
                      <h3>Loading your libraries...</h3>
                    </div>
                  </div>
                ) : librariesError ? (
                  <div className="kd-panel">
                    <div className="kd-empty">
                      <AlertCircle size={36} color="#b34c3e" />
                      <h3>Unable to load libraries</h3>
                      <p>{librariesError}</p>
                      <button type="button" className="kd-secondary-button" onClick={fetchOwnerData}>
                        Retry
                      </button>
                    </div>
                  </div>
                ) : filteredLibraries.length === 0 ? (
                  <div className="kd-panel">
                    <div className="kd-empty">
                      <BookOpen size={40} />
                      <h3>
                        {searchQuery || libraryFilter !== 'all'
                          ? 'No libraries match your filter'
                          : 'No libraries listed yet'}
                      </h3>
                      <p>
                        {searchQuery || libraryFilter !== 'all'
                          ? 'Try clearing the search query or changing your status tab.'
                          : 'Submit your library details to start onboarding onto Kitaab.'}
                      </p>
                      {searchQuery || libraryFilter !== 'all' ? (
                        <button
                          type="button"
                          className="kd-secondary-button"
                          onClick={() => {
                            setLibraryFilter('all')
                            setSearchQuery('')
                          }}
                        >
                          Show All Libraries
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="kd-primary-button"
                          onClick={() => {
                            resetForm()
                            setSection('Add Library')
                          }}
                        >
                          <PlusCircle size={15} /> Add New Library
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="kd-library-grid">
                    {filteredLibraries.map((library) => {
                      const image = library.photos?.[0] || '/images/sonipat-study-space.webp'

                      return (
                        <article className="kd-owner-library-card" key={library.id}>
                          <div className="kd-card-header-image">
                            <img src={image} alt={library.name} />
                            <div className="kd-card-status-badge">
                              <span className={`kd-status ${library.status}`}>
                                {library.status === 'pending'
                                  ? 'Pending Approval'
                                  : library.status}
                              </span>
                            </div>
                          </div>

                          <div className="kd-card-body">
                            <h3>{library.name}</h3>

                            <div className="kd-card-location">
                              <MapPin size={14} />
                              <span>
                                {[library.locality, library.city].filter(Boolean).join(', ')}
                              </span>
                            </div>

                            {library.description && (
                              <p className="kd-card-desc">{library.description}</p>
                            )}

                            <div className="kd-specs-row">
                              <span>
                                <strong>{library.available_seats}</strong> available
                              </span>
                              <span>
                                <strong>{library.total_seats}</strong> total seats
                              </span>
                            </div>

                            {/* Facilities chips preview */}
                            {library.facilities && library.facilities.length > 0 && (
                              <div className="kd-facilities-chips">
                                {library.facilities.slice(0, 4).map((f) => (
                                  <span key={f} className="kd-chip">
                                    {f}
                                  </span>
                                ))}
                                {library.facilities.length > 4 && (
                                  <span className="kd-chip">
                                    +{library.facilities.length - 4} more
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Rejection Alert Notice */}
                            {library.status === 'rejected' && (
                              <div className="kd-card-rejection-note">
                                <strong>Needs attention:</strong> This library was rejected during admin review. Click Edit to adjust information and submit for re-evaluation.
                              </div>
                            )}

                            {/* Pending Alert Notice */}
                            {library.status === 'pending' && (
                              <div
                                style={{
                                  padding: '8px 12px',
                                  background: '#fff7e9',
                                  borderRadius: 8,
                                  color: '#89652c',
                                  fontSize: 11,
                                  marginBottom: 14
                                }}
                              >
                                Awaiting admin review. Once approved, it appears instantly on the Customer Discover page.
                              </div>
                            )}

                            <div className="kd-card-actions">
                              <button
                                type="button"
                                className="kd-secondary-button"
                                onClick={() => setSelectedLibrary(library)}
                              >
                                <Eye size={14} /> Details
                              </button>

                              <button
                                type="button"
                                className="kd-secondary-button"
                                onClick={() => handleStartEdit(library)}
                              >
                                <Edit size={14} /> Edit
                              </button>

                              <button
                                type="button"
                                className="kd-danger-button"
                                style={{ marginLeft: 'auto' }}
                                onClick={() => handleDeleteLibrary(library.id, library.name)}
                                title="Delete library"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </article>
                      )
                    })}
                  </div>
                )}
              </>
            )
          )}

            {/* SECTION 3: ADD / EDIT LIBRARY */}
            {section === 'Add Library' && (
              isAdmin ? (
                <section className="kd-panel">
                  <div className="kd-empty">
                    <ShieldCheck size={36} color="#89652c" />
                    <h3>Administrator Access</h3>
                    <p>Library submission is for verified library owners.</p>
                    <button
                      type="button"
                      className="kd-primary-button"
                      onClick={() => setSection('Admin Approvals')}
                    >
                      Go to Admin Approvals
                    </button>
                  </div>
                </section>
              ) : (
                <section className="kd-panel" style={{ maxWidth: 900, margin: '0 auto' }}>
                  <div className="kd-panel-heading">
                    <div>
                      <h2>{editingLibrary ? `Edit "${editingLibrary.name}"` : 'Submit a New Library'}</h2>
                      <p>
                        {editingLibrary
                          ? 'Update your study library details, available capacity, and amenities.'
                          : 'Fill out your library information. Once submitted, our team will review it before listing it live.'}
                      </p>
                    </div>
                    {editingLibrary && (
                      <button
                        type="button"
                        className="kd-secondary-button"
                        onClick={() => {
                          resetForm()
                          setSection('My Libraries')
                        }}
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>

                  {formError && (
                    <div className="kd-banner error" style={{ marginBottom: 20 }}>
                      <AlertCircle size={16} />
                      <span>{formError}</span>
                    </div>
                  )}

                  <form onSubmit={handleFormSubmit} className="kd-form-grid">
                    <div className="kd-field kd-form-col-full">
                      <label>
                        Library Name <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Apex Reading Room & Study Center"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>

                    <div className="kd-field kd-form-col-full">
                      <label>Description</label>
                      <textarea
                        rows={3}
                        placeholder="Describe your quiet study environment, special amenities, student community, etc."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                      <small>Optional. Max 2000 characters.</small>
                    </div>

                    <div className="kd-field">
                      <label>
                        City <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Sonipat"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      />
                    </div>

                    <div className="kd-field">
                      <label>Locality / Area</label>
                      <input
                        type="text"
                        placeholder="e.g. Sector 14, Near Subhash Chowk"
                        value={formData.locality}
                        onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                      />
                    </div>

                    <div className="kd-field kd-form-col-full">
                      <label>
                        Full Address <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Shop/Floor number, Building, Street, Landmark"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      />
                    </div>

                    <div className="kd-field">
                      <label>Contact Phone Number</label>
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>

                    <div className="kd-field">
                      <label>Opening Hours</label>
                      <input
                        type="text"
                        placeholder="e.g. Monday - Sunday: 7:00 AM - 11:00 PM"
                        value={formData.opening_hours}
                        onChange={(e) => setFormData({ ...formData, opening_hours: e.target.value })}
                      />
                    </div>

                    <div className="kd-field">
                      <label>
                        Total Seats <span className="required">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={formData.total_seats}
                        onChange={(e) => {
                          const total = Math.max(0, parseInt(e.target.value, 10) || 0)
                          setFormData({
                            ...formData,
                            total_seats: total,
                            available_seats: Math.min(formData.available_seats, total)
                          })
                        }}
                      />
                      <small>Total physical seating capacity</small>
                    </div>

                    <div className="kd-field">
                      <label>
                        Available Seats Currently <span className="required">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min={0}
                        max={formData.total_seats}
                        value={formData.available_seats}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            available_seats: Math.max(0, parseInt(e.target.value, 10) || 0)
                          })
                        }
                      />
                      <small>Seats ready for immediate booking</small>
                    </div>

                    {/* Facilities Selection */}
                    <div className="kd-field kd-form-col-full">
                      <label>Available Facilities & Amenities</label>
                      <div className="kd-facilities-selector">
                        {AVAILABLE_FACILITIES.map((facility) => {
                          const isSelected = formData.facilities.includes(facility)
                          return (
                            <button
                              type="button"
                              key={facility}
                              className={`kd-facility-toggle ${isSelected ? 'selected' : ''}`}
                              onClick={() => handleToggleFacility(facility)}
                            >
                              {isSelected ? '✓ ' : '+ '}
                              {facility}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Photo Presets & Custom URL */}
                    <div className="kd-field kd-form-col-full">
                      <label>Library Cover Photos</label>
                      <p style={{ margin: '0 0 10px', fontSize: 12, color: '#7d8981' }}>
                        Choose from preset library photos or paste your own image URL:
                      </p>

                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
                        {SAMPLE_PHOTO_PRESETS.map((preset) => {
                          const isSelected = formData.photos.includes(preset.url)
                          return (
                            <div
                              key={preset.url}
                              onClick={() => handleSelectPresetPhoto(preset.url)}
                              style={{
                                cursor: 'pointer',
                                border: isSelected ? '2px solid #315c45' : '1px solid #e8ece7',
                                borderRadius: 8,
                                overflow: 'hidden',
                                width: 130,
                                background: 'white',
                                boxShadow: isSelected ? '0 2px 8px rgba(49, 92, 69, 0.2)' : 'none'
                              }}
                            >
                              <img
                                src={preset.url}
                                alt={preset.label}
                                style={{ width: '100%', height: 70, objectFit: 'cover' }}
                              />
                              <div
                                style={{
                                  padding: '4px 6px',
                                  fontSize: 11,
                                  textAlign: 'center',
                                  fontWeight: isSelected ? 700 : 500,
                                  color: isSelected ? '#1e5c35' : '#55635a'
                                }}
                              >
                                {isSelected ? '✓ ' : ''}
                                {preset.label}
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      <div style={{ display: 'flex', gap: 8 }}>
                        <input
                          type="url"
                          placeholder="https://images.unsplash.com/... or paste image link"
                          value={customPhotoUrl}
                          onChange={(e) => setCustomPhotoUrl(e.target.value)}
                        />
                        <button
                          type="button"
                          className="kd-secondary-button"
                          onClick={handleAddCustomPhoto}
                        >
                          Add URL
                        </button>
                      </div>
                    </div>

                    <div className="kd-form-actions">
                      <button
                        type="submit"
                        className="kd-primary-button"
                        disabled={formSubmitting}
                      >
                        {formSubmitting
                          ? 'Saving...'
                          : editingLibrary
                          ? 'Save Changes'
                          : 'Submit for Admin Approval'}
                      </button>

                      <button
                        type="button"
                        className="kd-secondary-button"
                        onClick={() => {
                          resetForm()
                          setSection('My Libraries')
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </section>
              )
            )}

            {/* SECTION 4: ADMIN APPROVALS (FOR MVP DEMO) */}
            {section === 'Admin Approvals' && isAdmin && (
              <section className="kd-panel">
                <div className="kd-panel-heading">
                  <div>
                    <span className="kd-eyebrow" style={{ color: '#89652c' }}>
                      ADMIN VERIFICATION DESK
                    </span>
                    <h2>Platform Approvals</h2>
                    <p>
                      Review incoming owner partner applications and verify library space listings before publication.
                    </p>
                  </div>
                  <button type="button" className="kd-secondary-button" onClick={fetchAdminData}>
                    Refresh Lists
                  </button>
                </div>

                {/* Sub-tabs: Owner Applications vs Library Listings */}
                <div
                  className="kd-filter-tabs"
                  style={{
                    display: 'flex',
                    gap: 8,
                    borderBottom: '1px solid var(--kd-border)',
                    paddingBottom: 12,
                    marginBottom: 20
                  }}
                >
                  <button
                    type="button"
                    className={`kd-tab ${adminApprovalTab === 'applications' ? 'active' : ''}`}
                    onClick={() => setAdminApprovalTab('applications')}
                  >
                    <Users size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                    Owner Applications ({pendingOwnerApps.length})
                  </button>
                  <button
                    type="button"
                    className={`kd-tab ${adminApprovalTab === 'libraries' ? 'active' : ''}`}
                    onClick={() => setAdminApprovalTab('libraries')}
                  >
                    <BookOpen size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                    Library Listings ({adminPending.length})
                  </button>
                </div>

                {/* SUBTAB 1: OWNER APPLICATIONS */}
                {adminApprovalTab === 'applications' && (
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 16
                      }}
                    >
                      <div className="kd-filter-tabs" style={{ margin: 0, padding: 0, border: 0 }}>
                        <button
                          type="button"
                          className={`kd-tab ${adminAppFilter === 'pending' ? 'active' : ''}`}
                          onClick={() => setAdminAppFilter('pending')}
                        >
                          Pending Review ({pendingOwnerApps.length})
                        </button>
                        <button
                          type="button"
                          className={`kd-tab ${adminAppFilter === 'all' ? 'active' : ''}`}
                          onClick={() => setAdminAppFilter('all')}
                        >
                          All Applications ({adminApplications.length})
                        </button>
                      </div>
                    </div>

                    {adminLoading ? (
                      <div className="kd-empty">
                        <Clock size={32} />
                        <h3>Loading applications...</h3>
                      </div>
                    ) : (adminAppFilter === 'pending' ? pendingOwnerApps : adminApplications).length === 0 ? (
                      <div className="kd-empty">
                        <CheckCircle size={36} color="#277343" />
                        <h3>
                          {adminAppFilter === 'pending'
                            ? 'No pending owner applications'
                            : 'No owner applications registered'}
                        </h3>
                        <p>
                          {adminAppFilter === 'pending'
                            ? 'All applicant requests have been reviewed and processed.'
                            : 'When users submit an application via the Apply as Owner form, it will show up here.'}
                        </p>
                      </div>
                    ) : (
                      <div className="kd-library-grid">
                        {(adminAppFilter === 'pending' ? pendingOwnerApps : adminApplications).map((app) => (
                          <div className="kd-owner-library-card" key={app.id}>
                            <div
                              style={{
                                padding: '14px 18px',
                                background: '#f7f8f5',
                                borderBottom: '1px solid #e8ece7',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}
                            >
                              <div>
                                <span style={{ fontSize: 11, fontWeight: 700, color: '#7d8981', textTransform: 'uppercase' }}>
                                  Application #{app.id}
                                </span>
                                <h3 style={{ margin: '2px 0 0', fontSize: 16 }}>{app.name}</h3>
                              </div>
                              <span className={`kd-status ${app.status}`}>
                                {app.status === 'pending' ? 'Pending Review' : app.status}
                              </span>
                            </div>

                            <div className="kd-card-body">
                              <div style={{ marginBottom: 12 }}>
                                <div style={{ fontSize: 13, marginBottom: 4 }}>
                                  <strong>Proposed Library:</strong> {app.library_name}
                                </div>
                                <div style={{ fontSize: 12, color: '#55635a', display: 'flex', alignItems: 'flex-start', gap: 4 }}>
                                  <MapPin size={13} style={{ flexShrink: 0, marginTop: 2 }} />
                                  <span>{app.library_address}</span>
                                </div>
                              </div>

                              <div
                                style={{
                                  padding: '8px 10px',
                                  background: '#f7f8f5',
                                  borderRadius: 6,
                                  fontSize: 12,
                                  marginBottom: 14
                                }}
                              >
                                <div><strong>Email:</strong> {app.email}</div>
                                <div><strong>Phone:</strong> {app.phone || 'N/A'}</div>
                                {app.created_at && (
                                  <div style={{ color: '#7d8981', marginTop: 4 }}>
                                    Applied: {new Date(app.created_at).toLocaleDateString()}
                                  </div>
                                )}
                              </div>

                              <div className="kd-card-actions" style={{ gap: 10, marginTop: 'auto' }}>
                                {app.status === 'pending' ? (
                                  <>
                                    <button
                                      type="button"
                                      className="kd-primary-button"
                                      style={{ flex: 1 }}
                                      disabled={adminAppActionId === app.id}
                                      onClick={() => handleAdminApproveApplication(app.id)}
                                    >
                                      <CheckCircle size={15} />
                                      {adminAppActionId === app.id ? 'Approving...' : 'Approve Application'}
                                    </button>

                                    <button
                                      type="button"
                                      className="kd-danger-button"
                                      disabled={adminAppActionId === app.id}
                                      onClick={() => handleAdminRejectApplication(app.id)}
                                    >
                                      <XCircle size={15} /> Reject
                                    </button>
                                  </>
                                ) : app.status === 'approved' ? (
                                  <div style={{ fontSize: 12, color: '#277343', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <CheckCircle size={15} /> Approved & Owner Account Created
                                  </div>
                                ) : (
                                  <div style={{ fontSize: 12, color: '#b34c3e', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <XCircle size={15} /> Application Rejected
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* SUBTAB 2: LIBRARY LISTINGS */}
                {adminApprovalTab === 'libraries' && (
                  <div>
                    {adminLoading ? (
                      <div className="kd-empty">
                        <Clock size={32} />
                        <h3>Loading pending libraries...</h3>
                      </div>
                    ) : adminPending.length === 0 ? (
                      <div className="kd-empty">
                        <CheckCircle size={36} color="#277343" />
                        <h3>No pending library approvals</h3>
                        <p>All submitted study spaces have been reviewed and processed.</p>
                      </div>
                    ) : (
                      <div className="kd-library-grid">
                        {adminPending.map((lib) => (
                          <div className="kd-owner-library-card" key={lib.id}>
                            <div className="kd-card-header-image">
                              <img
                                src={lib.photos?.[0] || '/images/sonipat-study-space.webp'}
                                alt={lib.name}
                              />
                              <div className="kd-card-status-badge">
                                <span className="kd-status pending">Pending Review</span>
                              </div>
                            </div>

                            <div className="kd-card-body">
                              <h3>{lib.name}</h3>
                              <div className="kd-card-location">
                                <MapPin size={13} />
                                <span>{[lib.locality, lib.city].filter(Boolean).join(', ')}</span>
                              </div>

                              <div
                                style={{
                                  padding: '8px 10px',
                                  background: '#f7f8f5',
                                  borderRadius: 6,
                                  fontSize: 12,
                                  marginBottom: 12
                                }}
                              >
                                <div>
                                  <strong>Owner:</strong> {lib.owner_name} ({lib.owner_email})
                                </div>
                                <div>
                                  <strong>Address:</strong> {lib.address}
                                </div>
                                <div>
                                  <strong>Phone:</strong> {lib.phone || 'N/A'}
                                </div>
                              </div>

                              <div className="kd-specs-row">
                                <span>
                                  <strong>{lib.total_seats}</strong> seats
                                </span>
                                <span>
                                  <strong>Facilities:</strong> {(lib.facilities || []).join(', ') || 'None listed'}
                                </span>
                              </div>

                              <div className="kd-card-actions" style={{ gap: 10, marginTop: 'auto' }}>
                                <button
                                  type="button"
                                  className="kd-primary-button"
                                  style={{ flex: 1 }}
                                  disabled={adminActionId === lib.id}
                                  onClick={() => handleAdminApprove(lib.id)}
                                >
                                  <CheckCircle size={15} />
                                  {adminActionId === lib.id ? 'Approving...' : 'Approve Library'}
                                </button>

                                <button
                                  type="button"
                                  className="kd-danger-button"
                                  disabled={adminActionId === lib.id}
                                  onClick={() => handleAdminReject(lib.id)}
                                >
                                  <XCircle size={15} /> Reject
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </section>
            )}

            {/* SECTION 5: PROFILE */}
            {section === 'Profile' && (
              <section className="kd-panel" style={{ maxWidth: 700, margin: '0 auto' }}>
                <div className="kd-panel-heading">
                  <div>
                    <h2>{isAdmin ? 'Admin Account Details' : 'Owner Account Details'}</h2>
                    <p>Information registered with your Kitaab provider account</p>
                  </div>
                </div>

                <div className="kd-profile-card">
                  <div className="kd-profile-item">
                    <span>Full Name</span>
                    <strong>{user?.name || (isAdmin ? 'Administrator' : 'Library Owner')}</strong>
                  </div>
                  <div className="kd-profile-item">
                    <span>Email Address</span>
                    <strong>{user?.email || (isAdmin ? 'admin@example.com' : 'owner@example.com')}</strong>
                  </div>
                  <div className="kd-profile-item">
                    <span>Account Role</span>
                    <strong style={{ textTransform: 'capitalize' }}>
                      {isAdmin ? 'Administrator' : 'Owner'}
                    </strong>
                  </div>
                  <div className="kd-profile-item">
                    <span>{isAdmin ? 'System Scope' : 'Total Libraries Managed'}</span>
                    <strong>
                      {isAdmin
                        ? `${dashboardStats?.libraries?.total || 0} libraries · ${dashboardStats?.users?.total || 0} users`
                        : `${libraries.length} space(s)`}
                    </strong>
                  </div>
                </div>

                <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
                  <a
                    href="/locations"
                    target="_blank"
                    rel="noreferrer"
                    className="kd-primary-button"
                  >
                    <ExternalLink size={16} /> Open Customer Discover
                  </a>

                  <button type="button" className="kd-danger-button" onClick={handleSignOut}>
                    <LogOut size={16} /> Sign Out of Portal
                  </button>
                </div>
              </section>
            )}
          </div>

          <footer className="kd-footer">
            Kitaab Library Management Platform · Owner Operations Dashboard
          </footer>
        </main>
      </div>

      {/* DETAIL MODAL */}
      {selectedLibrary && (
        <div className="kd-modal-backdrop" onClick={() => setSelectedLibrary(null)}>
          <div className="kd-modal" onClick={(e) => e.stopPropagation()}>
            <div className="kd-modal-header">
              <div>
                <h2>{selectedLibrary.name}</h2>
                <div style={{ marginTop: 4 }}>
                  <span className={`kd-status ${selectedLibrary.status}`}>
                    {selectedLibrary.status === 'pending'
                      ? 'Pending Approval'
                      : selectedLibrary.status}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="kd-icon-button"
                onClick={() => setSelectedLibrary(null)}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="kd-modal-content">
              <img
                src={selectedLibrary.photos?.[0] || '/images/sonipat-study-space.webp'}
                alt={selectedLibrary.name}
                className="kd-modal-image"
              />

              {selectedLibrary.description && (
                <p style={{ color: '#55635a', fontSize: 14, lineHeight: 1.6, margin: '0 0 18px' }}>
                  {selectedLibrary.description}
                </p>
              )}

              <div className="kd-details-grid">
                <div className="kd-detail-item">
                  <span>Location</span>
                  <strong>
                    {[selectedLibrary.locality, selectedLibrary.city].filter(Boolean).join(', ')}
                  </strong>
                </div>

                <div className="kd-detail-item">
                  <span>Full Address</span>
                  <strong>{selectedLibrary.address}</strong>
                </div>

                <div className="kd-detail-item">
                  <span>Total Seating Capacity</span>
                  <strong>{selectedLibrary.total_seats} seats</strong>
                </div>

                <div className="kd-detail-item">
                  <span>Available Seats</span>
                  <strong>{selectedLibrary.available_seats} seats available</strong>
                </div>

                <div className="kd-detail-item">
                  <span>Contact Phone</span>
                  <strong>{selectedLibrary.phone || 'Not provided'}</strong>
                </div>

                <div className="kd-detail-item">
                  <span>Opening Hours</span>
                  <strong>
                    {typeof selectedLibrary.opening_hours === 'string'
                      ? selectedLibrary.opening_hours
                      : selectedLibrary.opening_hours?.general || 'Mon - Sun: 8:00 AM - 10:00 PM'}
                  </strong>
                </div>
              </div>

              <div style={{ marginTop: 18 }}>
                <span
                  style={{
                    display: 'block',
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#7d8981',
                    marginBottom: 8
                  }}
                >
                  FACILITIES & AMENITIES
                </span>
                <div className="kd-facilities-chips">
                  {(selectedLibrary.facilities || []).map((f) => (
                    <span key={f} className="kd-chip" style={{ fontSize: 12, padding: '4px 10px' }}>
                      ✓ {f}
                    </span>
                  ))}
                  {(!selectedLibrary.facilities || selectedLibrary.facilities.length === 0) && (
                    <span style={{ fontSize: 13, color: '#7d8981' }}>None listed</span>
                  )}
                </div>
              </div>
            </div>

            <div className="kd-modal-footer">
              <button
                type="button"
                className="kd-secondary-button"
                onClick={() => {
                  const lib = selectedLibrary
                  setSelectedLibrary(null)
                  handleStartEdit(lib)
                }}
              >
                <Edit size={14} /> Edit This Library
              </button>
              <button
                type="button"
                className="kd-primary-button"
                onClick={() => setSelectedLibrary(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
