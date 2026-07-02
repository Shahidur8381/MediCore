const { executeQuery } = require('../config/db');

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
    try {
        const { Doctor_ID, Appointment_Date, Appointment_Time } = req.body;
        const Patient_ID = req.user.patientId;

        if (req.user.role !== 'Patient') {
            return res.status(403).json({ message: 'Only patients can book appointments directly' });
        }

        await executeQuery(
            `INSERT INTO APPOINTMENT (Patient_ID, Doctor_ID, Appointment_Date, Appointment_Time)
             VALUES (:1, :2, TO_DATE(:3, 'YYYY-MM-DD'), :4)`,
            [Patient_ID, Doctor_ID, Appointment_Date, Appointment_Time]
        );

        res.status(201).json({ message: 'Appointment booked successfully' });
    } catch (err) {
        console.error(err.message);
        if (err.message.includes('ORA-20001')) {
            return res.status(400).json({ message: 'Doctor already has an appointment at this date and time.' });
        }
        res.status(500).send('Server error');
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
