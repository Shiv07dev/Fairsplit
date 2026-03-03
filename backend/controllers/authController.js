const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const db = require('../config/db');

// Register new user
const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { name, email, password } = req.body;

  try {
    // Check if user exists
    const [existingUsers] = await db.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already registered. Please login.' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(password, salt);

    // Generate avatar URL using initials
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const avatarColors = ['6366f1', '8b5cf6', 'ec4899', 'f59e0b', '10b981', '3b82f6'];
    const colorIndex = name.charCodeAt(0) % avatarColors.length;
    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${avatarColors[colorIndex]}&color=fff&size=200&bold=true`;

    // Insert user
    const [result] = await db.execute(
      'INSERT INTO users (name, email, password_hash, avatar) VALUES (?, ?, ?, ?)',
      [name, email, password_hash, avatar]
    );

    // Generate JWT
    const token = jwt.sign(
      { id: result.insertId, email, name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to FairSplit! 🎉',
      token,
      user: {
        id: result.insertId,
        name,
        email,
        avatar
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// Login
const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const [users] = await db.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password.' 
      });
    }

    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password.' 
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.json({
      success: true,
      message: `Welcome back, ${user.name}! 👋`,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        phone: user.phone,
        currency: user.currency,
        dark_mode: user.dark_mode
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const [users] = await db.execute(
      'SELECT id, name, email, avatar, bio, phone, currency, dark_mode, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.json({ success: true, user: users[0] });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Update profile
const updateProfile = async (req, res) => {
  const { name, bio, phone, currency, dark_mode } = req.body;
  
  try {
    let avatarUrl = undefined;
    if (req.file) {
      avatarUrl = `/uploads/${req.file.filename}`;
    }

    const updateFields = [];
    const updateValues = [];

    if (name) { updateFields.push('name = ?'); updateValues.push(name); }
    if (bio !== undefined) { updateFields.push('bio = ?'); updateValues.push(bio); }
    if (phone !== undefined) { updateFields.push('phone = ?'); updateValues.push(phone); }
    if (currency) { updateFields.push('currency = ?'); updateValues.push(currency); }
    if (dark_mode !== undefined) { updateFields.push('dark_mode = ?'); updateValues.push(dark_mode); }
    if (avatarUrl) { updateFields.push('avatar = ?'); updateValues.push(avatarUrl); }

    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update.' });
    }

    updateValues.push(req.user.id);
    await db.execute(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    const [users] = await db.execute(
      'SELECT id, name, email, avatar, bio, phone, currency, dark_mode, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    return res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: users[0]
    });

  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Change password
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const [users] = await db.execute('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
    
    if (!users.length) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isValid = await bcrypt.compare(currentPassword, users[0].password_hash);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    const salt = await bcrypt.genSalt(12);
    const newHash = await bcrypt.hash(newPassword, salt);
    
    await db.execute('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, req.user.id]);

    return res.json({ success: true, message: 'Password changed successfully!' });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { register, login, getProfile, updateProfile, changePassword };
