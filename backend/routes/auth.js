const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.post('/login', authController.login);
router.post('/register-patient', authController.registerPatient);
router.post('/register-doctor', authMiddleware, roleMiddleware('Admin'), authController.registerDoctor);
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
