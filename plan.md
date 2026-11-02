# plan.md — Portofolio Rayan: HTML tunggal → TypeScript + Docker

Dokumen ini adalah rencana migrasi `muhammad_rayan_fahrezy_portfolio_revisi.html` (satu file, ±90 KB) menjadi project TypeScript yang di-bundle dan siap di-deploy lewat container Docker.

Semua potongan kode di bawah adalah rancangan. Belum dijalankan atau diuji.

---

## 1. Kondisi saat ini

| Aspek | Sekarang | Masalah untuk produksi |
|---|---|---|
| Struktur | 1 file HTML, CSS dan JS inline | Sulit dirawat, tidak bisa di-type-check |
| Styling | Tailwind via `cdn.tailwindcss.com` + ±300 baris CSS custom | CDN Tailwind tidak untuk produksi: JIT jalan di browser, FOUC, dan tidak bisa di-cache dengan baik |
| 3D / animasi | Three.js r128 + GSAP 3.12.5 dari cdnjs | Bergantung CDN pihak ketiga, tidak tree-shake, tidak ada versi terkunci |
| Font | Google Fonts | Request eksternal, FOUT, isu privasi |
| Interaksi | ±12 fungsi global dipanggil lewat `onclick="..."` | Tidak jalan di modul ES, tidak kompatibel CSP ketat |
| Konten | Teks CV tertanam di markup | Mengubah satu data (mis. status OLAF) berarti edit HTML di banyak tempat |
| Deploy | Belum ada | Belum ada image, health check, header keamanan |

## 2. Tujuan dan non-tujuan

**Tujuan**
1. Tampilan dan perilaku sama dengan versi sekarang (kecuali bug yang sengaja diperbaiki, lihat §7).
2. 100% TypeScript `strict`, tanpa `any`, `npm run typecheck` bersih.
3. Tidak ada dependensi runtime ke CDN: Tailwind, font, Three.js, dan GSAP semuanya di-bundle.
4. Satu image Docker kecil, berjalan sebagai non-root, dengan health check dan header keamanan.
5. CI otomatis: lint, typecheck, test, build, dan push image.

**Non-tujuan (fase ini)**
- Pindah ke framework (React/Vue/Astro). Situs ini satu halaman statis dengan interaksi ringan; Vite + TS murni sudah cukup.
- Redesain visual. Perubahan visual hanya yang tertulis di §7.
- Backend atau CMS.

## 3. Keputusan teknis

| Keputusan | Pilihan | Alasan |
|---|---|---|
| Bundler | **Vite** (template `vanilla-ts`) | Cepat, output statis, dukungan TS langsung |
| Tailwind | **v3.4 (PostCSS)**, bukan v4 | Markup memakai kelas seperti `rounded-xs` dan `backdrop-blur-xs` yang di v3 tidak ada tetapi di v4 ada. Pindah ke v4 akan mengubah tampilan diam-diam. Upgrade dijadikan tugas terpisah. |
| Three.js | paket `three` + `@types/three`, import bernama (tree-shake), **lazy-load** | Menjaga teks hero muncul cepat; adegan 3D dimuat saat idle |
| GSAP | paket `gsap` (`ScrollTrigger` ikut di dalamnya) | Versi terkunci lewat lockfile |
| Font | `@fontsource/plus-jakarta-sans` dan `@fontsource/jetbrains-mono` (self-host) | Tanpa request ke Google, bisa di-cache dengan header immutable |
| Konten | Tetap di `index.html` dulu (Fase 3), pindah ke `src/data/content.ts` bila ingin (Fase 8) | Menjaga fidelitas piksel dan SEO; migrasi data tidak memblokir deploy |
| Web server | **nginx-unprivileged** (alpine) | Non-root, ringan, header dan cache mudah diatur |
| Registry | GitHub Container Registry (GHCR) | Gratis untuk repo, terintegrasi dengan Actions |

## 4. Struktur project

