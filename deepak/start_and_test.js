const { spawn, exec } = require('child_process');
const path = require('path');

console.log('🚀 Starting Student Portal System...\n');

// Start the server
const serverProcess = spawn('node', ['server.js'], {
    cwd: __dirname,
    stdio: 'inherit'
});

// Wait for server to start, then run tests
setTimeout(async () => {
    console.log('\n⏳ Server should be running, starting tests...\n');
    
    try {
        // Run API tests
        const testAPI = require('./test_api.js');
        await testAPI();
        
        console.log('\n🌐 Server URLs:');
        console.log('📚 Student Portal: http://localhost:3000/student');
        console.log('🔧 Admin Portal:   http://localhost:3000/admin');
        console.log('❤️  API Health:    http://localhost:3000/api/health');
        
        console.log('\n🔑 Login Credentials:');
        console.log('👨‍🎓 Student: username = student, password = password123');
        console.log('👨‍💼 Admin:   username = admin,   password = admin123');
        
        console.log('\n✨ Features Available:');
        console.log('• Admin can create homework and assignments');
        console.log('• Students can see all assigned tasks');
        console.log('• Students can mark tasks as Completed/Pending');
        console.log('• Admin can register new admin accounts');
        console.log('• Real-time updates between admin and student portals');
        console.log('• Secure JWT authentication');
        console.log('• Role-based access control');
        
        console.log('\n💡 How to test:');
        console.log('1. Open Admin Portal: http://localhost:3000/admin');
        console.log('2. Login with admin credentials');
        console.log('3. Create new homework/assignments');
        console.log('4. Open Student Portal: http://localhost:3000/student');
        console.log('5. Login with student credentials');
        console.log('6. See the newly created tasks');
        console.log('7. Click status buttons to mark as completed/pending');
        
        console.log('\n🔄 To stop the server, press Ctrl+C');
        
    } catch (error) {
        console.error('❌ Tests failed:', error.message);
    }
}, 2000);

// Handle process termination
process.on('SIGINT', () => {
    console.log('\\n🛑 Shutting down...');
    serverProcess.kill('SIGINT');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\\n🛑 Shutting down...');
    serverProcess.kill('SIGTERM');
    process.exit(0);
});