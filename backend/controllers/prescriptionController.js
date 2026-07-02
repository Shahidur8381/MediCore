const { executeQuery } = require('../config/db');

// @route   GET /api/prescriptions/:appointmentId
// @desc    Get prescription for a specific appointment
// @access  Private
exports.getPrescriptionByAppointmentId = async (req, res) => {
    try {
        const { appointmentId } = req.params;

        const result = await executeQuery(
            `SELECT p.*, d.Name as Doctor_Name, pat.Name as Patient_Name
             FROM PRESCRIPTION p
             JOIN DOCTOR d ON p.Doctor_ID = d.Doctor_ID
             JOIN PATIENT pat ON p.Patient_ID = pat.Patient_ID
             WHERE p.Appointment_ID = :1`,
            [appointmentId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Prescription not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @route   GET /api/prescriptions/patient/all
// @desc    Get all prescriptions for the logged-in patient
// @access  Private (Patient only)
exports.getPatientPrescriptions = async (req, res) => {
    try {
        if (req.user.role !== 'Patient') {
             return res.status(403).json({ message: 'Access denied' });
        }
        
        const result = await executeQuery(
            `SELECT p.*, d.Name as Doctor_Name, a.Appointment_Date
             FROM PRESCRIPTION p
             JOIN DOCTOR d ON p.Doctor_ID = d.Doctor_ID
             JOIN APPOINTMENT a ON p.Appointment_ID = a.Appointment_ID
             WHERE p.Patient_ID = :1
             ORDER BY p.Prescription_Date DESC`,
            [req.user.patientId]
        );

        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @route   POST /api/prescriptions
// @desc    Create a new prescription
// @access  Private (Doctor only)
exports.createPrescription = async (req, res) => {
    try {
        if (req.user.role !== 'Doctor') {
            return res.status(403).json({ message: 'Only doctors can write prescriptions' });
        }

        const { Appointment_ID, Patient_ID, Diagnosis, Medicines, Notes } = req.body;
        const Doctor_ID = req.user.doctorId;

        await executeQuery(
            `INSERT INTO PRESCRIPTION (Appointment_ID, Patient_ID, Doctor_ID, Diagnosis, Medicines, Notes)
             VALUES (:1, :2, :3, :4, :5, :6)`,
            [Appointment_ID, Patient_ID, Doctor_ID, Diagnosis, Medicines, Notes]
        );
        
        // Update appointment status to Completed
        await executeQuery(
            `UPDATE APPOINTMENT SET Status = 'Completed' WHERE Appointment_ID = :1`,
            [Appointment_ID]
        );

        res.status(201).json({ message: 'Prescription created successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
