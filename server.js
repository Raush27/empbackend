const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./db/db');
const cors = require('cors');

// Load environment variables
dotenv.config();

// Connect to the database
connectDB();

const app = express();

// Middleware to parse JSON
app.use(express.json());
app.use(cors());


// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/employees', require('./routes/employees'));

const PORT = process.env.PORT || 8800;

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
