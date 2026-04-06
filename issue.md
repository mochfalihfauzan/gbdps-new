# Issue: Fitur Login User

## Deskripsi Singkat
Fitur ini bertujuan untuk membuat endpoint API yang memungkinkan pengguna terdaftar untuk melakukan login. Sistem akan memvalidasi kredensial (email dan password), lalu menghasilkan sebuah session token (menggunakan UUID) yang disimpan ke dalam database tabel `sessions` sebagai tanda bahwa user telah berhasil login.

## Kontrak API
- **Endpoint**: `POST /api/users/login`
- **Request Body**:
  ```json
  {
      "email" : "falih@gmail.com",
      "password" : "password"
  }
  ```
- **Response Body (Success)**:
  ```json
  {
      "data" : "123e4567-e89b-12d3-a456-426614174000"
  }
  ```
  *(Nilai `data` adalah token UUID unik yang dihasilkan)*
- **Response Body (Error)**:
  ```json
  {
      "error" : "Email atau password salah"
  }
  ```

---

## Rencana Implementasi & Tahapan

Silakan ikuti instruksi langkah demi langkah di bawah ini untuk mengimplementasikan fitur login. Tahapan disusun secara terurut agar mudah diikuti oleh implementator (junior programmer / AI).

### Tahap 1: Pembaruan Skema Database (Prisma)
Kita perlu membuat tabel baru bernama `sessions` yang terhubung (Foreign Key) ke tabel `users`.
1. Buka file `prisma/schema.prisma`.
2. Buat model baru bernama `Session` dengan struktur berikut:
   - `id`: Int, auto increment, jadikan primary key (`@id @default(autoincrement())`).
   - `token`: String (`@db.VarChar(255)`), tidak boleh null, jadikan `@unique`.
   - `user_id`: Int.
   - Tambahkan relasi ke model `User`: `user User @relation(fields: [user_id], references: [id])`.
   - `created_at`: DateTime, dengan default waktu saat ini (`@default(now())`).
3. Pada model `User`, pastikan tambahkan relasi array balikannya agar Prisma valid (tambahkan baris: `sessions Session[]`).
4. Buka terminal, dan jalankan migrasi untuk sinkronisasi database: `npx prisma migrate dev --name create_sessions_table`.
5. Prisma Client otomatis akan menggenerate ulang setelah proses tersebut berhasil.

### Tahap 2: Instalasi Dependensi UUID
Kita membutuhkan pustaka `uuid` untuk menghasilkan token (RFC4122 UUID).
1. Buka terminal proyek.
2. Install library utama: jalankan `npm install uuid`.
3. Install pustaka tipe datanya (karena kita menggunakan TypeScript): jalankan `npm install -D @types/uuid`.

### Tahap 3: Pembuatan Data Transfer Object (DTO)
Kita harus memvalidasi input *request body* untuk login.
1. Di dalam folder `src/users/dto`, buat file baru bernama `login-user.dto.ts`.
2. Buat class `LoginUserDto` dan gunakan dekorator dari `class-validator`:
   - Properti `email`: wajib diisi (`@IsNotEmpty()`) dan berformat email (`@IsEmail()`).
   - Properti `password`: wajib diisi (`@IsNotEmpty()`) dan berupa teks (`@IsString()`).

### Tahap 4: Update Service Logic (`src/users/users.service.ts`)
Di bagian ini, validasi kredensial (komparasi password) direalisasikan.
1. Pada `UsersService`, import library: `import * as bcrypt from 'bcrypt'` dan `import { v4 as uuidv4 } from 'uuid'`.
2. Tambahkan method `login(loginUserDto: LoginUserDto)` yang di dalamnya berisi logika pengecekan pengguna.
3. Alur method `login`:
   - Ambil data user berdasarkan email yang disubmit menggunakan `this.prisma.user.findUnique`.
   - Jika pengguna **tidak ditemukan**, lemparkan Exception Unauthorized (`UnauthorizedException` dari `@nestjs/common`) dengan pesan kustom `"Email atau password salah"`.
   - Jika pengguna **ditemukan**, bandingkan password plain-text dari DTO dengan password terenkripsi dari tabel user menggunakan `await bcrypt.compare(passwordDTO, passwordDB)`.
   - Jika `password_terverifikasi` bernilai **salah**, kembalikan Exception yang sama (jangan bedakan antara email salah atau password salah agar lebih aman).
   - Jika **benar**, buat session token menggunakan fungsi: `const token = uuidv4()`.
   - Lakukan penyimpanan sesi baru ke database menggunakan `this.prisma.session.create({ data: { token, user_id: user.id } })`.
   - Kembalikan kembalikan variabel `token` sebagai string dari method service ini.

### Tahap 5: Update Controller Routes (`src/users/users.controller.ts`)
1. Buka file *controller*. Load `LoginUserDto` pada modul import kalian.
2. Tambahkan method `@Post('login')` untuk handle path POST (`/api/users/login`). *Catatan: pastikan ada prefix `/api` akibat configurasi di main.ts*.
3. Lengkapi argumen dekorator `@Body()` untuk melempar isian validasi masuk ke object `dto: LoginUserDto`.
4. Panggil proses request di atas pada service secara aman menggunakan `try...catch`:
   - Blok eksekusi utama, panggil `this.usersService.login(dto)`.
   - Jika sukses, letakkan *response formatter* spesifik ke `return { "data" : token }` dimana `token` adalah UUID text dari method di atas.
   - Posisikan blok tangkap error (catch) saat service melemparkan Exception. Untuk memastikan balasan persis yang diinginkan: Return `HttpException / UnauthorizedException` berisi JSON dengan `{"error" : "Email atau password salah"}` secara detail.

### Tahapan Uji Coba:
1. Yakinkan Node server kalian menyala lewat (`npm run start:dev`).
2. Persiapkan Client Tes API misalnya Postman, ThunderClient, atau cURL.
3. Eksekusi endpoint pendaftaran (`POST /api/users`) bilamana database masih kosong.
4. Uji login endpoint (`POST /api/users/login`) memakai input JSON email palsu dan/atau password salah. Cermati balasan format errror persis di kontrak JSON awal.
5. Uji login titik normal (email dan sandi sah). Perhatikan kemunculan struktur `{"data": "nilai_UUID_acak"}` dan cocokan recordnya pada table `sessions` dalam PostgreSQL.
