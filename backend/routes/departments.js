const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/', departmentController.getDepartments);
router.post('/', authMiddleware, roleMiddleware('Admin'), departmentController.createDepartment);
router.put('/:id', authMiddleware, roleMiddleware('Admin'), departmentController.updateDepartment);
router.delete('/:id', authMiddleware, roleMiddleware('Admin'), departmentController.deleteDepartment);

module.exports = router;
