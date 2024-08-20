const Payroll = require('../models/Payroll');
const User = require('../models/User');

// Create payroll for an employee (HR Manager only)
exports.createPayroll = async (req, res) => {
    try {
        const { employeeId, month, year, basicSalary, allowances, deductions } = req.body;

        // Check if payroll already exists for the given month and year
        const existingPayroll = await Payroll.findOne({ employee: employeeId, month, year });

        if (existingPayroll) {
            return res.status(400).json({ msg: 'Payroll already exists for this month and year' });
        }

        // Calculate net salary
        const netSalary = basicSalary + allowances - deductions;

        // Create payroll entry
        const payroll = new Payroll({
            employee: employeeId,
            month,
            year,
            basicSalary,
            allowances,
            deductions,
            netSalary
        });

        await payroll.save();

        res.json({ msg: 'Payroll created', payroll });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Update payroll (HR Manager only)
exports.updatePayroll = async (req, res) => {
    try {
        const { id } = req.params;
        const { basicSalary, allowances, deductions, status, paymentDate } = req.body;

        // Find payroll entry by ID
        const payroll = await Payroll.findById(id);

        if (!payroll) {
            return res.status(404).json({ msg: 'Payroll entry not found' });
        }

        // Update fields
        if (basicSalary !== undefined) payroll.basicSalary = basicSalary;
        if (allowances !== undefined) payroll.allowances = allowances;
        if (deductions !== undefined) payroll.deductions = deductions;
        payroll.netSalary = payroll.basicSalary + payroll.allowances - payroll.deductions;

        if (status) payroll.status = status;
        if (paymentDate) payroll.paymentDate = paymentDate;

        await payroll.save();

        res.json({ msg: 'Payroll updated', payroll });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Get payroll for an employee by month and year
exports.getPayrollByMonth = async (req, res) => {
    try {
        const { employeeId, month, year } = req.params;

        // Find payroll entry for the given month and year
        const payroll = await Payroll.findOne({ employee: employeeId, month, year });

        if (!payroll) {
            return res.status(404).json({ msg: 'Payroll entry not found for this month and year' });
        }

        res.json(payroll);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Get all payrolls for an employee
exports.getAllPayrollsForEmployee = async (req, res) => {
    try {
        const { employeeId } = req.params;

        // Find all payroll entries for the employee
        const payrolls = await Payroll.find({ employee: employeeId }).sort({ year: -1, month: -1 });

        if (payrolls.length === 0) {
            return res.status(404).json({ msg: 'No payroll records found for this employee' });
        }

        res.json(payrolls);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
