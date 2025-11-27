#!/bin/bash

echo "=================================="
echo "NOC Management System - Setup"
echo "=================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null
then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null
then
    echo "⚠️  MongoDB is not installed or not in PATH."
    echo "   Please make sure MongoDB is installed and running."
    echo "   Visit: https://www.mongodb.com/try/download/community"
    echo ""
fi

echo "📦 Installing backend dependencies..."
cd backend
npm install

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Backend dependencies installed successfully!"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Make sure MongoDB is running"
    echo "   2. Review and edit backend/.env if needed"
    echo "   3. Run: npm run seed:admin    (Create admin user)"
    echo "   4. Run: npm run seed:data     (Create sample data)"
    echo "   5. Run: npm run dev           (Start development server)"
    echo ""
    echo "=================================="
else
    echo ""
    echo "❌ Failed to install dependencies"
    exit 1
fi