```
portfolio/
├─ legacy/                      # HTML asli, disimpan untuk perbandingan visual
│  └─ portfolio.html
├─ public/
│  ├─ favicon.svg
│  ├─ og-image.png              # 1200×630
│  └─ robots.txt
├─ src/
│  ├─ main.ts                   # entry: import css, init semua modul
│  ├─ styles/
│  │  └─ main.css               # @tailwind + token desain + kelas custom
│  ├─ lib/
│  │  ├─ dom.ts                 # $(), $$(), on() bertipe
│  │  └─ audio.ts               # playKeyClick()
│  ├─ features/
│  │  ├─ draggable.ts           # drag stiker + reset
│  │  ├─ desk-controls.ts       # x-ray switch, mode teks, retro controls, zoom
│  │  ├─ quick-menu.ts          # menu pojok kiri atas
│  │  ├─ experience-filter.ts   # filter 6 kartu pengalaman
│  │  ├─ watchlist-modal.ts     # modal OLAF / PEACE
│  │  ├─ clipboard.ts           # salin email / telepon
│  │  ├─ toast.ts
│  │  └─ grid-coords.ts         # koordinat di penggaris atas
│  ├─ motion/
│  │  ├─ paste-in.ts            # helper GSAP "tempel ke mat"
│  │  ├─ hero-intro.ts
│  │  ├─ card-reveal.ts
│  │  └─ mat-scene.ts           # Three.js (di-import dinamis)
│  ├─ data/
│  │  └─ content.ts             # (Fase 8) tipe + data CV
│  └─ types/
│     └─ global.d.ts
├─ tests/
│  ├─ unit/                     # Vitest
│  └─ e2e/                      # Playwright
├─ nginx/
│  ├─ default.conf
│  └─ security-headers.conf
├─ .github/workflows/ci.yml
├─ Dockerfile
├─ docker-compose.yml
├─ .dockerignore
├─ index.html
├─ package.json
├─ tailwind.config.ts
├─ postcss.config.js
├─ tsconfig.json
├─ eslint.config.js
└─ vite.config.ts
```

## 5. Fase kerja

Estimasi jam adalah perkiraan kasar untuk satu orang yang sudah paham kodenya.

### Fase 0 — Baseline (±1 jam)
- [ ] Salin HTML sekarang ke `legacy/portfolio.html`.
- [ ] Ambil screenshot Playwright di lebar 390, 768, dan 1440 px (kondisi awal, setelah intro GSAP selesai) sebagai acuan perbandingan visual.
- [ ] Catat bug yang sudah diketahui (§7) supaya tidak dianggap regresi.

**Selesai bila:** screenshot acuan tersimpan di `tests/e2e/__baseline__/`.

### Fase 1 — Scaffold (±1,5 jam)
- [ ] `npm create vite@latest portfolio -- --template vanilla-ts`
- [ ] Pasang dependensi:
  ```bash
  npm i three gsap @fontsource/plus-jakarta-sans @fontsource/jetbrains-mono
  npm i -D typescript vite @types/three tailwindcss@3.4 postcss autoprefixer \
           eslint typescript-eslint prettier vitest @playwright/test
  ```
- [ ] Atur `tsconfig.json`:
  ```jsonc
  {
    "compilerOptions": {
      "target": "ES2022",
      "lib": ["ES2022", "DOM", "DOM.Iterable"],
      "module": "ESNext",
      "moduleResolution": "bundler",
      "strict": true,
      "noUncheckedIndexedAccess": true,
      "noImplicitOverride": true,
      "verbatimModuleSyntax": true,
      "isolatedModules": true,
      "noEmit": true,
      "skipLibCheck": true
    },
    "include": ["src", "tests", "vite.config.ts"]
  }
  ```
