# Raspberry Pi Setup Guide สำหรับ Chemo Cursor

## 📋 ข้อกำหนดระบบ

### Hardware Requirements
- **Raspberry Pi 4** (แนะนำ 4GB หรือ 8GB RAM)
- **MicroSD Card** 32GB ขึ้นไป (Class 10 หรือเร็วกว่า)
- **Power Supply** 5V/3A (สำหรับ Pi 4)
- **Ethernet Cable** หรือ WiFi connection

### Software Requirements
- **Raspberry Pi OS** (64-bit) หรือ Ubuntu Server 20.04+
- **Docker** และ **Docker Compose**
- **Git**

## 🚀 การติดตั้งระบบ

### 1. ติดตั้ง Raspberry Pi OS

#### วิธีที่ 1: ใช้ Raspberry Pi Imager
1. ดาวน์โหลด [Raspberry Pi Imager](https://www.raspberrypi.org/software/)
2. เลือก **Raspberry Pi OS (64-bit)**
3. เลือก MicroSD card
4. กด **Write** และรอให้เสร็จ

#### วิธีที่ 2: ใช้ Ubuntu Server
```bash
# ดาวน์โหลด Ubuntu Server 20.04 LTS สำหรับ Raspberry Pi
# จาก https://ubuntu.com/download/raspberry-pi
```

### 2. ตั้งค่าเริ่มต้น

#### เปิดใช้งาน SSH
```bash
# สร้างไฟล์ ssh ใน boot partition
sudo touch /boot/ssh
```

#### ตั้งค่า WiFi (ถ้าใช้)
```bash
# สร้างไฟล์ wpa_supplicant.conf ใน boot partition
sudo nano /boot/wpa_supplicant.conf
```

เนื้อหาไฟล์:
```conf
country=TH
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1

network={
    ssid="ชื่อWiFi"
    psk="รหัสWiFi"
    key_mgmt=WPA-PSK
}
```

### 3. ติดตั้ง Docker

#### อัปเดตระบบ
```bash
sudo apt update && sudo apt upgrade -y
```

#### ติดตั้ง Docker
```bash
# ติดตั้ง dependencies
sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release

# เพิ่ม Docker GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# เพิ่ม Docker repository
echo "deb [arch=arm64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# ติดตั้ง Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# เพิ่ม user เข้า docker group
sudo usermod -aG docker $USER

# เริ่มต้น Docker service
sudo systemctl enable docker
sudo systemctl start docker
```

#### ติดตั้ง Docker Compose
```bash
# ติดตั้ง Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# ตรวจสอบการติดตั้ง
docker-compose --version
```

### 4. ติดตั้ง Git
```bash
sudo apt install -y git
```

## 📥 การดาวน์โหลดและตั้งค่าโปรเจกต์

### 1. Clone โปรเจกต์
```bash
# สร้างโฟลเดอร์สำหรับโปรเจกต์
mkdir -p ~/projects
cd ~/projects

# Clone จาก GitHub
git clone https://github.com/your-username/chemo-cursor.git
cd chemo-cursor
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
chmod +x docker-scripts-pi.sh
```

## 🚀 การเริ่มต้นใช้งาน

### 1. เริ่มต้น Production Mode
```bash
# ใช้ script เฉพาะ Raspberry Pi
./docker-scripts-pi.sh prod

# หรือใช้ docker-compose โดยตรง
docker-compose up -d
```

### 2. เริ่มต้น Development Mode
```bash
# ใช้ script เฉพาะ Raspberry Pi
./docker-scripts-pi.sh dev

# หรือใช้ docker-compose โดยตรง
docker-compose --profile dev up -d
```

### 3. ตรวจสอบสถานะ
```bash
# ดูสถานะ services
./docker-scripts-pi.sh status

# ดู logs
./docker-scripts-pi.sh logs

# monitor resources
./docker-scripts-pi.sh monitor
```

## 🔧 การปรับแต่งสำหรับ Raspberry Pi

### 1. เพิ่ม Swap Space (ถ้าจำเป็น)
```bash
# ตรวจสอบ swap ปัจจุบัน
free -h

# เพิ่ม swap 2GB
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# ทำให้ swap เริ่มต้นอัตโนมัติ
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 2. ปรับแต่ง Docker
```bash
# ใช้ script ที่มีมาให้
./docker-scripts-pi.sh optimize
```

### 3. ปรับแต่ง Memory Limits
```bash
# แก้ไข docker-compose.yml ถ้าจำเป็น
# ลด memory limits สำหรับ Raspberry Pi ที่มี RAM น้อย
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
./docker-scripts-pi.sh cleanup

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

### 3. ตั้งค่า SSL (ถ้าจำเป็น)
```bash
# ติดตั้ง Certbot
sudo apt install certbot

# สร้าง SSL certificate
sudo certbot certonly --standalone -d your-domain.com
```

## 🚨 การแก้ไขปัญหา

### ปัญหาที่พบบ่อยบน Raspberry Pi

#### 1. Memory ไม่พอ
```bash
# ตรวจสอบ memory usage
free -h

# ลด memory limits ใน docker-compose.yml
# หรือเพิ่ม swap space
```

#### 2. Disk Space เต็ม
```bash
# ตรวจสอบ disk usage
df -h

# Cleanup Docker
./docker-scripts-pi.sh cleanup

# ลบไฟล์ที่ไม่จำเป็น
sudo apt autoremove
```

#### 3. Temperature สูง
```bash
# ตรวจสอบ temperature
vcgencmd measure_temp

# ติดตั้ง heatsink หรือ fan
# หรือลด CPU usage
```

#### 4. Network Issues
```bash
# ตรวจสอบ network
ip addr show

# ตรวจสอบ DNS
nslookup google.com

# รีสตาร์ท network
sudo systemctl restart networking
```

## 📈 Performance Optimization

### 1. ปรับแต่ง Docker
```bash
# ใช้ overlay2 storage driver
# ตั้งค่า log rotation
# ใช้ resource limits
```

### 2. ปรับแต่ง MySQL
```bash
# ปรับ MySQL configuration สำหรับ Raspberry Pi
# ลด memory usage
# ใช้ SSD สำหรับ database
```

### 3. ปรับแต่ง Nginx
```bash
# เปิดใช้งาน gzip compression
# ใช้ caching
# ปรับ worker processes
```

## 🔄 การอัปเดต

### 1. อัปเดตระบบ
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. อัปเดต Docker
```bash
# อัปเดต Docker
sudo apt update
sudo apt upgrade docker-ce docker-ce-cli containerd.io
```

### 3. อัปเดตโปรเจกต์
```bash
# Pull changes จาก GitHub
git pull origin main

# Rebuild services
./docker-scripts-pi.sh rebuild
```

## 📞 การขอความช่วยเหลือ

หากพบปัญหา:
1. ตรวจสอบ logs: `./docker-scripts-pi.sh logs`
2. ตรวจสอบ system resources: `./docker-scripts-pi.sh monitor`
3. ดู troubleshooting section
4. สร้าง issue ใน GitHub repository

## 📚 ข้อมูลเพิ่มเติม

- [Raspberry Pi Documentation](https://www.raspberrypi.org/documentation/)
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Nginx Documentation](https://nginx.org/en/docs/) 