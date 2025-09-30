const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const db = require('../models/database');

// Login user
const login = async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: 'Validation failed', details: errors.array() });
        }

        const { username, password } = req.body;

        // Find user by username
        const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        // Save token to sessions table
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours from now
        
        await db.run(
            'INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)',
            [user.id, token, expiresAt.toISOString()]
        );

        // Remove password from user data before sending
        const { password: _, ...userWithoutPassword } = user;

        res.json({
            message: 'Login successful',
            user: userWithoutPassword,
            token
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Logout user
const logout = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            // Remove token from sessions table
            await db.run('DELETE FROM sessions WHERE token = ?', [token]);
        }

        res.json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get current user profile
const getProfile = async (req, res) => {
    try {
        const user = await db.get(`
            SELECT id, name, username, role, student_id, department, division, semester,
                   emergency_contact_name, emergency_contact_relationship, emergency_contact_phone,
                   avatar_url, created_at
            FROM users WHERE id = ?
        `, [req.user.id]);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update user profile
const updateProfile = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: 'Validation failed', details: errors.array() });
        }

        const {
            name,
            department,
            division,
            semester,
            emergency_contact_name,
            emergency_contact_relationship,
            emergency_contact_phone
        } = req.body;

        // Only update fields that are provided and not empty
        const updateFields = [];
        const updateValues = [];
        
        if (name && name.trim() !== '') {
            updateFields.push('name = ?');
            updateValues.push(name.trim());
        }
        if (department && department.trim() !== '') {
            updateFields.push('department = ?');
            updateValues.push(department.trim());
        }
        if (division && division.trim() !== '') {
            updateFields.push('division = ?');
            updateValues.push(division.trim());
        }
        if (semester && semester.trim() !== '') {
            updateFields.push('semester = ?');
            updateValues.push(semester.trim());
        }
        if (emergency_contact_name && emergency_contact_name.trim() !== '') {
            updateFields.push('emergency_contact_name = ?');
            updateValues.push(emergency_contact_name.trim());
        }
        if (emergency_contact_relationship && emergency_contact_relationship.trim() !== '') {
            updateFields.push('emergency_contact_relationship = ?');
            updateValues.push(emergency_contact_relationship.trim());
        }
        if (emergency_contact_phone && emergency_contact_phone.trim() !== '') {
            updateFields.push('emergency_contact_phone = ?');
            updateValues.push(emergency_contact_phone.trim());
        }
        
        if (updateFields.length === 0) {
            return res.status(400).json({ error: 'No valid fields to update' });
        }
        
        updateFields.push('updated_at = CURRENT_TIMESTAMP');
        updateValues.push(req.user.id);

        await db.run(`
            UPDATE users SET 
                ${updateFields.join(', ')}
            WHERE id = ?
        `, updateValues);

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Change password
const changePassword = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: 'Validation failed', details: errors.array() });
        }

        const { currentPassword, newPassword } = req.body;

        // Get current user's password
        const user = await db.get('SELECT password FROM users WHERE id = ?', [req.user.id]);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }

        // Hash new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 12);

        // Update password
        await db.run('UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', 
            [hashedNewPassword, req.user.id]);

        // Invalidate all existing sessions for this user
        await db.run('DELETE FROM sessions WHERE user_id = ?', [req.user.id]);

        res.json({ message: 'Password changed successfully. Please login again.' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Internal server error' });
    };
};

// Register new student (public)
const registerStudent = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: 'Validation failed', details: errors.array() });
        }

        const { name, username, password, student_id, department, division, semester } = req.body;

        // Check if username already exists
        const existingUser = await db.get('SELECT id FROM users WHERE username = ?', [username]);
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        // Check if student_id already exists (if provided)
        if (student_id) {
            const existingStudentId = await db.get('SELECT id FROM users WHERE student_id = ?', [student_id]);
            if (existingStudentId) {
                return res.status(400).json({ error: 'Student ID already exists' });
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Generate student ID if not provided
        const finalStudentId = student_id || `STU-${Date.now().toString().slice(-8)}`;

        // Create new student user
        const result = await db.run(`
            INSERT INTO users (
                name, username, password, role, student_id, department, division, semester,
                avatar_url, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `, [
            name, username, hashedPassword, 'student', 
            finalStudentId,
            department || 'General Studies', 
            division || 'A', 
            semester || '1st',
            `https://placehold.co/256x256/E0F2FE/0891B2?text=${name.charAt(0).toUpperCase()}`
        ]);

        res.status(201).json({ 
            message: 'Student registered successfully',
            user: {
                id: result.id,
                name,
                username,
                role: 'student',
                student_id: finalStudentId
            }
        });
    } catch (error) {
        console.error('Register student error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Register new admin (admin only)
const registerAdmin = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: 'Validation failed', details: errors.array() });
        }

        const { name, username, password, department, division } = req.body;

        // Check if username already exists
        const existingUser = await db.get('SELECT id FROM users WHERE username = ?', [username]);
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create new admin user
        const result = await db.run(`
            INSERT INTO users (
                name, username, password, role, department, division, semester,
                avatar_url, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `, [
            name, username, hashedPassword, 'admin', 
            department || 'Administration', 
            division || 'Admin', 
            'N/A',
            `https://placehold.co/256x256/E0F2FE/0891B2?text=${name.charAt(0).toUpperCase()}`
        ]);

        res.status(201).json({ 
            message: 'Admin registered successfully',
            user: {
                id: result.id,
                name,
                username,
                role: 'admin'
            }
        });
    } catch (error) {
        console.error('Register admin error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    login,
    logout,
    getProfile,
    updateProfile,
    changePassword,
    registerStudent,
    registerAdmin
};
