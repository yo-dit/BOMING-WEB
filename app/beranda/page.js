import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "../../lib/prisma";
import DeretanFilm from "../components/DeretanFilm";

export const metadata = {
  title: "Beranda - BOMING",
};

const DAFTAR_GENRE = [
  "Komedi",
  "Horor",
  "Aksi",
  "Drama",
  "Romansa",
  "Fiksi Ilmiah",
];

export default function BerandaPage() {
  return (
    <Suspense
      fallback={<p className="px-12 py-8 text-sm text-white/60">Memuat beranda...</p>}
    >
      <IsiBeranda />
    </Suspense>
  );
}

async function IsiBeranda() {
  const [movies, rataRata] = await Promise.all([
    prisma.movie.findMany({
      orderBy: { created_at: "desc" },
      select: {
        id_movie: true,
        judul: true,
        genre: true,
        tahun: true,
        poster: true,
      },
    }),
    prisma.rating.groupBy({
      by: ["id_movie"],
      _avg: { nilai: true },
    }),
  ]);

  // Sedang tren: rata-rata rating tertinggi. Film tanpa rating dianggap 0,
  // dan urutan awal (terbaru dulu) tetap dipertahankan kalau nilainya sama.
  const nilaiFilm = new Map(
    rataRata.map((item) => [item.id_movie, item._avg.nilai ?? 0])
  );
  const tren = [...movies].sort(
    (a, b) => (nilaiFilm.get(b.id_movie) ?? 0) - (nilaiFilm.get(a.id_movie) ?? 0)
  );
  const baru = movies.slice(0, 12);
  const unggulan = tren[0];

  return (
    <main className="px-12 pb-10 pt-4">
      {unggulan && (
        <div className="relative flex h-[480px] items-end overflow-hidden rounded-lg bg-linear-to-br from-[#5c4a38] to-[#0c0c0c]">
          <div className="absolute inset-0 bg-linear-to-t from-[#0c0c0c] via-transparent to-transparent" />
          <div className="relative p-10">
            <h1 className="font-judul text-[88px] uppercase leading-none text-merah">
              {unggulan.judul}
            </h1>
            <p className="mt-3 text-base text-white">
              Film | {unggulan.genre} | {unggulan.tahun}
            </p>
            <div className="mt-4 flex gap-3">
              <Link
                href={`/film/${unggulan.id_movie}/putar`}
                className="flex h-11 items-center rounded-full bg-white px-6 text-base font-bold text-black"
              >
                Putar
              </Link>
              <Link
                href={`/film/${unggulan.id_movie}`}
                className="flex h-11 items-center rounded-full bg-[#3a3a3a] px-6 text-base font-bold text-white"
              >
                Info lengkap
              </Link>
            </div>
          </div>
        </div>
      )}

      <nav className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/film"
          className="rounded-full bg-merah px-4 py-2 text-sm font-bold text-white"
        >
          Semua
        </Link>
        {DAFTAR_GENRE.map((genre) => (
          <Link
            key={genre}
            href={`/film?genre=${encodeURIComponent(genre)}`}
            className="rounded-full bg-[#222222] px-4 py-2 text-sm text-white/80"
          >
            {genre}
          </Link>
        ))}
      </nav>

      {movies.length > 0 && (
        <div className="mt-6 space-y-8">
          <DeretanFilm judul="Sedang tren" films={tren.slice(0, 12)} />
          <DeretanFilm judul="Baru ditambahkan" films={baru} />
        </div>
      )}
    </main>
  );
}