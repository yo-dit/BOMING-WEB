import { prisma } from "../../../lib/prisma";
import { ambilSession } from "../../../lib/session";

function belumLogin() {
  return Response.json({ pesan: "Belum login." }, { status: 401 });
}

function errorServer() {
  return Response.json(
    { pesan: "Terjadi kesalahan pada server." },
    { status: 500 }
  );
}

// Daftar film simpanan user yang sedang login, yang terbaru di atas.
export async function GET() {
  try {
    const session = await ambilSession();
    if (!session) return belumLogin();

    const baris = await prisma.daftarku.findMany({
      where: { id_user: session.id_user },
      orderBy: { created_at: "desc" },
      select: {
        movie: {
          select: {
            id_movie: true,
            judul: true,
            genre: true,
            tahun: true,
            poster: true,
          },
        },
      },
    });

    return Response.json({ movies: baris.map((b) => b.movie) });
  } catch (error) {
    console.error("Error lihat daftarku:", error);
    return errorServer();
  }
}

// Tambah film ke daftarku. Body: { id_movie }
// Kalau film sudah ada di daftar, tetap berhasil (tidak dobel).
export async function POST(request) {
  try {
    const session = await ambilSession();
    if (!session) return belumLogin();

    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json({ pesan: "Data tidak valid." }, { status: 400 });
    }

    const idMovie = body?.id_movie;
    if (!Number.isInteger(idMovie) || idMovie < 1) {
      return Response.json({ pesan: "id_movie tidak valid." }, { status: 400 });
    }

    const film = await prisma.movie.findUnique({
      where: { id_movie: idMovie },
      select: { id_movie: true },
    });
    if (!film) {
      return Response.json({ pesan: "Film tidak ditemukan." }, { status: 404 });
    }

    await prisma.daftarku.upsert({
      where: {
        id_user_id_movie: { id_user: session.id_user, id_movie: idMovie },
      },
      update: {},
      create: { id_user: session.id_user, id_movie: idMovie },
    });

    return Response.json(
      { pesan: "Film ditambahkan ke daftarku." },
      { status: 201 }
    );
  } catch (error) {
    // P2003 = user dari cookie sudah tidak ada di database
    if (error.code === "P2003") {
      return Response.json({ pesan: "User tidak ditemukan." }, { status: 401 });
    }
    console.error("Error tambah daftarku:", error);
    return errorServer();
  }
}
