import { prisma } from "../../../../lib/prisma";
import { cekAdmin } from "../../../../lib/admin";

function komentarTidakDitemukan() {
  return Response.json({ pesan: "Komentar tidak ditemukan." }, { status: 404 });
}

// Hapus komentar. Hanya admin.
export async function DELETE(request, { params }) {
  try {
    const admin = await cekAdmin();
    if (!admin.ok) {
      return Response.json({ pesan: admin.pesan }, { status: admin.status });
    }

    const id = Number((await params).id);
    if (!Number.isInteger(id) || id < 1) return komentarTidakDitemukan();

    await prisma.comment.delete({ where: { id_comment: id } });

    return Response.json({ pesan: "Komentar berhasil dihapus." });
  } catch (error) {
    // P2025 = data yang mau dihapus tidak ada
    if (error.code === "P2025") return komentarTidakDitemukan();
    console.error("Error hapus komentar:", error);
    return Response.json(
      { pesan: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
