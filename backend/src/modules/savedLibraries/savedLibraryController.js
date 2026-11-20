import pool from '../../config/db.js';

export const getMySavedLibraries = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         s.id AS saved_id,
         s.created_at AS saved_at,
         l.*
       FROM saved_libraries s
       JOIN libraries l ON l.id = s.library_id
       WHERE s.customer_id = $1
         AND l.status = 'approved'
       ORDER BY s.created_at DESC`,
      [req.user.id]
    );

    return res.status(200).json({
      success: true,
      count: result.rowCount,
      libraries: result.rows,
    });
  } catch (error) {
    console.error('Get saved libraries error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch saved libraries.',
    });
  }
};

export const saveLibrary = async (req, res) => {
  try {
    const libraryId = Number(req.body.library_id);

    if (!Number.isSafeInteger(libraryId) || libraryId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'A valid library_id is required.',
      });
    }

    const library = await pool.query(
      `SELECT id FROM libraries
       WHERE id = $1 AND status = 'approved'`,
      [libraryId]
    );

    if (library.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Approved library not found.',
      });
    }

    const result = await pool.query(
      `INSERT INTO saved_libraries (customer_id, library_id)
       VALUES ($1, $2)
       ON CONFLICT (customer_id, library_id) DO NOTHING
       RETURNING *`,
      [req.user.id, libraryId]
    );

    if (result.rowCount === 0) {
      return res.status(409).json({
        success: false,
        message: 'This library is already saved.',
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Library saved successfully.',
      savedLibrary: result.rows[0],
    });
  } catch (error) {
    console.error('Save library error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to save library.',
    });
  }
};

export const removeSavedLibrary = async (req, res) => {
  try {
    const libraryId = Number(req.params.libraryId);

    if (!Number.isSafeInteger(libraryId) || libraryId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'A valid library ID is required.',
      });
    }

    const result = await pool.query(
      `DELETE FROM saved_libraries
       WHERE customer_id = $1 AND library_id = $2
       RETURNING id`,
      [req.user.id, libraryId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Saved library not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Library removed from saved list.',
    });
  } catch (error) {
    console.error('Remove saved library error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to remove saved library.',
    });
  }
};
