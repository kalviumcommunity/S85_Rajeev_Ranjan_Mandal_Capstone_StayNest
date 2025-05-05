const express = require('express');
const router = express.Router();
const { register, getAllUsers, getUserById, updateUser } = require('../controllers/userController');

// Register a new user
router.post('/register', register);

// Get all users
router.get('/', getAllUsers);

// Get user by ID
router.get('/:id', getUserById);

// Update user by ID
router.put('/:id', updateUser);

module.exports = router; 