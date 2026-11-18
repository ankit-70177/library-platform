import express from 'express'
import { applyAsOwner } from '../modules/owner/ownerController.js'

const router = express.Router()

// Submit an owner application
router.post('/apply', applyAsOwner)

export default router