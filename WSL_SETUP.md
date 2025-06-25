# WSL Setup Guide สำหรับ Chemo Cursor

## 📋 ภาพรวม
คู่มือนี้จะอธิบายวิธีการติดตั้งและใช้งาน Chemo Cursor project บน Windows Subsystem for Linux (WSL)

## 🚀 ข้อดีของการใช้ WSL

### Performance
- ✅ เร็วกว่า Docker Desktop บน Windows
- ✅ ใช้ Linux kernel โดยตรง
- ✅ Resource usage น้อยกว่า

### Development Experience
- ✅ ใช้ Linux commands ได้โดยตรง
- ✅ Terminal experience ที่ดีกว่า
- ✅ File system performance ดีกว่า

### Compatibility
- ✅ รองรับ Linux tools ทั้งหมด
- ✅ ใช้ Git, Node.js, Docker ได้เหมือน Linux
- ✅ ไม่มีปัญหา path หรือ permission

## 🔧 การติดตั้ง WSL

### 1. ติดตั้ง WSL 2

#### วิธีที่ 1: ใช้ PowerShell (แนะนำ)
```powershell
# เปิด PowerShell as Administrator
wsl --install
```

#### วิธีที่ 2: ติดตั้งด้วยตนเอง
```powershell
# เปิดใช้งาน WSL feature
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

# รีสตาร์ทคอมพิวเตอร์
# จากนั้นดาวน์โหลดและติดตั้ง WSL2 kernel update
# https://aka.ms/wsl2kernel

# ตั้งค่า WSL 2 เป็น default
wsl --set-default-version 2
```

### 2. ติดตั้ง Ubuntu

#### ดาวน์โหลดจาก Microsoft Store
1. เปิด Microsoft Store
2. ค้นหา "Ubuntu"
3. เลือก "Ubuntu" หรือ "Ubuntu 20.04 LTS"
4. กด Install

#### หรือใช้คำสั่ง
```powershell
wsl --install -d Ubuntu
```

### 3. ตั้งค่า Ubuntu
```bash
# สร้าง username และ password
# ตามที่ระบบถาม

# อัปเดตระบบ
sudo apt update && sudo apt upgrade -y
```

## 🐳 การติดตั้ง Docker ใน WSL

### 1. ติดตั้ง Docker
```bash
# ติดตั้ง dependencies
sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release

# เพิ่ม Docker GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# เพิ่ม Docker repository
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# ติดตั้ง Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# เพิ่ม user เข้า docker group
sudo usermod -aG docker $USER

# เริ่มต้น Docker service
sudo systemctl enable docker
sudo systemctl start docker
```

### 2. ติดตั้ง Docker Compose
```bash
# ติดตั้ง Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# ตรวจสอบการติดตั้ง
docker-compose --version
```

### 3. ใช้ WSL Script (แนะนำ)
```bash
# ใช้ script ที่มีมาให้
./docker-scripts-wsl.sh setup
```

## 📁 การใช้งานโปรเจกต์

### 1. เข้าถึงโปรเจกต์

#### วิธีที่ 1: Clone ใหม่ใน WSL
```bash
# สร้างโฟลเดอร์สำหรับโปรเจกต์
mkdir -p ~/projects
cd ~/projects

# Clone จาก GitHub
git clone https://github.com/your-username/chemo-cursor.git
cd chemo-cursor
```

#### วิธีที่ 2: เข้าถึงจาก Windows path
```bash
# เข้าถึงโปรเจกต์ที่อยู่ใน Windows
cd /mnt/c/Users/urare/OneDrive/Desktop/CHEMO_CURSOR
```

### 2. ตั้งค่า Environment
```bash
# สร้างไฟล์ .env สำหรับ backend
cat > backend/.env << EOF
NODE_ENV=production
DATABASE_URL=mysql://chemo_user:chemo_pass@mysql:3306/chemo_db
JWT_SECRET=your-super-secret-jwt-key-change-in-production
PORT=5000
EOF

# สร้างไฟล์ .env สำหรับ frontend
cat > frontend/.env << EOF
VITE_API_URL=http://localhost/api
EOF
```

### 3. ทำให้ Scripts Executable
```bash
chmod +x docker-scripts.sh
chmod +x docker-scripts-wsl.sh
```

## 🚀 การเริ่มต้นใช้งาน

### 1. เริ่มต้น Production Mode
```bash
# ใช้ script เฉพาะ WSL
./docker-scripts-wsl.sh prod

# หรือใช้ docker-compose โดยตรง
docker-compose up -d
```

### 2. เริ่มต้น Development Mode
```bash
# ใช้ script เฉพาะ WSL
./docker-scripts-wsl.sh dev

# หรือใช้ docker-compose โดยตรง
docker-compose --profile dev up -d
```

### 3. ตรวจสอบสถานะ
```bash
# ดูสถานะ services
./docker-scripts-wsl.sh status

# ดู logs
./docker-scripts-wsl.sh logs

# monitor resources
./docker-scripts-wsl.sh monitor
```

## 🔧 การปรับแต่ง WSL

### 1. ปรับแต่ง WSL Configuration
```bash
# สร้างไฟล์ .wslconfig ใน Windows
# C:\Users\YourUsername\.wslconfig

[wsl2]
memory=4GB
processors=4
swap=2GB
localhostForwarding=true
```

### 2. ปรับแต่ง Docker
```bash
# ใช้ script ที่มีมาให้
./docker-scripts-wsl.sh optimize
```

