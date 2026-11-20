import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "../../../../lib/prisma";
import KartuFilm from "../../../components/KartuFilm";

export default function HalamanPutar({ params }) {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#0c0c0c] px-12 pt-4 text-white/60">
          Memuat pemutar...
        </main>
      }
    >
      <IsiPutar params={params} />
    </Suspense>
  );
}

async function IsiPutar({ params }) {
  const idMentah = (await params).id;
  const id = Number(idMentah);
  if (!Number.isInteger(id) || id < 1 || id > 2147483647) {
    notFound();
  }

  const film = await prisma.movie.findUnique({ where: { id_movie: id } });
  if (!film) {
    notFound();
  }

  // Film "Selanjutnya": genre sama dulu, sisanya film terbaru (maksimal 6)
  const sama = await prisma.movie.findMany({
    where: { genre: film.genre, NOT: { id_movie: id } },
    orderBy: { created_at: "desc" },
    take: 6,
  });
  let selanjutnya = sama;
  if (sama.length < 6) {
    const sisa = await prisma.movie.findMany({
      where: {
        NOT: { id_movie: { in: [id, ...sama.map((f) => f.id_movie)] } },
      },
      orderBy: { created_at: "desc" },
      take: 6 - sama.length,
    });
    selanjutnya = [...sama, ...sisa];
  }

  const url = film.video_url;
  const langsung = url ? /\.(mp4|webm|ogg)(\?.*)?$/i.test(url) : false;

  return (
    <main className="min-h-screen bg-[#0c0c0c] px-12 pb-16 pt-4 text-white">
      <div className="relative aspect-[1344/675] w-full overflow-hidden rounded-md bg-black">
        {url ? (
          langsung ? (
            <video
              src={url}
              controls
              className="h-full w-full"
              poster={film.backdrop || film.poster || undefined}
            />
          ) : (
            <iframe
              src={url}
              title={film.judul}
              allow="autoplay; fullscreen"
              allowFullScreen
              className="h-full w-full border-0"
            />
          )
        ) : (
          <div className="flex h-full w-full items-center justify-center text-white/60">
            Video belum tersedia
          </div>
        )}

        <div className="pointer-events-none absolute left-0 right-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent px-6 py-4">
          <Link
            href={"/film/" + film.id_movie}
            className="pointer-events-auto text-sm font-medium text-white hover:text-white/70"
          >
            {"\u2190 Kembali"}
          </Link>
          <span className="font-judul text-xl uppercase">{film.judul}</span>
        </div>
      </div>

      {selanjutnya.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-4 font-judul text-2xl uppercase">Selanjutnya</h2>
          <div className="flex gap-4">
            {selanjutnya.map((f) => (
              <div key={f.id_movie} className="w-28 shrink-0">
                <KartuFilm film={f} penuh />
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}