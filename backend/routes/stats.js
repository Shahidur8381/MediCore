const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// @route   GET /api/stats
// @desc    Get dashboard statistics
// @access  Private (Admin)
router.get('/', authMiddleware, roleMiddleware('Admin'), async (req, res) => {
    try {
        const [deptResult, docResult, patResult] = await Promise.all([
            executeQuery('SELECT COUNT(*) AS count FROM DEPARTMENT'),
            executeQuery('SELECT COUNT(*) AS count FROM DOCTOR'),
            executeQuery('SELECT COUNT(*) AS count FROM PATIENT'),
        ]);

        res.json({
            departments: deptResult.rows[0].COUNT,
            doctors: docResult.rows[0].COUNT,
            patients: patResult.rows[0].COUNT,
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
