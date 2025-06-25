# ระบบจัดการข้อมูลผู้ป่วยและแดชบอร์ดหอผู้ป่วยเคมีบำบัด

ระบบจัดการข้อมูลผู้ป่วยและแดชบอร์ดสำหรับหอผู้ป่วยเคมีบำบัดที่พัฒนาด้วย React, Node.js, และ Prisma

## 🚀 การติดตั้งแบบเร็ว (Quick Start)

### สำหรับ Windows
```bash
# ดับเบิลคลิกไฟล์ start-local.bat
# หรือรันใน Command Prompt:
start-local.bat
```

### สำหรับ Linux/Mac
```bash
# ให้สิทธิ์การรันไฟล์
chmod +x start-local.sh

# รันสคริปต์
./start-local.sh
```

## 📋 ข้อกำหนดเบื้องต้น

- **Node.js** เวอร์ชัน 18 หรือใหม่กว่า
- **npm** หรือ **yarn**
- **Git**

## 🛠️ การติดตั้งแบบ Manual

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

### 3. ตั้งค่า Backend Environment
สร้างไฟล์ `.env` ในโฟลเดอร์ `backend/`:
```env
DATABASE_URL="file:./dev.db"
PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=debug
API_PREFIX=/api/v1
```

### 4. ตั้งค่าฐานข้อมูล
```bash
npx prisma migrate dev
npx prisma generate
```

### 5. รัน Backend
```bash
npm run dev
```

### 6. ติดตั้ง Frontend (เปิด Terminal ใหม่)
```bash
cd frontend
npm install
```

