import { useState } from 'react';
import './Home.css';

const libraries = [
  {
    id: 1,
    name: 'Reading Room, Model Town',
    area: 'Model Town, Sonipat',
    price: 800,
    totalSeats: 40,
    occupiedSeats: 27,
    facilities: ['Wi-Fi', 'AC', 'Power backup'],
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
];

function Home() {
  const [area, setArea] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching libraries in:', area || 'all areas');
    // TODO: wire this to services/libraryService.js once the search API exists
  };

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-copy">
          <h1>Find a seat to read, ten minutes from home.</h1>
          <p>
            Every reading room in your colony, listed in one place — check open
            seats, compare prices, and book a subscription without walking
            door to door.
          </p>
          <form className="search-bar" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search by area — Model Town, Kundli..."
              value={area}
              onChange={(e) => setArea(e.target.value)}
            />
            <button type="submit">Search libraries</button>
          </form>
        </div>

        <div className="hero-panel">
          <span className="hero-panel-label">Right now, nearby</span>
          <div className="hero-stat">
            <strong>18</strong>
            <span>libraries onboarded in Sonipat</span>
          </div>
          <div className="hero-stat">
            <strong>63</strong>
            <span>seats open across the colony tonight</span>
          </div>
        </div>
      </section>

      <section className="libraries">
        <div className="section-heading">
          <h2>Libraries near you</h2>
          <p>Live seat counts, updated as students check in and out.</p>
        </div>

        <div className="library-grid">
          {libraries.map((lib) => {
            const openSeats = lib.totalSeats - lib.occupiedSeats;
            const occupancy = Math.round((lib.occupiedSeats / lib.totalSeats) * 100);
            return (
              <article className="library-card" key={lib.id}>
                <div className="library-card-top">
                  <h3>{lib.name}</h3>
                  <span className="price">₹{lib.price}<small>/mo</small></span>
                </div>
                <p className="area">{lib.area}</p>

                <div className="occupancy">
                  <div className="occupancy-track">
                    <div className="occupancy-fill" style={{ width: `${occupancy}%` }} />
                  </div>
                  <span>{openSeats} of {lib.totalSeats} seats open</span>
                </div>

                <div className="facilities">
                  {lib.facilities.map((f) => (
                    <span className="facility-tag" key={f}>{f}</span>
                  ))}
                </div>

                <button className="view-btn">View details</button>
              </article>
            );
          })}
        </div>
      </section>

      <section className="how-it-works">
        <div className="section-heading">
          <h2>How it works</h2>
        </div>
        <ol className="steps">
          <li>
            <span className="step-number">1</span>
            <div>
              <h4>Search your colony</h4>
              <p>Filter by area, price, or facilities like AC and power backup.</p>
            </div>
          </li>
          <li>
            <span className="step-number">2</span>
            <div>
              <h4>Check live seats</h4>
              <p>See exactly how many seats are open before you walk over.</p>
            </div>
          </li>
          <li>
            <span className="step-number">3</span>
            <div>
              <h4>Book your subscription</h4>
              <p>Reserve a seat and manage renewals from one place.</p>
            </div>
          </li>
        </ol>
      </section>

      <section className="owner-cta">
        <div>
          <h2>Run a library in your colony?</h2>
          <p>List your seats, set your price, and reach students searching nearby.</p>
        </div>
        <button className="owner-btn">Register your library</button>
      </section>
    </div>
  );
}

export default Home;