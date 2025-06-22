# ระบบจัดการข้อมูลผู้ป่วยและแดชบอร์ดหอผู้ป่วยเคมีบำบัด

ระบบจัดการข้อมูลผู้ป่วยและแดชบอร์ดสำหรับหอผู้ป่วยเคมีบำบัดที่พัฒนาด้วย React, Node.js, และ Prisma

## 🚀 คุณสมบัติหลัก

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
  - ปุ่ม Check-in
  - แจ้งไม่มาตามนัด
  - เลื่อนนัดหมาย
- **กล่องกำลัง Admit**: แสดงผู้ป่วยที่กำลังรักษาตัวอยู่
  - ปุ่ม Discharge
- **กล่องเครื่องมือ**: สำหรับฟังก์ชันค้นหาและ Export PDF (เตรียมไว้)
- **กล่อง Links**: แสดงลิงก์ภายนอกจากฐานข้อมูล

### 📋 การจัดการแผนการรักษา
- เพิ่ม/แก้ไขข้อมูลการวินิจฉัย
- จัดการแผนการรักษา
- เชื่อมโยงกับผู้ป่วย

### 🔗 การจัดการลิงก์ภายนอก
- เพิ่ม/แก้ไข/ลบลิงก์เอกสารภายนอก
- แสดงลิงก์ในแดชบอร์ด

## 🛠️ เทคโนโลยีที่ใช้

### Frontend
- **React 18** - UI Framework
- **React Router** - การจัดการ Routing
- **Vite** - Build Tool
- **Tailwind CSS** - Styling
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
│   ├── prisma/
│   │   ├── migrations/          # Database migrations
│   │   └── schema.prisma        # Database schema
│   ├── src/
│   │   ├── routes/              # API routes
│   │   ├── middlewares/         # Middleware functions
│   │   └── app.js              # Main server file
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable components
│   │   ├── pages/              # Page components
│   │   ├── context/            # React context
│   │   └── main.jsx           # App entry point
│   └── package.json
└── README.md
```

## 🚀 การติดตั้งและรันโปรเจกต์

### ข้อกำหนดเบื้องต้น
- Node.js (เวอร์ชัน 18 หรือใหม่กว่า)
- npm หรือ yarn

### ขั้นตอนการติดตั้ง

1. **Clone โปรเจกต์**
```bash
git clone https://github.com/prhdev222/chemotherapy_ward.git
cd chemotherapy_ward
```

2. **ติดตั้ง Dependencies Backend**
```bash
cd backend
npm install
```

3. **ตั้งค่าฐานข้อมูล**
```bash
npx prisma migrate dev
npx prisma generate
```

4. **รัน Backend Server**
```bash
npm run dev
```
Backend จะรันที่ `http://localhost:5000`

5. **ติดตั้ง Dependencies Frontend** (เปิด Terminal ใหม่)
```bash
cd frontend
npm install
```

6. **รัน Frontend**
```bash
npm run dev
```
Frontend จะรันที่ `http://localhost:5173`

## 🔧 การตั้งค่า Environment Variables

สร้างไฟล์ `.env` ในโฟลเดอร์ `backend/`:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-here"
PORT=5000
```

## 👤 ข้อมูลผู้ใช้เริ่มต้น

ระบบมาพร้อมกับผู้ใช้เริ่มต้นสำหรับทดสอบ:

- **Admin**: admin@example.com / password123
- **Doctor**: doctor@example.com / password123  
- **Nurse**: nurse@example.com / password123

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

## 🤝 การมีส่วนร่วม

1. Fork โปรเจกต์
2. สร้าง Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit การเปลี่ยนแปลง (`git commit -m 'Add some AmazingFeature'`)
4. Push ไปยัง Branch (`git push origin feature/AmazingFeature`)
5. เปิด Pull Request

## 📝 License

โปรเจกต์นี้อยู่ภายใต้ MIT License - ดูรายละเอียดในไฟล์ [LICENSE](LICENSE)

## 📞 ติดต่อ

หากมีคำถามหรือข้อเสนอแนะ กรุณาติดต่อ:
- GitHub Issues: [สร้าง Issue ใหม่](https://github.com/prhdev222/chemotherapy_ward/issues)

---

**หมายเหตุ**: โปรเจกต์นี้พัฒนาสำหรับการใช้งานในโรงพยาบาล กรุณาตรวจสอบและทดสอบอย่างละเอียดก่อนใช้งานจริง