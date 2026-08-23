<div align="center">

# Noisy Virus

**Pindai file, hash, dan URL melawan 70+ mesin antivirus — sebelum sempat menyentuh perangkat Anda**

Scan URL · Scan file · Lookup hash · VirusTotal API v3

[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel&logoColor=white)](https://vercel.com)
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
| **Hash-first** | File di-fingerprint SHA-256 di browser — jika sudah dikenal VirusTotal, file tidak pernah dikirim |
| **Streaming relay** | File baru diunggah lewat relai yang mengalirkan body langsung ke VirusTotal tanpa buffering — lolos dari batas body 4.5 MB khas serverless |

**Fitur umum**

- 🎨 Tampilan dark sinematik dengan scene 3D interaktif (Three.js), partikel, dan kamera parallax mengikuti scroll
- 🎬 Intro dua babak dengan animasi staggered + watchdog anti-stuck untuk perangkat lambat
- 🔊 Musik latar (YouTube) dan efek blip saat berinteraksi dengan objek 3D
- 🌐 Bilingual ID/EN — berpindah bahasa sekali klik, tersimpan di localStorage
- 📱 Responsif penuh — desktop maupun mobile, dengan mode animasi sederhana otomatis untuk perangkat lemah
- 📄 Kebijakan Privasi & Ketentuan Layanan dengan latar scene 3D yang sama

## 🚀 Menjalankan Secara Lokal

**Prasyarat:** Node.js 18+ dan akun VirusTotal gratis (untuk API key). Tanpa dependensi npm sama sekali.

```bash
# 1. Isi environment (file .env sudah dibaca dev-server; contoh ada di repo)
#    VT_API_KEY=<kunci-virustotal-anda>
#    PORT=3000

# 2. Jalankan
npm install     # opsional; hanya membersihkan node_modules lama
npm start       # atau: npm run dev
```

Buka **http://localhost:3000** — selesai.

### Script yang tersedia

| Perintah | Fungsi |
|----------|--------|
| `npm start` / `npm run dev` | Server dev lokal tanpa dependensi (`node dev-server.mjs`) |

## 🧠 Cara Kerja

```
Browser ──► Vercel ──► VirusTotal API v3
   │             │            ├── /api/check/{hash,url}  : Node Function (JSON kecil)
   │             │            └── /api/check/file      : Edge Function — stream multipart
   │             │               langsung ke VT tanpa buffering → bebas batas 4.5 MB
   │             ├── SHA-256 di browser ── file dikenal? tidak pernah diunggah
   │             ├── Cache in-memory 10 menit + throttle 4 req/menit
   └── Three.js ── scene 3D: equalizer bars, signal core, satelit orbit, partikel
```

**Alur scan file:** file dihitung hash SHA-256-nya di **browser** (Web Crypto) → hash dicari dulu → bila VirusTotal sudah mengenalnya, laporan muncul instan tanpa satu bit pun meninggalkan perangkat. Bila benar-benar baru, file diunggah **satu kali** melalui Edge Function yang me-*pipe* body multipart apa adanya ke VirusTotal (server tak pernah membaca isi file), lalu frontend mem-polling lookup hash tiap 5 detik sampai laporan analisis muncul.

## 📁 Struktur Proyek

```
noisy-virus/
├── api/                    # Empat Vercel Edge Functions (semua respons <25s)
│   ├── health.js           # GET  /api/health
│   ├── check-url.js        # POST /api/check/url   (+pending untuk URL baru)
│   ├── check-hash.js       # POST /api/check/hash  (jadi endpoint polling file baru)
│   └── upload.js           # POST /api/check/file  — relai streaming ke VT
├── lib/
│   ├── router-core.js      # Router API bersama (dipakai Vercel & Workers)
│   ├── upload-relay.js     # Pipe multipart → VirusTotal tanpa buffering
│   ├── vt-api.js           # Client VirusTotal API v3 (fetch native, Web-standard)
│   └── normalize.js        # Penyeragam respons VT → format laporan tunggal
├── public/                 # Frontend statis
│   ├── index.html          # Halaman utama (intro, scanner, hasil)
│   ├── app.js              # Logika frontend (scan, i18n, intro, audio)
│   ├── scene.js            # Scene 3D Three.js (deferred boot, low-fps aware)
│   ├── style.css           # Seluruh gaya (dark theme, responsif)
│   ├── privacy.html, terms.html
│   └── dev-avatar.png, bloodskill.png
├── worker.js               # (Opsional) entry Cloudflare Workers — modul yang sama
├── wrangler.jsonc          # (Opsional) konfigurasi Workers bila ingin dual-host
├── vercel.json             # Rewrite /api/* ke functions
├── dev-server.mjs          # Server dev lokal tanpa dependensi
└── package.json
```

## ☁️ Deploy

### Vercel (utama)

1. Push repo ini ke GitHub dan hubungkan di **Vercel → Add New Project** (framework preset: *Other*).
2. Set Environment Variable `VT_API_KEY` (Production + Preview).
3. Deploy. Setiap push berikutnya otomatis ter-deploy.

Tidak ada build command maupun output directory yang perlu diisi — `public/` disajikan statis oleh Vercel dan `api/*` menjadi Functions sesuai konvensi + rewrite di `vercel.json`.

> Upload besar mengandalkan Edge Function streaming (`api/upload.js`). Bila suatu saat platform berubah perilaku, ganti `runtime: 'edge'` → hapus baris config itu untuk memakai runtime Node dengan Fluid compute (durasi hingga 300 s).

## ⚠️ Catatan

- Hasil pemindaian bersumber dari mesin antivirus pihak ketiga via VirusTotal dan bukan jaminan mutlak aman/bahaya — selalu verifikasi dengan beberapa sumber untuk keputusan penting.
- Quota API gratis VirusTotal dibatasi (± 4 permintaan/menit & ±500 unggahan/hari) — server membungkus lookup dengan throttle dan cache internal.
- Analisis file yang benar-benar baru butuh waktu ±1–3 menit di sisi VirusTotal; frontend otomatis mem-polling sampai laporannya siap.

---

<div align="center">
Dibuat dengan 💜 oleh <b>Noisy</b> &amp; <b>BloodSKill</b> — Noisy Virus
</div>
