#!/bin/bash

echo ""
echo "============================================"
echo "  Fashion Shop API - Server Startup Script"
echo "============================================"
echo ""

# Check if Java is installed
if ! command -v java &> /dev/null; then
    echo "[ERROR] Java is not installed or not in PATH"
    echo "Please install Java 21+ and add it to system PATH"
    exit 1
fi

# Check if JAR file exists
if [ ! -f "target/fashion-shop-0.0.1-SNAPSHOT.jar" ]; then
    echo "[ERROR] JAR file not found!"
    echo "Building project..."
    mvn clean package -DskipTests
    if [ $? -ne 0 ]; then
        echo "[ERROR] Build failed!"
        exit 1
    fi
fi

echo ""
echo "[INFO] Starting Fashion Shop Server..."
echo "[INFO] Server URL: http://localhost:8080"
echo "[INFO] Press Ctrl+C to stop the server"
echo ""

# Run the JAR file
java -jar "target/fashion-shop-0.0.1-SNAPSHOT.jar"

if [ $? -ne 0 ]; then
    echo "[ERROR] Server failed to start"
    exit 1
fi
