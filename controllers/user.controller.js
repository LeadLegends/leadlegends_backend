import User from '../models/user.model.js';
import sendEmail from '../utils/sendEmail.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Admin / Manager
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  Admin / Manager
 */
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user (role, status)
 * @route   PUT /api/users/:id
 * @access  Admin
 */
export const updateUser = async (req, res, next) => {
  try {
    const { role, status, name, phone } = req.body;

    // Validate role
    const allowedRoles = ['admin', 'manager', 'sales'];
    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    // Validate status
    const allowedStatus = ['active', 'inactive'];
    if (status && !allowedStatus.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { role, status, name, phone },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) return res.status(404).json({ success: false, message: 'User not found' });

    res.status(200).json({ success: true, message: 'User updated successfully', data: updatedUser });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Admin
 */
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    await user.deleteOne();

    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Resend password setup email
 * @route   POST /api/users/:id/send-password
 * @access  Admin
 */
export const resendPasswordEmail = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Generate password reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = Date.now() + 24 * 60 * 60 * 1000; // 24h
    await user.save({ validateBeforeSave: false });

    const resetURL = `${process.env.CLIENT_URL}/set-password?token=${resetToken}&email=${user.email}`;
    const message = `Hello ${user.name},\n\nPlease set your password by clicking the link below:\n\n${resetURL}\n\nLink valid for 24 hours.`;

    await sendEmail({ email: user.email, subject: 'Set Your Password', message });

    res.status(200).json({ success: true, message: 'Password setup email sent', data: user });
  } catch (error) {
    next(error);
  }
};