- [ ] Tambahkan script di `package.json`:
  ```json
  {
    "scripts": {
      "dev": "vite",
      "build": "tsc --noEmit && vite build",
      "preview": "vite preview --host",
      "typecheck": "tsc --noEmit",
      "lint": "eslint .",
      "format": "prettier --write .",
      "test": "vitest run",
      "test:e2e": "playwright test"
    }
  }
  ```

**Selesai bila:** `npm run dev` menampilkan halaman kosong dan `npm run build` sukses.

### Fase 2 — Port CSS dan Tailwind (±2 jam)
- [ ] Pindahkan `tailwind.config = {...}` ke `tailwind.config.ts` (warna `mat`, `paper`, `ink`, `yt`; font `sans`, `mono`), dengan `content: ['./index.html', './src/**/*.ts']`.
- [ ] Pindahkan blok `<style>` ke `src/styles/main.css` di bawah `@tailwind base/components/utilities`. Token `:root` tetap; kelas custom (`.paper-cutout-*`, `.mech-key`, `.washi-tape`, dst.) masuk `@layer components`.
- [ ] Salin background mat baru (grid 24/120 px, `body::before`, `body::after`) apa adanya.
- [ ] Ganti Google Fonts dengan `import '@fontsource/...'` untuk bobot yang dipakai saja: Jakarta 500/600/700/800 (+ italic 700/800) dan JetBrains Mono 500/700 (+ italic 500).
- [ ] Tambahkan blok `@media (prefers-reduced-motion: reduce)` yang mematikan transisi dan animasi CSS.
- [ ] Salin markup `<body>` ke `index.html`. Jangan ubah dulu apa pun selain menghapus `onclick` (Fase 3).

**Selesai bila:** halaman statis (tanpa JS) tampil sama dengan `legacy/` di screenshot 3 ukuran.

### Fase 3 — Port JavaScript ke modul TypeScript (±4 jam)

Karena skrip sekarang menjadi modul, fungsi tidak lagi global. Setiap `onclick` diganti atribut `data-action` dan satu *event delegation* di `main.ts`.

| Handler lama | Atribut baru | Modul |
|---|---|---|
| `toggleQuickJumpMenu()` | `data-action="toggle-menu"` | `quick-menu.ts` |
| `resetDraggablePositions()` | `data-action="reset-desk"` | `draggable.ts` |
| `cycleCanvasZoom()` | `data-action="cycle-zoom"` | `desk-controls.ts` |
| `toggleHeadlineCopy()` | `data-action="cycle-headline"` | `desk-controls.ts` |
| `retroControlAction('minimize'\|'maximize'\|'close')` | `data-action="retro" data-value="minimize"` | `desk-controls.ts` |
| `toggleXrayDeskMode()` | `data-action="toggle-xray"` | `desk-controls.ts` |
| `filterScrapbookExp('all'\|...)` | `data-action="filter-exp" data-value="all"` | `experience-filter.ts` |
| `openWatchlistModal('olaf'\|'peace')` | `data-action="open-modal" data-value="olaf"` | `watchlist-modal.ts` |
| `closeWatchlistModal()` + klik backdrop | `data-action="close-modal"` | `watchlist-modal.ts` |
| `copyTextToClipboard(text)` | `data-action="copy" data-value="…"` | `clipboard.ts` |
| `playKeyClick()` di tombol keyboard dan mouse | `data-action="click-sound"` | `audio.ts` |

Kerangka yang disarankan:

```ts
// src/lib/dom.ts
export function $<T extends HTMLElement = HTMLElement>(sel: string, root: ParentNode = document): T {
  const el = root.querySelector<T>(sel);
  if (!el) throw new Error(`Elemen tidak ditemukan: ${sel}`);
  return el;
}
export const $$ = <T extends HTMLElement = HTMLElement>(sel: string, root: ParentNode = document) =>
  Array.from(root.querySelectorAll<T>(sel));
```

