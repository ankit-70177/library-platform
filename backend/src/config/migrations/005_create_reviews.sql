CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,

    customer_id INTEGER NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,

    library_id INTEGER NOT NULL
        REFERENCES libraries(id) ON DELETE CASCADE,

    rating INTEGER NOT NULL
        CHECK (rating BETWEEN 1 AND 5),

    comment TEXT,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_customer_library_review
        UNIQUE (customer_id, library_id),

    CONSTRAINT review_comment_length
        CHECK (comment IS NULL OR char_length(comment) <= 1000)
);

CREATE INDEX IF NOT EXISTS reviews_library_idx
ON reviews(library_id);

CREATE INDEX IF NOT EXISTS reviews_customer_idx
ON reviews(customer_id);
