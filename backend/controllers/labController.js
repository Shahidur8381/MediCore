const { executeQuery } = require('../config/db');

// @route   GET /api/lab/tests
// @desc    Get all available lab tests
// @access  Private
exports.getAvailableTests = async (req, res) => {
    try {
        const result = await executeQuery(`SELECT * FROM LAB_TEST WHERE Status = 'Available'`);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @route   GET /api/lab/records
// @desc    Get lab test records filtered by role
// @access  Private
exports.getLabRecords = async (req, res) => {
    try {
        let query = `
            SELECT r.*, t.Test_Name, t.Test_Fee, d.Name as Doctor_Name, p.Name as Patient_Name
            FROM LAB_TEST_RECORD r
            JOIN LAB_TEST t ON r.Test_ID = t.Test_ID
            JOIN DOCTOR d ON r.Doctor_ID = d.Doctor_ID
            JOIN PATIENT p ON r.Patient_ID = p.Patient_ID
        `;
        let params = [];

        if (req.user.role === 'Patient') {
            query += ' WHERE r.Patient_ID = :1';
            params.push(req.user.patientId);
        } else if (req.user.role === 'Doctor') {
            query += ' WHERE r.Doctor_ID = :1';
            params.push(req.user.doctorId);
        }

        query += ' ORDER BY r.Order_Date DESC';

        const result = await executeQuery(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @route   POST /api/lab/records
// @desc    Order a new lab test
// @access  Private (Doctor only)
exports.orderLabTest = async (req, res) => {
    try {
        if (req.user.role !== 'Doctor') {
            return res.status(403).json({ message: 'Only doctors can order lab tests' });
        }

        const { Patient_ID, Test_ID } = req.body;
        const Doctor_ID = req.user.doctorId;

        await executeQuery(
            `INSERT INTO LAB_TEST_RECORD (Patient_ID, Doctor_ID, Test_ID)
             VALUES (:1, :2, :3)`,
            [Patient_ID, Doctor_ID, Test_ID]
        );

        res.status(201).json({ message: 'Lab test ordered successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @route   PUT /api/lab/records/:id/result
// @desc    Update lab test result
// @access  Private (Admin, Doctor)
exports.updateLabResult = async (req, res) => {
    try {
        if (req.user.role === 'Patient') {
            return res.status(403).json({ message: 'Patients cannot update lab results' });
        }

        const { id } = req.params;
        const { Result_Details, Status } = req.body;

        await executeQuery(
            `UPDATE LAB_TEST_RECORD 
             SET Result_Details = :1, Status = :2, Report_Date = SYSDATE
             WHERE Record_ID = :3`,
            [Result_Details, Status, id]
        );

        res.json({ message: 'Lab result updated' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
