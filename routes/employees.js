const express = require("express");
const router = express.Router();
const {
    getAllEmployees,
    getEmployeeById,
    updateEmployee,
    markAttendance,
    getAttendanceRecords,
} = require("../controller/employeeController");
const auth = require("../middleware/auth");
const role = require("../middleware/role");
const {
    requestLeave,
    updateLeaveStatus,
    getLeaveRequests,
} = require("Backend-app/controller/leaveController");

// @route   GET api/employees
// @desc    Get all employees
// @access  Private (HR Manager only)
router.get("/", auth, role("hr_manager"), getAllEmployees);

// @route   GET api/employees/:id
// @desc    Get employee by ID
// @access  Private (HR Manager only)
router.get("/:id", auth, role("hr_manager"), getEmployeeById);
router.put("/:id", auth, role("hr_manager"), updateEmployee);

// Attendance routes
router.post("/attendance", markAttendance);
router.get("/:id/attendance", getAttendanceRecords);
router.get("/:id/attendance/monthly", getMonthlyAttendance);

// Leave routes
router.post("/request", requestLeave); // Employee requests leave
router.put("/:id/status", updateLeaveStatus); // HR Manager updates leave status
router.get("/:employeeId", getLeaveRequests); // Get leave requests for an employee

module.exports = router;
