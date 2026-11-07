# Laundry Budget Planner

เว็บคำนวณค่าซักผ้าสำหรับ 2 คน สร้างด้วย React + Vite พร้อม deploy บน Vercel

## ค่าเริ่มต้น
- เริ่มวันที่ 7 พฤศจิกายน 2026
- ซักและอบวันอังคาร + วันเสาร์ (2 รอบ/สัปดาห์)
- ซัก 30 บาท/รอบ, อบ 50 บาท/รอบ
- หารเท่ากัน 2 คน

## รันในเครื่อง
```bash
npm install
npm run dev
```

## Deploy บน Vercel
1. แตกไฟล์ ZIP แล้ว push โฟลเดอร์นี้ขึ้น GitHub
2. เข้า https://vercel.com/new แล้ว Import Git Repository
3. Framework Preset เลือก Vite (หรือให้ Vercel ตรวจจับอัตโนมัติ)
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. กด Deploy

ไม่มี backend หรือ environment variables ที่ต้องตั้งค่า
