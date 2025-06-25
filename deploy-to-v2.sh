#!/bin/bash

echo "========================================"
echo "อัปโหลดโค้ดไปยัง Chemo Ward V2"
echo "========================================"
echo

# ตรวจสอบ Git
if ! command -v git &> /dev/null; then
    echo "[ERROR] ไม่พบ Git กรุณาติดตั้ง Git"
    exit 1
fi

# ตรวจสอบว่าอยู่ใน Git repository หรือไม่
if [ ! -d ".git" ]; then
    echo "[ERROR] ไม่พบ .git directory กรุณารันคำสั่งนี้ใน Git repository"
    exit 1
fi

# เพิ่ม remote repository ใหม่
echo "กำลังเพิ่ม remote repository..."
git remote add v2 https://github.com/prhdev222/chemo_ward_V2.git

# ตรวจสอบ remote
echo "Remote repositories:"
git remote -v

# สร้าง branch ใหม่สำหรับ V2
echo "กำลังสร้าง branch สำหรับ V2..."
git checkout -b v2-release

# เพิ่มไฟล์ทั้งหมด
echo "กำลังเพิ่มไฟล์ทั้งหมด..."
git add .

# Commit การเปลี่ยนแปลง
echo "กำลัง commit การเปลี่ยนแปลง..."
git commit -m "Initial release for Chemo Ward V2

- Simplified environment setup
- Added startup scripts for Windows and Linux/Mac
- Updated documentation for local setup
- Removed Docker dependencies for easier deployment
- Added default values for most configuration
- Improved error handling and user experience"

# Push ไปยัง repository ใหม่
echo "กำลัง push ไปยัง repository V2..."
git push v2 v2-release

# สร้าง main branch
echo "กำลังสร้าง main branch..."
git checkout -b main
git push v2 main

echo
echo "========================================"
echo "อัปโหลดเสร็จสิ้น!"
echo "========================================"
echo
echo "Repository: https://github.com/prhdev222/chemo_ward_V2.git"
echo "Branch: main"
echo
echo "ขั้นตอนต่อไป:"
echo "1. ไปที่ GitHub repository"
echo "2. ตั้งค่า main branch เป็น default"
echo "3. ลบ branch v2-release (ถ้าต้องการ)"
echo
echo "กด Enter เพื่อปิดหน้าต่างนี้..."
read 