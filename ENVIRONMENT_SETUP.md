# Environment Variables Setup Guide

## Backend Environment Variables

สร้างไฟล์ `.env` ในโฟลเดอร์ `backend/` โดยใช้ `backend/env.example` เป็นต้นแบบ:

```bash
# คัดลอกไฟล์ตัวอย่าง
cp backend/env.example backend/.env
```

### Environment Variables ที่สำคัญ:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/chemo_db"

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Logging Configuration
LOG_LEVEL=debug

# API Configuration
API_PREFIX=/api/v1
```

## Frontend Environment Variables

สร้างไฟล์ `.env` ในโฟลเดอร์ `frontend/` โดยใช้ `frontend/env.example` เป็นต้นแบบ:

```bash
# คัดลอกไฟล์ตัวอย่าง
cp frontend/env.example frontend/.env
```

### Environment Variables ที่สำคัญ:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_API_TIMEOUT=10000

# App Configuration
VITE_APP_NAME=Chemo Management System
VITE_APP_VERSION=1.0.0

# Development Configuration
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=debug

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG_PANEL=true
```

## การตั้งค่าสำหรับแต่ละ Environment

### Development
```env
# Backend
NODE_ENV=development
LOG_LEVEL=debug
CORS_ORIGIN=http://localhost:5173

# Frontend
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=debug
VITE_ENABLE_DEBUG_PANEL=true
```

### Production
```env
# Backend
NODE_ENV=production
LOG_LEVEL=info
CORS_ORIGIN=http://your-domain.com

# Frontend
VITE_DEBUG_MODE=false
VITE_LOG_LEVEL=info
VITE_ENABLE_DEBUG_PANEL=false
```

## การใช้งานกับ Docker

เมื่อใช้ Docker environment variables จะถูกกำหนดใน `docker-compose.yml`:

### Production
```yaml
environment:
  - NODE_ENV=production
  - PORT=5000
  - CORS_ORIGIN=http://localhost
  - LOG_LEVEL=info
```

### Development
```yaml
environment:
  - NODE_ENV=development
  - PORT=5000
  - CORS_ORIGIN=http://localhost:5173
  - LOG_LEVEL=debug
```

## Security Notes

1. **อย่าลืมเปลี่ยน JWT_SECRET** ใน production
2. **อย่า commit ไฟล์ .env** เข้า git repository
3. **ใช้ .env.example** เป็นต้นแบบเท่านั้น
4. **ตรวจสอบ CORS_ORIGIN** ให้ตรงกับ domain ที่ใช้งานจริง

## การตรวจสอบ Environment Variables

### Backend
```bash
cd backend
node -e "require('dotenv').config(); console.log(process.env)"
```

### Frontend
```bash
cd frontend
npm run dev
# ดู console log ใน browser developer tools
```

## Troubleshooting

### ปัญหาที่พบบ่อย:

1. **API ไม่เชื่อมต่อ**: ตรวจสอบ `VITE_API_BASE_URL` และ `PORT`
2. **CORS Error**: ตรวจสอบ `CORS_ORIGIN` ใน backend
3. **Database Connection**: ตรวจสอบ `DATABASE_URL`
4. **File Upload Error**: ตรวจสอบ `UPLOAD_PATH` และ `MAX_FILE_SIZE`

### การ Debug:
- เปิด `VITE_DEBUG_MODE=true` ใน frontend
- ตั้ง `LOG_LEVEL=debug` ใน backend
- ดู console logs ใน browser และ terminal 