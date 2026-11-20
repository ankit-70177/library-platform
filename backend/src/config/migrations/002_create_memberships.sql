BEGIN;

CREATE TABLE IF NOT EXISTS membership_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    duration_days INTEGER NOT NULL CHECK (duration_days > 0),
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    library_id INTEGER NOT NULL REFERENCES libraries(id) ON DELETE CASCADE,
    plan_id INTEGER NOT NULL REFERENCES membership_plans(id) ON DELETE RESTRICT,
    start_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'expired', 'cancelled')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (end_date > start_date)
);

CREATE INDEX IF NOT EXISTS subscriptions_customer_idx
ON subscriptions(customer_id);

CREATE INDEX IF NOT EXISTS subscriptions_library_idx
ON subscriptions(library_id);

CREATE INDEX IF NOT EXISTS subscriptions_status_expiry_idx
ON subscriptions(status, end_date);

CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_one_active_per_customer_library
ON subscriptions(customer_id, library_id)
WHERE status = 'active';

INSERT INTO membership_plans (name, description, duration_days, price)
VALUES
    ('Monthly', 'Monthly library membership', 30, 500.00),
    ('Quarterly', 'Three-month library membership', 90, 1350.00),
    ('Yearly', 'Annual library membership', 365, 5000.00)
ON CONFLICT (name) DO NOTHING;

COMMIT;
