const Leave = require('../models/Leave');
const User = require('../models/User');

// Employee requests leave
exports.requestLeave = async (req, res) => {
    try {
        const { employeeId, leaveType, startDate, endDate, reason } = req.body;

        // Validate dates
        if (new Date(startDate) > new Date(endDate)) {
            return res.status(400).json({ msg: 'Start date cannot be later than end date' });
        }

        // Check if employee exists
        const employee = await User.findById(employeeId);
        if (!employee || employee.role !== 'employee') {
            return res.status(404).json({ msg: 'Employee not found' });
        }

        // Create leave request
        const leaveRequest = new Leave({
            employee: employeeId,
            leaveType,
            startDate,
            endDate,
            reason
        });

        await leaveRequest.save();

        res.json({ msg: 'Leave request submitted', leaveRequest });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// HR Manager approves/rejects leave request
exports.updateLeaveStatus = async (req, res) => {
    try {
        const { status } = req.body; // 'approved' or 'rejected'

        // Validate status
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ msg: 'Invalid status' });
        }

        // Find leave request by ID
        const leaveRequest = await Leave.findById(req.params.id);

        if (!leaveRequest) {
            return res.status(404).json({ msg: 'Leave request not found' });
        }

        // Update status
        leaveRequest.status = status;
        await leaveRequest.save();

        res.json({ msg: `Leave request ${status}`, leaveRequest });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Get leave requests for an employee
exports.getLeaveRequests = async (req, res) => {
    try {
        const leaveRequests = await Leave.find({ employee: req.params.employeeId }).sort({ startDate: -1 });

        if (leaveRequests.length === 0) {
            return res.status(404).json({ msg: 'No leave requests found' });
        }

        res.json(leaveRequests);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