```ts
// src/main.ts (inti)
type Action =
  | 'toggle-menu' | 'reset-desk' | 'cycle-zoom' | 'cycle-headline' | 'retro'
  | 'toggle-xray' | 'filter-exp' | 'open-modal' | 'close-modal' | 'copy' | 'click-sound';

const handlers: Record<Action, (el: HTMLElement) => void> = { /* … */ };

document.addEventListener('click', (e) => {
  const el = (e.target as HTMLElement).closest<HTMLElement>('[data-action]');
  if (!el) return;
  handlers[el.dataset.action as Action]?.(el);
});
```

Aturan tipe:
- Modal memakai `type ModalKey = 'olaf' | 'peace'` dan `Record<ModalKey, { tag: string; title: string; bodyHtml: string }>`. Teks modal tidak lagi diduplikasi di HTML dan JS.
- `AudioContext` diketik dengan `window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext`.
- Status drag disimpan di `WeakMap<HTMLElement, { dx: number; dy: number }>`, bukan `dataset` berisi string.

**Selesai bila:** semua tombol dan interaksi berfungsi seperti versi lama, dan `grep -rn "onclick" index.html` tidak menemukan apa pun.

### Fase 4 — Port Three.js dan GSAP (±3 jam)
- [ ] `motion/paste-in.ts`: pindahkan helper `pasteIn()` dengan tipe `gsap.TweenVars`.
- [ ] `motion/hero-intro.ts` dan `card-reveal.ts`: pindahkan timeline dan `ScrollTrigger.batch`. Panggil `gsap.registerPlugin(ScrollTrigger)` sekali di `main.ts`.
- [ ] Hapus penimpaan `window.filterScrapbookExp`. `experience-filter.ts` cukup memanggil `ScrollTrigger.refresh()` langsung setelah filter.
- [ ] `motion/mat-scene.ts`: ubah `THREE.X` menjadi import bernama (`WebGLRenderer, Scene, PerspectiveCamera, Mesh, BoxGeometry, MeshStandardMaterial, AmbientLight, DirectionalLight, MathUtils`).
- [ ] Muat adegan lewat `requestIdleCallback` (fallback `setTimeout`) dengan `import('./motion/mat-scene')`.
- [ ] **Setel ulang pencahayaan.** Pada Three.js baru, mode lampu legacy dan manajemen warna lama sudah hilang, jadi intensitas `AmbientLight` / `DirectionalLight` dan warna kertas akan tampak berbeda dari r128. Kalikan intensitas kira-kira dengan π sebagai titik awal, lalu cocokkan dengan screenshot baseline.
- [ ] Lengkapi `dispose()` (geometri, material, renderer) dan hentikan ticker saat tab tersembunyi atau komponen dilepas.
- [ ] Fallback bila WebGL gagal: hapus `<canvas>` dan lanjut tanpa error (sudah ada di versi sekarang; pertahankan).

**Selesai bila:** intro hero, animasi kartu, parallax scroll, dan parallax mouse sama seperti versi sekarang; mode *reduce motion* mematikan semuanya.

### Fase 5 — Kualitas: aksesibilitas, SEO, performa (±3 jam)
Aksesibilitas
- [ ] Switch x-ray: tambahkan `tabindex="0"`, tangani `Enter` dan `Space`, dan perbarui `aria-checked`.
- [ ] Modal: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, pindahkan fokus ke dalam saat dibuka, kembalikan ke tombol pemicu saat ditutup, dan tutup dengan `Esc`.
- [ ] Menu pojok kiri atas: `aria-expanded` dan `aria-controls`.
- [ ] Pastikan kontras teks putih di atas panel hijau tetap ≥ 4,5:1 dengan canvas Three.js menyala.
- [ ] Fokus keyboard terlihat di semua tombol (`:focus-visible`).

SEO dan metadata
- [ ] `<meta name="description">`, Open Graph, dan Twitter card (`og:image` 1200×630).
- [ ] `<link rel="canonical">` memakai `VITE_SITE_URL`.
- [ ] Favicon SVG, `robots.txt`, dan data terstruktur `Person` (JSON-LD).

