const express = require('express');
const router = express.Router();
const {
    createPayroll,
    updatePayroll,
    getPayrollByMonth,
    getAllPayrollsForEmployee
} = require('../controllers/payrollController');

// Payroll routes
router.post('/', createPayroll); // HR Manager creates payroll
router.put('/:id', updatePayroll); // HR Manager updates payroll
router.get('/:employeeId/:month/:year', getPayrollByMonth); // Get payroll by month and year
router.get('/:employeeId', getAllPayrollsForEmployee); // Get all payrolls for an employee

module.exports = router;
