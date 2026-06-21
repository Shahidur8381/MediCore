const { executeQuery } = require('../config/db');

// @route   GET /api/patients
// @desc    Get all patients
// @access  Private (Admin, Doctor)
exports.getPatients = async (req, res) => {
    try {
        const result = await executeQuery(`SELECT * FROM PATIENT ORDER BY Name`);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @route   GET /api/patients/:id
// @desc    Get patient by ID
// @access  Private (Admin, Doctor, Patient themselves)
exports.getPatientById = async (req, res) => {
    try {
        // Simple authorization check
        if (req.user.role === 'Patient' && req.user.patientId != req.params.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const result = await executeQuery(`SELECT * FROM PATIENT WHERE Patient_ID = :id`, [req.params.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Patient not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
