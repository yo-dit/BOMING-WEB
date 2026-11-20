import { Suspense } from "react";
import { prisma } from "../../lib/prisma";
import KartuFilm from "../components/KartuFilm";

export const metadata = {
  title: "Film - BOMING",
};

export default function FilmPage({ searchParams }) {
  return (
    <Suspense
      fallback={<p className="px-11 py-8 text-sm text-white/60">Memuat film...</p>}
    >
      <IsiFilm searchParams={searchParams} />
    </Suspense>
  );
}

// Ambil teks dari alamat. Kalau bukan teks biasa, anggap kosong.
function ambilTeks(nilai) {
  return typeof nilai === "string" ? nilai.trim() : "";
}

async function IsiFilm({ searchParams }) {
  const params = await searchParams;
  const q = ambilTeks(params.q);
  const genre = ambilTeks(params.genre);

  const where = {};
  if (q) where.judul = { contains: q, mode: "insensitive" };
  if (genre) where.genre = genre;

  const movies = await prisma.movie.findMany({
    where,
    orderBy: { created_at: "desc" },
    select: {
      id_movie: true,
      judul: true,
      genre: true,
      tahun: true,
      poster: true,
    },
  });

  return (
    <main className="px-11 pb-10 pt-8">
      <h1 className="font-judul text-[32px] leading-10 text-white">
        Semua film
      </h1>
      <p className="text-base leading-6 text-white/60">
        {movies.length} film ditemukan
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-6">
        {movies.map((film) => (
          <KartuFilm key={film.id_movie} film={film} denganInfo penuh />
        ))}
      </div>
    </main>
  );
}