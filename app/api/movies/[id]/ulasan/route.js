import { prisma } from "../../../../../lib/prisma";
import { ambilSession } from "../../../../../lib/session";

const MAKS_KOMENTAR = 500;

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

// Lihat rata-rata rating dan semua komentar sebuah film. Boleh diakses siapa saja.
// jumlah = banyaknya rating. nilaiSaya = rating user yang sedang login (null kalau belum).
export async function GET(request, { params }) {
  try {
    const id = bacaId((await params).id);
    if (!id) return filmTidakDitemukan();

    const film = await prisma.movie.findUnique({
      where: { id_movie: id },
      select: { id_movie: true },
    });
    if (!film) return filmTidakDitemukan();

    const session = await ambilSession();

    const [komentar, ratings, agregat] = await Promise.all([
      prisma.comment.findMany({
        where: { id_movie: id },
        orderBy: { created_at: "desc" },
        select: {
          id_comment: true,
          id_user: true,
          isi_komentar: true,
          created_at: true,
          user: { select: { nama: true } },
        },
      }),
      prisma.rating.findMany({
        where: { id_movie: id },
        select: { id_user: true, nilai: true },
      }),
      prisma.rating.aggregate({
        where: { id_movie: id },
        _avg: { nilai: true },
        _count: { nilai: true },
      }),
    ]);

    // Bintang di samping komentar = rating milik user yang sama untuk film ini.
    const nilaiPerUser = new Map(ratings.map((r) => [r.id_user, r.nilai]));

    const ulasan = komentar.map((k) => ({
      id_comment: k.id_comment,
      nama: k.user.nama,
      isi_komentar: k.isi_komentar,
      nilai: nilaiPerUser.get(k.id_user) ?? null,
      created_at: k.created_at,
    }));

    const rataRata = agregat._avg.nilai
      ? Math.round(agregat._avg.nilai * 10) / 10
      : 0;

    const nilaiSaya = session ? (nilaiPerUser.get(session.id_user) ?? null) : null;

    return Response.json({
      rataRata,
      jumlah: agregat._count.nilai,
      ulasan,
      nilaiSaya,
    });
  } catch (error) {
    console.error("Error lihat ulasan:", error);
    return errorServer();
  }
}

// Kirim rating dan komentar sekaligus. Harus login.
// Satu user satu rating per film: kirim lagi berarti rating diperbarui,
// dan komentar baru ditambahkan.
export async function POST(request, { params }) {
  try {
    const session = await ambilSession();
    if (!session) {
      return Response.json({ pesan: "Belum login." }, { status: 401 });
    }

    const id = bacaId((await params).id);
    if (!id) return filmTidakDitemukan();

    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json({ pesan: "Data tidak valid." }, { status: 400 });
    }

    const nilai = body?.nilai;
    const isi =
      typeof body?.isi_komentar === "string" ? body.isi_komentar.trim() : "";

    // Database tidak membatasi nilai, jadi diperiksa di sini.
    if (!Number.isInteger(nilai) || nilai < 1 || nilai > 5) {
      return Response.json(
        { pesan: "Nilai harus bilangan bulat 1 sampai 5." },
        { status: 400 }
      );
    }
    if (!isi) {
      return Response.json(
        { pesan: "Komentar tidak boleh kosong." },
        { status: 400 }
      );
    }
    if (isi.length > MAKS_KOMENTAR) {
      return Response.json(
        { pesan: `Komentar maksimal ${MAKS_KOMENTAR} karakter.` },
        { status: 400 }
      );
    }

    const film = await prisma.movie.findUnique({
      where: { id_movie: id },
      select: { id_movie: true },
    });
    if (!film) return filmTidakDitemukan();

    await prisma.$transaction([
      prisma.rating.upsert({
        where: { id_user_id_movie: { id_user: session.id_user, id_movie: id } },
        update: { nilai },
        create: { id_user: session.id_user, id_movie: id, nilai },
      }),
      prisma.comment.create({
        data: { id_user: session.id_user, id_movie: id, isi_komentar: isi },
      }),
    ]);

    return Response.json({ pesan: "Ulasan berhasil dikirim." }, { status: 201 });
  } catch (error) {
    // P2003 = user dari cookie sudah tidak ada di database
    if (error.code === "P2003") {
      return Response.json({ pesan: "User tidak ditemukan." }, { status: 401 });
    }
    console.error("Error kirim ulasan:", error);
    return errorServer();
  }
}
