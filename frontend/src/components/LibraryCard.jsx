import './LibraryCard.css'

function LibraryCard({ library }) {
  return (
    <article className="library-card">
      <div className="library-card-top">
        <h3>{library.name}</h3>

        <span className="price">
          ₹{library.price}
          <small>/mo</small>
        </span>
      </div>

      <p className="area">{library.area}</p>

      <div className="occupancy">
        <div className="occupancy-track">
          <div
            className="occupancy-fill"
            style={{
              width: `${(library.occupiedSeats / library.totalSeats) * 100}%`,
            }}
          />
        </div>

        <span>
          {library.totalSeats - library.occupiedSeats} of{' '}
          {library.totalSeats} seats open
        </span>
      </div>

      <div className="facilities">
        {library.facilities.map((facility) => (
          <span className="facility-tag" key={facility}>
            {facility}
          </span>
        ))}
      </div>

      <button className="view-btn">
        View details
      </button>
    </article>
  )
}

export default LibraryCard