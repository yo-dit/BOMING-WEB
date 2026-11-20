import { prisma } from "../../../../lib/prisma";
import { ambilSession } from "../../../../lib/session";

// Hapus film dari daftarku milik user yang sedang login.
// Kalau film memang tidak ada di daftar, tetap dianggap berhasil.
export async function DELETE(request, { params }) {
  try {
    const session = await ambilSession();
    if (!session) {
      return Response.json({ pesan: "Belum login." }, { status: 401 });
    }

    const idMovie = Number((await params).id_movie);
    if (!Number.isInteger(idMovie) || idMovie < 1) {
      return Response.json({ pesan: "id_movie tidak valid." }, { status: 400 });
    }

    await prisma.daftarku.deleteMany({
      where: { id_user: session.id_user, id_movie: idMovie },
    });

    return Response.json({ pesan: "Film dihapus dari daftarku." });
  } catch (error) {
    console.error("Error hapus daftarku:", error);
    return Response.json(
      { pesan: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
