const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const labController = require('../controllers/labController');

// All routes require authentication
router.use(authMiddleware);

// @route   GET /api/lab/tests
// @desc    Get all available lab tests
router.get('/tests', labController.getAvailableTests);

// @route   GET /api/lab/records
// @desc    Get lab test records filtered by role
router.get('/records', labController.getLabRecords);

// @route   POST /api/lab/records
// @desc    Order a new lab test
router.post('/records', labController.orderLabTest);

// @route   PUT /api/lab/records/:id/result
// @desc    Update lab test result
router.put('/records/:id/result', labController.updateLabResult);

// @route   POST /api/lab/records/:id/pay
// @desc    Pay for a lab test (Dummy SSLCommerz callback)
router.post('/records/:id/pay', labController.payLabTest);

module.exports = router;
