# 🎉 Play With Yok

รวมมิตรเกมปาร์ตี้ในเว็บเดียว: วงล้อสุ่มชื่อ, ซ่อนหา, ตำรวจจับโจร และ Play ASUS
เขียนด้วย HTML/CSS/JavaScript ล้วน (ไม่มี build step) มีเสียงพูดภาษาไทยผ่าน Web Speech API และเอฟเฟกต์เสียงที่สร้างขึ้นเองแบบ real-time (ไม่ต้องใช้ไฟล์เสียงภายนอก)

## โครงสร้างไฟล์

```
playwithyok/
├── index.html            หน้าแรก
├── games.html            หน้าเลือกเกม
├── roulette.html          🎡 วงล้อสุ่มชื่อ
├── hideandseek.html       🙈 ซ่อนหา
├── police-thief.html      🚓 ตำรวจจับโจร
├── play-asus.html         🎭 Play ASUS
├── css/style.css          ดีไซน์ระบบรวม (โทนสดใส-พรีเมียม)
└── js/
    ├── sound.js           เสียงคลิก/เอฟเฟกต์ + Text-to-Speech ภาษาไทย
    ├── roulette.js
    ├── hideandseek.js
    ├── police-thief.js
    └── play-asus.js
```

## รันดูบนเครื่องตัวเอง

ไม่ต้องติดตั้งอะไรเพิ่ม แค่เปิดด้วย local server (เบราว์เซอร์บางตัวบล็อก fetch/font บน `file://`):

```bash
cd playwithyok
python3 -m http.server 8080
# แล้วเปิด http://localhost:8080
```

## Deploy ขึ้น GitHub

1. สร้าง repository ใหม่ แล้วอัปโหลดไฟล์ทั้งหมดในโฟลเดอร์ `playwithyok/` ขึ้นไป (เป็น root ของ repo)
2. ถ้าจะใช้ GitHub Pages: ไปที่ Settings → Pages → เลือก branch `main` และโฟลเดอร์ `/root` แล้วบันทึก

## Deploy ขึ้น Vercel

1. Push โค้ดขึ้น GitHub ตามข้อด้านบน
2. เข้า [vercel.com](https://vercel.com) → New Project → เลือก repo นี้
3. Framework Preset เลือก **Other** (เป็น static site ล้วน ไม่ต้องตั้งค่า build command หรือ output directory)
4. กด Deploy — เสร็จแล้ว 🎉

## หมายเหตุเรื่องเสียงพูด

- ใช้ `speechSynthesis` (Web Speech API) ของเบราว์เซอร์ ตั้งค่าภาษาเป็น `th-TH`
- คุณภาพเสียงและความแม่นยำขึ้นอยู่กับเสียงพูดที่เบราว์เซอร์/อุปกรณ์นั้นมีติดตั้งไว้ (Chrome บน Android/Windows มักมีเสียงไทยมาให้; iOS Safari ก็รองรับ)
- โหมด "แรง" ในเกมซ่อนหาจะนับเร็วมาก เสียงพูดอาจพูดไม่ทันสนิท — เป็นข้อจำกัดปกติของ TTS ความเร็วสูง

## ปรับแต่งเพิ่มเติม

- สีธีมและ token ของดีไซน์ทั้งหมดอยู่ใน `:root` ของ `css/style.css` ปรับสีเกมแต่ละใบได้ที่ `--gc` บนการ์ดใน `games.html`
- จำนวนรอบหมุนของวงล้อ/ระยะเวลาอนิเมชันปรับได้ใน `js/roulette.js` (ตัวแปร `extraSpins`, `duration`)
- ความเร็วนับของเกมซ่อนหาปรับได้ที่ตัวแปร `SPEEDS` ใน `js/hideandseek.js`
