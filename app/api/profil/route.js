import { prisma } from "../../../lib/prisma";
import { ambilSession } from "../../../lib/session";

// Ubah nama tampilan. Body: { nama }
// Nama diambil dari database, bukan dari cookie, jadi sesi tidak perlu dibuat ulang.
export async function PATCH(request) {
  try {
    const session = await ambilSession();
    if (!session) {
      return Response.json({ pesan: "Belum login." }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json({ pesan: "Data tidak valid." }, { status: 400 });
    }

    const nama = typeof body?.nama === "string" ? body.nama.trim() : "";
    if (nama.length < 1 || nama.length > 50) {
      return Response.json(
        { pesan: "Nama harus 1 sampai 50 karakter." },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id_user: session.id_user },
      data: { nama },
    });

    return Response.json({ pesan: "Nama berhasil diubah.", nama });
  } catch (error) {
    // P2025 = user dari cookie sudah tidak ada di database
    if (error.code === "P2025") {
      return Response.json({ pesan: "User tidak ditemukan." }, { status: 401 });
    }
    console.error("Error ubah nama:", error);
    return Response.json(
      { pesan: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
