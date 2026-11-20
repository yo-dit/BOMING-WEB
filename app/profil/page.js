import { Suspense } from "react";
import { redirect } from "next/navigation";
import { prisma } from "../../lib/prisma";
import { ambilSession } from "../../lib/session";
import Navbar from "../components/Navbar";
import TombolKeluar from "../components/TombolKeluar";
import UbahNama from "../components/UbahNama";
import DaftarkuSaya from "../components/DaftarkuSaya";

export const metadata = {
  title: "Profil - BOMING",
};

export default function ProfilPage() {
  return (
    <>
      <Navbar />
      <Suspense
        fallback={
          <p className="mx-auto max-w-[1024px] px-12 py-8 text-sm text-white/60">
            Memuat profil...
          </p>
        }
      >
        <IsiProfil />
      </Suspense>
    </>
  );
}

async function IsiProfil() {
  const session = await ambilSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id_user: session.id_user },
    select: { id_user: true, nama: true, email: true, role: true },
  });

  if (!user) redirect("/login");
  if (user.role === "admin") redirect("/profil-admin");

  const [diDaftarku, filmDinilai, totalKomentar] = await Promise.all([
    prisma.daftarku.count({ where: { id_user: user.id_user } }),
    prisma.rating.count({ where: { id_user: user.id_user } }),
    prisma.comment.count({ where: { id_user: user.id_user } }),
  ]);

  const statistik = [
    { angka: diDaftarku, label: "Di daftarku" },
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

      <div className="pt-6">
        <UbahNama />
      </div>

      <DaftarkuSaya idUser={user.id_user} />
    </main>
  );
}
