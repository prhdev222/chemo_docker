# 🚀 คู่มือการอัปโหลดไปยัง Chemo Ward V2

## วิธีที่ 1: ใช้สคริปต์อัตโนมัติ (แนะนำ)

### Windows
```bash
# ดับเบิลคลิกไฟล์ deploy-to-v2.bat
# หรือรันใน Command Prompt:
deploy-to-v2.bat
```

### Linux/Mac
```bash
# ให้สิทธิ์การรันไฟล์
chmod +x deploy-to-v2.sh

# รันสคริปต์
./deploy-to-v2.sh
```

## วิธีที่ 2: ใช้คำสั่ง Git แบบ Manual

### 1. เพิ่ม Remote Repository
```bash
git remote add v2 https://github.com/prhdev222/chemo_ward_V2.git
```

### 2. ตรวจสอบ Remote
```bash
git remote -v
```

### 3. สร้าง Branch ใหม่
```bash
git checkout -b v2-release
```

### 4. เพิ่มไฟล์ทั้งหมด
```bash
git add .
```

### 5. Commit การเปลี่ยนแปลง
```bash
git commit -m "Initial release for Chemo Ward V2

- Simplified environment setup
- Added startup scripts for Windows and Linux/Mac
- Updated documentation for local setup
- Removed Docker dependencies for easier deployment
- Added default values for most configuration
- Improved error handling and user experience"
```

### 6. Push ไปยัง Repository ใหม่
```bash
git push v2 v2-release
```

### 7. สร้าง Main Branch
```bash
git checkout -b main
git push v2 main
```

## วิธีที่ 3: Clone Repository ใหม่

### 1. Clone Repository V2
```bash
git clone https://github.com/prhdev222/chemo_ward_V2.git
cd chemo_ward_V2
```

### 2. Copy ไฟล์จากโปรเจคปัจจุบัน
```bash
# Copy ไฟล์ทั้งหมด (ยกเว้น .git)
cp -r ../CHEMO_CURSOR/* .
cp -r ../CHEMO_CURSOR/.* . 2>/dev/null || true
```

### 3. เพิ่มและ Commit
```bash
git add .
git commit -m "Initial release for Chemo Ward V2"
git push origin main
```

## 📋 ไฟล์ที่สำคัญสำหรับ V2

### ไฟล์ใหม่ที่เพิ่ม
- `start-local.bat` - สคริปต์สำหรับ Windows
- `start-local.sh` - สคริปต์สำหรับ Linux/Mac
- `env.simple` - ไฟล์ environment แบบง่าย
- `LOCAL_SETUP.md` - คู่มือการติดตั้งแบบละเอียด
- `QUICK_START.md` - คู่มือการใช้งานแบบเร็ว
- `README_LOCAL.md` - คู่มือการใช้งานแบบเต็ม

### ไฟล์ที่อัปเดต
- `README.md` - อัปเดตสำหรับ V2
- `backend/src/app.js` - เพิ่มค่าเริ่มต้น
- `backend/src/middlewares/auth.js` - เพิ่มค่าเริ่มต้น
- `frontend/src/utils/api.js` - เพิ่มค่าเริ่มต้น
- `.gitignore` - อัปเดตสำหรับการใช้งานแบบธรรมดา

## 🔧 การตั้งค่า Repository

### 1. ไปที่ GitHub Repository
เปิดเบราว์เซอร์ไปที่: https://github.com/prhdev222/chemo_ward_V2

### 2. ตั้งค่า Main Branch เป็น Default
1. ไปที่ Settings > Branches
2. ตั้งค่า main เป็น default branch
3. ลบ branch v2-release (ถ้าต้องการ)

### 3. ตั้งค่า Repository
1. ไปที่ Settings > General
2. เปิดใช้งาน Issues (ถ้าต้องการ)
3. เปิดใช้งาน Wiki (ถ้าต้องการ)

## 📝 หมายเหตุสำคัญ

### การเปลี่ยนแปลงหลักใน V2
- **ไม่ใช้ Docker**: ใช้การติดตั้งแบบธรรมดา
- **Environment Variables น้อยลง**: ใช้ค่าเริ่มต้นแทน
- **สคริปต์อัตโนมัติ**: สำหรับ Windows และ Linux/Mac
- **เอกสารที่ครบถ้วน**: คู่มือการใช้งานแบบละเอียด

### ข้อควรระวัง
- ตรวจสอบว่า repository V2 ว่างเปล่าก่อนอัปโหลด
- สำรองข้อมูลก่อนอัปโหลด
- ทดสอบการทำงานหลังอัปโหลด

## 🎯 ขั้นตอนหลังการอัปโหลด

### 1. ทดสอบการ Clone
```bash
git clone https://github.com/prhdev222/chemo_ward_V2.git
cd chemo_ward_V2
```

### 2. ทดสอบการติดตั้ง
```bash
# Windows
start-local.bat

# Linux/Mac
chmod +x start-local.sh
./start-local.sh
```

### 3. ตรวจสอบการทำงาน
- Backend: http://localhost:5000
- Frontend: http://localhost:5173

## 📞 ความช่วยเหลือ

หากมีปัญหาในการอัปโหลด:
1. ตรวจสอบสิทธิ์การเข้าถึง repository
2. ตรวจสอบการตั้งค่า Git
3. ลองใช้วิธี Manual แทนสคริปต์อัตโนมัติ

## 🎉 เสร็จสิ้น

หลังจากอัปโหลดเสร็จแล้ว คุณจะมี:
- Repository V2 ที่ใช้งานได้
- คู่มือการใช้งานที่ครบถ้วน
- สคริปต์อัตโนมัติสำหรับการติดตั้ง
- ระบบที่ใช้งานง่ายโดยไม่ต้องใช้ Docker 