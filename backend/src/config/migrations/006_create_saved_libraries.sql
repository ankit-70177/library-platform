BEGIN;

CREATE TABLE IF NOT EXISTS saved_libraries (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    library_id INTEGER NOT NULL REFERENCES libraries(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_customer_saved_library UNIQUE (customer_id, library_id)
);

CREATE INDEX IF NOT EXISTS saved_libraries_customer_idx
ON saved_libraries(customer_id);

CREATE INDEX IF NOT EXISTS saved_libraries_library_idx
ON saved_libraries(library_id);

COMMIT;
