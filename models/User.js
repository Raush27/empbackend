const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["employee", "hr_manager"], // Define roles here
        default: "employee",
    },
    date: {
        type: Date,
        default: Date.now,
    },

    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: "employee",
    },
    position: {
        type: String,
    },
    department: {
        type: String,
    },
    phone: {
        type: String,
    },
    dob: {
        type: Date,
    },
    dateOfJoining: {
        type: Date,
    },
    designation: {
        type: String,
    },
    address: {
        type: String,
    },
    salary: {
        type: Number,
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active",
    },
});

// Hash the password before saving the user
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare the password for login
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