### 7. ตั้งค่า Frontend Environment
สร้างไฟล์ `.env` ในโฟลเดอร์ `frontend/`:
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_API_TIMEOUT=10000
VITE_APP_NAME=Chemo Management System
VITE_APP_VERSION=1.0.0
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=debug
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG_PANEL=true
```

### 8. รัน Frontend
```bash
npm run dev
```

## 🌐 การเข้าถึงระบบ

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

### ข้อมูลล็อกอินเริ่มต้น
- **Admin**: admin@example.com / password123
- **Doctor**: doctor@example.com / password123
- **Nurse**: nurse@example.com / password123

## 🔧 คำสั่งที่มีประโยชน์

### Backend
```bash
cd backend
npm run dev          # รันในโหมด development
npm start           # รันในโหมด production
npm run db:studio   # ดูฐานข้อมูลด้วย Prisma Studio
npx prisma migrate dev --name migration_name  # สร้าง migration ใหม่
npx prisma migrate reset  # Reset ฐานข้อมูล
```

### Frontend
```bash
cd frontend
npm run dev         # รันในโหมด development
npm run build       # Build สำหรับ production
npm run preview     # Preview build
npm run lint        # Lint code
```

## 🏥 คุณสมบัติหลัก

### 🔐 ระบบ Authentication
- ระบบล็อกอินด้วย JWT Token
- การจัดการสิทธิ์ตาม Role (Admin, Doctor, Nurse)
- การป้องกันการเข้าถึงหน้าต่างๆ ตามสิทธิ์

### 👥 การจัดการผู้ป่วย
- เพิ่ม/แก้ไข/ลบข้อมูลผู้ป่วย
- ข้อมูลพื้นฐาน: HN, ชื่อ, วันเกิด, ที่อยู่, สถานะ
- คำนวณอายุอัตโนมัติ
- การแสดงสถานะผู้ป่วย (Active, Inactive, Deceased)

### 📅 การจัดการนัดหมาย
- สร้าง/แก้ไข/ลบนัดหมาย
- เชื่อมโยงนัดหมายกับผู้ป่วย
- ระบบ Check-in/Discharge
- การเลื่อนนัดหมาย

### 🏥 แดชบอร์ดหอผู้ป่วยเคมีบำบัด
- **กล่องรอ Admit**: แสดงผู้ป่วยที่รอเข้ารับการรักษา
- **กล่องกำลัง Admit**: แสดงผู้ป่วยที่กำลังรักษาตัวอยู่
- **กล่องเครื่องมือ**: สำหรับฟังก์ชันค้นหาและ Export PDF
- **กล่อง Links**: แสดงลิงก์ภายนอกจากฐานข้อมูล

## 🛠️ เทคโนโลยีที่ใช้

### Frontend
- **React 18** - UI Framework
- **React Router** - การจัดการ Routing
- **Vite** - Build Tool
- **TH Sarabun New** - ฟอนต์ไทย

### Backend
- **Node.js** - Runtime Environment
- **Express.js** - Web Framework
- **Prisma** - ORM และ Database Migration
- **SQLite** - Database
- **JWT** - Authentication
- **bcrypt** - Password Hashing

## 📁 โครงสร้างโปรเจกต์

```
CHEMO_CURSOR/
├── backend/
│   ├── .env                    # Environment variables
│   ├── package.json           # Dependencies
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── migrations/        # Database migrations
│   └── src/
│       ├── routes/            # API routes
│       ├── middlewares/       # Middleware functions
│       └── app.js            # Main server file
├── frontend/
│   ├── .env                   # Environment variables
│   ├── package.json          # Dependencies
│   └── src/
│       ├── components/        # Reusable components
│       ├── pages/            # Page components
│       ├── context/          # React context
│       └── main.jsx          # App entry point
├── start-local.bat           # Windows startup script
├── start-local.sh            # Linux/Mac startup script
├── LOCAL_SETUP.md            # คู่มือการติดตั้งแบบละเอียด
└── README_LOCAL.md           # คู่มือนี้
```

## 🔧 การแก้ไขปัญหา

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

## 📊 โครงสร้างฐานข้อมูล

### ตารางหลัก
- **User**: ข้อมูลผู้ใช้ระบบ
- **Patient**: ข้อมูลผู้ป่วย
- **Appointment**: ข้อมูลนัดหมาย
- **Treatment**: ข้อมูลแผนการรักษา
- **ExternalLink**: ลิงก์ภายนอก

### ความสัมพันธ์
- User สามารถมีหลาย Appointment
- Patient สามารถมีหลาย Appointment และ Treatment
- Appointment เชื่อมโยงกับ Patient และ User

## 🔐 ระบบสิทธิ์

- **Admin**: เข้าถึงทุกฟังก์ชัน
- **Doctor**: จัดการผู้ป่วย, นัดหมาย, แผนการรักษา
- **Nurse**: จัดการสถานะผู้ป่วย, Check-in/Discharge, เลื่อนนัดหมาย

## 🎨 UI/UX Features

- **Responsive Design**: รองรับทุกขนาดหน้าจอ
- **Sidebar Navigation**: เมนูด้านข้างที่ใช้งานง่าย
- **Modal Dialogs**: สำหรับเพิ่ม/แก้ไขข้อมูล
- **Real-time Updates**: อัปเดตข้อมูลแบบ Real-time
- **Thai Language Support**: รองรับภาษาไทยเต็มรูปแบบ

## 🚧 การพัฒนาต่อ

### ฟีเจอร์ที่วางแผนไว้
- [ ] ระบบ Export PDF
- [ ] ระบบค้นหาขั้นสูง
- [ ] ระบบแจ้งเตือน
- [ ] Dashboard Analytics
- [ ] ระบบ Backup ข้อมูล

### การปรับปรุงที่แนะนำ
- เพิ่ม Unit Tests
- เพิ่ม E2E Tests
- ปรับปรุง Error Handling
- เพิ่ม Logging System
- ปรับปรุง Performance

## 📝 การ Backup ข้อมูล

ฐานข้อมูล SQLite จะอยู่ในไฟล์ `backend/dev.db` สามารถ copy ไฟล์นี้เพื่อ backup ได้

## 🔄 การ Reset ระบบ

```bash
# ลบฐานข้อมูลและสร้างใหม่
cd backend
npx prisma migrate reset

# ลบ node_modules และติดตั้งใหม่
cd backend && rm -rf node_modules package-lock.json && npm install
cd frontend && rm -rf node_modules package-lock.json && npm install
```

## 🤝 การมีส่วนร่วม

1. Fork โปรเจกต์
2. สร้าง Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit การเปลี่ยนแปลง (`git commit -m 'Add some AmazingFeature'`)
4. Push ไปยัง Branch (`git push origin feature/AmazingFeature`)
5. เปิด Pull Request

## 📄 License

MIT License 