# Panduan Push Project ke Repository Git

## Langkah-langkah Push Project ke Repository

### 1. Inisialisasi Git Repository

Jalankan perintah berikut di terminal di folder root project:
```bash
git init
```

### 2. Konfigurasi Git (jika belum dikonfigurasi)

```bash
git config --global user.name "Nama Anda"
git config --global user.email "email@example.com"
```

### 3. Tambahkan Semua File ke Staging Area

```bash
git add .
```

### 4. Buat Commit Pertama

```bash
git commit -m "Initial commit: Jejak Liqo project"
```

### 5. Buat Repository di GitHub/GitLab/Bitbucket

1. Login ke GitHub/GitLab/Bitbucket
2. Klik tombol "New Repository" atau "Create Repository"
3. Beri nama repository (contoh: `jejak-liqo`)
4. **JANGAN** centang "Initialize with README" (karena project sudah ada)
5. Klik "Create Repository"

### 6. Tambahkan Remote Repository

Ganti `username` dan `repository-name` dengan username dan nama repository Anda:

```bash
git remote add origin https://github.com/username/repository-name.git
```

Atau jika menggunakan SSH:
```bash
git remote add origin git@github.com:username/repository-name.git
```

### 7. Push ke Repository

```bash
git branch -M main
git push -u origin main
```

Jika branch utama adalah `master`:
```bash
git branch -M master
git push -u origin master
```

## Catatan Penting

### File yang Sudah Diabaikan (.gitignore)

File-file berikut **TIDAK** akan di-push ke repository:
- `node_modules/` (dependencies frontend dan backend)
- `vendor/` (dependencies Laravel)
- `.env` (file konfigurasi environment - **PENTING!**)
- File log (`*.log`)
- File cache dan build
- Folder IDE (`.vscode/`, `.idea/`, dll)

### Sebelum Push, Pastikan:

1. ✅ File `.env` tidak di-commit (sudah di-ignore)
2. ✅ File konfigurasi sensitif tidak di-commit
3. ✅ Dependencies (`node_modules`, `vendor`) tidak di-commit
4. ✅ File besar/tidak perlu sudah di-ignore

### Setelah Push Pertama

Untuk push perubahan selanjutnya:
```bash
git add .
git commit -m "Deskripsi perubahan"
git push
```

## Troubleshooting

### Jika terjadi error "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/username/repository-name.git
```

### Jika perlu mengubah remote URL
```bash
git remote set-url origin https://github.com/username/repository-name.git
```

### Melihat remote yang terpasang
```bash
git remote -v
```

## Struktur Project

Project ini terdiri dari:
- `Jejak-Liqo-backend/` - Laravel backend API
- `jejak-liqo-frontend/` - React frontend

Kedua folder sudah memiliki `.gitignore` masing-masing yang akan di-respect oleh `.gitignore` di root.

