# ระบบแดชบอร์ดหอผู้ป่วยเคมีบำบัด

ระบบนี้ประกอบด้วย Frontend (Vite + ReactJS), Backend (Node.js + Express + Prisma), และฐานข้อมูล MySQL สำหรับจัดการข้อมูลผู้ป่วยโรคมะเร็งทางโลหิตวิทยา พร้อมแดชบอร์ดตาม SRS

## โครงสร้างโฟลเดอร์

```
CHEMO_CURSOR/
│
├── backend/                # Node.js + Express + Prisma
│   ├── src/
│   │   ├── controllers/    # จัดการ logic ของแต่ละ resource
│   │   ├── middlewares/    # จัดการ auth, role
│   │   ├── routes/         # กำหนด API endpoint
│   │   ├── prisma/         # client prisma
│   │   └── app.js          # จุดเริ่มต้น backend
│   ├── package.json
│   └── .env                # config DB
│
├── frontend/               # Vite + ReactJS + CSS
│   ├── src/
│   │   ├── components/     # UI component
│   │   ├── pages/          # หน้า Dashboard, จัดการผู้ป่วย ฯลฯ
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── prisma/                 # Prisma schema
    └── schema.prisma
```

## โครงสร้างไฟล์สำคัญใน backend

- `backend/src/app.js` : จุดเริ่มต้น Express backend
- `backend/src/routes/patient.js` : ไฟล์ route สำหรับจัดการข้อมูลผู้ป่วย (CRUD)
- `backend/src/controllers/` : สำหรับแยก logic ของแต่ละ resource (สามารถสร้างไฟล์ controller เพิ่มเติมได้)
- `backend/src/middlewares/` : สำหรับ middleware เช่น auth, role
- `backend/src/prisma/` : สำหรับ client prisma (ถ้ามี)

> **หมายเหตุ:**
> - ไฟล์ `patient.js` ต้องอยู่ใน `backend/src/routes/patient.js` เท่านั้น
> - โครงสร้างนี้ช่วยให้แยกส่วนการพัฒนาและดูแลรักษาโค้ดได้ง่าย

## ขั้นตอนการเริ่มต้นโปรเจกต์

### 1. เตรียมฐานข้อมูล MySQL
- สร้างฐานข้อมูลใหม่ เช่น `chemo_db`
- ตั้งค่าการเชื่อมต่อในไฟล์ `.env` ของ backend

### 2. ติดตั้ง Backend
```bash
cd backend
npm install
```
- ตั้งค่า `.env` เช่น
```
DATABASE_URL="mysql://user:password@localhost:3306/chemo_db"
```
- สร้าง Prisma schema ใน `prisma/schema.prisma` (ดูตัวอย่างใน README ด้านบน)
- รันคำสั่ง
```bash
npx prisma migrate dev --name init
```
- สตาร์ท backend
```bash
node src/app.js
```

### 3. ติดตั้ง Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. โครงสร้างฟังก์ชันหลัก
- **จัดการข้อมูลผู้ป่วย**: CRUD, soft delete, export PDF
- **แดชบอร์ด**: แสดงนัดหมาย, admit, ค้นหา, ลิงก์เอกสาร
- **Role**: Admin, Doctor, Nurse (กำหนดสิทธิ์แต่ละหน้า)

### 5. การเชื่อมต่อ Frontend-Backend
- Frontend เรียก API จาก backend (`/api/patients`, `/api/appointments` ฯลฯ)
- ใช้ fetch/axios ใน React

### 6. การ Export PDF
- ใช้ไลบรารี `jspdf` หรือ `react-pdf` ฝั่ง frontend หรือสร้าง endpoint export PDF ฝั่ง backend

---

## หมายเหตุ
- สามารถขยาย schema, เพิ่ม auth, หรือปรับ UI ได้ตามความต้องการ
- ตัวอย่างโค้ด backend/frontend ดูได้ในแต่ละโฟลเดอร์