### 3. ตั้งค่า Git
```bash
# ตั้งค่า Git user
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# ตั้งค่า default editor
git config --global core.editor "nano"
```

## 📊 การ Monitor และ Maintenance

### 1. ตรวจสอบ Performance
```bash
# ดู Docker stats
docker stats

# ดู system resources
htop

# ดู disk usage
df -h

# ดู memory usage
free -h
```

### 2. การ Cleanup
```bash
# Cleanup Docker resources
./docker-scripts-wsl.sh cleanup

# หรือใช้คำสั่ง Docker โดยตรง
docker system prune -a
```

### 3. การ Backup
```bash
# Backup database
docker-compose exec mysql mysqldump -u chemo_user -p chemo_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup uploads
tar -czf uploads_backup_$(date +%Y%m%d_%H%M%S).tar.gz backend/uploads/
```

## 🔒 Security Considerations

### 1. เปลี่ยน Default Passwords
```bash
# เปลี่ยน MySQL password
docker-compose exec mysql mysql -u root -p
ALTER USER 'chemo_user'@'%' IDENTIFIED BY 'new_secure_password';
FLUSH PRIVILEGES;
```

### 2. ตั้งค่า Firewall
```bash
# ติดตั้ง ufw
sudo apt install ufw

# เปิด port ที่จำเป็น
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS (ถ้าใช้)

# เปิดใช้งาน firewall
sudo ufw enable
```

## 🚨 การแก้ไขปัญหา

### ปัญหาที่พบบ่อยใน WSL

#### 1. Docker ไม่ start
```bash
# ตรวจสอบ Docker service
sudo systemctl status docker

# รีสตาร์ท Docker
sudo systemctl restart docker

# ตรวจสอบ Docker group
groups $USER
```

#### 2. Permission Issues
```bash
# ตรวจสอบ file permissions
ls -la

# แก้ไข permissions
chmod +x script.sh
chown -R $USER:$USER .
```

#### 3. Network Issues
```bash
# ตรวจสอบ network
ip addr show

# ตรวจสอบ DNS
nslookup google.com

# รีสตาร์ท network
sudo systemctl restart networking
```

#### 4. Memory Issues
```bash
# ตรวจสอบ memory usage
free -h

# ลด memory limits ใน docker-compose.yml
# หรือเพิ่ม swap space
```

### การ Reset WSL
```bash
# หยุด WSL
wsl --shutdown

# รีสตาร์ท WSL
wsl

# หรือ reset WSL distribution
wsl --unregister Ubuntu
wsl --install -d Ubuntu
```

## 📈 Performance Optimization

### 1. ปรับแต่ง WSL
```bash
# ใช้ WSL2 แทน WSL1
wsl --set-version Ubuntu 2

# ปรับแต่ง .wslconfig
# เพิ่ม memory และ processors
```

### 2. ปรับแต่ง Docker
```bash
# ใช้ overlay2 storage driver
# ตั้งค่า log rotation
# ใช้ resource limits
```

### 3. ปรับแต่ง File System
```bash
# ใช้ WSL file system แทน Windows file system
# หลีกเลี่ยงการเข้าถึง /mnt/c/ สำหรับ development
```

## 🔄 การอัปเดต

### 1. อัปเดต WSL
```powershell
# ใน PowerShell
wsl --update
```

### 2. อัปเดต Ubuntu
```bash
sudo apt update && sudo apt upgrade -y
```

### 3. อัปเดต Docker
```bash
# อัปเดต Docker
sudo apt update
sudo apt upgrade docker-ce docker-ce-cli containerd.io
```

### 4. อัปเดตโปรเจกต์
```bash
# Pull changes จาก GitHub
git pull origin main

# Rebuild services
./docker-scripts-wsl.sh rebuild
```

## 🛠️ Tips และ Tricks

### 1. การใช้ VS Code กับ WSL
```bash
# ติดตั้ง VS Code Remote - WSL extension
# เปิด VS Code ใน WSL
code .

# หรือใช้ command line
code /mnt/c/Users/urare/OneDrive/Desktop/CHEMO_CURSOR
```

### 2. การใช้ Windows Terminal
```bash
# ติดตั้ง Windows Terminal จาก Microsoft Store
# ตั้งค่า WSL เป็น default profile
```

### 3. การใช้ Git Credential Manager
```bash
# ติดตั้ง Git Credential Manager
sudo apt install git-credential-manager

# ตั้งค่า Git
git config --global credential.helper manager
```

### 4. การใช้ SSH Keys
```bash
# สร้าง SSH key
ssh-keygen -t rsa -b 4096 -C "your.email@example.com"

# เพิ่ม SSH key ไปยัง GitHub
cat ~/.ssh/id_rsa.pub
```

## 📞 การขอความช่วยเหลือ

หากพบปัญหา:
1. ตรวจสอบ logs: `./docker-scripts-wsl.sh logs`
2. ตรวจสอบ system resources: `./docker-scripts-wsl.sh monitor`
3. ดู troubleshooting section
4. สร้าง issue ใน GitHub repository

## 📚 ข้อมูลเพิ่มเติม

- [WSL Documentation](https://docs.microsoft.com/en-us/windows/wsl/)
- [Docker Documentation](https://docs.docker.com/)
- [Ubuntu Documentation](https://ubuntu.com/tutorials)
- [VS Code Remote Development](https://code.visualstudio.com/docs/remote/remote-overview) 