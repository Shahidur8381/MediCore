const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const appointmentController = require('../controllers/appointmentController');

// All routes require authentication
router.use(authMiddleware);

// @route   GET /api/appointments
// @desc    Get all appointments (Filtered by role)
router.get('/', appointmentController.getAppointments);

// @route   POST /api/appointments
// @desc    Book a new appointment
router.post('/', appointmentController.createAppointment);

// @route   PUT /api/appointments/:id/status
// @desc    Update appointment status
router.put('/:id/status', appointmentController.updateAppointmentStatus);

module.exports = router;
