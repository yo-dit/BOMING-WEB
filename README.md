# BOMING

Website streaming film untuk tugas sekolah. Dikerjakan berkelompok (4 orang).

## Teknologi

- Next.js 16 (App Router), JavaScript, Tailwind CSS
- PostgreSQL 18 (lokal) dan Prisma 7
- Gemini API untuk chatbot rekomendasi film

## Yang sudah jadi

| Bagian | Alamat |
| --- | --- |
| Landing page | `/` |
| Register dan login | `/register`, `/login` |
| Profil Admin (kelola film: tambah, ubah, hapus) | `/profil-admin` |
| Chatbot rekomendasi film | `/chatbot` |

API yang sudah ada:

| Alamat | Fungsi | Siapa yang boleh |
| --- | --- | --- |
| `POST /api/register` | Daftar akun baru (role selalu `user`) | Semua |
| `POST /api/login` | Masuk | Semua |
| `POST /api/logout` | Keluar | Semua |
| `GET /api/me` | Data user yang sedang login | User login |
| `GET /api/movies` | Daftar film (terbaru di atas) | Semua |
| `POST /api/movies` | Tambah film | Admin |
| `GET /api/movies/[id]` | Satu film | Semua |
| `PUT /api/movies/[id]` | Ubah film | Admin |
| `DELETE /api/movies/[id]` | Hapus film | Admin |
| `GET /api/chat` | Riwayat chat milik user | User login |
| `POST /api/chat` | Kirim pertanyaan ke chatbot | User login |

## Persiapan di komputer sendiri (sekali saja)

### 1. Pasang yang dibutuhkan

Node.js (project ini memakai 24.x), Git, dan PostgreSQL 18. Catat password user `postgres` saat memasang PostgreSQL.

### 2. Ambil kodenya

```powershell
git clone https://github.com/yo-dit/BOMING-WEB.git
cd BOMING-WEB
npm install
```

### 3. Buat database

Di Windows, `psql` sering belum masuk PATH, jadi pakai alamat lengkapnya:

```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE DATABASE boming_db;"
```

### 4. Buat file `.env`

Buat file bernama `.env` di folder project (sejajar dengan `package.json`). **File ini tidak ikut ke GitHub dan jangan pernah di-commit.** Isi:

```env
DATABASE_URL="postgresql://postgres:PASSWORD_POSTGRES_KAMU@localhost:5432/boming_db?schema=public"
AUTH_SECRET="teks_acak_64_karakter"
ADMIN_PASSWORD="kata_sandi_admin_pilihanmu"
GEMINI_API_KEY="kunci_dari_google_ai_studio"
GEMINI_MODEL="gemini-3.1-flash-lite"
```

- Kalau password PostgreSQL mengandung karakter khusus seperti `@ # / :` atau spasi, karakter itu harus di-URL-encode, kalau tidak koneksi akan error.
- `AUTH_SECRET`: buat teks acak dengan perintah ini lalu tempel hasilnya. Setiap orang membuat sendiri.

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

- `ADMIN_PASSWORD`: minimal 6 karakter, bebas.
- `GEMINI_API_KEY`: buka `https://aistudio.google.com/apikey`, login dengan akun Google, klik **Create API key**. Gratis dan tanpa kartu kredit.
- `GEMINI_MODEL`: lihat bagian Chatbot di bawah kalau error.

### 5. Buat tabel dan akun admin

```powershell
npx prisma migrate deploy
npx prisma generate
node prisma\seed.mjs
```

Perintah terakhir membuat akun admin: email `admin@boming.id`, kata sandi sesuai `ADMIN_PASSWORD`.

### 6. Jalankan

```powershell
npm run dev
```

Buka `http://localhost:3000`.

## Chatbot

Chatbot memakai Gemini API. Nama model Gemini sering berganti dan kadang sedang penuh, jadi nama model disimpan di `.env` (`GEMINI_MODEL`), bukan di kode.

| Gejala | Artinya | Yang dilakukan |
| --- | --- | --- |
| Muncul "chatbot sedang sibuk", terminal menampilkan `timeout` atau `503` | Server Google sedang penuh | Ganti `GEMINI_MODEL` dengan model Flash lain, lalu nyalakan ulang `npm run dev` |
| Terminal menampilkan `404` | Nama model tidak tersedia untuk kunci kamu | Ganti `GEMINI_MODEL` |
| Muncul "batas pemakaian habis" (`429`) | Jatah gratis habis | Tunggu beberapa menit |

Nilai `.env` hanya dibaca saat server dinyalakan, jadi setelah mengubahnya, matikan server (`Ctrl + C`) lalu `npm run dev` lagi.

## Aturan kerja kelompok

- Satu anggota, satu branch. Hasil kerja digabung ke `main` lewat Pull Request.
- Sebelum mulai bekerja: `git pull`. Kalau ada perubahan di `package.json`, jalankan `npm install`. Kalau ada folder baru di `prisma/migrations`, jalankan `npx prisma migrate deploy`.
- Sebelum push: `npx eslint app lib`. Perbaiki semua error.
- Jangan mengubah `prisma/schema.prisma` tanpa memberi tahu kelompok. Setiap perubahan butuh migration (`npx prisma migrate dev --name nama_perubahan`) dan semua anggota harus menjalankannya.
- Tampilan harus sama dengan Figma. Jangan menambah atau mengurangi fitur dari desain.

## Catatan teknis (supaya tidak tersandung)

- **Halaman yang membaca cookie login atau database per pengguna harus dibungkus `<Suspense>`.** Project ini memakai Cache Components, jadi kalau tidak dibungkus akan muncul error "Blocking Route". Lihat `app/profil-admin/page.js` sebagai contoh.
- Di route dinamis, `params` berupa Promise, jadi tulis `(await params).id`.
- Folder dengan tanda kurung siku (`[id]`) harus diperiksa di PowerShell dengan `Get-ChildItem -LiteralPath "app\api\movies\[id]"`.
- ESLint melarang memanggil `setState` langsung di dalam `useEffect`, dan melarang `Date.now()` saat render. Contoh cara yang diterima ada di `app/components/KelolaFilm.js` dan `app/chatbot/page.js`.
- Warna dan font memakai class Tailwind kita sendiri: `font-judul` (Anton), `text-merah` dan `bg-merah` (`#d4141c`). Font teks biasa DM Sans. Latar halaman `#0c0c0c`, kartu `#1a1a1a`.

## Yang bisa dipakai ulang

- `lib/prisma.js`: koneksi database. `lib/session.js`: baca dan buat sesi login (`ambilSession`). `lib/admin.js`: `cekAdmin()` untuk API khusus admin. `lib/film.js`: `validasiFilm()`.
- `app/components/TombolKeluar.js`: tombol Keluar. `app/components/KelolaFilm.js`: tabel dan dialog kelola film.

## Yang belum dikerjakan

Home, daftar film dan pencarian, detail film, halaman pemutar (streaming tidak wajib), rating dan komentar, Profile User, navbar dan footer, dashboard dan moderasi komentar admin, dan fitur "Daftarku". Ada beberapa data di Figma yang belum ada di database dan perlu disepakati kelompok: kelas usia ("NR"), gambar lebar untuk hero (backdrop), tabel "Daftarku", dan aturan "Sedang tren".