---

**เริ่มต้นโปรเจกต์:**
1. สร้างโฟลเดอร์ตามโครงสร้างด้านบน
2. ติดตั้ง dependency ทั้ง backend และ frontend
3. ตั้งค่า database และ prisma
4. เริ่มพัฒนาแต่ละส่วนตาม SRS

หากต้องการตัวอย่างโค้ดแต่ละไฟล์ หรือมีคำถามเพิ่มเติม แจ้งได้เลยค่ะ 

## โครงสร้างและตัวอย่างการใช้งาน Frontend (Vite + ReactJS)

- `frontend/src/pages/Dashboard.jsx` :
  - หน้าแดชบอร์ดหลัก แสดงรายชื่อผู้ป่วยทั้งหมด (ดึงจาก backend)
  - มีช่องค้นหา HN เพื่อดูรายละเอียดผู้ป่วยแต่ละราย
  - ตัวอย่างโค้ดเชื่อมต่อ backend (fetch API)
- `frontend/src/App.jsx` :
  - นำเข้าและแสดงหน้า Dashboard เป็นหน้าแรก
- `frontend/src/components/` :
  - สำหรับแยก UI component เพิ่มเติม (เช่น ปุ่ม, modal, ตาราง)

### วิธีรัน frontend
```sh
cd frontend
npm run dev
```

### วิธีเชื่อมต่อ backend
- Dashboard จะ fetch ข้อมูลจาก backend ที่รันบน `http://localhost:3001/api/patients`
- ต้องแน่ใจว่า backend รันอยู่ก่อน (ดูวิธีรัน backend ด้านบน)

### อธิบายการทำงานของ Dashboard (Demo)
- เมื่อเปิดหน้า Dashboard จะดึงรายชื่อผู้ป่วยทั้งหมดมาแสดงในตาราง
- สามารถกรอก HN แล้วกด "ค้นหา" เพื่อดูรายละเอียดผู้ป่วยรายนั้น
- โค้ดตัวอย่างนี้เหมาะสำหรับการสอนและทดลองเชื่อมต่อ backend จริง
- สามารถขยายเพิ่มหน้า/ฟีเจอร์อื่น ๆ ได้ เช่น เพิ่ม/แก้ไข/ลบผู้ป่วย, จัดการนัดหมาย ฯลฯ 

## หมายเหตุสำคัญเกี่ยวกับ Prisma
- **ไฟล์ `schema.prisma` ต้องอยู่ที่ `backend/prisma/schema.prisma` เท่านั้น**
- เวลารันคำสั่ง Prisma (เช่น migrate, generate) ให้รันในโฟลเดอร์ `backend/`
- ตัวอย่างโครงสร้างที่ถูกต้อง:

```
CHEMO_CURSOR/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   └── ...
├── frontend/
└── README.md
```

### วิธี migrate Prisma ที่ถูกต้อง
1. ตรวจสอบให้แน่ใจว่าไฟล์ `schema.prisma` อยู่ที่ `backend/prisma/schema.prisma`
2. เปิดเทอร์มินัลที่โฟลเดอร์ `backend/`
3. รันคำสั่ง:
   ```sh
   npx prisma migrate dev --name init
   ```

---

## ขั้นตอนการทดสอบระบบ (Testing Step by Step)

### 1. ทดสอบ Backend (API)
1. ตรวจสอบว่าได้ migrate Prisma และเชื่อมต่อฐานข้อมูลสำเร็จแล้ว
2. รัน backend:
   ```sh
   cd backend
   node src/app.js
   ```
