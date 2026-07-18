const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');
const auth = require('../middleware/authMiddleware');

// Doctor routes
router.get('/doctor-stats', auth, financeController.getDoctorStats);
router.post('/withdraw', auth, financeController.requestWithdrawal);

// Admin routes
router.get('/admin-stats', auth, financeController.getAdminStats);
router.get('/pending-withdrawals', auth, financeController.getPendingWithdrawals);
router.post('/clear-withdrawal/:doctorId', auth, financeController.clearWithdrawal);

module.exports = router;
