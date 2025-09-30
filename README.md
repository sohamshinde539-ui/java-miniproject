# Student Portal - Full Stack Application

A complete student and admin portal system with backend API integration, authentication, and database management.

## Features

### Student Portal
- 🔐 Secure authentication with JWT tokens
- 📚 View assigned homework and assignments
- ✅ Mark tasks as completed
- 📅 Calendar view for due dates
- 👤 Profile management
- 📱 Responsive design

### Admin Portal
- 🛡️ Admin-only access with role-based authentication
- ➕ Create new homework and assignments
- 👥 Assign tasks to students
- 📊 Dashboard overview
- 🔧 Manage student tasks

### Backend Features
- 🗄️ SQLite database with proper schema
- 🔒 JWT authentication with session management
- 🛡️ Role-based authorization (Student/Admin)
- ✅ Input validation and sanitization
- 🔐 Password hashing with bcrypt
- 🚀 RESTful API endpoints
- ⚡ Rate limiting and security middleware

## Technologies Used

### Frontend
- HTML5 & CSS3
- Tailwind CSS for styling
- Vanilla JavaScript
- Lucide Icons

### Backend
- Node.js & Express.js
- SQLite database
- JWT for authentication
- bcrypt for password hashing
- express-validator for input validation
- CORS, Helmet, and rate limiting for security

## Prerequisites

Before running this application, make sure you have:

1. **Node.js** (version 14 or higher) - [Download here](https://nodejs.org/)
2. **npm** (comes with Node.js)
3. A modern web browser

## Installation & Setup

### 1. Install Node.js Dependencies

```bash
# Install all dependencies
npm install
```

### 2. Initialize the Database

```bash
# Create database and insert sample data
npm run init-db
```

This will:
- Create the SQLite database file
- Create all necessary tables
- Insert default admin and student accounts
- Add sample homework and assignments

### 3. Start the Server

```bash
# Start the development server
npm start

# OR start with auto-reload (if you have nodemon)
npm run dev
```

The server will start on `http://localhost:3000`

### 4. Access the Application

- **Student Portal**: http://localhost:3000/student
- **Admin Portal**: http://localhost:3000/admin
- **API Health Check**: http://localhost:3000/api/health

## Default Credentials

### Student Account
- **Username**: `student`
- **Password**: `password123`

### Admin Account
- **Username**: `admin`
- **Password**: `admin123`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Homework
- `GET /api/homework` - Get all homework (filtered by user role)
- `GET /api/homework/:id` - Get specific homework
- `POST /api/homework` - Create homework (admin only)
- `PUT /api/homework/:id` - Update homework
- `DELETE /api/homework/:id` - Delete homework (admin only)

### Assignments
- `GET /api/assignments` - Get all assignments (filtered by user role)
- `GET /api/assignments/:id` - Get specific assignment
- `POST /api/assignments` - Create assignment (admin only)
- `PUT /api/assignments/:id` - Update assignment
- `DELETE /api/assignments/:id` - Delete assignment (admin only)

## Project Structure

```
dkk/
├── js/
│   └── api.js              # Frontend API utility functions
├── controllers/
│   ├── authController.js   # Authentication logic
│   ├── homeworkController.js
│   └── assignmentController.js
├── models/
│   └── database.js         # Database configuration and connection
├── routes/
│   ├── auth.js            # Authentication routes
│   ├── homework.js        # Homework routes
│   └── assignments.js     # Assignment routes
├── middleware/
│   ├── auth.js           # JWT authentication middleware
│   └── validation.js     # Input validation middleware
├── scripts/
│   └── initDatabase.js   # Database initialization script
├── database/
│   └── student_portal.db # SQLite database (created after init)
├── admin portal.html     # Admin interface
├── to do.html           # Student interface
├── server.js            # Main server file
├── package.json         # Node.js dependencies and scripts
├── .env                 # Environment configuration
└── README.md           # This file
```

## Database Schema

### Users Table
- `id` - Primary key
- `name` - Full name
- `username` - Login username
- `password` - Hashed password
- `role` - 'student' or 'admin'
- `student_id` - Student ID (for students only)
- `department`, `division`, `semester` - Academic info
- `emergency_contact_*` - Emergency contact details
- `avatar_url` - Profile picture URL
- `created_at`, `updated_at` - Timestamps

### Homework Table
- `id` - Primary key
- `subject`, `title`, `description` - Task details
- `due_date` - Due date
- `status` - 'Pending', 'Completed', or 'Overdue'
- `created_by` - Admin who created it
- `assigned_to` - Student assigned to (optional)
- `created_at`, `updated_at` - Timestamps

### Assignments Table
- Same structure as homework table

### Sessions Table
- `id` - Primary key
- `user_id` - User reference
- `token` - JWT token
- `expires_at` - Token expiration
- `created_at` - Creation timestamp

## Security Features

- 🔐 JWT tokens with expiration
- 🛡️ Role-based access control
- 🔒 Password hashing with bcrypt (12 rounds)
- ✅ Input validation and sanitization
- 🚫 Rate limiting (100 requests per 15 minutes)
- 🌐 CORS configuration
- 🛡️ Helmet.js security headers
- 🗄️ SQL injection prevention with parameterized queries

## Environment Variables

The `.env` file contains configuration options:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# Database Configuration
DB_PATH=./database/student_portal.db

# Default Credentials
DEFAULT_ADMIN_USERNAME=admin
DEFAULT_ADMIN_PASSWORD=admin123
DEFAULT_STUDENT_USERNAME=student
DEFAULT_STUDENT_PASSWORD=password123
```

## Development

### Adding New Features

1. **Database Changes**: Update `models/database.js` and `scripts/initDatabase.js`
2. **API Endpoints**: Add controllers in `controllers/`, routes in `routes/`
3. **Frontend**: Update HTML files and `js/api.js`
4. **Validation**: Add validation rules in `middleware/validation.js`

### Testing API Endpoints

You can test the API using tools like Postman or curl:

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "student", "password": "password123"}'

# Get homework (with JWT token)
curl -X GET http://localhost:3000/api/homework \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Production Deployment

For production deployment:

1. Change `JWT_SECRET` to a strong, unique value
2. Set `NODE_ENV=production`
3. Update CORS origins in `server.js`
4. Use a more robust database (PostgreSQL, MySQL)
5. Implement proper logging
6. Set up SSL/HTTPS
7. Use a process manager (PM2)
8. Set up proper backup strategies

## Troubleshooting

### Common Issues

1. **Database not found**: Run `npm run init-db`
2. **Token invalid**: Clear browser localStorage and login again
3. **CORS errors**: Check server is running and CORS configuration
4. **Port in use**: Change PORT in `.env` file

### Logs

Check the server console for detailed error logs and API request information.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for educational purposes. Feel free to use and modify as needed.

## Developers

1. Mr. Soham Sushant Shinde
2. Mr. Deepak Yadav

---

🚀 **Happy coding!** If you encounter any issues, check the troubleshooting section or create an issue in the repository.