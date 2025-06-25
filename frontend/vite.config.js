import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // ไม่ต้องตั้งค่า proxy แล้ว เพราะเรียก API ตรง ๆ ที่ http://localhost:5000
})
