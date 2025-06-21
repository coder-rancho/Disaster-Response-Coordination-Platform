import express from 'express';
import { reportController } from '../controllers/report.controller.js';

const router = express.Router({ mergeParams: true }); // Enable access to parent router params

/* Copilot generated these routes */

// Create a new report for a disaster
router.post('/', reportController.create);

// Get all reports for a disaster
router.get('/', reportController.getAll);

// Get a specific report
router.get('/:id', reportController.getOne);

// Update a report
router.put('/:id', reportController.update);

// Delete a report
router.delete('/:id', reportController.delete);

export default router;
