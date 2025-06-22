# Dockerfile สำหรับ backend (Node.js + Prisma + MySQL)
FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Prisma generate (ไม่ migrate อัตโนมัติ ให้ migrate ผ่าน docker-compose exec)
RUN npx prisma generate

EXPOSE 5000

CMD ["npm", "run", "dev"] 