import express from 'express';
import { disasterController } from '../controllers/disaster.controller.js';

const router = express.Router();

/* Copilot generated these routes */

// Create a new disaster
router.post('/', disasterController.create);

// Get all disasters (with optional tag filter)
router.get('/', disasterController.getAll);

// Get a specific disaster
router.get('/:id', disasterController.getOne);

// Update a disaster
router.put('/:id', disasterController.update);

// Delete a disaster
router.delete('/:id', disasterController.delete);

export default router;
