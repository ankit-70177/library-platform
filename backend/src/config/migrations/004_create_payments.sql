BEGIN;

CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    library_id INTEGER NOT NULL REFERENCES libraries(id) ON DELETE CASCADE,
    plan_id INTEGER NOT NULL REFERENCES membership_plans(id) ON DELETE RESTRICT,
    subscription_id INTEGER REFERENCES subscriptions(id) ON DELETE SET NULL,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    payment_method VARCHAR(30) NOT NULL DEFAULT 'demo'
        CHECK (payment_method IN ('demo')),
    transaction_id VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'success', 'failed')),
    failure_reason TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS payments_customer_idx
ON payments(customer_id);

CREATE INDEX IF NOT EXISTS payments_library_idx
ON payments(library_id);

CREATE INDEX IF NOT EXISTS payments_subscription_idx
ON payments(subscription_id);

CREATE INDEX IF NOT EXISTS payments_status_idx
ON payments(status);

CREATE INDEX IF NOT EXISTS payments_created_at_idx
ON payments(created_at);

COMMIT;
