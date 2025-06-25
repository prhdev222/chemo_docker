# คู่มือการติดตั้งและรันโปรเจคแบบธรรมดา (ไม่ใช้ Docker)

## ข้อกำหนดเบื้องต้น

- **Node.js** เวอร์ชัน 18 หรือใหม่กว่า
- **npm** หรือ **yarn**
- **Git**

## ขั้นตอนการติดตั้ง

### 1. Clone โปรเจค
```bash
git clone https://github.com/prhdev222/chemotherapy_ward_V1.2.git
cd CHEMO_CURSOR
```

### 2. ติดตั้ง Backend

```bash
cd backend
npm install
```

### 3. ตั้งค่า Environment Variables สำหรับ Backend (ไม่บังคับ)

สร้างไฟล์ `.env` ในโฟลเดอร์ `backend/` (หรือใช้ `cp env.simple .env`):

```env
# Database Configuration (Required)
DATABASE_URL="file:./dev.db"

# Optional: Override defaults if needed
# PORT=5000
# JWT_SECRET=your_custom_secret_here
```

**หมายเหตุ**: ระบบใช้ค่าเริ่มต้นสำหรับการตั้งค่าส่วนใหญ่:
- PORT: 5000
- JWT_SECRET: chemo_management_secret_key_2024
- CORS_ORIGIN: http://localhost:5173
- API_PREFIX: /api/v1

### 4. ตั้งค่าฐานข้อมูล

```bash
# สร้างและรัน migrations
npx prisma migrate dev

# Generate Prisma Client
npx prisma generate
```

### 5. รัน Backend Server

```bash
npm run dev
```

Backend จะรันที่ `http://localhost:5000`

### 6. ติดตั้ง Frontend (เปิด Terminal ใหม่)

```bash
cd frontend
npm install
```

### 7. ตั้งค่า Environment Variables สำหรับ Frontend (ไม่บังคับ)

สร้างไฟล์ `.env` ในโฟลเดอร์ `frontend/` (หรือใช้ `cp env.simple .env`):

```env
# API Configuration (Optional - uses defaults if not set)
# VITE_API_BASE_URL=http://localhost:5000/api/v1

# App Configuration (Optional)
# VITE_APP_NAME=Chemo Management System
# VITE_APP_VERSION=1.0.0
```

**หมายเหตุ**: ระบบใช้ค่าเริ่มต้น:
- VITE_API_BASE_URL: http://localhost:5000/api/v1
- VITE_API_TIMEOUT: 10000
- VITE_DEBUG_MODE: true

### 8. รัน Frontend

```bash
npm run dev
```

Frontend จะรันที่ `http://localhost:5173`

## การเข้าถึงระบบ

1. เปิดเบราว์เซอร์ไปที่ `http://localhost:5173`
2. ใช้ข้อมูลล็อกอินเริ่มต้น:
   - **Admin**: admin@example.com / password123
   - **Doctor**: doctor@example.com / password123
   - **Nurse**: nurse@example.com / password123

## คำสั่งที่มีประโยชน์

### Backend Commands
```bash
# รันในโหมด development
npm run dev

# รันในโหมด production
npm start

# ดูฐานข้อมูลด้วย Prisma Studio
npm run db:studio

# สร้าง migration ใหม่
npx prisma migrate dev --name migration_name

# Reset ฐานข้อมูล
npx prisma migrate reset
```

### Frontend Commands
```bash
# รันในโหมด development
npm run dev

# Build สำหรับ production
npm run build

# Preview build
npm run preview

# Lint code
npm run lint
```

## การแก้ไขปัญหา

### ปัญหาที่พบบ่อย

1. **Port ถูกใช้งานแล้ว**
   - เปลี่ยน PORT ในไฟล์ `.env` ของ backend
   - หรือปิดโปรแกรมที่ใช้ port นั้น

2. **ฐานข้อมูลไม่พบ**
   - รัน `npx prisma migrate dev` อีกครั้ง
   - ตรวจสอบ DATABASE_URL ในไฟล์ `.env`

3. **CORS Error**
   - ตรวจสอบ CORS_ORIGIN ในไฟล์ `.env` ของ backend
   - ต้องตรงกับ URL ของ frontend

4. **Module not found**
   - ลบโฟลเดอร์ `node_modules` และ `package-lock.json`
   - รัน `npm install` อีกครั้ง

### การ Debug

1. **Backend Logs**: ดูใน terminal ที่รัน backend
2. **Frontend Logs**: เปิด Developer Tools ในเบราว์เซอร์
3. **Database**: ใช้ `npm run db:studio` เพื่อดูฐานข้อมูล

## การ Deploy

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
# ไฟล์ build จะอยู่ในโฟลเดอร์ dist/
```

## โครงสร้างไฟล์สำคัญ

```
CHEMO_CURSOR/
├── backend/
│   ├── .env                    # Environment variables (optional)
│   ├── env.simple             # Simple env template
│   ├── package.json           # Dependencies
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── migrations/        # Database migrations
│   └── src/
│       └── app.js            # Main server file
├── frontend/
│   ├── .env                   # Environment variables (optional)
│   ├── env.simple            # Simple env template
│   ├── package.json          # Dependencies
│   └── src/
│       └── main.jsx          # App entry point
├── start-local.bat           # Windows startup script
├── start-local.sh            # Linux/Mac startup script
├── LOCAL_SETUP.md            # คู่มือนี้
└── README_LOCAL.md           # คู่มือการใช้งานแบบเต็ม
```

## การอัปเดต

1. **อัปเดต Dependencies**
   ```bash
   # Backend
   cd backend
   npm update

   # Frontend
   cd frontend
   npm update
   ```

2. **อัปเดต Database Schema**
   ```bash
   cd backend
   npx prisma migrate dev
   ```

## การ Backup ข้อมูล

ฐานข้อมูล SQLite จะอยู่ในไฟล์ `backend/dev.db` สามารถ copy ไฟล์นี้เพื่อ backup ได้

## การ Reset ระบบ

```bash
# ลบฐานข้อมูลและสร้างใหม่
cd backend
npx prisma migrate reset

# ลบ node_modules และติดตั้งใหม่
cd backend && rm -rf node_modules package-lock.json && npm install
cd frontend && rm -rf node_modules package-lock.json && npm install
```

## ค่าเริ่มต้นของระบบ

### Backend Defaults
- PORT: 5000
- NODE_ENV: development
- CORS_ORIGIN: http://localhost:5173
- UPLOAD_PATH: ./uploads
- API_PREFIX: /api/v1
- JWT_SECRET: chemo_management_secret_key_2024

### Frontend Defaults
- VITE_API_BASE_URL: http://localhost:5000/api/v1
- VITE_API_TIMEOUT: 10000
- VITE_DEBUG_MODE: true
- VITE_APP_NAME: Chemo Management System
- VITE_APP_VERSION: 1.0.0 