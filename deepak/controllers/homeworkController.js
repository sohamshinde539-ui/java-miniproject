const { validationResult } = require('express-validator');
const db = require('../models/database');

// Get all homework for a student
const getHomework = async (req, res) => {
    try {
        let homework;
        
        if (req.user.role === 'admin') {
            // Admin can see all homework
            homework = await db.all(`
                SELECT h.*, u.name as assigned_to_name, u.username as assigned_to_username
                FROM homework h
                LEFT JOIN users u ON h.assigned_to = u.id
                ORDER BY h.due_date ASC, h.created_at DESC
            `);
        } else {
            // Students can see homework assigned directly to them OR global (unassigned) ones
            homework = await db.all(`
                SELECT h.*, u.name as assigned_to_name, u.username as assigned_to_username
                FROM homework h
                LEFT JOIN users u ON h.assigned_to = u.id
                WHERE h.assigned_to = ? OR h.assigned_to IS NULL
                ORDER BY h.due_date ASC, h.created_at DESC
            `, [req.user.id]);
        }

        res.json({ homework });
    } catch (error) {
        console.error('Get homework error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get homework by ID
const getHomeworkById = async (req, res) => {
    try {
        const { id } = req.params;
        let query = `
            SELECT h.*, u.name as assigned_to_name, u.username as assigned_to_username
            FROM homework h
            LEFT JOIN users u ON h.assigned_to = u.id
            WHERE h.id = ?
        `;
        let params = [id];

        // If student, make sure they can only access their own homework or global ones
        if (req.user.role === 'student') {
            query += ' AND (h.assigned_to = ? OR h.assigned_to IS NULL)';
            params.push(req.user.id);
        }

        const homework = await db.get(query, params);

        if (!homework) {
            return res.status(404).json({ error: 'Homework not found' });
        }

        res.json({ homework });
    } catch (error) {
        console.error('Get homework by ID error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Create new homework (admin only)
const createHomework = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: 'Validation failed', details: errors.array() });
        }

        const { subject, title, description, due_date, assigned_to } = req.body;

        // If no assigned_to is provided, treat as a global homework visible to all students (assigned_to = NULL)
        let targetStudentId = assigned_to ?? null;

        // If assigned_to is provided, verify the user exists and is a student
        if (targetStudentId !== null) {
            const assignedUser = await db.get('SELECT id FROM users WHERE id = ? AND role = ?', [targetStudentId, 'student']);
            if (!assignedUser) {
                return res.status(400).json({ error: 'Invalid student ID for assignment' });
            }
        }

        const result = await db.run(`
            INSERT INTO homework (subject, title, description, due_date, created_by, assigned_to)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [subject, title, description, due_date, req.user.id, targetStudentId]);

        const homework = await db.get(`
            SELECT h.*, u.name as assigned_to_name, u.username as assigned_to_username
            FROM homework h
            LEFT JOIN users u ON h.assigned_to = u.id
            WHERE h.id = ?
        `, [result.id]);

        res.status(201).json({ 
            message: 'Homework created successfully',
            homework 
        });
    } catch (error) {
        console.error('Create homework error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update homework
const updateHomework = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: 'Validation failed', details: errors.array() });
        }

        const { id } = req.params;
        const { subject, title, description, due_date, status, assigned_to } = req.body;

        // Check if homework exists and user has permission to modify it
        let homework = await db.get('SELECT * FROM homework WHERE id = ?', [id]);
        if (!homework) {
            return res.status(404).json({ error: 'Homework not found' });
        }

        // Students are not allowed to update homework (admin only)
        if (req.user.role === 'student') {
            return res.status(403).json({ error: 'Only administrators can update homework' });
        } else {
            // Admin can update everything
            if (assigned_to && assigned_to !== homework.assigned_to) {
                const assignedUser = await db.get('SELECT id FROM users WHERE id = ? AND role = ?', [assigned_to, 'student']);
                if (!assignedUser) {
                    return res.status(400).json({ error: 'Invalid student ID for assignment' });
                }
            }

            await db.run(`
                UPDATE homework SET 
                    subject = ?, title = ?, description = ?, due_date = ?, status = ?, assigned_to = ?,
                    updated_at = CURRENT_TIMESTAMP 
                WHERE id = ?
            `, [
                subject || homework.subject,
                title || homework.title,
                description || homework.description,
                due_date || homework.due_date,
                status || homework.status,
                assigned_to !== undefined ? assigned_to : homework.assigned_to,
                id
            ]);
        }

        // Get updated homework
        const updatedHomework = await db.get(`
            SELECT h.*, u.name as assigned_to_name, u.username as assigned_to_username
            FROM homework h
            LEFT JOIN users u ON h.assigned_to = u.id
            WHERE h.id = ?
        `, [id]);

        res.json({ 
            message: 'Homework updated successfully',
            homework: updatedHomework 
        });
    } catch (error) {
        console.error('Update homework error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Delete homework (admin only)
const deleteHomework = async (req, res) => {
    try {
        const { id } = req.params;

        const homework = await db.get('SELECT * FROM homework WHERE id = ?', [id]);
        if (!homework) {
            return res.status(404).json({ error: 'Homework not found' });
        }

        await db.run('DELETE FROM homework WHERE id = ?', [id]);

        res.json({ message: 'Homework deleted successfully' });
    } catch (error) {
        console.error('Delete homework error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getHomework,
    getHomeworkById,
    createHomework,
    updateHomework,
    deleteHomework
};