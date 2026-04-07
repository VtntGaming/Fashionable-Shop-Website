@echo off
echo.
echo ============================================
echo  Fashion Shop API - Server Startup Script
echo ============================================
echo.

REM Check if Java is installed
java -version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Java is not installed or not in PATH
    echo Please install Java 21+ and add it to system PATH
    pause
    exit /b 1
)

REM Check if JAR file exists
if not exist "target\fashion-shop-0.0.1-SNAPSHOT.jar" (
    echo [ERROR] JAR file not found!
    echo Building project...
    call mvn clean package -DskipTests
    if errorlevel 1 (
        echo [ERROR] Build failed!
        pause
        exit /b 1
    )
)

echo.
echo [INFO] Starting Fashion Shop Server...
echo [INFO] Server URL: http://localhost:8080
echo [INFO] Press Ctrl+C to stop the server
echo.

REM Run the JAR file
java -jar "target\fashion-shop-0.0.1-SNAPSHOT.jar"

if errorlevel 1 (
    echo [ERROR] Server failed to start
    pause
    exit /b 1
)

pause
