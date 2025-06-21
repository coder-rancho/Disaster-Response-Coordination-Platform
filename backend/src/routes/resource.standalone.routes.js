/* Copilot generated this */
import express from 'express';
import { resourceController } from '../controllers/resource.controller.js';

const router = express.Router();

// Get nearby resources regardless of disaster
router.get('/nearby', resourceController.getNearby);

export default router;
