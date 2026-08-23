<div align="center">

# Noisy Virus

**Pindai file, hash, dan URL melawan 70+ mesin antivirus — sebelum sempat menyentuh perangkat Anda**

Scan URL · Scan file · Lookup hash · VirusTotal API v3

[![Cloudflare Workers](https://img.shields.io/badge/Deploy-Cloudflare%20Workers-f38020?logo=cloudflare&logoColor=white)](https://developers.cloudflare.com/workers/)
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

**Fitur umum**

- 🎨 Tampilan dark sinematik dengan scene 3D interaktif (Three.js), partikel, dan kamera parallax mengikuti scroll
- 🎬 Intro dua babak dengan animasi staggered + watchdog anti-stuck untuk perangkat lambat
- 🔊 Musik latar (YouTube) dan efek blip saat berinteraksi dengan objek 3D
- 🌐 Bilingual ID/EN — berpindah bahasa sekali klik, tersimpan di localStorage
- 📱 Responsif penuh — desktop maupun mobile, dengan mode animasi sederhana otomatis untuk perangkat lemah
- 📄 Kebijakan Privasi & Ketentuan Layanan dengan latar scene 3D yang sama

## 🚀 Menjalankan Secara Lokal

**Prasyarat:** Node.js 18+ dan akun VirusTotal gratis (untuk API key).

```bash
# 1. Install dependensi (wrangler)
npm install

# 2. Siapkan environment lokal
#    Salin .dev.vars.example menjadi .dev.vars lalu isi:
#    VT_API_KEY=<kunci-virustotal-anda>

# 3. Jalankan server dev
npm start        # atau: npm run dev  (= npx wrangler dev)
```

Buka URL yang dicetak wrangler (default **http://localhost:8787**) — selesai.

### Script yang tersedia

| Perintah | Fungsi |
|----------|--------|
| `npm start` / `npm run dev` | Menjalankan worker secara lokal (`wrangler dev`) |
| `npm run deploy` | Deploy ke Cloudflare Workers (`wrangler deploy`) |

## 🧠 Cara Kerja

```
Browser ──► Cloudflare Worker ──► VirusTotal API v3
   │               │                   ├── lookup hash/url langsung
   │               │                   └── upload sekali untuk file baru
   │               ├── SHA-256 di browser ── file dikenal? tidak pernah diunggah
   │               ├── Cache in-memory 10 menit + throttle 4 req/menit
   └── Three.js ── scene 3D: equalizer bars, signal core, satelit orbit, partikel
```

**Hash-first:** file dihitung hash SHA-256-nya di **browser** (Web Crypto) → hash dicari dulu lewat `/api/check/hash` (payload beberapa byte) → bila VirusTotal sudah mengenalnya, laporan muncul instan tanpa satu bit file pun meninggalkan perangkat. Hanya file yang benar-benar baru yang diunggah satu kali untuk dianalisis.

## 📁 Struktur Proyek

```
noisy-virus/
├── worker.js               # Entry Cloudflare Worker — /api/check/{url,hash,file}, /api/health
├── wrangler.jsonc          # Konfigurasi Workers + static assets (./public)
├── lib/
│   ├── vt-api.js           # Client VirusTotal API v3 (fetch native, Web-standard)
│   └── normalize.js        # Penyeragam respons VT → format laporan tunggal
├── public/                 # Static assets (disajikan otomatis oleh assets binding)
│   ├── index.html          # Halaman utama (intro, scanner, hasil)
│   ├── app.js              # Logika frontend (scan, i18n, intro, audio)
│   ├── scene.js            # Scene 3D Three.js (deferred boot, low-fps aware)
│   ├── style.css           # Seluruh gaya (dark theme, responsif)
│   ├── privacy.html        # Kebijakan Privasi
│   ├── terms.html          # Ketentuan Layanan
│   └── dev-avatar.png, bloodskill.png
├── .dev.vars.example       # Template environment lokal (VT_API_KEY)
└── package.json
```

## ☁️ Deploy ke Cloudflare

Aplikasi berjalan sebagai **satu Cloudflare Worker**: frontend statis disajikan dari assets binding, API jalan di edge global. Upload hingga ±100 MB didukung platform (aplikasi membatasi sendiri di 32 MB sesuai kuota analisis VT).

### Cara A — via CLI

```bash
npx wrangler login                      # sekali saja, buka browser
npx wrangler secret put VT_API_KEY      # tempel kunci VirusTotal Anda
npm run deploy
```

Worker live di `https://noisy-virus.<subdomain-anda>.workers.dev`.

### Cara B — via Dashboard (auto-deploy tiap push)

1. Push repo ini ke GitHub.
2. Buka **Cloudflare Dashboard → Workers & Pages → Create** → hubungkan repo GitHub.
3. Wrangler akan membaca `wrangler.jsonc` secara otomatis — tidak ada build command yang perlu diisi.
4. Di pengaturan Worker → **Settings → Variables and Secrets**, tambahkan secret `VT_API_KEY`.
5. Setiap `git push` ke branch utama memicu deploy ulang otomatis.

> Jangan pernah commit `.dev.vars` — file itu sudah masuk `.gitignore`. Kunci produksi hanya disimpan sebagai Secret di dashboard/CLI.

## ⚠️ Catatan

- Hasil pemindaian bersumber dari mesin antivirus pihak ketiga via VirusTotal dan bukan jaminan mutlak aman/bahaya — selalu verifikasi dengan beberapa sumber untuk keputusan penting.
- Quota API gratis VirusTotal dibatasi (± 4 permintaan/menit) — worker sudah membungkusnya dengan throttle dan cache internal.
- Cache hasil bersifat per-isolate (ter-reset saat isolate di-evict); cukup untuk menyerap permintaan berulang dalam sesi hangat.

---

<div align="center">
Dibuat dengan 💜 oleh <b>Noisy</b> &amp; <b>BloodSKill</b> — Noisy Virus
</div>
