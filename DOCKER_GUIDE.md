# Docker Guide สำหรับ Chemo Cursor Project

## 📋 ภาพรวม
คู่มือนี้จะอธิบายวิธีการใช้งาน Docker สำหรับ Chemo Cursor project ทั้งใน production และ development mode

## 🚀 การเริ่มต้นใช้งาน

### ข้อกำหนดเบื้องต้น
- Docker Desktop ติดตั้งและรันอยู่
- Docker Compose v2
- อย่างน้อย 4GB RAM

### การเริ่มต้นแบบรวดเร็ว

#### 1. Production Mode (แนะนำ)
```bash
# เริ่มต้น production services
./docker-scripts.sh prod

# หรือใช้ docker-compose โดยตรง
docker-compose up -d
```

#### 2. Development Mode
```bash
# เริ่มต้น development services
./docker-scripts.sh dev

# หรือใช้ docker-compose โดยตรง
docker-compose --profile dev up -d
```

## 🏗️ โครงสร้าง Services

### Production Services
- **mysql**: MySQL 8.0 database
- **backend**: Node.js API server
- **frontend**: Nginx serving React app

### Development Services
- **mysql**: MySQL 8.0 database
- **backend-dev**: Node.js API server with hot reload
- **frontend-dev**: Vite dev server with hot reload

## 📊 Ports และ URLs

### Production
- Frontend: http://localhost
- Backend API: http://localhost:5000
- MySQL: localhost:3306

### Development
- Frontend: http://localhost:5173
- Backend API: http://localhost:5001
- MySQL: localhost:3306

## 🛠️ คำสั่งที่ใช้บ่อย

### การจัดการ Services
```bash
# ดูสถานะ services
./docker-scripts.sh status

# หยุด services ทั้งหมด
./docker-scripts.sh stop

# รีสตาร์ท services
./docker-scripts.sh restart

# Rebuild services
./docker-scripts.sh rebuild
```

### การดู Logs
```bash
# ดู logs ทั้งหมด
./docker-scripts.sh logs

# ดู logs เฉพาะ service
./docker-scripts.sh logs backend
./docker-scripts.sh logs frontend
./docker-scripts.sh logs mysql
```

### การจัดการ Database
```bash
# รัน migrations
./docker-scripts.sh migrate

# รีเซ็ต database (ระวัง: ลบข้อมูลทั้งหมด)
./docker-scripts.sh reset-db
```

## 🔧 การตั้งค่า Environment

### Backend Environment Variables
```env
NODE_ENV=production
DATABASE_URL=mysql://chemo_user:chemo_pass@mysql:3306/chemo_db
JWT_SECRET=your-super-secret-jwt-key-change-in-production
PORT=5000
```

### Frontend Environment Variables
```env
VITE_API_URL=http://localhost/api
```

## 📁 โครงสร้างไฟล์

```
CHEMO_CURSOR/
├── docker-compose.yml          # Docker Compose configuration
├── docker-scripts.sh           # Management scripts
├── backend/
│   ├── Dockerfile              # Production backend image
│   ├── Dockerfile.dev          # Development backend image
│   └── .dockerignore           # Files to ignore
├── frontend/
│   ├── Dockerfile              # Production frontend image
│   ├── Dockerfile.dev          # Development frontend image
│   ├── nginx.conf              # Nginx configuration
│   └── .dockerignore           # Files to ignore
└── mysql/
    └── init/                   # Database initialization scripts
```

## 🔍 การ Debug และ Troubleshooting

### ตรวจสอบสถานะ Services
```bash
# ดูสถานะ containers
docker-compose ps

# ดู health checks
docker-compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
```

### ตรวจสอบ Logs
```bash
# ดู logs แบบ real-time
docker-compose logs -f

# ดู logs เฉพาะ error
docker-compose logs --tail=100 | grep ERROR
```

### เข้าไปใน Container
```bash
# เข้าไปใน backend container
docker-compose exec backend sh

# เข้าไปใน frontend container
docker-compose exec frontend sh

# เข้าไปใน MySQL container
docker-compose exec mysql mysql -u chemo_user -p chemo_db
```

### ตรวจสอบ Network
```bash
# ดู network configuration
docker network ls
docker network inspect chemo_cursor_chemo-network
```

## 🚨 การแก้ไขปัญหา

### ปัญหาที่พบบ่อย

#### 1. Port ถูกใช้งานอยู่
```bash
# ตรวจสอบ port ที่ใช้งาน
netstat -tulpn | grep :80
netstat -tulpn | grep :5000

# หยุด service ที่ใช้ port นั้น
sudo lsof -ti:80 | xargs kill -9
```

#### 2. Database Connection Error
```bash
# ตรวจสอบ MySQL container
docker-compose logs mysql

# รีสตาร์ท MySQL
docker-compose restart mysql
```

#### 3. Frontend ไม่สามารถเรียก API ได้
```bash
# ตรวจสอบ backend logs
docker-compose logs backend

# ตรวจสอบ network connectivity
docker-compose exec frontend ping backend
```

#### 4. Memory ไม่พอ
```bash
# ดู memory usage
docker stats

# ลด memory limit ใน docker-compose.yml
```

### การ Reset ทั้งหมด
```bash
# หยุดและลบ containers ทั้งหมด
docker-compose down -v

# ลบ images
docker-compose down --rmi all

# ลบ volumes
docker volume prune

# เริ่มต้นใหม่
./docker-scripts.sh prod
```

## 🔒 Security Considerations

### Production Security
1. **เปลี่ยน JWT Secret**: แก้ไขใน docker-compose.yml
2. **ใช้ Environment Files**: สร้าง .env files แทน hardcode
3. **Restrict Ports**: เปิดเฉพาะ port ที่จำเป็น
4. **Use Secrets**: ใช้ Docker secrets สำหรับข้อมูลที่ละเอียดอ่อน

### Network Security
```yaml
# ใน docker-compose.yml
networks:
  chemo-network:
    driver: bridge
    internal: true  # ไม่ expose ไปภายนอก
```

## 📈 Performance Optimization

### Resource Limits
```yaml
# ใน docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
        reservations:
          memory: 256M
          cpus: '0.25'
```

### Caching
- ใช้ Docker layer caching
- ใช้ npm cache ใน frontend
- ใช้ nginx caching ใน production

## 🔄 CI/CD Integration

### GitHub Actions Example
```yaml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build and deploy
        run: |
          docker-compose build
          docker-compose up -d
```

## 📝 Best Practices

1. **ใช้ Multi-stage Builds**: ลดขนาด image
2. **ใช้ .dockerignore**: ไม่ copy ไฟล์ที่ไม่จำเป็น
3. **ใช้ Health Checks**: ตรวจสอบ service health
4. **ใช้ Non-root Users**: เพิ่มความปลอดภัย
5. **ใช้ Volume Mounts**: แยก data ออกจาก container
6. **ใช้ Environment Variables**: ไม่ hardcode configuration
7. **ใช้ Docker Networks**: แยก network สำหรับแต่ละ service

## 🆘 การขอความช่วยเหลือ

หากพบปัญหา:
1. ตรวจสอบ logs ก่อน
2. ดู troubleshooting section
3. ตรวจสอบ Docker documentation
4. สร้าง issue ใน GitHub repository 