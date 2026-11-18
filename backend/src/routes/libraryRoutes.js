
// import express from 'express'

// import {
//   createLibrary,
//   getMyLibraries,
//   getLibraryById,
//   updateLibrary,
//   deleteLibrary,
// } from '../modules/libraries/libraryController.js'

// import { authenticateUser } from '../middleware/authMiddleware.js'
// import { authorizeRole } from '../middleware/authorizeRole.js'

// const router = express.Router()

// // All library management routes require authentication.
// router.use(authenticateUser)

// // Owner-only: Create a library
// router.post(
//   '/',
//   authorizeRole('owner'),
//   createLibrary
// )

// // Owner-only: Get all libraries belonging to the logged-in owner
// router.get(
//   '/my',
//   authorizeRole('owner'),
//   getMyLibraries
// )

// // Owner/Admin: Get a library by ID
// router.get(
//   '/:id',
//   authorizeRole('owner', 'admin'),
//   getLibraryById
// )

// // Owner-only: Update own library
// router.patch(
//   '/:id',
//   authorizeRole('owner'),
//   updateLibrary
// )

// // Owner-only: Delete own library
// router.delete(
//   '/:id',
//   authorizeRole('owner'),
//   deleteLibrary
// )

// export default router


import express from 'express'

import {
  createLibrary,
  getMyLibraries,
  getLibraryById,
  updateLibrary,
  deleteLibrary,
  getPendingLibraries,
  approveLibrary,
  rejectLibrary,
} from '../modules/libraries/libraryController.js'

import { authenticateUser } from '../middleware/authMiddleware.js'
import { authorizeRole } from '../middleware/authorizeRole.js'

const router = express.Router()

// All library routes require authentication.
router.use(authenticateUser)

// Admin-only routes
router.get(
  '/admin/pending',
  authorizeRole('admin'),
  getPendingLibraries
)

router.patch(
  '/admin/:id/approve',
  authorizeRole('admin'),
  approveLibrary
)

router.patch(
  '/admin/:id/reject',
  authorizeRole('admin'),
  rejectLibrary
)

// Owner-only: Create a library
router.post(
  '/',
  authorizeRole('owner'),
  createLibrary
)

// Owner-only: Get logged-in owner's libraries
router.get(
  '/my',
  authorizeRole('owner'),
  getMyLibraries
)

// Owner/Admin: Get library by ID
router.get(
  '/:id',
  authorizeRole('owner', 'admin'),
  getLibraryById
)

// Owner-only: Update own library
router.patch(
  '/:id',
  authorizeRole('owner'),
  updateLibrary
)

// Owner-only: Delete own library
router.delete(
  '/:id',
  authorizeRole('owner'),
  deleteLibrary
)

export default router

