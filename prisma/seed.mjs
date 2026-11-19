import "dotenv/config";
import pg from "pg";
import bcrypt from "bcryptjs";

const NAMA = "Admin";
const EMAIL = "admin@boming.id";
const password = process.env.ADMIN_PASSWORD;

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL belum ada di .env");
  process.exit(1);
}

if (!password || password.length < 6) {
  console.error("ADMIN_PASSWORD belum diisi di .env (minimal 6 karakter).");
  process.exit(1);
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

try {
  await client.connect();
  const passwordAcak = await bcrypt.hash(password, 10);

  await client.query(
    `INSERT INTO users (nama, email, password, role)
     VALUES ($1, $2, $3, 'admin')
     ON CONFLICT (email) DO UPDATE
     SET nama = EXCLUDED.nama,
         password = EXCLUDED.password,
         role = 'admin'`,
    [NAMA, EMAIL, passwordAcak]
  );

  console.log("Akun admin siap:", EMAIL);
} catch (error) {
  console.error("Gagal membuat akun admin:", error.message);
  process.exitCode = 1;
} finally {
  await client.end();
}