Performa (target, bukan hasil terukur)
- [ ] Lighthouse mobile: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95.
- [ ] Three.js dalam chunk terpisah; `modulepreload` hanya untuk entry utama.
- [ ] Hindari layout shift: cadangkan tinggi hero sebelum intro GSAP berjalan.

### Fase 6 — Docker (±2 jam)

**`Dockerfile`**
```dockerfile
# syntax=docker/dockerfile:1.7

# ---------- build ----------
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY . .
ARG VITE_SITE_URL=http://localhost:8080
ENV VITE_SITE_URL=$VITE_SITE_URL
RUN npm run build

# ---------- runtime ----------
FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime
COPY nginx/security-headers.conf /etc/nginx/security-headers.conf
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/healthz >/dev/null || exit 1
```
Pin versi image ke tag minor yang sudah diuji, dan catat *digest*-nya di PR bila ingin build yang benar-benar reproducible.

**`nginx/security-headers.conf`**
```nginx
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header X-Frame-Options "DENY" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'" always;
```
`style-src 'unsafe-inline'` dipertahankan karena markup memakai banyak atribut `style="transform: rotate(...)"`. Bila nanti rotasi dipindah ke kelas atau CSS variable, hapus `'unsafe-inline'`. `script-src 'self'` hanya bisa dipakai setelah semua `onclick` hilang (Fase 3).

**`nginx/default.conf`**
```nginx
server {
  listen 8080;
  server_name _;
  root /usr/share/nginx/html;
  index index.html;

  include /etc/nginx/security-headers.conf;

  gzip on;
  gzip_comp_level 5;
  gzip_types text/css application/javascript application/json image/svg+xml;

  location = /healthz {
    access_log off;
    default_type text/plain;
    return 200 "ok\n";
  }

  location /assets/ {                      # file ber-hash dari Vite
    include /etc/nginx/security-headers.conf;
    add_header Cache-Control "public, max-age=31536000, immutable" always;
    try_files $uri =404;
  }

  location = /index.html {
    include /etc/nginx/security-headers.conf;
    add_header Cache-Control "no-cache" always;
  }

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```
`include` diulang di tiap `location` yang memakai `add_header`, karena nginx tidak mewarisi `add_header` dari level atas bila `location` punya `add_header` sendiri.

**`.dockerignore`**
```
node_modules
dist
.git
legacy
tests/e2e/__baseline__
*.md
.github
```

**`docker-compose.yml`** (untuk lokal dan VPS)
```yaml
services:
  web:
    image: ghcr.io/<user>/portfolio:${TAG:-latest}
    build:
      context: .
      args:
        VITE_SITE_URL: ${VITE_SITE_URL:-http://localhost:8080}
    ports:
      - "8080:8080"
    restart: unless-stopped
    read_only: true
    tmpfs:
      - /tmp
    security_opt:
      - no-new-privileges:true
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://127.0.0.1:8080/healthz"]
      interval: 30s
      timeout: 3s
      retries: 3
```
Bila `read_only: true` membuat nginx gagal start (tulis ke direktori cache), tambahkan `tmpfs` untuk path yang diminta di log.

**Selesai bila:** `docker compose up --build` menyajikan situs di `http://localhost:8080`, `/healthz` mengembalikan 200, `docker exec web id` menunjukkan user non-root, dan header keamanan muncul di `curl -I`.

### Fase 7 — CI/CD dan deploy (±2 jam)

**`.github/workflows/ci.yml`** (kerangka)
```yaml
name: ci
on:
  push: { branches: [main], tags: ['v*'] }
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 24, cache: npm }
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test
      - run: npm run build
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e

  image:
    needs: test
    if: github.event_name != 'pull_request'
    runs-on: ubuntu-latest
    permissions: { contents: read, packages: write }
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - uses: docker/metadata-action@v5
        id: meta
        with:
          images: ghcr.io/${{ github.repository }}
          tags: |
            type=sha
            type=semver,pattern={{version}}
            type=raw,value=latest,enable={{is_default_branch}}
      - uses: docker/build-push-action@v6
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          build-args: VITE_SITE_URL=${{ vars.SITE_URL }}
```
Pin versi *action* ke versi major yang berlaku saat kamu mengerjakan ini.

