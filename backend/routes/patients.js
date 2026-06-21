const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/', authMiddleware, roleMiddleware('Admin', 'Doctor'), patientController.getPatients);
router.get('/:id', authMiddleware, roleMiddleware('Admin', 'Doctor', 'Patient'), patientController.getPatientById);

module.exports = router;
