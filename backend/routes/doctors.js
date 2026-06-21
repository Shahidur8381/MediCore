const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/', doctorController.getDoctors);
router.get('/:id', doctorController.getDoctorById);
router.put('/:id', authMiddleware, roleMiddleware('Admin'), doctorController.updateDoctor);

module.exports = router;
