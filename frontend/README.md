# THEATRO

Vue 3, Vite, Vue Router, Pinia va Lucide asosida yaratilgan o‘zbek tilidagi teatr sayti.

## Ishga tushirish

Node.js 22.12+ (yoki 20.19+) talab qilinadi.

```sh
cd frontend
npm install
# .env mavjud bo‘lmasa:
# .env.example faylidan .env yarating va ADMIN_PASSWORD ni belgilang (kamida 12 belgi).
npm run dev
```

Sayt: `http://localhost:5174`. Admin panel: `http://localhost:5174/admin`.

Ushbu ishchi nusxada `.env` fayliga tasodifiy admin paroli yaratildi. Kirishda
shu fayldagi `ADMIN_PASSWORD` qiymatidan foydalaning. Login nomi talab qilinmaydi.
`.env` Git va frontend to‘plamiga kiritilmaydi. Namunadagi parol bilan server ishlamaydi.

`npm run dev` API serveri va Vite’ni birga ishga tushiradi. `npm run dev:frontend`
faqat sayt maketini ochadi; unda admin orqali saqlash uchun API alohida ishlashi kerak.

## Admin panel

- Spektakllar, aktyorlar, yutuqlar va galereya: qo‘shish, tahrirlash, qidirish va tasdiqlab o‘chirish.
- Bosh sahifa: muqova va animatsiyali rasmni kompyuterdan tanlab yuklash.
  PNG, JPG, WebP va GIF formatlari, har bir fayl uchun 10 MB gacha.
  Rasm yuklangach, ko‘rinishini tekshirib «Saqlash» tugmasini bosing.
  Yuklangan fayllar `DATA_DIR/uploads` (odatda `server/data/uploads`) ichida
  saqlanadi va build yangilanganda saqlanib qoladi. Bu papka ham zaxiralanishi kerak.
- Ijtimoiy tarmoqlar: nomi va HTTPS havolasini qo‘shish, tahrirlash va o‘chirish.
  Ikonkani ro‘yxatdan tanlash va saqlashdan oldin ko‘rish mumkin; avtomatik tanlash ham mavjud.
  Saqlangan havolalar sayt footerida yangi oynada ochiladi. Instagram, Telegram,
  YouTube, Facebook va LinkedIn uchun mos ikonka, boshqa saytlar uchun umumiy ikonka ko‘rsatiladi.
- Rasmlar: HTTPS havola, `/media/rasm.webp` kabi mahalliy yo‘l yoki Unsplash `photo-…` identifikatori.
- Repertuar sanaga qarab oylar bo‘yicha guruhlanadi.

O‘zgarishlar `server/data/content.json` faylida saqlanadi. Ushbu papkani zaxiralang;
hostingda doimiy diskka joylashtiring (`DATA_DIR` bilan yo‘lini belgilash mumkin).
Boshlang‘ich namuna ma’lumotlari `shared/default-content.json` faylida.
Sessiya 8 soat amal qiladi, server qayta ishga tushirilsa qayta kirish kerak.
API saqlashdan avval ma’lumotlarni tekshiradi; noto‘g‘ri parolga beshta urinishdan
keyin 15 daqiqalik cheklov qo‘yiladi.

## Production

```sh
npm run build
npm start
```

`npm start` yig‘ilgan `dist` fayllari va API’ni bitta serverdan beradi.
Mahalliy manzil: `http://localhost:3002/admin`. HTTPS hostingda `.env` ichida
`APP_ORIGIN=https://sizning-domeningiz.uz` va `COOKIE_SECURE=true` belgilang.
HTTPS reverse proxy’ni API serveriga yo‘naltiring. `PORT` va `HOST` bilan tinglash
manzilini o‘zgartirish mumkin; odatiy qiymatlar `3002` va `127.0.0.1`.
Admin panel uchun faqat `dist` fayllarini statik hostingga yuklash yetarli emas:
Node.js serveri ham ishlashi kerak. Server bitta nusxada ishlash uchun mo‘ljallangan.

```sh
npm test
```

Testlar autentifikatsiya, ruxsatsiz so‘rovlar, tekshirish, yozuvlarni boshqarish,
diskda saqlash va server qayta ishga tushgandan keyingi holatni tekshiradi.

To‘lov va chipta broni ulanmagan. Kontaktlar, mavsum va boshlang‘ich spektakllar namuna ma’lumotlari. Rasmlar Unsplash, shriftlar Google Fonts orqali yuklanadi; internet bo‘lmasa zaxira rang va shriftlar ishlatiladi.

- Teatr haqida: kichik va asosiy sarlavha, ajratilgan so‘z, ichki sarlavha,
  teatr haqida matn, rasm tavsifi va ixtiyoriy izoh. Rasm kompyuterdan yuklanadi.
  Saqlangach `/about` sahifasi yangilanadi; avvalgi ma’lumotlar saqlanib qoladi.
- Aloqa: teatr manzili, telefon, email, kassa ish vaqti, HTTPS xarita havolasi
  va ixtiyoriy izoh. Saqlangan ma’lumotlar `/contact` sahifasi va footerda ko‘rinadi.

## Port sozlamalari

API uchun .env ichida PORT=3002 ishlating. Frontend Vite 5174 portida ochiladi. Ikkalasiga 5174 qo‘yilsa dev server ishga tushmaydi. .env o‘zgargach serverni qayta ishga tushiring.
