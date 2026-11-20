BEGIN;

CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,

    customer_id INTEGER NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,

    library_id INTEGER NOT NULL
        REFERENCES libraries(id) ON DELETE CASCADE,

    seats_booked INTEGER NOT NULL DEFAULT 1
        CHECK (seats_booked > 0),

    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'confirmed'
        CHECK (status IN ('confirmed', 'cancelled', 'completed')),

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CHECK (end_time > start_time)
);

CREATE INDEX IF NOT EXISTS bookings_library_time_idx
ON bookings(library_id, start_time, end_time);

CREATE INDEX IF NOT EXISTS bookings_customer_idx
ON bookings(customer_id);

CREATE INDEX IF NOT EXISTS bookings_status_idx
ON bookings(status);

COMMIT;
