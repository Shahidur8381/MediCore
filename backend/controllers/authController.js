const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const oracledb = require('oracledb');
const { executeQuery } = require('../config/db');

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await executeQuery(
            `SELECT User_ID, Doctor_ID, Patient_ID, Username, Password_Hash, Role, Status 
             FROM USER_ACCOUNT WHERE Username = :username`,
            [username]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const user = result.rows[0];

        if (user.STATUS !== 'Active') {
            return res.status(403).json({ message: 'Account is inactive' });
        }

        const isMatch = await bcrypt.compare(password, user.PASSWORD_HASH);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const payload = {
            user: {
                id: user.USER_ID,
                role: user.ROLE,
                username: user.USERNAME,
                doctorId: user.DOCTOR_ID,
                patientId: user.PATIENT_ID
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'medicore_secret_key',
            { expiresIn: '1d' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: payload.user });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @route   POST /api/auth/register-patient
// @desc    Register a new patient
// @access  Public
exports.registerPatient = async (req, res) => {
    const { username, password, name, gender, dob, bloodGroup, phone, email, address, emergencyContact } = req.body;
    let connection;

    try {
        // Check if user exists
        const userCheck = await executeQuery('SELECT User_ID FROM USER_ACCOUNT WHERE Username = :username', [username]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const phoneCheck = await executeQuery('SELECT Patient_ID FROM PATIENT WHERE Phone = :phone', [phone]);
        if (phoneCheck.rows.length > 0) {
            return res.status(400).json({ message: 'Phone number already registered' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Use a SINGLE connection for both inserts (transaction)
        const { getConnection } = require('../config/db');
        connection = await getConnection();

        // Insert Patient
        const patientInsert = await connection.execute(
            `INSERT INTO PATIENT (Name, Gender, Date_Of_Birth, Blood_Group, Phone, Email, Address, Emergency_Contact) 
             VALUES (:name, :gender, TO_DATE(:dob, 'YYYY-MM-DD'), :bloodGroup, :phone, :email, :address, :emergencyContact) 
             RETURNING Patient_ID INTO :patientId`,
            {
                name, gender, dob, bloodGroup, phone, email, address, emergencyContact,
                patientId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
            },
            { autoCommit: false }
        );

        const patientId = patientInsert.outBinds.patientId[0];

        // Insert User Account
        await connection.execute(
            `INSERT INTO USER_ACCOUNT (Patient_ID, Username, Password_Hash, Role) 
             VALUES (:patientId, :username, :passwordHash, 'Patient')`,
            { patientId, username, passwordHash: hashedPassword },
            { autoCommit: false }
        );

        await connection.commit();
        res.status(201).json({ message: 'Patient registered successfully' });
    } catch (err) {
        if (connection) {
            try { await connection.rollback(); } catch (e) { /* ignore */ }
        }
        console.error(err.message);
        res.status(500).json({ message: err.message || 'Server error' });
    } finally {
        if (connection) {
            try { await connection.close(); } catch (e) { /* ignore */ }
        }
    }
};

// @route   POST /api/auth/register-doctor
// @desc    Register a new doctor (Admin only)
// @access  Private (Admin)
exports.registerDoctor = async (req, res) => {
    const { username, password, departmentId, name, gender, dob, specialization, qualification, phone, email, fee } = req.body;
    let connection;

    try {
        const userCheck = await executeQuery('SELECT User_ID FROM USER_ACCOUNT WHERE Username = :username', [username]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Use a SINGLE connection for both inserts (transaction)
        const { getConnection } = require('../config/db');
        connection = await getConnection();

        const doctorInsert = await connection.execute(
            `INSERT INTO DOCTOR (Department_ID, Name, Gender, Date_Of_Birth, Specialization, Qualification, Phone, Email, Consultation_Fee) 
             VALUES (:departmentId, :name, :gender, TO_DATE(:dob, 'YYYY-MM-DD'), :specialization, :qualification, :phone, :email, :fee) 
             RETURNING Doctor_ID INTO :doctorId`,
            {
                departmentId, name, gender, dob, specialization, qualification, phone, email, fee,
                doctorId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
            },
            { autoCommit: false }
        );

        const doctorId = doctorInsert.outBinds.doctorId[0];

        await connection.execute(
            `INSERT INTO USER_ACCOUNT (Doctor_ID, Username, Password_Hash, Role) 
             VALUES (:doctorId, :username, :passwordHash, 'Doctor')`,
            { doctorId, username, passwordHash: hashedPassword },
            { autoCommit: false }
        );

        await connection.commit();
        res.status(201).json({ message: 'Doctor registered successfully' });
    } catch (err) {
        if (connection) {
            try { await connection.rollback(); } catch (e) { /* ignore */ }
        }
        console.error(err.message);
        res.status(500).json({ message: err.message || 'Server error' });
    } finally {
        if (connection) {
            try { await connection.close(); } catch (e) { /* ignore */ }
        }
    }
};

// @route   GET /api/auth/me
// @desc    Get current user profile based on token
// @access  Private
exports.getMe = async (req, res) => {
    try {
        if (req.user.role === 'Admin') {
            return res.json({ id: req.user.id, role: req.user.role, username: req.user.username });
        }

        if (req.user.role === 'Doctor') {
            const result = await executeQuery('SELECT * FROM DOCTOR WHERE Doctor_ID = :id', [req.user.doctorId]);
            return res.json({ id: req.user.id, role: req.user.role, username: req.user.username, profile: result.rows[0] });
        }

        if (req.user.role === 'Patient') {
            const result = await executeQuery('SELECT * FROM PATIENT WHERE Patient_ID = :id', [req.user.patientId]);
            return res.json({ id: req.user.id, role: req.user.role, username: req.user.username, profile: result.rows[0] });
        }

        res.status(404).json({ message: 'Profile not found' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
