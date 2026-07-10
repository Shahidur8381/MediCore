const oracledb = require('oracledb');
const { executeQuery, getConnection } = require('../config/db');

// @route   GET /api/appointments
// @desc    Get all appointments (Filtered by role)
// @access  Private
exports.getAppointments = async (req, res) => {
    try {
        let query = `
            SELECT a.*, p.Name as Patient_Name, d.Name as Doctor_Name, dept.Department_Name
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

        query += ' ORDER BY a.Appointment_Date DESC, a.Appointment_Time DESC';

        const result = await executeQuery(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};



// @route   POST /api/appointments
// @desc    Book a new appointment
// @access  Private (Patient only)
exports.createAppointment = async (req, res) => {
    let connection;
    try {
        const { Doctor_ID, Appointment_Date, Appointment_Time } = req.body;
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

        const fee = docResult.rows[0].CONSULTATION_FEE;
        const doctorAmount = fee * 0.8;
        const adminAmount = fee * 0.2;

        // Insert appointment and get the new ID
        const aptResult = await connection.execute(
            `INSERT INTO APPOINTMENT (Patient_ID, Doctor_ID, Appointment_Date, Appointment_Time)
             VALUES (:1, :2, TO_DATE(:3, 'YYYY-MM-DD'), :4)
             RETURNING Appointment_ID INTO :5`,
            [Patient_ID, Doctor_ID, Appointment_Date, Appointment_Time, { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }],
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
        res.status(201).json({ message: 'Appointment booked successfully and payment recorded' });
    } catch (err) {
        if (connection) await connection.rollback();
        console.error(err.message);
        if (err.message.includes('ORA-20001')) {
            return res.status(400).json({ message: 'Doctor already has an appointment at this date and time.' });
        }
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
            [status, id]
        );

        res.json({ message: 'Appointment status updated' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
