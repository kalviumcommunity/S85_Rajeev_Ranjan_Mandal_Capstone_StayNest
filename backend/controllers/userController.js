const User = require('../models/User');

// Register a new user
const register = async (req, res) => {
    try {
        const { name, email, password, role, phone } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user
        const user = new User({
            name,
            email,
            password,
            role,
            phone
        });

        await user.save();

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(201).json({
            message: 'User registered successfully',
            user: userResponse
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error registering user',
            error: error.message
        });
    }
};

module.exports = {
    register
}; 