3. เปิดโปรแกรม Postman หรือ curl ทดสอบ API เช่น
   - GET รายชื่อผู้ป่วยทั้งหมด:
     ```
     GET http://localhost:3001/api/patients
     ```
   - GET ข้อมูลผู้ป่วยตาม HN:
     ```
     GET http://localhost:3001/api/patients/{hn}
     ```
   - POST เพิ่มผู้ป่วยใหม่ (ตัวอย่าง JSON):
     ```
     POST http://localhost:3001/api/patients
     Content-Type: application/json
     {
       "hn": "123456",
       "firstName": "สมชาย",
       "lastName": "ใจดี",
       "birthDate": "1990-01-01T00:00:00.000Z",
       "diagnosis": "AML",
       "diagnosisDate": "2024-06-21T00:00:00.000Z",
       "stage": "II",
       "treatmentPlan": {"regimen": "RCHOP"}
     }
     ```

### 2. ทดสอบ Frontend (React Dashboard)
1. รัน backend ให้เรียบร้อยก่อน
2. เปิดเทอร์มินัลใหม่ รัน frontend:
   ```sh
   cd frontend
   npm run dev
   ```
3. เปิดเบราว์เซอร์ไปที่ลิงก์ที่แสดง (เช่น http://localhost:5173)
4. หน้า Dashboard จะแสดงรายชื่อผู้ป่วยทั้งหมด (ถ้ามีข้อมูลในฐานข้อมูล)
5. ทดสอบค้นหา HN ในช่องค้นหา แล้วกดปุ่ม "ค้นหา" เพื่อดูรายละเอียดผู้ป่วย

### 3. ทดสอบการใช้งาน Prisma Studio (GUI ฐานข้อมูล)
1. เปิดเทอร์มินัลที่โฟลเดอร์ backend
2. รันคำสั่ง:
   ```sh
   npx prisma studio
   ```
3. ระบบจะเปิดเว็บ http://localhost:5555
4. สามารถเพิ่ม/แก้ไข/ลบข้อมูลในตาราง User, Patient, Appointment ได้
   - ฟิลด์ที่เป็น JSON (เช่น treatmentPlan) ต้องกรอกเป็น JSON ที่ถูกต้อง เช่น `{ "regimen": "RCHOP" }`
   - ฟิลด์วันที่ต้องกรอกในรูปแบบ `YYYY-MM-DDTHH:mm:ss.sssZ`
5. กด Save เพื่อบันทึกข้อมูล

### 4. ทดสอบการเชื่อมต่อ Frontend กับ Backend
- เพิ่ม/แก้ไขข้อมูลใน Prisma Studio แล้วรีเฟรชหน้า Dashboard จะเห็นข้อมูลเปลี่ยนแปลงทันที
- ทดสอบค้นหา HN ที่มีในฐานข้อมูล จะเห็นรายละเอียดแสดงในหน้าเว็บ

---

**หมายเหตุ:**
- หากพบ error หรือข้อมูลไม่แสดง ให้ตรวจสอบ log ในเทอร์มินัลของ backend/frontend และดู error message ในเบราว์เซอร์หรือ Prisma Studio
- สามารถขยายขั้นตอนทดสอบเพิ่มเติมได้ตามฟีเจอร์ที่เพิ่มในอนาคต

---

## อธิบายโค้ดสำคัญ (Key Code Explanation)

### Backend
- **backend/src/app.js**
  - จุดเริ่มต้นของ Express backend
  - ตั้งค่า middleware (CORS, JSON)
  - นำเข้าและใช้งาน route `/api/patients`
  - ตัวอย่างโค้ด:
    ```js
    const express = require('express');
    const cors = require('cors');
    const app = express();
    const patientRoutes = require('./routes/patient');
    app.use(cors());
    app.use(express.json());
    app.use('/api/patients', patientRoutes);
    app.listen(PORT, ...);
    ```

- **backend/src/routes/patient.js**
  - กำหนด API สำหรับ CRUD ข้อมูลผู้ป่วย
  - ใช้ Prisma Client เชื่อมต่อฐานข้อมูล
  - ตัวอย่างโค้ด:
    ```js
    const express = require('express');
    const router = express.Router();
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    // POST, GET, PUT, DELETE ตาม HN
    module.exports = router;
    ```

- **backend/src/routes/appointment.js**
  - กำหนด API สำหรับ CRUD ข้อมูลนัดหมาย (Appointment)
  - รองรับ filter ตามช่วงวันที่และ patientId
  - ใช้ Prisma Client เชื่อมต่อฐานข้อมูลและ relation กับ Patient
  - ตัวอย่างโค้ด:
    ```js
    // GET นัดหมายทั้งหมด (option: filter by date, patientId)
    router.get('/', ...)
    // POST สร้างนัดหมายใหม่
    router.post('/', ...)
    // PUT แก้ไขนัดหมาย
    router.put('/:id', ...)
    // DELETE ลบนัดหมาย
    router.delete('/:id', ...)
    ```

- **backend/prisma/schema.prisma**
  - กำหนดโครงสร้างฐานข้อมูล (model User, Patient, Appointment)
  - ฟิลด์สำคัญ เช่น hn, firstName, lastName, treatmentPlan (Json)

### Frontend
- **frontend/src/pages/Dashboard.jsx**
  - หน้าแดชบอร์ดหลัก แสดงรายชื่อผู้ป่วยทั้งหมด (fetch จาก backend)
  - มีช่องค้นหา HN เพื่อดูรายละเอียดผู้ป่วยแต่ละราย
  - ตัวอย่างโค้ด:
    ```jsx
    useEffect(() => {
      fetch('http://localhost:3001/api/patients')
        .then(res => res.json())
        .then(data => setPatients(data));
    }, []);
    // ...
    <input value={hn} onChange={...} />
    <button onClick={handleSearch}>ค้นหา</button>
    ```

- **frontend/src/App.jsx**
  - นำเข้าและแสดงหน้า Dashboard เป็นหน้าแรก

---

## สรุปสิ่งที่ทดสอบในรอบนี้
- ทดสอบ migrate Prisma และใช้งาน Prisma Studio (เพิ่ม/แก้ไขข้อมูลผู้ป่วย)
- ทดสอบรัน backend (`node src/app.js`) และเชื่อมต่อฐานข้อมูลสำเร็จ
- ทดสอบรัน frontend (`npm run dev`) และเชื่อมต่อ backend สำเร็จ
- ทดสอบ Dashboard: แสดงรายชื่อผู้ป่วย, ค้นหา HN, แสดงรายละเอียดผู้ป่วย
- ทดสอบการกรอกข้อมูล JSON ใน Prisma Studio (ฟิลด์ treatmentPlan) ให้ถูกต้อง
- ทดสอบการเชื่อมต่อข้อมูลระหว่าง backend, frontend, และฐานข้อมูลจริง

---

## ขั้นตอนการทดสอบ API นัดหมาย (Appointment)

1. รัน backend ให้เรียบร้อย
2. ทดสอบ API ด้วย Postman หรือ curl
   - GET นัดหมายทั้งหมด:
     ```
     GET http://localhost:3001/api/appointments
     ```
   - GET นัดหมายช่วงวันที่:
     ```
     GET http://localhost:3001/api/appointments?start=2024-06-01&end=2024-06-30
     ```
   - POST เพิ่มนัดหมายใหม่ (ตัวอย่าง JSON):
     ```
     POST http://localhost:3001/api/appointments
     Content-Type: application/json
     {
       "patientId": 1,
       "date": "2024-06-25T09:00:00.000Z",
       "chemoRegimen": "RCHOP",
       "admitStatus": "waiting"
     }
     ```
   - PUT แก้ไขนัดหมาย:
     ```
     PUT http://localhost:3001/api/appointments/1
     Content-Type: application/json
     {
       "admitStatus": "admit"
     }
     ```
   - DELETE ลบนัดหมาย:
     ```
     DELETE http://localhost:3001/api/appointments/1
     ```

---

## ER Diagram และคำอธิบายความสัมพันธ์

```mermaid
erDiagram
  Patient {
    INT id PK "Primary Key, Auto Increment"
    STRING hn "Hospital Number (รหัสผู้ป่วย), Unique"
    STRING firstName
    STRING lastName
  }
  Appointment {
    INT id PK "Primary Key, Auto Increment"
    INT patientId FK "Foreign Key to Patient.id"
    DATETIME date
    STRING chemoRegimen
    STRING admitStatus
  }
  Patient ||--o{ Appointment : has
```

### คำอธิบาย
- **Patient**
  - `id`: Primary Key (เลขลำดับอัตโนมัติ)
  - `hn`: รหัสผู้ป่วย (Hospital Number) ใช้สำหรับค้นหา/แสดงผล (ต้องไม่ซ้ำ)
  - `firstName`, `lastName`: ชื่อ-นามสกุลผู้ป่วย
- **Appointment**
  - `id`: Primary Key (เลขลำดับอัตโนมัติ)
  - `patientId`: Foreign Key อ้างอิงไปที่ `Patient.id`
  - `date`: วันที่นัดหมาย
  - `chemoRegimen`: สูตรยาเคมีบำบัด
  - `admitStatus`: สถานะการ admit (waiting, admit, discharged, ...)
- **ความสัมพันธ์**
  - ผู้ป่วย 1 คน (Patient) มีนัดหมายได้หลายรายการ (Appointment)
  - แต่ละ Appointment ต้องระบุว่าเป็นของผู้ป่วยคนใด (ผ่าน patientId)

---

## Frontend: Appointment Dashboard (แดชบอร์ดนัดหมาย)

- **frontend/src/pages/AppointmentDashboard.jsx**
  - ดึงข้อมูลนัดหมายจาก backend (`/api/appointments`)
  - แสดงตารางนัดหมาย (ชื่อผู้ป่วย, วันนัด, สูตรยา, สถานะ)
  - ปุ่ม Refresh สำหรับดึงข้อมูลใหม่
  - ถ้า backend include patient ใน API จะเห็นชื่อผู้ป่วยในตาราง

- **frontend/src/App.jsx**
  - เพิ่มปุ่มสลับหน้าแดชบอร์ดผู้ป่วย/แดชบอร์ดนัดหมาย
  - สามารถดูข้อมูลทั้ง 2 แบบได้ในระบบเดียว

### วิธีทดสอบ
1. รัน backend และ frontend ให้เรียบร้อย
2. เปิดหน้าเว็บ จะเห็นปุ่มสลับหน้า "แดชบอร์ดผู้ป่วย" และ "แดชบอร์ดนัดหมาย"
3. กด "แดชบอร์ดนัดหมาย" จะเห็นตารางนัดหมายที่ดึงจาก backend
4. ถ้ามีข้อมูลนัดหมายในฐานข้อมูล จะเห็นชื่อผู้ป่วย วันนัด สูตรยา และสถานะ
5. กดปุ่ม Refresh เพื่อดึงข้อมูลใหม่จาก backend

### ฟีเจอร์: เพิ่มนัดหมายใหม่ (Add Appointment)
- ในหน้า Appointment Dashboard จะมีฟอร์มสำหรับเพิ่มนัดหมายใหม่
- สามารถเลือกผู้ป่วยจาก dropdown (ดึงจาก backend), กรอกวันนัด, สูตรยา, สถานะ
- เมื่อกด "เพิ่มนัดหมาย" จะ POST ข้อมูลไป backend และ refresh ตารางอัตโนมัติ
- ใช้ patientId ที่มีอยู่จริงในฐานข้อมูลเท่านั้น

### วิธีทดสอบ
1. เปิดหน้าแดชบอร์ดนัดหมาย (Appointment Dashboard)
2. กรอกข้อมูลในฟอร์ม (เลือกผู้ป่วย, วันนัด, สูตรยา, สถานะ)
3. กดปุ่ม "เพิ่มนัดหมาย"
4. ตารางนัดหมายจะ refresh และแสดงข้อมูลนัดหมายใหม่ทันที

### ฟีเจอร์: ปุ่ม Edit สถานะนัดหมาย (Inline Edit)
- ในแต่ละแถวของตารางนัดหมายจะมีปุ่ม Edit สำหรับแก้ไขสถานะ (admitStatus) ได้ทันที
- เมื่อคลิก Edit จะเปลี่ยนสถานะเป็น dropdown ให้เลือกสถานะใหม่ (waiting, admit, discharged, missed, rescheduled)
- เมื่อเลือกสถานะใหม่แล้วกด Save จะ PATCH ไป backend (`/api/appointments/:id/status`) และ refresh ตาราง
- สามารถ Cancel เพื่อยกเลิกการแก้ไขได้
- ป้องกันความผิดพลาดจากการ click ผิดปุ่ม Check-in/D/C

**ตัวอย่างโค้ดสำคัญ:**
```jsx
// State
const [editId, setEditId] = useState(null);
const [editStatus, setEditStatus] = useState('');

// เริ่มแก้ไข
const startEdit = (a) => {
  setEditId(a.id);
  setEditStatus(a.admitStatus);
};
// บันทึกการแก้ไข
const saveEdit = async (id) => {
  await fetch(`http://localhost:3001/api/appointments/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ admitStatus: editStatus }),
  });
  setEditId(null);
  setEditStatus('');
  fetchAppointments();
};
// ยกเลิก
const cancelEdit = () => {
  setEditId(null);
  setEditStatus('');
};
```

**วิธีทดสอบ:**
1. ในตารางนัดหมาย กดปุ่ม Edit ในแถวที่ต้องการแก้ไขสถานะ
2. เลือกสถานะใหม่จาก dropdown แล้วกด Save
3. ตารางจะ refresh และแสดงสถานะใหม่ทันที
4. ถ้าต้องการยกเลิกการแก้ไข กด Cancel

---

## สรุปและขั้นตอนการเชื่อมโยง Appointment กับ Patient (สำหรับสอน)

### 1. โครงสร้างฐานข้อมูล (ER Diagram)
- ตาราง Patient มี id (PK) และ hn (รหัสผู้ป่วย)
- ตาราง Appointment มี patientId (FK) ที่อ้างอิงไปยัง Patient.id
- ความสัมพันธ์: ผู้ป่วย 1 คน มีได้หลาย appointment

### 2. Backend (Node.js + Express + Prisma)
- **GET /api/appointments**
  - คืนข้อมูลนัดหมายทั้งหมด พร้อมข้อมูลผู้ป่วย (include patient)
- **POST /api/appointments**
  - ตรวจสอบว่า patientId มีอยู่จริงในฐานข้อมูลก่อนสร้าง appointment
  - ถ้า patientId ไม่ถูกต้อง จะคืน error ที่เข้าใจง่าย
  - ถ้า patientId ถูกต้อง จะสร้าง appointment ที่สัมพันธ์กับ patient

**ตัวอย่างโค้ดสำคัญ:**
```js
// ตรวจสอบ patientId ก่อนสร้าง appointment
const patient = await prisma.patient.findUnique({ where: { id: Number(data.patientId) } });
if (!patient) {
  return res.status(400).json({ error: 'patientId ไม่ถูกต้อง หรือไม่มีในฐานข้อมูล' });
}
// สร้าง appointment
const appointment = await prisma.appointment.create({ ... });
```

### 3. Frontend (React)
- ดึงรายชื่อผู้ป่วยทั้งหมดจาก `/api/patients` มาแสดงใน dropdown หรือ autocomplete
- เมื่อเลือกผู้ป่วย จะได้ patientId ที่ถูกต้องไปใช้กับ backend
- เมื่อเพิ่มนัดหมายใหม่สำเร็จ ตารางนัดหมายจะ refresh และแสดงชื่อผู้ป่วยด้วย

**ตัวอย่างโค้ด dropdown:**
```jsx
<select name="patientId" value={form.patientId} onChange={handleChange} required>
  <option value="">-- เลือกผู้ป่วย --</option>
  {patients.map(p => (
    <option key={p.id} value={p.id}>
      {p.firstName} {p.lastName} (HN: {p.hn})
    </option>
  ))}
