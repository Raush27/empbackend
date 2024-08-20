const { register, login, getUser } = require('../controller/authController');
const express = require('express');
const router = express.Router();
const role = require('../middleware/role');
const auth = require('../middleware/auth');


// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', register);

// @route   POST api/auth/login
// @desc    Login user & get token
// @access  Public
router.post('/login', login);

// @route   GET api/auth/user
// @desc    Get logged in user
// @access  Private
router.get('/user', auth, getUser);

// @route   GET api/auth/admin
// @desc    Admin only route
// @access  Private (Admin only)
router.get('/admin', auth, role('admin'), (req, res) => {
    res.send('Admin content');
});

module.exports = router;
