import bcrypt from "bcryptjs";
import { prisma } from "../../../lib/prisma";
import { buatSession } from "../../../lib/session";

export async function POST(request) {
  try {
    const body = await request.json();
    const nama = (body.nama || "").trim();
    const email = (body.email || "").trim().toLowerCase();
    const password = body.password || "";

    // Validasi input
    if (!nama || !email || !password) {
      return Response.json(
        { pesan: "Nama, email, dan password wajib diisi." },
        { status: 400 }
      );
    }

    if (!email.includes("@")) {
      return Response.json(
        { pesan: "Format email tidak valid." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return Response.json(
        { pesan: "Password minimal 6 karakter." },
        { status: 400 }
      );
    }

    // Cek email sudah dipakai atau belum
    const sudahAda = await prisma.user.findUnique({ where: { email } });
    if (sudahAda) {
      return Response.json(
        { pesan: "Email sudah terdaftar." },
        { status: 409 }
      );
    }

    // Acak password, lalu simpan user baru (role selalu "user")
    const passwordAcak = await bcrypt.hash(password, 10);
    const userBaru = await prisma.user.create({
      data: { nama, email, password: passwordAcak, role: "user" },
    });

    // Langsung login setelah register
    await buatSession(userBaru);

    return Response.json(
      {
        pesan: "Register berhasil.",
        user: {
          id_user: userBaru.id_user,
          nama: userBaru.nama,
          email: userBaru.email,
          role: userBaru.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error register:", error);
    return Response.json(
      { pesan: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}