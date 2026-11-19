import { prisma } from "../../../../lib/prisma";
import { cekAdmin } from "../../../../lib/admin";
import { validasiFilm } from "../../../../lib/film";

function bacaId(idMentah) {
  const id = Number(idMentah);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function filmTidakDitemukan() {
  return Response.json({ pesan: "Film tidak ditemukan." }, { status: 404 });
}

function errorServer() {
  return Response.json(
    { pesan: "Terjadi kesalahan pada server." },
    { status: 500 }
  );
}

// Lihat satu film. Boleh diakses siapa saja.
export async function GET(request, { params }) {
  try {
    const id = bacaId((await params).id);
    if (!id) return filmTidakDitemukan();

    const movie = await prisma.movie.findUnique({ where: { id_movie: id } });
    if (!movie) return filmTidakDitemukan();

    return Response.json({ movie });
  } catch (error) {
    console.error("Error lihat film:", error);
    return errorServer();
  }
}

// Ubah film. Hanya admin.
export async function PUT(request, { params }) {
  try {
    const admin = await cekAdmin();
    if (!admin.ok) {
      return Response.json({ pesan: admin.pesan }, { status: admin.status });
    }

    const id = bacaId((await params).id);
    if (!id) return filmTidakDitemukan();

    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json({ pesan: "Data tidak valid." }, { status: 400 });
    }

    const hasil = validasiFilm(body);
    if (!hasil.ok) {
      return Response.json({ pesan: hasil.pesan }, { status: 400 });
    }

    const movie = await prisma.movie.update({
      where: { id_movie: id },
      data: hasil.data,
    });

    return Response.json({ pesan: "Film berhasil diubah.", movie });
  } catch (error) {
    // P2025 = data yang mau diubah tidak ada
    if (error.code === "P2025") return filmTidakDitemukan();
    console.error("Error ubah film:", error);
    return errorServer();
  }
}

// Hapus film. Hanya admin.
// Komentar dan rating milik film itu ikut terhapus (onDelete: Cascade di schema).
export async function DELETE(request, { params }) {
  try {
    const admin = await cekAdmin();
    if (!admin.ok) {
      return Response.json({ pesan: admin.pesan }, { status: admin.status });
    }

    const id = bacaId((await params).id);
    if (!id) return filmTidakDitemukan();

    await prisma.movie.delete({ where: { id_movie: id } });

    return Response.json({ pesan: "Film berhasil dihapus." });
  } catch (error) {
    if (error.code === "P2025") return filmTidakDitemukan();
    console.error("Error hapus film:", error);
    return errorServer();
  }
}