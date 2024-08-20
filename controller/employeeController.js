const User = require('../models/User');
const Attendance = require('../models/Attendance');

// Get all employees (HR Manager only)
exports.getAllEmployees = async (req, res) => {
    try {
        const employees = await User.find({ role: 'employee' }).select('-password');
        res.json(employees);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Get employee by ID (HR Manager only)
exports.getEmployeeById = async (req, res) => {
    try {
        const employee = await User.findById(req.params.id).select('-password');

        if (!employee || employee.role !== 'employee') {
            return res.status(404).json({ msg: 'Employee not found' });
        }

        res.json(employee);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Update employee details (HR Manager only)
exports.updateEmployee = async (req, res) => {
    try {
        // Find employee by ID
        let employee = await User.findById(req.params.id);

        if (!employee || employee.role !== 'employee') {
            return res.status(404).json({ msg: 'Employee not found' });
        }

        // Check if the employee's status is active
        if (employee.status !== 'active') {
            return res.status(400).json({ msg: 'Cannot update an inactive employee profile' });
        }

        // Update fields
        const {
            name,
            email,
            position,
            department,
            phone,
            dob,
            dateOfJoining,
            designation,
            address,
            salary
        } = req.body;

        if (name) employee.name = name;
        if (email) employee.email = email;
        if (position) employee.position = position;
        if (department) employee.department = department;
        if (phone) employee.phone = phone;
        if (dob) employee.dob = dob;
        if (dateOfJoining) employee.dateOfJoining = dateOfJoining;
        if (designation) employee.designation = designation;
        if (address) employee.address = address;
        if (salary) employee.salary = salary;

        // Save updated employee
        await employee.save();

        res.json({ msg: 'Employee details updated', employee });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};



// Mark attendance for an employee (HR Manager only)
exports.markAttendance = async (req, res) => {
    try {
        const { employeeId, status } = req.body;

        // Validate status
        if (!['present', 'absent', 'on leave'].includes(status)) {
            return res.status(400).json({ msg: 'Invalid attendance status' });
        }

        // Check if employee exists
        const employee = await User.findById(employeeId);
        if (!employee || employee.role !== 'employee') {
            return res.status(404).json({ msg: 'Employee not found' });
        }

        // Check if attendance already marked for today
        const today = new Date().setHours(0, 0, 0, 0);
        const existingAttendance = await Attendance.findOne({
            employee: employeeId,
            date: { $gte: today }
        });

        if (existingAttendance) {
            return res.status(400).json({ msg: 'Attendance already marked for today' });
        }

        // Create new attendance record
        const attendance = new Attendance({
            employee: employeeId,
            status
        });

        await attendance.save();

        res.json({ msg: 'Attendance marked', attendance });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Get attendance records for an employee (HR Manager only)
exports.getAttendanceRecords = async (req, res) => {
    try {
        const employeeId = req.params.id;

        // Check if employee exists
        const employee = await User.findById(employeeId);
        if (!employee || employee.role !== 'employee') {
            return res.status(404).json({ msg: 'Employee not found' });
        }

        // Get attendance records
        const attendanceRecords = await Attendance.find({ employee: employeeId }).sort({ date: -1 });

        res.json(attendanceRecords);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Generate monthly attendance for an employee (HR Manager only)
exports.getMonthlyAttendance = async (req, res) => {
    try {
        const { id } = req.params; // Employee ID
        const { month, year } = req.query; // Query parameters

        // Validate query parameters
        if (!month || !year) {
            return res.status(400).json({ msg: 'Please provide both month and year' });
        }

        // Ensure month and year are numbers
        const monthNum = parseInt(month);
        const yearNum = parseInt(year);

        if (isNaN(monthNum) || isNaN(yearNum) || monthNum < 1 || monthNum > 12) {
            return res.status(400).json({ msg: 'Invalid month or year' });
        }

        // Calculate start and end dates for the month
        const startDate = new Date(yearNum, monthNum - 1, 1);
        const endDate = new Date(yearNum, monthNum, 0);

        // Find attendance records for the employee within the given month
        const attendanceRecords = await Attendance.find({
            employee: id,
            date: {
                $gte: startDate,
                $lte: endDate
            }
        }).sort({ date: 1 });

        if (attendanceRecords.length === 0) {
            return res.status(404).json({ msg: 'No attendance records found for this month' });
        }

        // Count the number of each attendance status
        const report = {
            present: 0,
            absent: 0,
            onLeave: 0,
            totalDays: endDate.getDate(),
            attendanceRecords
        };

        attendanceRecords.forEach(record => {
            if (record.status === 'present') report.present += 1;
            if (record.status === 'absent') report.absent += 1;
            if (record.status === 'on leave') report.onLeave += 1;
        });

        res.json(report);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
