// src/routes/fitnessTrackingRoutes.js
const express = require('express');
const router = express.Router();
const fitnessTrackingController = require('../controllers/fitnessTrackingController');
const { verifyToken } = require('../middleware/authMiddleware');

// Apply token verification to all routes
router.use(verifyToken);

// Get all fitness metrics for the authenticated user
router.get('/', fitnessTrackingController.getUserMetrics);

// Get fitness statistics summary
router.get('/stats', fitnessTrackingController.getFitnessStats);

// Weight entries
router.post('/weight', fitnessTrackingController.addWeightEntry);

// Body fat entries
router.post('/body-fat', fitnessTrackingController.addBodyFatEntry);

// Water intake entries
router.post('/water-intake', fitnessTrackingController.addWaterIntake);

// Workout logs
router.post('/workout-logs', fitnessTrackingController.addWorkoutLog);
router.delete('/workout-logs/:id', fitnessTrackingController.deleteWorkoutLog);

// Fitness goals
router.post('/goals', fitnessTrackingController.addGoal);
router.delete('/goals/:id', fitnessTrackingController.deleteGoal);
router.patch('/goals/:id/progress', fitnessTrackingController.updateGoalProgress);

module.exports = router;