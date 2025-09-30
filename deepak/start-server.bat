@echo off
echo.
echo ================================
echo   Student Portal Server
echo ================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ Node.js is not installed!
    echo.
    echo Please install Node.js first:
    echo 1. Go to https://nodejs.org/
    echo 2. Download and install the LTS version
    echo 3. Restart this terminal and try again
    echo.
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    echo.
    npm install
    if %ERRORLEVEL% neq 0 (
        echo ❌ Failed to install dependencies!
        pause
        exit /b 1
    )
    echo.
)

REM Check if database exists
if not exist "database\student_portal.db" (
    echo 🗄️ Initializing database...
    echo.
    npm run init-db
    if %ERRORLEVEL% neq 0 (
        echo ❌ Failed to initialize database!
        pause
        exit /b 1
    )
    echo.
)

echo 🚀 Starting the server...
echo.
echo Once started, you can access:
echo   📚 Student Portal: http://localhost:3000/student
echo   🔧 Admin Portal:   http://localhost:3000/admin
echo.
echo Default login credentials:
echo   👨‍🎓 Student: username = student, password = password123
echo   👨‍💼 Admin:   username = admin,   password = admin123
echo.
echo Press Ctrl+C to stop the server
echo.
echo ================================
echo.

REM Start the server
npm start