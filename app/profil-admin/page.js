import { Suspense } from "react";
import { redirect } from "next/navigation";
import { prisma } from "../../lib/prisma";
import { ambilSession } from "../../lib/session";
import KelolaFilm from "../components/KelolaFilm";
import TombolKeluar from "../components/TombolKeluar";

export const metadata = {
  title: "Profil Admin - BOMING",
};

export default function ProfilAdminPage() {
  return (
    <Suspense
      fallback={
        <p className="mx-auto max-w-[1024px] px-12 py-8 text-sm text-white/60">
          Memuat profil...
        </p>
      }
    >
      <IsiProfilAdmin />
    </Suspense>
  );
}

async function IsiProfilAdmin() {
  const session = await ambilSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id_user: session.id_user },
    select: { id_user: true, nama: true, email: true, role: true },
  });

  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/");

  const [totalFilm, filmDinilai, totalKomentar] = await Promise.all([
    prisma.movie.count(),
    prisma.rating.count({ where: { id_user: user.id_user } }),
    prisma.comment.count({ where: { id_user: user.id_user } }),
  ]);

  const statistik = [
    { angka: totalFilm, label: "Total film" },
    { angka: filmDinilai, label: "Film dinilai" },
    { angka: totalKomentar, label: "Komentar" },
  ];

  return (
    <main className="mx-auto max-w-[1024px] px-12 py-8">
      <div className="flex items-center gap-5">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-merah font-judul text-4xl leading-10 text-white">
          {user.nama.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-judul text-[30px] leading-9 text-white">
            {user.nama}
          </h1>
          <p className="truncate text-base leading-6 text-white/60">
            {user.email}
          </p>
        </div>
        <TombolKeluar />
      </div>

      <div className="grid grid-cols-3 gap-3 pt-6">
        {statistik.map((item) => (
          <div
            key={item.label}
            className="flex h-[88px] flex-col items-center rounded-lg bg-[#1a1a1a] p-4"
          >
            <span className="font-judul text-[30px] leading-9 text-white">
              {item.angka}
            </span>
            <span className="text-sm leading-5 text-white/60">{item.label}</span>
          </div>
        ))}
      </div>

      <KelolaFilm />
    </main>
  );
}