</select>
```

### 4. วิธีทดสอบ (Step by Step)
1. เปิด Prisma Studio → ดูเลข id ในตาราง Patient
2. ในหน้าเพิ่มนัดหมาย ให้เลือกผู้ป่วยจาก dropdown/autocomplete เท่านั้น
3. กรอกข้อมูลอื่น ๆ ให้ครบ
4. กด "เพิ่มนัดหมาย"
5. ตารางนัดหมายจะ refresh และแสดงข้อมูลใหม่ พร้อมชื่อผู้ป่วย
6. ถ้าเลือก patientId ที่ไม่มี จะขึ้น error ชัดเจน

---

**หมายเหตุ:**
- ต้องเลือก patient จาก dropdown/autocomplete เท่านั้น ห้ามพิมพ์เลขเอง
- ถ้าเพิ่มนัดหมายไม่ได้ ให้ดู error message ที่ backend หรือใน response
- สามารถขยายฟีเจอร์ เช่น แก้ไข/ลบ appointment, filter, export PDF ฯลฯ ได้ต่อไป

---

### ฟีเจอร์: Export PDF ตารางนัดหมาย
- เพิ่มปุ่ม "Export PDF" ในหน้าแดชบอร์ดนัดหมาย (AppointmentDashboard)
- เมื่อกดปุ่ม ระบบจะสร้างไฟล์ PDF ตารางนัดหมาย (ชื่อผู้ป่วย, วันนัด, สูตรยา, สถานะ) โดยใช้ไลบรารี `jspdf` และ `jspdf-autotable`
- สามารถดาวน์โหลดไฟล์ `appointments.pdf` ได้ทันที

**ตัวอย่างโค้ดสำคัญ:**
```jsx
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const exportPDF = () => {
  const doc = new jsPDF();
  doc.text('ตารางนัดหมายผู้ป่วย', 14, 16);
  doc.autoTable({
    startY: 22,
    head: [['ชื่อผู้ป่วย', 'วันนัด', 'สูตรยา', 'สถานะ']],
    body: appointments.map(a => [
      a.patient ? `${a.patient.firstName} ${a.patient.lastName}` : '-',
      a.date ? new Date(a.date).toLocaleString() : '-',
      a.chemoRegimen,
      a.admitStatus
    ]),
  });
  doc.save('appointments.pdf');
};
```

**วิธีทดสอบ:**
1. เปิดหน้าแดชบอร์ดนัดหมาย (AppointmentDashboard)
2. กดปุ่ม "Export PDF" เหนือตารางนัดหมาย
3. ระบบจะดาวน์โหลดไฟล์ `appointments.pdf` ที่มีข้อมูลนัดหมายทั้งหมด

### ขั้นตอนที่ 1: Backend - API สำหรับ Register และ Login
- **ติดตั้ง dependency:**
  - ติดตั้ง `jsonwebtoken` สำหรับสร้างและยืนยัน token
  - ติดตั้ง `bcryptjs` สำหรับเข้ารหัสรหัสผ่านอย่างปลอดภัย
  ```sh
  cd backend
  npm install jsonwebtoken bcryptjs
  ```
- **สร้าง User Routes (`backend/src/routes/user.js`):**
  - สร้าง endpoint `POST /api/users/register` สำหรับสมัครสมาชิกใหม่ โดยจะเข้ารหัสรหัสผ่านก่อนบันทึกลงฐานข้อมูล และตรวจสอบ Role ที่ส่งมา (ต้องเป็น ADMIN, DOCTOR, หรือ NURSE เท่านั้น)
  - สร้าง endpoint `POST /api/users/login` สำหรับเข้าระบบ โดยจะเปรียบเทียบรหัสผ่านที่ส่งมากับที่เข้ารหัสไว้ในฐานข้อมูล ถ้าถูกต้องจะสร้าง JWT token คืนไปให้ frontend
- **เพิ่ม JWT Secret:**
  - เพิ่ม `JWT_SECRET` ในไฟล์ `.env` ของ backend สำหรับใช้สร้าง token
  - **สำคัญ:** ควรตั้งค่านี้เป็นข้อความลับที่ไม่ซ้ำใครและซับซ้อน
  ```env
  # backend/.env
  DATABASE_URL="mysql://user:password@localhost:3306/chemo_db"
  JWT_SECRET="YOUR_SUPER_SECRET_KEY_HERE"
  ```

**วิธีทดสอบ API (ด้วย Postman):**
1. **Register User:**
   - **POST** `http://localhost:3001/api/users/register`
   - **Body (raw, JSON):**
     ```json
     {
       "name": "Test Nurse",
       "email": "nurse@example.com",
       "password": "password123",
       "role": "NURSE"
     }
     ```
   - จะได้รับข้อมูล user ที่สร้างใหม่กลับมา (สถานะ 201)
