CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'customer'
        CHECK (role IN ('customer', 'owner', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique
ON users (LOWER(email));

CREATE TABLE IF NOT EXISTS owner_applications (
    id SERIAL PRIMARY KEY,

    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,

    library_name VARCHAR(150) NOT NULL,
    library_address TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected')),

    reviewed_by INTEGER REFERENCES users(id),
    reviewed_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS owner_applications_email_unique
ON owner_applications (LOWER(email));
-- MVP: Libraries
CREATE TABLE IF NOT EXISTS libraries (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    locality VARCHAR(150),
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    phone VARCHAR(20),
    opening_hours JSONB NOT NULL DEFAULT '{}'::jsonb,
    total_seats INTEGER NOT NULL DEFAULT 0 CHECK (total_seats >= 0),
    available_seats INTEGER NOT NULL DEFAULT 0 CHECK (
        available_seats >= 0 AND available_seats <= total_seats
    ),
    facilities TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    photos TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by INTEGER REFERENCES users(id),
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS libraries_owner_idx ON libraries(owner_id);
CREATE INDEX IF NOT EXISTS libraries_status_idx ON libraries(status);
CREATE INDEX IF NOT EXISTS libraries_city_idx ON libraries(city);