**Pilihan target deploy** (pilih salah satu)

| Opsi | Cocok bila | Catatan |
|---|---|---|
| **A. VPS + Docker Compose + Caddy** | Ingin kontrol penuh, biaya tetap kecil | Caddy otomatis mengurus HTTPS; pilih region terdekat dengan pengunjung (mis. Singapura/Jakarta) |
| **B. Cloud Run / Fly.io / Railway** | Tidak mau mengurus server | Set port kontainer ke 8080; domain dan TLS diurus platform |
| **C. Hosting statis (Cloudflare Pages / Netlify)** | Hanya butuh situs jalan | Tidak memakai Docker; folder `dist/` langsung di-upload. Disebut sebagai pembanding karena situs ini sepenuhnya statis |

Contoh Caddy untuk opsi A:
```
rayan.example.com {
  reverse_proxy web:8080
  encode zstd gzip
}
```

Rollback: setiap image di-tag dengan SHA commit. Untuk kembali ke versi sebelumnya, ubah `TAG` ke SHA lama lalu `docker compose up -d`.

### Fase 8 — Opsional: konten berbasis data (±3 jam)
- [ ] Buat `src/data/content.ts` dengan tipe:
  ```ts
  export interface Experience {
    id: string;
    role: string;
    org: string;
    period: string;
    category: 'hr-lead' | 'event' | 'admin';
    tone: 'white' | 'brown' | 'yellow';
    bullets: readonly string[];
    competencies: string;
    status?: { date: string; label: string };   // mis. OLAF: 2026-12-02
  }
  ```
- [ ] Render 6 kartu pengalaman, kartu pendidikan, skills, dan kontak dari data, lalu bandingkan screenshot terhadap Fase 0.
- [ ] Untuk OLAF, kalimat modal dan kartu bisa otomatis berganti dari "ditargetkan terlaksana…" menjadi "terlaksana pada…" setelah 2 Desember 2026 lewat, dengan membandingkan `status.date` dengan tanggal hari ini.

## 6. Pengujian

**Unit (Vitest)** — hanya untuk logika murni:
- Siklus mode teks hero (3 mode) dan siklus skala zoom.
- Perhitungan koordinat grid (`floor(clientX / 24)`, dan seterusnya).
- Pemilih kartu pada filter pengalaman.

**E2E (Playwright, Chromium)** — smoke test yang berjalan di CI:
1. Halaman termuat tanpa error di console.
2. Tiga judul hero terlihat setelah intro selesai.
3. Filter "Sekretariat (1)" menyisakan 1 kartu; "Semua (6)" menampilkan 6.
4. Klik tombol play membuka modal; `Esc` menutupnya dan fokus kembali ke tombol.
5. Tombol "Salin" memanggil clipboard dan menampilkan toast.
6. Dengan `reducedMotion: 'reduce'`, tidak ada elemen tertinggal di `opacity: 0`.
7. Screenshot dibandingkan dengan baseline Fase 0 (toleransi kecil karena Three.js acak; kunci `Math.random` dengan seed atau sembunyikan canvas saat membandingkan).

## 7. Perbaikan yang sengaja dibawa saat migrasi

