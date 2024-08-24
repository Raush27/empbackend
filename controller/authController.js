const User = require("../models/User");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

// Register a new user
exports.register = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        let user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({ msg: "User already exists" });
        }

        user = new User({
            name,
            email,
            password,
            role: role
        });

        await user.save();

        const payload = {
            user: {
                id: user.id,
                role: user.role, // Include role in payload
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: "1h" },
            (err, token) => {
                if (err) throw err;
                res.json({ token,user});
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
};

// Login a user
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });

        // Check if user exists
        if (!user) {
            return res.status(400).json({ status: 'error', message: "Invalid Credentials" });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ status: 'error', message: "Invalid Credentials" });
        }

        // Prepare payload with user details excluding password
        const payload = {
            user: {
                id: user.id,
                role: user.role, // Include role in payload
            },
        };

        // Generate JWT token
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: "1h" },
            (err, token) => {
                if (err) throw err;

                // Remove password before sending user data
                const userWithoutPassword = {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                };

                res.status(200).json({ status: true, token, user: userWithoutPassword });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ status: 'error', message: "Server error" });
    }
};


// Get the authenticated user's data
exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
};
