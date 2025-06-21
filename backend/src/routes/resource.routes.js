/* Copilot generated this */
import express from 'express';
import { resourceController } from '../controllers/resource.controller.js';

const router = express.Router({ mergeParams: true }); // Enable access to parent router params

// Create a new resource for a disaster
router.post('/', resourceController.create);

// Get all resources for a disaster
router.get('/', resourceController.getAll);

// Get nearby resources
router.get('/nearby', resourceController.getNearby);

// Update a resource
router.put('/:id', resourceController.update);

// Delete a resource
router.delete('/:id', resourceController.delete);

export default router;
