const { executeQuery } = require('../config/db');

// @route   GET /api/doctors
// @desc    Get all doctors
// @access  Public or Private
exports.getDoctors = async (req, res) => {
    try {
        const result = await executeQuery(`
            SELECT d.*, dept.Department_Name 
            FROM DOCTOR d
            LEFT JOIN DEPARTMENT dept ON d.Department_ID = dept.Department_ID
            ORDER BY d.Name
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @route   GET /api/doctors/:id
// @desc    Get doctor by ID
// @access  Public or Private
exports.getDoctorById = async (req, res) => {
    try {
        const result = await executeQuery(`
            SELECT d.*, dept.Department_Name 
            FROM DOCTOR d
            LEFT JOIN DEPARTMENT dept ON d.Department_ID = dept.Department_ID
            WHERE d.Doctor_ID = :id
        `, [req.params.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @route   PUT /api/doctors/:id
// @desc    Update a doctor
// @access  Private (Admin)
exports.updateDoctor = async (req, res) => {
    const { departmentId, name, gender, dob, specialization, qualification, phone, email, fee, status } = req.body;
    
    try {
        const result = await executeQuery(
            `UPDATE DOCTOR SET 
                Department_ID = :departmentId, 
                Name = :name, 
                Gender = :gender, 
                Date_Of_Birth = TO_DATE(:dob, 'YYYY-MM-DD'), 
                Specialization = :specialization, 
                Qualification = :qualification, 
                Phone = :phone, 
                Email = :email, 
                Consultation_Fee = :fee,
                Status = :status
             WHERE Doctor_ID = :id`,
            { departmentId, name, gender, dob, specialization, qualification, phone, email, fee, status, id: req.params.id }
        );
        
        if (result.rowsAffected === 0) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        res.json({ message: 'Doctor updated' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
