# Portofolio Muhammad Rayan Fahrezy

> Creative HR & Organizational Communications Scrapbook Portfolio.  
> Dimigrasikan dari file monolitik tunggal ke TypeScript + Vite dengan bundling lokal (Zero External CDN), arsitektur modular, dan siap deploy via Docker / Vercel.

---

## 🛠️ Tech Stack

- **Bundler & Tooling:** [Vite](https://vite.dev/) (vanilla-ts) + [TypeScript](https://www.typescriptlang.org/) (strict mode)
- **Styling:** [Tailwind CSS v3.4](https://tailwindcss.com/) via PostCSS + Autoprefixer
- **Motion & 3D:** [Three.js](https://threejs.org/) (lazy-loaded, chunked) + [GSAP & ScrollTrigger](https://greensock.com/gsap/)
- **Typography:** Self-hosted via `@fontsource/plus-jakarta-sans` & `@fontsource/jetbrains-mono`
- **Testing:** [Vitest](https://vitest.dev/) (unit tests) + [Playwright](https://playwright.dev/) (smoke & visual regression)
- **Web Server & Container:** [nginx-unprivileged](https://hub.docker.com/r/nginxinc/nginx-unprivileged) (Alpine) + Docker Compose

---

## 🚀 Panduan Pengembangan

### 1. Prasyarat
- Node.js >= 20 (disarankan v22 atau v24)
- npm >= 10

### 2. Instalasi Dependensi
```bash
npm ci
```

### 3. Menjalankan Server Pengembangan
```bash
npm run dev
```
Akses di `http://localhost:5173`.

### 4. Validasi & Pengujian
```bash
# Typecheck TypeScript (strict mode, 0 error)
npm run typecheck

# Linting kode
npm run lint

# Unit tests logika (Vitest)
npm test

# E2E Smoke & Visual tests (Playwright)
npm run test:e2e

# Production build
npm run build
```

---

## 🐳 Docker Deployment

### Menjalankan dengan Docker Compose
```bash
docker compose up --build -d
```
Situs akan berjalan di `http://localhost:8080` sebagai user non-root (`nginx`), dengan health check di `/healthz` dan header keamanan lengkap (`CSP`, `X-Frame-Options`, `X-Content-Type-Options`).

### Build Image Manual
```bash
docker build -t porto-rayyan:latest .
docker run -p 8080:8080 porto-rayyan:latest
```

---

## ⚡ Vercel Deployment

Proyek ini telah dilengkapi `vercel.json` dengan rule SPA rewrite ke `/index.html`:
```bash
# Deploy langsung dengan Vercel CLI
vercel --prod
```
Build Command: `npm run build`  
Output Directory: `dist`

---

## 📂 Struktur Direktori

```
portfolio/
├─ legacy/                      # HTML monolitik asli untuk acuan visual
│  └─ portfolio.html
├─ public/                      # Aset statis (favicon, og-image, robots.txt)
├─ src/
│  ├─ main.ts                   # Entry point aplikasi & event delegation
│  ├─ styles/
│  │  └─ main.css               # CSS custom, Tailwind layers & token desain
│  ├─ lib/
│  │  ├─ dom.ts                 # Helper typed DOM selector
│  │  └─ audio.ts               # Synthesized Web Audio API key click
│  ├─ features/
│  │  ├─ draggable.ts           # Interaksi drag stiker dengan translate CSS
│  │  ├─ desk-controls.ts       # Zoom canvas, headline mode, x-ray crop marks
│  │  ├─ quick-menu.ts          # Navigasi cepat studio desk map
│  │  ├─ experience-filter.ts   # Filter 6 kartu pengalaman
│  │  ├─ watchlist-modal.ts     # Modal OLAF 2026 & PEACE 2026
│  │  ├─ clipboard.ts           # Navigator clipboard copy + fallback
│  │  ├─ toast.ts               # Notifikasi tactile toast
│  │  └─ grid-coords.ts         # Koordinat grid dinamis pada penggaris atas
│  ├─ motion/
│  │  ├─ paste-in.ts            # Helper paste-in animasi GSAP
│  │  ├─ hero-intro.ts          # Timeline intro hero
│  │  ├─ card-reveal.ts         # ScrollTrigger batch reveal
│  │  └─ mat-scene.ts           # Three.js 3D paper trimmings (lazy-loaded)
├─ tests/
│  ├─ unit/                     # Unit test logika (Vitest)
│  └─ e2e/                      # E2E test smoke & visual (Playwright)
├─ nginx/
│  ├─ default.conf              # Konfigurasi nginx unprivileged
│  └─ security-headers.conf     # Security & CSP headers
├─ Dockerfile
├─ docker-compose.yml
├─ vercel.json
└─ vite.config.ts
```
