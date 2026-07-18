const oracledb = require('oracledb');
const { executeQuery, getConnection } = require('../config/db');

// @route   GET /api/lab/tests
// @desc    Get all available lab tests
// @access  Private
exports.getAvailableTests = async (req, res) => {
    try {
        const result = await executeQuery(`SELECT * FROM LAB_TEST WHERE Status = 'Available' ORDER BY Test_Name`);
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
        let whereClauses = [];

        if (req.user.role === 'Patient') {
            whereClauses.push('r.Patient_ID = :1');
            params.push(req.user.patientId);
        } else if (req.user.role === 'Doctor') {
            whereClauses.push('r.Doctor_ID = :1');
            params.push(req.user.doctorId);
        } else if (req.user.role === 'Lab') {
            // Lab sees all records that have been paid for (ready for processing)
            whereClauses.push("r.Payment_Status = 'Paid'");
        }

        if (whereClauses.length > 0) {
            query += ' WHERE ' + whereClauses.join(' AND ');
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
// @desc    Order a new lab test (multiple can be ordered)
// @access  Private (Doctor only)
exports.orderLabTest = async (req, res) => {
    try {
        if (req.user.role !== 'Doctor') {
            return res.status(403).json({ message: 'Only doctors can order lab tests' });
        }

        const { Patient_ID, Test_ID, waiveCommission } = req.body;
        const Doctor_ID = req.user.doctorId;
        const waive = waiveCommission ? 'Y' : 'N';

        await executeQuery(
            `INSERT INTO LAB_TEST_RECORD (Patient_ID, Doctor_ID, Test_ID, Waive_Commission)
             VALUES (:1, :2, :3, :4)`,
            [Patient_ID, Doctor_ID, Test_ID, waive]
        );

        res.status(201).json({ message: 'Lab test ordered successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @route   POST /api/lab/records/:id/pay
// @desc    Pay for a lab test (Dummy SSLCommerz callback)
// @access  Private (Patient only)
exports.payLabTest = async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        if (req.user.role !== 'Patient') {
            return res.status(403).json({ message: 'Only patients can pay for lab tests' });
        }

        connection = await getConnection();

        // Get lab record details
        const recResult = await connection.execute(
            `SELECT r.Test_ID, r.Doctor_ID, r.Patient_ID, r.Waive_Commission, r.Payment_Status, t.Test_Fee 
             FROM LAB_TEST_RECORD r
             JOIN LAB_TEST t ON r.Test_ID = t.Test_ID
             WHERE r.Record_ID = :1 AND r.Patient_ID = :2`,
            [parseInt(id, 10), req.user.patientId],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (recResult.rows.length === 0) {
            return res.status(404).json({ message: 'Lab test not found' });
        }

        const record = recResult.rows[0];
        if (record.PAYMENT_STATUS === 'Paid') {
            return res.status(400).json({ message: 'Lab test is already paid' });
        }

        const fee = record.TEST_FEE;
        let doctorAmount = 0;
        let adminAmount = Math.ceil(fee * 0.75);
        let totalAmount = Math.ceil(fee * 0.75);

        if (record.WAIVE_COMMISSION === 'N') {
            doctorAmount = Math.ceil(fee * 0.25);
            totalAmount = fee;
            adminAmount = fee - doctorAmount; // Ensure total matches fee exactly
        }

        // Update payment status → moves to "Awaiting Result" for lab to process
        await connection.execute(
            `UPDATE LAB_TEST_RECORD SET Payment_Status = 'Paid', Status = 'Awaiting Result' WHERE Record_ID = :1`,
            [parseInt(id, 10)],
            { autoCommit: false }
        );

        // Insert into financial ledger
        await connection.execute(
            `INSERT INTO FINANCIAL_LEDGER (Transaction_Type, Reference_ID, Patient_ID, Doctor_ID, Total_Amount, Doctor_Amount, Admin_Amount)
             VALUES ('Lab Test', :1, :2, :3, :4, :5, :6)`,
            [parseInt(id, 10), record.PATIENT_ID, record.DOCTOR_ID, totalAmount, doctorAmount, adminAmount],
            { autoCommit: false }
        );

        await connection.commit();
        res.json({ message: 'Payment successful. Test sent to lab.' });
    } catch (err) {
        if (connection) await connection.rollback();
        console.error(err.message);
        res.status(500).json({ message: err.message });
    } finally {
        if (connection) {
            try { await connection.close(); } catch (e) {}
        }
    }
};

// @route   PUT /api/lab/records/:id/complete
// @desc    Complete a lab test and submit report (Lab role only)
// @access  Private (Lab only)
exports.completeLabTest = async (req, res) => {
    try {
        if (req.user.role !== 'Lab') {
            return res.status(403).json({ message: 'Only lab technicians can complete lab tests' });
        }

        const { id } = req.params;
        const { Result_Details } = req.body;

        if (!Result_Details || !Result_Details.trim()) {
            return res.status(400).json({ message: 'Result details are required' });
        }

        await executeQuery(
            `UPDATE LAB_TEST_RECORD 
             SET Result_Details = :1, Status = 'Completed', Report_Date = SYSDATE
             WHERE Record_ID = :2 AND Payment_Status = 'Paid'`,
            [Result_Details, parseInt(id, 10)]
        );

        res.json({ message: 'Lab report submitted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @route   PUT /api/lab/records/:id/result
// @desc    Update lab test result (legacy - kept for compatibility)
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
            [Result_Details, Status, parseInt(id, 10)]
        );

        res.json({ message: 'Lab result updated' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
