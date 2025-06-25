#!/bin/bash

# Setup Environment Variables Script
echo "🔧 Setting up environment variables..."

# Backend setup
if [ ! -f "backend/.env" ]; then
    echo "📁 Creating backend/.env from env.example..."
    cp backend/env.example backend/.env
    echo "✅ Backend .env created successfully"
else
    echo "⚠️  backend/.env already exists, skipping..."
fi

# Frontend setup
if [ ! -f "frontend/.env" ]; then
    echo "📁 Creating frontend/.env from env.example..."
    cp frontend/env.example frontend/.env
    echo "✅ Frontend .env created successfully"
else
    echo "⚠️  frontend/.env already exists, skipping..."
fi

echo ""
echo "🎉 Environment setup completed!"
echo ""
echo "📝 Next steps:"
echo "1. Edit backend/.env with your database credentials"
echo "2. Edit frontend/.env if you need to change API URL"
echo "3. Make sure to change JWT_SECRET in production"
echo ""
echo "🔒 Remember: .env files are ignored by git for security" 