| # | Masalah di versi sekarang | Perbaikan |
|---|---|---|
| 1 | Stiker yang rotasinya dari kelas Tailwind kehilangan rotasi saat di-drag (inline `transform` menimpa kelas) | Pakai properti CSS `translate` untuk offset drag. Ia tersusun bersama `rotate` tanpa menimpanya. |
| 2 | `hover:rotate-0` pada kartu pengalaman tidak berefek karena kalah oleh `style="transform: …"` | Pindahkan rotasi ke CSS variable `--r` dan buat hover mengubah `--r` |
| 3 | Kelas tidak valid di Tailwind v3: `rounded-xs`, `backdrop-blur-xs`, `position` | Daftarkan `xs` di `tailwind.config.ts` (radius 2 px, blur 2 px) agar tampilan terjaga, hapus kelas `position` |
| 4 | `document.execCommand('copy')` sudah deprecated | Pakai `navigator.clipboard.writeText()` dengan fallback lama |
| 5 | Switch x-ray dan modal belum ramah keyboard / pembaca layar | Lihat Fase 5 |
| 6 | Penomoran bagian dan menu sudah disamakan di revisi terakhir, tetapi masih hard-coded | Pastikan `index.html` dan menu dibangkitkan dari satu daftar bila masuk Fase 8 |
| 7 | Durasi "08:42" dan label "HD" di polaroid adalah dekorasi, bukan video sungguhan | Ganti dengan label yang jujur (mis. "Studi Kasus") atau sambungkan ke video asli bila ada |

## 8. Risiko dan mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Three.js baru mengubah tampilan pencahayaan | Warna kertas berbeda dari sekarang | Setel ulang intensitas (Fase 4), bandingkan dengan screenshot baseline |
| Tailwind v4 terpasang tanpa sengaja | Tampilan bergeser | Pin `tailwindcss@3.4.x` dan kunci lewat lockfile |
| GSAP menimpa `transform` inline | Drag atau hover rusak setelah intro | Pertahankan pola `pasteIn()` yang mengembalikan transform; tambahkan e2e untuk drag setelah intro |
| CSP terlalu ketat | Elemen tidak tampil | Uji dengan `curl -I` + buka DevTools Console; longgarkan satu direktif sekali, bukan semuanya |
| `read_only` container menyebabkan nginx gagal start | Container restart terus | Tambahkan `tmpfs` untuk path di log, atau lepas `read_only` |
| WebGL tidak tersedia (perangkat lawas) | Canvas kosong | Sudah ada `try/catch` yang menghapus canvas; pertahankan dan uji |
| Data pribadi (telepon, alamat) tampil publik dan mudah di-scrape | Spam | Pertimbangkan hanya menampilkan email dan tombol WhatsApp, atau merakit nomor lewat JS. Keputusan ada pada pemilik portofolio. |
| Konten OLAF menyatakan hal yang belum terjadi (acara 2 Des 2026) | Kredibilitas | Gunakan kalimat "ditargetkan…" sampai tanggalnya lewat (Fase 8 mengotomatiskannya) |

## 9. Definition of Done

- [ ] `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, dan `npm run test:e2e` semuanya hijau.
- [ ] Tidak ada request jaringan ke domain pihak ketiga saat halaman dimuat (cek tab Network).
- [ ] `docker compose up --build` jalan bersih dan `/healthz` mengembalikan 200.
- [ ] Container berjalan sebagai non-root dan header keamanan hadir.
- [ ] Lighthouse mobile memenuhi target di Fase 5.
- [ ] Screenshot 390 / 768 / 1440 px sesuai baseline (selisih hanya pada bagian yang tercantum di §7).
- [ ] Image ter-push ke GHCR dengan tag SHA dan `latest`, dan prosedur rollback sudah dicoba satu kali.
- [ ] `README.md` berisi cara dev, build, jalankan Docker, dan deploy.

## 10. Urutan eksekusi yang disarankan

`Fase 0 → 1 → 2 → 3 → 4` (situs jalan di dev) → `Fase 6` (Docker) → `Fase 5` (kualitas) → `Fase 7` (CI/CD dan deploy) → `Fase 8` (opsional).

Docker didahulukan sebelum polesan kualitas supaya kamu sudah punya versi yang bisa di-deploy lebih awal. Total estimasi Fase 0–7 sekitar 19 jam kerja.
