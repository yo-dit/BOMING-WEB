import { prisma } from "../../../lib/prisma";
import { cekAdmin } from "../../../lib/admin";
import { validasiFilm } from "../../../lib/film";

// Daftar film, yang terbaru di atas. Boleh diakses siapa saja.
// ?q=kata     : cari di judul (huruf besar/kecil tidak dibedakan)
// ?genre=Aksi : hanya film dengan genre itu (persis)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim();
    const genre = (searchParams.get("genre") || "").trim();

    const where = {};
    if (q) where.judul = { contains: q, mode: "insensitive" };
    if (genre) where.genre = genre;

    const movies = await prisma.movie.findMany({
      where,
      orderBy: { created_at: "desc" },
    });
    return Response.json({ movies });
  } catch (error) {
    console.error("Error daftar film:", error);
    return Response.json(
      { pesan: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}

// Tambah film baru. Hanya admin.
export async function POST(request) {
  try {
    const admin = await cekAdmin();
    if (!admin.ok) {
      return Response.json({ pesan: admin.pesan }, { status: admin.status });
    }

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

    const movie = await prisma.movie.create({ data: hasil.data });

    return Response.json(
      { pesan: "Film berhasil ditambahkan.", movie },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error tambah film:", error);
    return Response.json(
      { pesan: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}