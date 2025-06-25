# 🚀 คู่มือการใช้งานแบบเร็ว

## วิธีที่ 1: ใช้สคริปต์อัตโนมัติ (แนะนำ)

### Windows
1. ดับเบิลคลิกไฟล์ `start-local.bat`
2. รอให้ระบบติดตั้งเสร็จ
3. เปิดเบราว์เซอร์ไปที่ `http://localhost:5173`

### Linux/Mac
```bash
chmod +x start-local.sh
./start-local.sh
```

## วิธีที่ 2: ใช้คำสั่งเดียว

```bash
# ติดตั้งทุกอย่างและรัน
npm run setup
npm run dev
```

## วิธีที่ 3: ติดตั้งแบบ Manual

### ขั้นตอนที่ 1: ติดตั้ง Backend
```bash
cd backend
npm install
cp env.simple .env
npx prisma migrate dev
npm run dev
```

### ขั้นตอนที่ 2: ติดตั้ง Frontend (เปิด Terminal ใหม่)
```bash
cd frontend
npm install
cp env.simple .env
npm run dev
```

## 🌐 การเข้าถึงระบบ

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000

## 👤 ข้อมูลล็อกอิน

- **Admin**: admin@example.com / password123
- **Doctor**: doctor@example.com / password123
- **Nurse**: nurse@example.com / password123

## 🔧 คำสั่งที่มีประโยชน์

```bash
# รันทั้ง Backend และ Frontend พร้อมกัน
npm run dev

# รันเฉพาะ Backend
npm run dev:backend

# รันเฉพาะ Frontend
npm run dev:frontend

# ดูฐานข้อมูล
npm run db:studio

# Reset ฐานข้อมูล
npm run db:reset

# ลบ node_modules และติดตั้งใหม่
npm run clean
npm run install-all
```

## ❗ ปัญหาที่พบบ่อย

### Port ถูกใช้งานแล้ว
- เปลี่ยน PORT ในไฟล์ `backend/.env`
- หรือปิดโปรแกรมที่ใช้ port นั้น

### ฐานข้อมูลไม่พบ
```bash
cd backend
npx prisma migrate dev
```

### Module not found
```bash
npm run clean
npm run install-all
```

## 📞 ความช่วยเหลือ

หากมีปัญหา ให้ดูไฟล์:
- `LOCAL_SETUP.md` - คู่มือการติดตั้งแบบละเอียด
- `README_LOCAL.md` - คู่มือการใช้งานแบบเต็ม

## 🎯 ฟีเจอร์หลัก

✅ ระบบล็อกอินและจัดการสิทธิ์  
✅ จัดการข้อมูลผู้ป่วย  
✅ จัดการนัดหมาย  
✅ แดชบอร์ดหอผู้ป่วยเคมีบำบัด  
✅ ระบบ Check-in/Discharge  
✅ Export ข้อมูลเป็น Excel  
✅ รองรับภาษาไทย  

## 🚧 ฟีเจอร์ที่กำลังพัฒนา

- [ ] Export PDF
- [ ] ระบบแจ้งเตือน
- [ ] Dashboard Analytics
- [ ] ระบบ Backup

## 📝 หมายเหตุ

ระบบใช้ค่าเริ่มต้นสำหรับการตั้งค่าส่วนใหญ่ คุณสามารถแก้ไขได้ในไฟล์ `.env` หากต้องการปรับแต่ง 