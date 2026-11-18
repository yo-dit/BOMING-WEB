import bcrypt from "bcryptjs";
import { prisma } from "../../../lib/prisma";
import { buatSession } from "../../../lib/session";

export async function POST(request) {
  try {
    const body = await request.json();
    const email = (body.email || "").trim().toLowerCase();
    const password = body.password || "";

    if (!email || !password) {
      return Response.json(
        { pesan: "Email dan password wajib diisi." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Pesan sengaja dibuat sama, supaya orang tidak bisa menebak email mana yang terdaftar
    const pesanGagal = "Email atau password salah.";

    if (!user) {
      return Response.json({ pesan: pesanGagal }, { status: 401 });
    }

    const passwordCocok = await bcrypt.compare(password, user.password);
    if (!passwordCocok) {
      return Response.json({ pesan: pesanGagal }, { status: 401 });
    }

    await buatSession(user);

    return Response.json({
      pesan: "Login berhasil.",
      user: {
        id_user: user.id_user,
        nama: user.nama,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error login:", error);
    return Response.json(
      { pesan: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}