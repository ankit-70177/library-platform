import express from 'express';
import {
  getMySavedLibraries,
  saveLibrary,
  removeSavedLibrary,
} from '../modules/savedLibraries/savedLibraryController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { authorizeRole } from '../middleware/authorizeRole.js';

const router = express.Router();

router.use(authenticateUser, authorizeRole('customer'));

router.get('/my', getMySavedLibraries);
router.post('/', saveLibrary);
router.delete('/:libraryId', removeSavedLibrary);

export default router;
