import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "../../../lib/prisma";
import KartuFilm from "../../components/KartuFilm";

export const metadata = {
  title: "Detail Film - BOMING",
};

export default function DetailFilmPage({ params }) {
  return (
    <Suspense
      fallback={<p className="px-12 py-8 text-sm text-white/60">Memuat film...</p>}
    >
      <IsiDetail params={params} />
    </Suspense>
  );
}

async function IsiDetail({ params }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id < 1) notFound();

  const [film, rating] = await Promise.all([
    prisma.movie.findUnique({
      where: { id_movie: id },
      select: {
        id_movie: true,
        judul: true,
        sinopsis: true,
        genre: true,
        tahun: true,
        poster: true,
      },
    }),
    prisma.rating.aggregate({
      where: { id_movie: id },
      _avg: { nilai: true },
      _count: { nilai: true },
    }),
  ]);

  if (!film) notFound();

  // Mirip dengan ini: sampai 4 film lain dengan genre yang sama,
  // kalau kurang diisi film terbaru lainnya.
  const pilihan = {
    select: { id_movie: true, judul: true, genre: true, tahun: true, poster: true },
    orderBy: { created_at: "desc" },
  };
  const sama = await prisma.movie.findMany({
    ...pilihan,
    where: { genre: film.genre, id_movie: { not: id } },
    take: 4,
  });
  let mirip = sama;
  if (sama.length < 4) {
    const lain = await prisma.movie.findMany({
      ...pilihan,
      where: { id_movie: { notIn: [id, ...sama.map((m) => m.id_movie)] } },
      take: 4 - sama.length,
    });
    mirip = [...sama, ...lain];
  }

  const jumlahRating = rating._count.nilai;
  const rataRata = rating._avg.nilai;
  const bintangPenuh = rataRata ? Math.round(rataRata) : 0;
  const bintang = "\u2605".repeat(bintangPenuh) + "\u2606".repeat(5 - bintangPenuh);

  return (
    <main>
      <div className="relative flex h-[420px] items-end bg-linear-to-br from-[#5c4a38] to-[#0c0c0c]">
        <div className="absolute inset-0 bg-linear-to-t from-[#0c0c0c] via-transparent to-transparent" />
        <div className="relative px-12 pb-8">
          <h1 className="font-judul text-[72px] uppercase leading-none text-white">
            {film.judul}
          </h1>
          <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-white">
            <span>
              {film.genre} {"\u00b7"} {film.tahun}
            </span>
            {jumlahRating > 0 && (
              <>
                <span>{"\u00b7"}</span>
                <span className="text-merah">{bintang}</span>
                <span>{rataRata.toFixed(1)}/5</span>
              </>
            )}
          </p>
          <div className="mt-4 flex gap-3">
            <Link
              href={`/film/${film.id_movie}/putar`}
              className="flex h-11 items-center rounded-full bg-white px-6 text-base font-bold text-black"
            >
              Putar
            </Link>
            {/* SLOT: TombolDaftarku */}
          </div>
        </div>
      </div>

      <div className="grid gap-10 px-12 pb-10 pt-6 lg:grid-cols-[1fr_421px]">
        <div className="min-w-0">
          <p className="max-w-[650px] text-base leading-relaxed text-white/85">
            {film.sinopsis}
          </p>
          {/* SLOT: RatingKomentar */}
        </div>

        <aside>
          <h2 className="font-judul text-2xl leading-8 text-white">
            Mirip dengan ini
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {mirip.map((m) => (
              <KartuFilm key={m.id_movie} film={m} penuh />
            ))}
          </div>
        </aside>
      </div>
    </main>
  );
}