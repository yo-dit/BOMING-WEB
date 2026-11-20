import { prisma } from "../../lib/prisma";
import KartuFilm from "./KartuFilm";

// Bagian "Daftarku": poster film simpanan user.
// Komponen server, dipakai di Profile User dan Profile Admin
// (harus berada di dalam <Suspense> karena membaca database).
export default async function DaftarkuSaya({ idUser }) {
  const baris = await prisma.daftarku.findMany({
    where: { id_user: idUser },
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

  return (
    <section className="pt-8">
      <h2 className="font-judul text-2xl leading-8 text-white">Daftarku</h2>
      {baris.length === 0 ? (
        <p className="pt-3 text-sm text-white/60">
          Belum ada film di daftarku.
        </p>
      ) : (
        <div className="flex flex-wrap gap-4 pt-3">
          {baris.map((b) => (
            <KartuFilm key={b.movie.id_movie} film={b.movie} />
          ))}
        </div>
      )}
    </section>
  );
}
