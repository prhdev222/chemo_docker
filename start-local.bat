@echo off
echo ========================================
echo ระบบจัดการข้อมูลผู้ป่วยเคมีบำบัด
echo ========================================
echo.

echo กำลังตรวจสอบ Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] ไม่พบ Node.js กรุณาติดตั้ง Node.js เวอร์ชัน 18 หรือใหม่กว่า
    pause
    exit /b 1
)

echo กำลังตรวจสอบ npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] ไม่พบ npm กรุณาติดตั้ง npm
    pause
    exit /b 1
)

echo.
echo ========================================
echo ขั้นตอนที่ 1: ติดตั้ง Backend
echo ========================================
cd backend

if not exist "node_modules" (
    echo กำลังติดตั้ง dependencies สำหรับ backend...
    npm install
    if %errorlevel% neq 0 (
        echo [ERROR] การติดตั้ง backend dependencies ล้มเหลว
        pause
        exit /b 1
    )
)

if not exist ".env" (
    echo กำลังสร้างไฟล์ .env สำหรับ backend...
    copy env.simple .env >nul
    echo [INFO] ไฟล์ .env ถูกสร้างแล้ว (ใช้ค่าเริ่มต้น)
)

echo กำลังตั้งค่าฐานข้อมูล...
npx prisma generate >nul 2>&1
npx prisma migrate dev --name init >nul 2>&1

echo กำลังเริ่มต้น Backend Server...
start "Backend Server" cmd /k "npm run dev"

echo.
echo ========================================
echo ขั้นตอนที่ 2: ติดตั้ง Frontend
echo ========================================
cd ..\frontend

if not exist "node_modules" (
    echo กำลังติดตั้ง dependencies สำหรับ frontend...
    npm install
    if %errorlevel% neq 0 (
        echo [ERROR] การติดตั้ง frontend dependencies ล้มเหลว
        pause
        exit /b 1
    )
)

if not exist ".env" (
    echo กำลังสร้างไฟล์ .env สำหรับ frontend...
    copy env.simple .env >nul
    echo [INFO] ไฟล์ .env ถูกสร้างแล้ว (ใช้ค่าเริ่มต้น)
)

echo กำลังเริ่มต้น Frontend Server...
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ========================================
echo การติดตั้งเสร็จสิ้น!
echo ========================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo ข้อมูลล็อกอินเริ่มต้น:
echo - Admin: admin@example.com / password123
echo - Doctor: doctor@example.com / password123
echo - Nurse: nurse@example.com / password123
echo.
echo กด Enter เพื่อปิดหน้าต่างนี้...
pause 