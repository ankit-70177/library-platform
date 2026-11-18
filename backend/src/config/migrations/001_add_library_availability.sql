BEGIN;

ALTER TABLE libraries
ADD COLUMN available_seats INTEGER NOT NULL DEFAULT 0;

UPDATE libraries
SET available_seats = total_seats;

ALTER TABLE libraries
ADD CONSTRAINT libraries_available_seats_check
CHECK (
    available_seats >= 0
    AND available_seats <= total_seats
);

COMMIT;
