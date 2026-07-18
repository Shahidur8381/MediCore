const oracledb = require('oracledb');
const { executeQuery, getConnection } = require('../config/db');

// @route   GET /api/appointments
// @desc    Get all appointments (Filtered by role)
// @access  Private
exports.getAppointments = async (req, res) => {
    try {
        let query = `
            SELECT a.Appointment_ID, a.Patient_ID, a.Doctor_ID, a.Appointment_Date, 
                   a.Queue_Number, a.Booking_Date, a.Status,
                   p.Name as Patient_Name, d.Name as Doctor_Name, dept.Department_Name
            FROM APPOINTMENT a
            JOIN PATIENT p ON a.Patient_ID = p.Patient_ID
            JOIN DOCTOR d ON a.Doctor_ID = d.Doctor_ID
            JOIN DEPARTMENT dept ON d.Department_ID = dept.Department_ID
        `;
        let params = [];

        if (req.user.role === 'Patient') {
            query += ' WHERE a.Patient_ID = :1';
            params.push(req.user.patientId);
        } else if (req.user.role === 'Doctor') {
            query += ' WHERE a.Doctor_ID = :1';
            params.push(req.user.doctorId);
        }

        query += ' ORDER BY a.Appointment_Date DESC, a.Queue_Number ASC';

        const result = await executeQuery(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @route   GET /api/appointments/stats
// @desc    Get appointment stats for current user
// @access  Private
exports.getStats = async (req, res) => {
    try {
        if (req.user.role === 'Patient') {
            const [aptRes, labRes, rxRes] = await Promise.all([
                executeQuery('SELECT COUNT(*) AS CNT FROM APPOINTMENT WHERE Patient_ID = :1', [req.user.patientId]),
                executeQuery('SELECT COUNT(*) AS CNT FROM LAB_TEST_RECORD WHERE Patient_ID = :1', [req.user.patientId]),
                executeQuery('SELECT COUNT(*) AS CNT FROM PRESCRIPTION WHERE Patient_ID = :1', [req.user.patientId]),
            ]);
            return res.json({
                appointments: aptRes.rows[0].CNT,
                labTests: labRes.rows[0].CNT,
                prescriptions: rxRes.rows[0].CNT,
            });
        }
        if (req.user.role === 'Doctor') {
            const [todayRes, totalRxRes, totalLabRes] = await Promise.all([
                executeQuery(
                    `SELECT COUNT(*) AS CNT FROM APPOINTMENT WHERE Doctor_ID = :1 AND TRUNC(Appointment_Date) = TRUNC(SYSDATE) AND Status != 'Cancelled'`,
                    [req.user.doctorId]
                ),
                executeQuery('SELECT COUNT(*) AS CNT FROM PRESCRIPTION WHERE Doctor_ID = :1', [req.user.doctorId]),
                executeQuery('SELECT COUNT(*) AS CNT FROM LAB_TEST_RECORD WHERE Doctor_ID = :1', [req.user.doctorId]),
            ]);
            return res.json({
                todayAppointments: todayRes.rows[0].CNT,
                totalPrescriptions: totalRxRes.rows[0].CNT,
                totalLabOrders: totalLabRes.rows[0].CNT,
            });
        }
        res.json({});
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @route   POST /api/appointments
// @desc    Book a new appointment (queue-based)
// @access  Private (Patient only)
exports.createAppointment = async (req, res) => {
    let connection;
    try {
        const { Doctor_ID, Appointment_Date } = req.body;
        const Patient_ID = req.user.patientId;

        if (req.user.role !== 'Patient') {
            return res.status(403).json({ message: 'Only patients can book appointments directly' });
        }

        connection = await getConnection();

        // Get the doctor's consultation fee
        const docResult = await connection.execute(
            `SELECT Consultation_Fee FROM DOCTOR WHERE Doctor_ID = :1`,
            [Doctor_ID],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (docResult.rows.length === 0) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        // Check patient hasn't already booked this doctor on same date
        const dupeCheck = await connection.execute(
            `SELECT Appointment_ID FROM APPOINTMENT WHERE Doctor_ID = :1 AND Appointment_Date = TO_DATE(:2, 'YYYY-MM-DD') AND Patient_ID = :3 AND Status != 'Cancelled'`,
            [Doctor_ID, Appointment_Date, Patient_ID],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        if (dupeCheck.rows.length > 0) {
            return res.status(400).json({ message: 'You already have an appointment with this doctor on this date.' });
        }

        // Calculate queue number
        const queueResult = await connection.execute(
            `SELECT NVL(MAX(Queue_Number), 0) + 1 AS NEXT_QUEUE FROM APPOINTMENT WHERE Doctor_ID = :1 AND Appointment_Date = TO_DATE(:2, 'YYYY-MM-DD') AND Status != 'Cancelled'`,
            [Doctor_ID, Appointment_Date],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        const queueNumber = queueResult.rows[0].NEXT_QUEUE;

        const fee = docResult.rows[0].CONSULTATION_FEE;
        const doctorAmount = Math.ceil(fee * 0.8);
        const adminAmount = fee - doctorAmount; // Ensure exact match

        // Insert appointment
        const aptResult = await connection.execute(
            `INSERT INTO APPOINTMENT (Patient_ID, Doctor_ID, Appointment_Date, Queue_Number)
             VALUES (:1, :2, TO_DATE(:3, 'YYYY-MM-DD'), :4)
             RETURNING Appointment_ID INTO :5`,
            [Patient_ID, Doctor_ID, Appointment_Date, queueNumber, { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }],
            { autoCommit: false }
        );

        const appointmentId = aptResult.outBinds[0][0];

        // Insert into financial ledger
        await connection.execute(
            `INSERT INTO FINANCIAL_LEDGER (Transaction_Type, Reference_ID, Patient_ID, Doctor_ID, Total_Amount, Doctor_Amount, Admin_Amount)
             VALUES ('Appointment', :1, :2, :3, :4, :5, :6)`,
            [appointmentId, Patient_ID, Doctor_ID, fee, doctorAmount, adminAmount],
            { autoCommit: false }
        );

        await connection.commit();
        res.status(201).json({ message: 'Appointment booked successfully', queueNumber });
    } catch (err) {
        if (connection) await connection.rollback();
        console.error(err.message);
        res.status(500).send('Server error');
    } finally {
        if (connection) {
            try { await connection.close(); } catch (e) {}
        }
    }
};

// @route   PUT /api/appointments/:id/status
// @desc    Update appointment status
// @access  Private (Doctor, Admin)
exports.updateAppointmentStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;

        if (req.user.role === 'Patient') {
            return res.status(403).json({ message: 'Patients cannot update appointment status directly' });
        }

        await executeQuery(
            `UPDATE APPOINTMENT SET Status = :1 WHERE Appointment_ID = :2`,
            [status, parseInt(id, 10)]
        );

        res.json({ message: 'Appointment status updated' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
