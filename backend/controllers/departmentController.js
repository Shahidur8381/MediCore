const { executeQuery } = require('../config/db');

// @route   GET /api/departments
// @desc    Get all departments
// @access  Public or Private
exports.getDepartments = async (req, res) => {
    try {
        const result = await executeQuery('SELECT * FROM DEPARTMENT ORDER BY Department_Name');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @route   POST /api/departments
// @desc    Create a department
// @access  Private (Admin)
exports.createDepartment = async (req, res) => {
    const { name, head } = req.body;

    try {
        const result = await executeQuery(
            `INSERT INTO DEPARTMENT (Department_Name, Department_Head) 
             VALUES (:name, :head)`,
            { name, head }
        );
        res.status(201).json({ message: 'Department created successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @route   PUT /api/departments/:id
// @desc    Update a department
// @access  Private (Admin)
exports.updateDepartment = async (req, res) => {
    const { name, head } = req.body;
    const { id } = req.params;

    try {
        const result = await executeQuery(
            `UPDATE DEPARTMENT SET Department_Name = :name, Department_Head = :head 
             WHERE Department_ID = :id`,
            { name, head, id }
        );
        
        if (result.rowsAffected === 0) {
            return res.status(404).json({ message: 'Department not found' });
        }
        res.json({ message: 'Department updated' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @route   DELETE /api/departments/:id
// @desc    Delete a department
// @access  Private (Admin)
exports.deleteDepartment = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await executeQuery('DELETE FROM DEPARTMENT WHERE Department_ID = :id', [id]);
        if (result.rowsAffected === 0) {
            return res.status(404).json({ message: 'Department not found' });
        }
        res.json({ message: 'Department deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
