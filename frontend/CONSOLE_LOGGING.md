# Console Logging Guide

## 📋 ภาพรวม
ระบบ console logging ถูกออกแบบมาเพื่อช่วยในการ debug และ monitor การทำงานของแอปพลิเคชัน

## 🔍 ประเภทของ Log

### 1. 🚀 Application Lifecycle
- **App Start**: เมื่อแอปเริ่มต้น
- **Route Changes**: เมื่อเปลี่ยนหน้า
- **Component Mount**: เมื่อ component ถูกโหลด

### 2. 🔐 Authentication
- **Login Attempts**: การพยายามเข้าสู่ระบบ
- **Login Success/Failure**: ผลลัพธ์การเข้าสู่ระบบ
- **Logout**: การออกจากระบบ
- **Token Changes**: การเปลี่ยนแปลง token

### 3. 📡 API Calls
- **Request Details**: รายละเอียดการเรียก API
- **Response Status**: สถานะการตอบกลับ
- **Error Handling**: การจัดการข้อผิดพลาด
- **Performance**: เวลาที่ใช้ในการเรียก API

### 4. 👤 User Interactions
- **Form Submissions**: การส่งฟอร์ม
- **Button Clicks**: การคลิกปุ่ม
- **Input Changes**: การเปลี่ยนแปลงข้อมูลใน input

### 5. 🚨 Error Handling
- **Global Errors**: ข้อผิดพลาดทั่วไป
- **React Errors**: ข้อผิดพลาดใน React
- **API Errors**: ข้อผิดพลาดจาก API
- **Unhandled Promises**: Promise ที่ไม่ได้รับการจัดการ

## 🛠️ วิธีใช้งาน

### การดู Log ใน Browser
1. เปิด Developer Tools (F12)
2. ไปที่แท็บ Console
3. ดู log ที่มี emoji และสีต่างๆ

### การ Filter Log
```javascript
// ดูเฉพาะ error
console.error('ข้อความ')

// ดูเฉพาะ warning
console.warn('ข้อความ')

// ดูข้อมูลในรูปแบบตาราง
console.table(data)

// จัดกลุ่ม log
console.group('ชื่อกลุ่ม')
console.log('ข้อมูล')
console.groupEnd()
```

## 📊 Emoji Legend

| Emoji | ความหมาย | ตัวอย่าง |
|-------|----------|----------|
| 🚀 | Application Start | แอปเริ่มต้น |
| 📍 | Route Change | เปลี่ยนหน้า |
| 🔐 | Authentication | การยืนยันตัวตน |
| 📡 | API Call | การเรียก API |
| ✅ | Success | สำเร็จ |
| ❌ | Error | ข้อผิดพลาด |
| ⚠️ | Warning | คำเตือน |
| 💥 | Critical Error | ข้อผิดพลาดร้ายแรง |
| 👤 | User Action | การกระทำของผู้ใช้ |
| 📝 | Form Data | ข้อมูลฟอร์ม |
| 🔍 | Search | การค้นหา |
| 📄 | Export | การส่งออกข้อมูล |
| 💾 | Storage | การจัดเก็บข้อมูล |
| ⚡ | Performance | ประสิทธิภาพ |

## 🔧 การปรับแต่ง

### เพิ่ม Log ใน Component ใหม่
```javascript
import { logComponent, logUserAction } from '../utils/debug.js';

const MyComponent = (props) => {
  // Log component mount
  React.useEffect(() => {
    console.log('📱 MyComponent mounted');
  }, []);

  // Log user action
  const handleClick = () => {
    logUserAction('button_clicked', { buttonName: 'submit' });
    // ... logic
  };

  return <div>...</div>;
};
```

### ใช้ API Utility
```javascript
import { api } from '../utils/api.js';

// แทนที่จะใช้ fetch โดยตรง
const data = await api.getPatients(token);
```

### วัดประสิทธิภาพ
```javascript
import { measureAsyncPerformance } from '../utils/debug.js';

const result = await measureAsyncPerformance('fetchData', async () => {
  return await fetch('/api/data');
});
```

## 🚨 การจัดการ Error

### Error Boundary
- จับ React errors และแสดง fallback UI
- Log ข้อมูล error อย่างละเอียด
- แสดงรายละเอียด error ใน development mode

### Global Error Handlers
- จับ JavaScript errors ทั่วไป
- จับ unhandled promise rejections
- Log ข้อมูล error พร้อม context

## 📈 Performance Monitoring

### การวัดประสิทธิภาพ
- เวลาที่ใช้ในการเรียก API
- เวลาที่ใช้ในการ render component
- เวลาที่ใช้ในการประมวลผลข้อมูล

### การ Optimize
- ใช้ React.memo สำหรับ component ที่ไม่ต้อง re-render บ่อย
- ใช้ useMemo และ useCallback สำหรับ expensive operations
- ใช้ lazy loading สำหรับ component ขนาดใหญ่

## 🔍 Tips สำหรับ Debug

1. **ใช้ Console Groups**: จัดกลุ่ม log ที่เกี่ยวข้องกัน
2. **ใช้ Console Table**: แสดงข้อมูลในรูปแบบตาราง
3. **ใช้ Conditional Logging**: Log เฉพาะใน development mode
4. **ใช้ Performance API**: วัดประสิทธิภาพของโค้ด
5. **ใช้ Network Tab**: ดูการเรียก API ในแท็บ Network

## 📝 Best Practices

1. **ไม่ Log ข้อมูลที่ละเอียดอ่อน**: เช่น password, token
2. **ใช้ Emoji**: เพื่อให้ log อ่านง่าย
3. **รวม Timestamp**: เพื่อติดตามเวลา
4. **Log Context**: เช่น URL, user info
5. **ใช้ Error Boundary**: เพื่อป้องกัน app crash
6. **Clean Up**: ลบ log ที่ไม่จำเป็นใน production

## 🚀 Production Considerations

ใน production mode:
- ลด log ที่ไม่จำเป็น
- ไม่แสดงข้อมูลที่ละเอียดอ่อน
- ใช้ error reporting service
- เก็บ log เฉพาะ error และ warning ที่สำคัญ 