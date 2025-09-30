const bcrypt = require('bcryptjs');
const db = require('../models/database');
require('dotenv').config();

async function initializeDatabase() {
    try {
        console.log('Initializing database...');
        
        // Connect to database
        await db.connect();
        
        // Create tables
        await db.createTables();
        console.log('Database tables created successfully');

        // Hash passwords
        const adminPassword = await bcrypt.hash(process.env.DEFAULT_ADMIN_PASSWORD || 'admin123', 12);
        const studentPassword = await bcrypt.hash(process.env.DEFAULT_STUDENT_PASSWORD || 'password123', 12);

        // Insert default admin user
        try {
            await db.run(`
                INSERT OR IGNORE INTO users (
                    name, username, password, role, student_id, department, division, semester, 
                    emergency_contact_name, emergency_contact_relationship, emergency_contact_phone, avatar_url
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                'Admin User', 
                process.env.DEFAULT_ADMIN_USERNAME || 'admin', 
                adminPassword,
                'admin',
                null, // admin doesn't have student_id
                'Administration',
                'Admin',
                'N/A',
                null,
                null,
                null,
                'https://placehold.co/256x256/E0F2FE/0891B2?text=A'
            ]);
            console.log('Default admin user created');
        } catch (err) {
            if (!err.message.includes('UNIQUE constraint failed')) {
                throw err;
            }
            console.log('Default admin user already exists');
        }

        // Insert default student user
        try {
            await db.run(`
                INSERT OR IGNORE INTO users (
                    name, username, password, role, student_id, department, division, semester,
                    emergency_contact_name, emergency_contact_relationship, emergency_contact_phone, avatar_url
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                'Student User',
                process.env.DEFAULT_STUDENT_USERNAME || 'student',
                studentPassword,
                'student',
                'STU-12345',
                'Computer Science',
                'A',
                '5th',
                'Emergency Contact',
                'Mother',
                '+1 (555) 123-4567',
                'https://placehold.co/256x256/E0F2FE/0891B2?text=S'
            ]);
            console.log('Default student user created');
        } catch (err) {
            if (!err.message.includes('UNIQUE constraint failed')) {
                throw err;
            }
            console.log('Default student user already exists');
        }

        // Get student user ID for assigning homework and assignments
        const studentUser = await db.get('SELECT id FROM users WHERE role = ?', ['student']);
        const adminUser = await db.get('SELECT id FROM users WHERE role = ?', ['admin']);

        if (studentUser && adminUser) {
            // Insert sample homework
            const homeworkData = [
                {
                    subject: 'Math',
                    title: 'Calculus Problems',
                    description: 'Complete exercises 5.1 to 5.3 in the textbook.',
                    due_date: '2025-09-15',
                    status: 'Pending'
                },
                {
                    subject: 'Science',
                    title: 'Photosynthesis Paper',
                    description: 'Write a 2-page research paper on the importance of photosynthesis.',
                    due_date: '2025-09-19',
                    status: 'Pending'
                },
                {
                    subject: 'History',
                    title: 'Chapter 10 Notes',
                    description: 'Read Chapter 10 on the Renaissance and summarize key points.',
                    due_date: '2025-09-22',
                    status: 'Completed'
                },
                {
                    subject: 'English',
                    title: 'Poetry Analysis',
                    description: 'Analyze the use of metaphors in Robert Frost\'s "The Road Not Taken".',
                    due_date: '2025-09-17',
                    status: 'Pending'
                }
            ];

            for (const hw of homeworkData) {
                try {
                    await db.run(`
                        INSERT OR IGNORE INTO homework (subject, title, description, due_date, status, created_by, assigned_to)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    `, [hw.subject, hw.title, hw.description, hw.due_date, hw.status, adminUser.id, studentUser.id]);
                } catch (err) {
                    console.log('Homework already exists or error:', err.message);
                }
            }

            // Insert sample assignments
            const assignmentData = [
                {
                    subject: 'History',
                    title: 'World War I Presentation',
                    description: 'Prepare a 15-minute group presentation on the causes of WWI.',
                    due_date: '2025-10-10',
                    status: 'Pending'
                },
                {
                    subject: 'English',
                    title: '1984 Essay',
                    description: 'Write a 1500-word critical analysis of George Orwell\'s "1984".',
                    due_date: '2025-10-01',
                    status: 'Pending'
                },
                {
                    subject: 'Science',
                    title: 'Lab Report',
                    description: 'Submit the final lab report for the chemistry experiment conducted last week.',
                    due_date: '2025-09-25',
                    status: 'Completed'
                }
            ];

            for (const assignment of assignmentData) {
                try {
                    await db.run(`
                        INSERT OR IGNORE INTO assignments (subject, title, description, due_date, status, created_by, assigned_to)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    `, [assignment.subject, assignment.title, assignment.description, assignment.due_date, assignment.status, adminUser.id, studentUser.id]);
                } catch (err) {
                    console.log('Assignment already exists or error:', err.message);
                }
            }

            console.log('Sample homework and assignments created');
        }

        console.log('Database initialization completed successfully!');
        console.log('You can now start the server with: npm start');
        
    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1);
    } finally {
        db.close();
    }
}

// Run initialization if this script is executed directly
if (require.main === module) {
    initializeDatabase();
}

module.exports = initializeDatabase;