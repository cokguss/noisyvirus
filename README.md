<div align="center">

# Noisy Virus

**Pindai file, hash, dan URL melawan 70+ mesin antivirus — sebelum sempat menyentuh perangkat Anda**

Scan URL · Scan file · Lookup hash · Dual engine (API resmi / stealth)

[![Node](https://img.shields.io/badge/Node-Express-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Vanilla JS](https://img.shields.io/badge/Frontend-Vanilla%20JS%20%2B%20Three.js-f7df1e?logo=javascript&logoColor=black)](#)
[![License](https://img.shields.io/badge/Penggunaan-pribadi-a855f7)](LICENSE.md)

</div>

---

## ✨ Fitur

| Fitur | Kemampuan |
|-------|-----------|
| **Scan URL** | Periksa reputasi tautan terhadap puluhan mesin antivirus via VirusTotal |
| **Scan file** | Unggah file (maks 32 MB) dan dapatkan laporan deteksi lengkap |
| **Lookup hash** | Cek MD5 / SHA-1 / SHA-256 langsung tanpa mengunggah apa pun |
| **Hash-first** | File di-fingerprint SHA-256 secara lokal — jika sudah dikenal VirusTotal, file tidak pernah dikirim |
| **Dual engine** | Pakai VT API resmi bila ada key; tanpa key otomatis beralih ke mode stealth (browser headless) |

**Fitur umum**

- 🎨 Tampilan dark sinematik dengan scene 3D interaktif (Three.js), partikel, dan kamera parallax mengikuti scroll
- 🎬 Intro dua babak dengan animasi staggered + watchdog anti-stuck untuk perangkat lambat
- 🔊 Musik latar (YouTube) dan efek blip saat berinteraksi dengan objek 3D
- 🌐 Bilingual ID/EN — berpindah bahasa sekali klik, tersimpan di localStorage
- 📱 Responsif penuh — desktop maupun mobile, dengan mode animasi sederhana otomatis untuk perangkat lemah
- 📄 Kebijakan Privasi & Ketentuan Layanan dengan latar scene 3D yang sama

## 🚀 Menjalankan Secara Lokal

**Prasyarat:** Node.js 18+ (opsional: Chrome/Edge untuk mode stealth)

```bash
# 1. Install dependensi
npm install

# 2. Siapkan environment
#    Salin .env.example menjadi .env lalu isi:
#    VT_API_KEY=<kunci-virustotal-anda>   # opsional — tanpa key dipakai mode stealth
#    PORT=3000
#    CHROME_PATH=                          # opsional, jalur chrome.exe khusus

# 3. Jalankan server
npm start        # atau: npm run dev
```

Buka **http://localhost:3000** — selesai.

### Script yang tersedia

| Perintah | Fungsi |
|----------|--------|
| `npm start` | Menjalankan server (`node server.js`) |
| `npm run dev` | Sama dengan `start` |

## 🧠 Cara Kerja

```
Browser ──► Express (server.js) ──► VirusTotal
   │               │                   ├── API v3 resmi  : bila VT_API_KEY tersedia
   │               │                   └── Mode stealth  : Puppeteer + plugin stealth
   │               │                                      (tanpa key, menyadap respons GUI)
   │               ├── SHA-256 lokal ── file dikenal? tidak pernah diunggah
   │               ├── Cache in-memory 10 menit + throttle 4 req/menit
   └── Three.js ── scene 3D: equalizer bars, signal core, satelit orbit, partikel
```

**Kenapa dua engine?** Mode API memberi kecepatan dan kuota resmi. Mode stealth hadir untuk tetap bisa memindai tanpa kunci API — membuka GUI VirusTotal lewat browser headless yang menyamar (puppeteer-extra-plugin-stealth) lalu membaca respons jaringannya, sehingga tidak perlu akun maupun key. Pemilihan engine otomatis saat server boot.

**Alur scan file:** file dihitung hash SHA-256-nya di memori server → hash dicari dulu di VirusTotal → bila sudah ada laporannya, file asli tidak pernah meninggalkan mesin pengguna; bila belum, barulah file diunggah sekali untuk dipindai.

## 📁 Struktur Proyek

```
noisy-virus/
├── server.js               # Server Express + /api/check/{url,hash,file}, /api/health
├── lib/
│   ├── vt-api.js           # Client VirusTotal API v3 (fetch native)
│   ├── vt-scraper.js       # Mode stealth (puppeteer-extra + stealth plugin)
│   └── normalize.js        # Penyeragam respons VT → format laporan tunggal
├── public/
│   ├── index.html          # Halaman utama (intro, scanner, hasil)
│   ├── app.js              # Logika frontend (scan, i18n, intro, audio)
│   ├── scene.js            # Scene 3D Three.js (deferred boot, low-fps aware)
│   ├── style.css           # Seluruh gaya (dark theme, responsif, fallback engine lama)
│   ├── privacy.html        # Kebijakan Privasi
│   ├── terms.html          # Ketentuan Layanan
│   └── dev-avatar.png, bloodskill.png
├── .env.example            # Template environment
└── package.json
```

## ☁️ Deploy

Aplikasi ini adalah server Node tunggal yang menyajikan frontend statis sekaligus API proxy.

| Bagian | Hosting | Platform yang cocok |
|--------|---------|---------------------|
| Server + frontend | Node.js runtime | Render, Railway, Fly.io, VPS |

**Langkah deploy:**

1. Set environment variable `VT_API_KEY` (dan `PORT` bila disediakan platform).
2. Deploy sebagai layanan Node dengan perintah start `node server.js`.

> Mode stealth membutuhkan Chrome/Edge di host — di platform serverless biasanya tidak tersedia, jadi setel `VT_API_KEY` untuk pengalaman paling stabil. Jangan meng-commit `.env` — atur variabel melalui dashboard Environment Variables.

## ⚠️ Catatan

- Hasil pemindaian bersumber dari mesin antivirus pihak ketiga via VirusTotal dan bukan jaminan mutlak aman/bahaya — selalu verifikasi dengan beberapa sumber untuk keputusan penting.
- Mode stealth bergantung pada struktur GUI VirusTotal yang dapat berubah sewaktu-waktu; mode API resmi lebih tahan lama.
- Quota API gratis VirusTotal dibatasi (± 4 permintaan/menit) — server sudah membungkusnya dengan throttle dan cache internal.

---

<div align="center">
Dibuat dengan 💜 oleh <b>Noisy</b> &amp; <b>BloodSKill</b> — Noisy Virus
</div>
