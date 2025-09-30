# Quick Start Guide

This guide will help you get the Student Portal application running on your system.

## Step 1: Install Node.js

Since Node.js is not currently installed on your system, you'll need to install it first:

### For Windows:
1. Go to [nodejs.org](https://nodejs.org/)
2. Download the LTS version (Long Term Support)
3. Run the installer and follow the setup wizard
4. Restart your terminal/PowerShell after installation

### Verify Installation:
Open a new terminal/PowerShell and run:
```bash
node --version
npm --version
```

Both commands should return version numbers.

## Step 2: Install Project Dependencies

In your project directory (`C:\Users\DELL\OneDrive\Desktop\dkk`), run:

```bash
npm install
```

This will install all the required packages.

## Step 3: Initialize the Database

Run the database initialization script:

```bash
npm run init-db
```

This will create the SQLite database and add sample data.

## Step 4: Start the Server

Start the application server:

```bash
npm start
```

You should see output like:
```
🚀 Server running on http://localhost:3000
📚 Student Portal: http://localhost:3000/student
🔧 Admin Portal: http://localhost:3000/admin
❤️  API Health: http://localhost:3000/api/health

Default credentials:
👨‍🎓 Student - Username: student, Password: password123
👨‍💼 Admin - Username: admin, Password: admin123
```

## Step 5: Access the Application

Open your web browser and go to:

- **Student Portal**: [http://localhost:3000/student](http://localhost:3000/student)
- **Admin Portal**: [http://localhost:3000/admin](http://localhost:3000/admin)

## Login Credentials

### For Students:
- **Username**: `student`
- **Password**: `password123`

### For Administrators:
- **Username**: `admin`
- **Password**: `admin123`

## Testing the Application

1. **Test Student Portal**:
   - Open http://localhost:3000/student
   - Login with student credentials
   - View homework and assignments
   - Mark tasks as completed

2. **Test Admin Portal**:
   - Open http://localhost:3000/admin
   - Login with admin credentials
   - Create new homework and assignments
   - View all student tasks

## What You've Built

🎉 **Congratulations!** You now have a fully functional student management system with:

✅ **Secure Authentication** - JWT-based login system
✅ **Role-Based Access** - Separate portals for students and admins
✅ **Database Integration** - SQLite database with proper relationships
✅ **RESTful API** - Complete backend API with CRUD operations
✅ **Responsive Design** - Works on desktop and mobile devices
✅ **Real-time Updates** - Changes reflect immediately across portals

## Next Steps

- Customize the design and styling
- Add more user roles (teachers, parents)
- Implement file uploads for assignments
- Add email notifications
- Create reporting and analytics features
- Deploy to a cloud server

## Need Help?

If you encounter any issues:

1. Check that Node.js is properly installed
2. Make sure all dependencies are installed (`npm install`)
3. Verify the database was initialized (`npm run init-db`)
4. Check the server console for error messages
5. Refer to the detailed README.md file

## Common Issues & Solutions

### "npm is not recognized"
- Node.js is not installed or not in PATH
- Reinstall Node.js and restart your terminal

### "Port 3000 already in use"
- Change the PORT in the `.env` file to a different number (like 3001)
- Or kill the process using port 3000

### Database errors
- Delete the `database` folder and run `npm run init-db` again

### CORS errors in browser
- Make sure the server is running
- Check that you're accessing the correct URLs

---

🚀 **You're all set!** Enjoy exploring your new student portal system!