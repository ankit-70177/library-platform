
import express from 'express'

import {
  getApprovedLibraries,
  getApprovedLibraryById,
} from '../modules/discovery/discoveryController.js'

const router = express.Router()

// Public library discovery
router.get('/libraries', getApprovedLibraries)

// Public approved library details
router.get('/libraries/:id', getApprovedLibraryById)

export default router

