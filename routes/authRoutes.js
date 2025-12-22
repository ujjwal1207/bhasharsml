const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  getUsers,
  approveUser,
  rejectUser,
  deleteUser,
  initAdmin
} = require('../controllers/authController');
const { protect, admin } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/init-admin', initAdmin); // Only works if no users exist

// Protected routes (require authentication)
router.get('/me', protect, getMe);

// Admin only routes
router.get('/users', protect, admin, getUsers);
router.put('/users/:id/approve', protect, admin, approveUser);
router.put('/users/:id/reject', protect, admin, rejectUser);
router.delete('/users/:id', protect, admin, deleteUser);

module.exports = router;
