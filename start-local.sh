#!/bin/bash

echo "========================================"
echo "ระบบจัดการข้อมูลผู้ป่วยเคมีบำบัด"
echo "========================================"
echo

# ตรวจสอบ Node.js
echo "กำลังตรวจสอบ Node.js..."
if ! command -v node &> /dev/null; then
    echo "[ERROR] ไม่พบ Node.js กรุณาติดตั้ง Node.js เวอร์ชัน 18 หรือใหม่กว่า"
    exit 1
fi

# ตรวจสอบ npm
echo "กำลังตรวจสอบ npm..."
if ! command -v npm &> /dev/null; then
    echo "[ERROR] ไม่พบ npm กรุณาติดตั้ง npm"
    exit 1
fi

echo
echo "========================================"
echo "ขั้นตอนที่ 1: ติดตั้ง Backend"
echo "========================================"
cd backend

# ติดตั้ง dependencies
if [ ! -d "node_modules" ]; then
    echo "กำลังติดตั้ง dependencies สำหรับ backend..."
    npm install
    if [ $? -ne 0 ]; then
        echo "[ERROR] การติดตั้ง backend dependencies ล้มเหลว"
        exit 1
    fi
fi

# สร้างไฟล์ .env
if [ ! -f ".env" ]; then
    echo "กำลังสร้างไฟล์ .env สำหรับ backend..."
    cp env.simple .env
    echo "[INFO] ไฟล์ .env ถูกสร้างแล้ว (ใช้ค่าเริ่มต้น)"
fi

# ตั้งค่าฐานข้อมูล
echo "กำลังตั้งค่าฐานข้อมูล..."
npx prisma generate > /dev/null 2>&1
npx prisma migrate dev --name init > /dev/null 2>&1

# เริ่มต้น Backend Server
echo "กำลังเริ่มต้น Backend Server..."
gnome-terminal --title="Backend Server" -- bash -c "npm run dev; exec bash" 2>/dev/null || \
xterm -title "Backend Server" -e "npm run dev; bash" 2>/dev/null || \
osascript -e 'tell app "Terminal" to do script "cd '$(pwd)' && npm run dev"' 2>/dev/null || \
echo "กรุณาเปิด terminal ใหม่และรัน: cd backend && npm run dev"

echo
echo "========================================"
echo "ขั้นตอนที่ 2: ติดตั้ง Frontend"
echo "========================================"
cd ../frontend

# ติดตั้ง dependencies
if [ ! -d "node_modules" ]; then
    echo "กำลังติดตั้ง dependencies สำหรับ frontend..."
    npm install
    if [ $? -ne 0 ]; then
        echo "[ERROR] การติดตั้ง frontend dependencies ล้มเหลว"
        exit 1
    fi
fi

# สร้างไฟล์ .env
if [ ! -f ".env" ]; then
    echo "กำลังสร้างไฟล์ .env สำหรับ frontend..."
    cp env.simple .env
    echo "[INFO] ไฟล์ .env ถูกสร้างแล้ว (ใช้ค่าเริ่มต้น)"
fi

# เริ่มต้น Frontend Server
echo "กำลังเริ่มต้น Frontend Server..."
gnome-terminal --title="Frontend Server" -- bash -c "npm run dev; exec bash" 2>/dev/null || \
xterm -title "Frontend Server" -e "npm run dev; bash" 2>/dev/null || \
osascript -e 'tell app "Terminal" to do script "cd '$(pwd)' && npm run dev"' 2>/dev/null || \
echo "กรุณาเปิด terminal ใหม่และรัน: cd frontend && npm run dev"

echo
echo "========================================"
echo "การติดตั้งเสร็จสิ้น!"
echo "========================================"
echo
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:5173"
echo
echo "ข้อมูลล็อกอินเริ่มต้น:"
echo "- Admin: admin@example.com / password123"
echo "- Doctor: doctor@example.com / password123"
echo "- Nurse: nurse@example.com / password123"
echo
echo "กด Enter เพื่อปิดหน้าต่างนี้..."
read 