const { validationResult } = require('express-validator');
const db = require('../models/database');

// Get all assignments for a student
const getAssignments = async (req, res) => {
    try {
        let assignments;
        
        if (req.user.role === 'admin') {
            // Admin can see all assignments
            assignments = await db.all(`
                SELECT a.*, u.name as assigned_to_name, u.username as assigned_to_username
                FROM assignments a
                LEFT JOIN users u ON a.assigned_to = u.id
                ORDER BY a.due_date ASC, a.created_at DESC
            `);
        } else {
            // Students can see assignments assigned directly to them OR global (unassigned) ones
            assignments = await db.all(`
                SELECT a.*, u.name as assigned_to_name, u.username as assigned_to_username
                FROM assignments a
                LEFT JOIN users u ON a.assigned_to = u.id
                WHERE a.assigned_to = ? OR a.assigned_to IS NULL
                ORDER BY a.due_date ASC, a.created_at DESC
            `, [req.user.id]);
        }

        res.json({ assignments });
    } catch (error) {
        console.error('Get assignments error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get assignment by ID
const getAssignmentById = async (req, res) => {
    try {
        const { id } = req.params;
        let query = `
            SELECT a.*, u.name as assigned_to_name, u.username as assigned_to_username
            FROM assignments a
            LEFT JOIN users u ON a.assigned_to = u.id
            WHERE a.id = ?
        `;
        let params = [id];

        // If student, make sure they can only access their own assignments or global ones
        if (req.user.role === 'student') {
            query += ' AND (a.assigned_to = ? OR a.assigned_to IS NULL)';
            params.push(req.user.id);
        }

        const assignment = await db.get(query, params);

        if (!assignment) {
            return res.status(404).json({ error: 'Assignment not found' });
        }

        res.json({ assignment });
    } catch (error) {
        console.error('Get assignment by ID error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Create new assignment (admin only)
const createAssignment = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: 'Validation failed', details: errors.array() });
        }

        const { subject, title, description, due_date, assigned_to } = req.body;

        // If no assigned_to is provided, treat as a global assignment visible to all students (assigned_to = NULL)
        let targetStudentId = assigned_to ?? null;

        // If assigned_to is provided, verify the user exists and is a student
        if (targetStudentId !== null) {
            const assignedUser = await db.get('SELECT id FROM users WHERE id = ? AND role = ?', [targetStudentId, 'student']);
            if (!assignedUser) {
                return res.status(400).json({ error: 'Invalid student ID for assignment' });
            }
        }

        const result = await db.run(`
            INSERT INTO assignments (subject, title, description, due_date, created_by, assigned_to)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [subject, title, description, due_date, req.user.id, targetStudentId]);

        const assignment = await db.get(`
            SELECT a.*, u.name as assigned_to_name, u.username as assigned_to_username
            FROM assignments a
            LEFT JOIN users u ON a.assigned_to = u.id
            WHERE a.id = ?
        `, [result.id]);

        res.status(201).json({ 
            message: 'Assignment created successfully',
            assignment 
        });
    } catch (error) {
        console.error('Create assignment error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Update assignment
const updateAssignment = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: 'Validation failed', details: errors.array() });
        }

        const { id } = req.params;
        const { subject, title, description, due_date, status, assigned_to } = req.body;

        // Check if assignment exists and user has permission to modify it
        let assignment = await db.get('SELECT * FROM assignments WHERE id = ?', [id]);
        if (!assignment) {
            return res.status(404).json({ error: 'Assignment not found' });
        }

        // Students are not allowed to update assignments (admin only)
        if (req.user.role === 'student') {
            return res.status(403).json({ error: 'Only administrators can update assignments' });
        } else {
            // Admin can update everything
            if (assigned_to && assigned_to !== assignment.assigned_to) {
                const assignedUser = await db.get('SELECT id FROM users WHERE id = ? AND role = ?', [assigned_to, 'student']);
                if (!assignedUser) {
                    return res.status(400).json({ error: 'Invalid student ID for assignment' });
                }
            }

            await db.run(`
                UPDATE assignments SET 
                    subject = ?, title = ?, description = ?, due_date = ?, status = ?, assigned_to = ?,
                    updated_at = CURRENT_TIMESTAMP 
                WHERE id = ?
            `, [
                subject || assignment.subject,
                title || assignment.title,
                description || assignment.description,
                due_date || assignment.due_date,
                status || assignment.status,
                assigned_to !== undefined ? assigned_to : assignment.assigned_to,
                id
            ]);
        }

        // Get updated assignment
        const updatedAssignment = await db.get(`
            SELECT a.*, u.name as assigned_to_name, u.username as assigned_to_username
            FROM assignments a
            LEFT JOIN users u ON a.assigned_to = u.id
            WHERE a.id = ?
        `, [id]);

        res.json({ 
            message: 'Assignment updated successfully',
            assignment: updatedAssignment 
        });
    } catch (error) {
        console.error('Update assignment error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Delete assignment (admin only)
const deleteAssignment = async (req, res) => {
    try {
        const { id } = req.params;

        const assignment = await db.get('SELECT * FROM assignments WHERE id = ?', [id]);
        if (!assignment) {
            return res.status(404).json({ error: 'Assignment not found' });
        }

        await db.run('DELETE FROM assignments WHERE id = ?', [id]);

        res.json({ message: 'Assignment deleted successfully' });
    } catch (error) {
        console.error('Delete assignment error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getAssignments,
    getAssignmentById,
    createAssignment,
    updateAssignment,
    deleteAssignment
};