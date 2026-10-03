import { useState } from 'react'
import LibraryCard from '../components/LibraryCard'
import './Libraries.css'

const libraries = [
  {
    id: 1,
    name: 'Reading Room',
    area: 'Model Town, Sonipat',
    price: 800,
    totalSeats: 40,
    occupiedSeats: 27,
    facilities: ['Wi-Fi', 'AC', 'Power Backup'],
  },
  {
    id: 2,
    name: 'Gyandeep Library',
    area: 'Kundli, Sonipat',
    price: 650,
    totalSeats: 30,
    occupiedSeats: 12,
    facilities: ['Wi-Fi', 'Locker'],
  },
  {
    id: 3,
    name: 'Scholars Corner',
    area: 'Murthal Road, Sonipat',
    price: 900,
    totalSeats: 50,
    occupiedSeats: 44,
    facilities: ['AC', 'Printout', 'Cabin'],
  },
]

function Libraries() {
  const [search, setSearch] = useState('')

  const filteredLibraries = libraries.filter((library) => {
    const searchText = search.toLowerCase()

    return (
      library.name.toLowerCase().includes(searchText) ||
      library.area.toLowerCase().includes(searchText)
    )
  })

  return (
    <main className="libraries-page">
      <section className="libraries-header">
        <h1>Find your library</h1>

        <p>
          Discover libraries near you and find the right place to study.
        </p>

        <input
          className="library-search"
          type="text"
          placeholder="Search by library or area..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </section>

      <section className="library-results">
        <div className="results-heading">
          <h2>Libraries near you</h2>

          <span>{filteredLibraries.length} found</span>
        </div>

        <div className="library-grid">
          {filteredLibraries.map((library) => (
            <LibraryCard
              key={library.id}
              library={library}
            />
          ))}
        </div>

        {filteredLibraries.length === 0 && (
          <p className="no-results">
            No libraries found. Try another search.
          </p>
        )}
      </section>
    </main>
  )
}

export default Libraries