const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const prescriptionController = require('../controllers/prescriptionController');

// All routes require authentication
router.use(authMiddleware);

// @route   GET /api/prescriptions/patient/all
// @desc    Get all prescriptions for the logged-in patient
router.get('/patient/all', prescriptionController.getPatientPrescriptions);

// @route   GET /api/prescriptions/:appointmentId
// @desc    Get prescription for a specific appointment
router.get('/:appointmentId', prescriptionController.getPrescriptionByAppointmentId);

// @route   POST /api/prescriptions
// @desc    Create a new prescription
router.post('/', prescriptionController.createPrescription);

module.exports = router;
