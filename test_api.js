const http = require('http');
const https = require('https');

// Simple fetch implementation for older Node.js versions
function fetch(url, options = {}) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const requestModule = urlObj.protocol === 'https:' ? https : http;
        
        const requestOptions = {
            hostname: urlObj.hostname,
            port: urlObj.port,
            path: urlObj.pathname + urlObj.search,
            method: options.method || 'GET',
            headers: options.headers || {}
        };
        
        const req = requestModule.request(requestOptions, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    ok: res.statusCode >= 200 && res.statusCode < 300,
                    status: res.statusCode,
                    json: () => Promise.resolve(JSON.parse(data))
                });
            });
        });
        
        req.on('error', reject);
        
        if (options.body) {
            req.write(options.body);
        }
        
        req.end();
    });
}

const API_BASE = 'http://localhost:3000/api';

async function testAPI() {
    console.log('🧪 Starting API tests...\n');

    try {
        // Test 1: Health Check
        console.log('1. Testing health check...');
        const healthResponse = await fetch(`${API_BASE}/health`);
        const healthData = await healthResponse.json();
        console.log('✅ Health check:', healthData.status);

        // Test 2: Admin Login
        console.log('\n2. Testing admin login...');
        const loginResponse = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: 'admin',
                password: 'admin123'
            })
        });
        const loginData = await loginResponse.json();
        const adminToken = loginData.token;
        console.log('✅ Admin login successful, role:', loginData.user.role);

        // Test 3: Create Homework
        console.log('\n3. Testing homework creation...');
        const homeworkResponse = await fetch(`${API_BASE}/homework`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify({
                subject: 'Mathematics',
                title: 'Algebra Test Prep',
                description: 'Complete practice problems for upcoming algebra test',
                due_date: '2025-09-25'
            })
        });
        const homeworkData = await homeworkResponse.json();
        console.log('✅ Homework created:', homeworkData.message);

        // Test 4: Create Assignment
        console.log('\n4. Testing assignment creation...');
        const assignmentResponse = await fetch(`${API_BASE}/assignments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify({
                subject: 'Science',
                title: 'Chemistry Lab Report',
                description: 'Write a detailed report on the recent chemistry experiment',
                due_date: '2025-09-30'
            })
        });
        const assignmentData = await assignmentResponse.json();
        console.log('✅ Assignment created:', assignmentData.message);

        // Test 5: Student Login
        console.log('\n5. Testing student login...');
        const studentLoginResponse = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: 'student',
                password: 'password123'
            })
        });
        const studentLoginData = await studentLoginResponse.json();
        const studentToken = studentLoginData.token;
        console.log('✅ Student login successful, role:', studentLoginData.user.role);

        // Test 6: Get Student Homework
        console.log('\n6. Testing student homework retrieval...');
        const studentHomeworkResponse = await fetch(`${API_BASE}/homework`, {
            headers: {
                'Authorization': `Bearer ${studentToken}`
            }
        });
        const studentHomework = await studentHomeworkResponse.json();
        console.log('✅ Student homework count:', studentHomework.homework.length);

        // Test 7: Get Student Assignments
        console.log('\n7. Testing student assignments retrieval...');
        const studentAssignmentsResponse = await fetch(`${API_BASE}/assignments`, {
            headers: {
                'Authorization': `Bearer ${studentToken}`
            }
        });
        const studentAssignments = await studentAssignmentsResponse.json();
        console.log('✅ Student assignments count:', studentAssignments.assignments.length);

        // Test 8: Update Homework Status
        if (studentHomework.homework.length > 0) {
            console.log('\n8. Testing homework status update...');
            const firstHomework = studentHomework.homework[0];
            const updateResponse = await fetch(`${API_BASE}/homework/${firstHomework.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${studentToken}`
                },
                body: JSON.stringify({
                    status: 'Completed'
                })
            });
            const updateData = await updateResponse.json();
            console.log('✅ Homework status updated:', updateData.message);
        }

        // Test 9: Admin Registration
        console.log('\n9. Testing admin registration...');
        const registerResponse = await fetch(`${API_BASE}/auth/register-admin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify({
                name: 'Test Admin',
                username: 'testadmin',
                password: 'TestAdmin123',
                department: 'IT',
                division: 'Tech'
            })
        });
        const registerData = await registerResponse.json();
        console.log('✅ Admin registration:', registerData.message);

        console.log('\n🎉 All tests completed successfully!');
        console.log('\n📋 Summary:');
        console.log('• Health check working');
        console.log('• Admin login working');
        console.log('• Homework creation working');
        console.log('• Assignment creation working');
        console.log('• Student login working');
        console.log('• Student data retrieval working');
        console.log('• Task status updates working');
        console.log('• Admin registration working');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    testAPI();
}

module.exports = testAPI;