2. **Login:**
   - **POST** `http://localhost:3001/api/users/login`
   - **Body (raw, JSON):**
     ```json
     {
       "email": "nurse@example.com",
       "password": "password123"
     }
     ```
   - จะได้รับ `token` และข้อมูล `user` กลับมา (สถานะ 200)

### ขั้นตอนที่ 2: Backend - Middleware สำหรับ Authorization
- **สร้าง `backend/src/middlewares/auth.js`**:
  - `authenticateToken`: Middleware สำหรับตรวจสอบ JWT Token ที่ส่งมาใน Header ของทุก request ที่ต้องการการยืนยันตัวตน
  - `authorizeRoles`: Middleware สำหรับตรวจสอบว่า Role ของผู้ใช้ (ที่ได้จาก Token) มีสิทธิ์ในการเข้าถึง endpoint นั้นๆ หรือไม่
- **นำ Middleware ไปใช้กับ Routes**:
  - `patient.js` และ `appointment.js` จะถูกป้องกันด้วย `authenticateToken` ทั้งหมด
  - แต่ละ endpoint จะมีการใช้ `authorizeRoles` เพื่อกำหนดสิทธิ์อย่างละเอียด เช่น
    - `POST /api/patients`: อนุญาตเฉพาะ `ADMIN`, `DOCTOR`
    - `DELETE /api/patients/:hn`: อนุญาตเฉพาะ `ADMIN`
    - `PATCH /api/appointments/:id/status`: อนุญาตทุกสิทธิ์ที่ login แล้ว (`ADMIN`, `DOCTOR`, `NURSE`)

**วิธีทดสอบ API ที่มีการป้องกันสิทธิ์ (ด้วย Postman):**
1. **Login** เพื่อรับ Token (ตามขั้นตอนที่ 1)
2. **Copy Token** ที่ได้รับมา
3. **ไปที่ Request ที่ต้องการทดสอบ** (เช่น `GET /api/patients`)
4. **ไปที่ Tab `Authorization`**:
   - เลือก `Type` เป็น `Bearer Token`
   - วาง Token ที่ copy มาในช่อง `Token`
5. **ส่ง Request**
   - ถ้า Token และสิทธิ์ถูกต้อง จะได้รับข้อมูลกลับมา (สถานะ 200)
   - ถ้าไม่มี Token หรือ Token ไม่ถูกต้อง จะได้รับสถานะ `401 Unauthorized`
   - ถ้าสิทธิ์ไม่ถึง (เช่น Nurse พยายามลบผู้ป่วย) จะได้รับสถานะ `403 Forbidden`

---