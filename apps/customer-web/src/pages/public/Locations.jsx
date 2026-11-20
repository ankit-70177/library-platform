import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, Bookmark, MapPin, Search } from 'lucide-react'
import {
  getApprovedLibraries,
  getMySavedLibraries,
  saveMyLibrary,
  removeMySavedLibrary
} from '../../services/api.js'
import './Home.css'

function Locations() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [query, setQuery] = useState(searchParams.get('search') || '')
  const [libraries, setLibraries] = useState([])
  const [savedLibraries, setSavedLibraries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savedError, setSavedError] = useState('')
  const [actionLoading, setActionLoading] = useState(null)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadLibraries = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await getApprovedLibraries()

        if (isMounted) {
          setLibraries(response.libraries || [])
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Unable to load libraries.')
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadLibraries()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    const token = localStorage.getItem('kitaab-auth-token')

    if (!token) return

    const loadSavedLibraries = async () => {
      try {
        const response = await getMySavedLibraries()

        if (isMounted) {
          setSavedLibraries(response.libraries || [])
        }
      } catch (err) {
        if (isMounted) {
          setSavedError(err.message || 'Unable to load saved libraries.')
        }
      }
    }

    loadSavedLibraries()

    return () => {
      isMounted = false
    }
  }, [])

  const results = useMemo(() => {
    const value = query.trim().toLowerCase()

    if (!value) return libraries

    return libraries.filter((library) => {
      const searchableText = [
        library.name,
        library.address,
        library.city,
        library.locality,
        ...(library.facilities || [])
      ].filter(Boolean).join(' ').toLowerCase()

      return searchableText.includes(value)
    })
  }, [query, libraries])

  const toggleSavedLibrary = async (library) => {
    const token = localStorage.getItem('kitaab-auth-token')

    if (!token) {
      navigate('/login')
      return
    }

    const user = JSON.parse(localStorage.getItem('kitaab-demo-user') || 'null')

    if (user?.role !== 'customer') {
      setNotice('Please log in with a customer account to save libraries.')
      return
    }

    const isSaved = savedLibraries.some(
      (item) => Number(item.id) === Number(library.id)
    )

    try {
      setActionLoading(library.id)
      setNotice('')
      setSavedError('')

      if (isSaved) {
        const response = await removeMySavedLibrary(library.id)

        setSavedLibraries((current) =>
          current.filter((item) => Number(item.id) !== Number(library.id))
        )

        setNotice(response.message || 'Library removed from saved list.')
      } else {
        const response = await saveMyLibrary(library.id)

        setSavedLibraries((current) => [...current, library])
        setNotice(response.message || 'Library saved successfully.')
      }
    } catch (err) {
      setNotice(err.message || 'Unable to update saved library.')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <main className="directory-page">
      <section className="directory-hero grain-surface">
        <h1>Find your<br /><em>study space.</em></h1>
        <p>Search neighbourhoods and compare approved local study libraries by facilities and available seats.</p>

        <label className="directory-search">
          <Search size={22} aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try Sector 14, Sonipat, or Wi-Fi"
            aria-label="Search libraries by neighbourhood or facility"
          />
        </label>
      </section>

      <section className="directory-results content-width">
        <div className="section-title-row">
          <div>
            <h2>{loading ? 'Loading libraries...' : `${results.length} spaces to explore`}</h2>
          </div>
        </div>

        {notice && <p role="status">{notice}</p>}
        {savedError && <p role="alert">{savedError}</p>}

        {loading ? (
          <div className="directory-empty">
            <p>Loading approved libraries...</p>
          </div>
        ) : error ? (
          <div className="directory-empty">
            <h3>Unable to load libraries</h3>
            <p>{error}</p>
            <button type="button" onClick={() => window.location.reload()}>
              Try again
            </button>
          </div>
        ) : (
          <>
            <div className="directory-grid">
              {results.map((library) => {
                const isSaved = savedLibraries.some(
                  (item) => Number(item.id) === Number(library.id)
                )

                const image = library.photos?.[0] || '/images/sonipat-study-space.webp'

                return (
                  <article className="directory-card" key={library.id}>
                    <img src={image} alt={`${library.name} study space`} />

                    <div className="directory-card-copy">
                      <p className="library-meta">
                        <MapPin size={14} aria-hidden="true" />
                        {[library.locality, library.city].filter(Boolean).join(', ')}
                      </p>

                      <h3>{library.name}</h3>
                      <p className="directory-hours">{library.address}</p>

                      <div className="directory-tags">
                        {(library.facilities || []).map((facility) => (
                          <span key={facility}>{facility}</span>
                        ))}
                      </div>

                      <div className="directory-card-bottom">
                        <span>
                          <strong>{library.available_seats}</strong>
                          <small> available seats</small>
                        </span>
                        <span>{library.total_seats} total seats</span>
                      </div>

                      <button
                        type="button"
                        className="directory-cta"
                        onClick={() => toggleSavedLibrary(library)}
                        disabled={actionLoading === library.id}
                      >
                        <Bookmark size={16} aria-hidden="true" />
                        {actionLoading === library.id
                          ? 'Please wait...'
                          : isSaved
                            ? 'Saved · Remove'
                            : 'Save Library'}
                      </button>

                      <Link
                        className="directory-cta"
                        to={`/register?library=${library.id}`}
                      >
                        Choose this space
                        <ArrowRight size={17} aria-hidden="true" />
                      </Link>
                    </div>
                  </article>
                )
              })}
            </div>

            {results.length === 0 && (
              <div className="directory-empty">
                <h3>No spaces match that search yet.</h3>
                <p>Try another neighbourhood, city, or facility.</p>
                <button type="button" onClick={() => setQuery('')}>
                  Show all libraries
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  )
}

export default Locations
