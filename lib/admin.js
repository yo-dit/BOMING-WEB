import { prisma } from "./prisma";
import { ambilSession } from "./session";

// Dipakai di API yang khusus admin.
// Hasilnya { ok: true, user } kalau boleh, atau { ok: false, status, pesan } kalau tidak.
export async function cekAdmin() {
  const session = await ambilSession();
  if (!session) {
    return { ok: false, status: 401, pesan: "Belum login." };
  }

  // Role dicek ulang ke database, bukan hanya dari cookie,
  // supaya kalau role seseorang diubah, hasilnya langsung berlaku.
  const user = await prisma.user.findUnique({
    where: { id_user: session.id_user },
    select: { id_user: true, role: true },
  });

  if (!user) {
    return { ok: false, status: 401, pesan: "User tidak ditemukan." };
  }

  if (user.role !== "admin") {
    return {
      ok: false,
      status: 403,
      pesan: "Hanya admin yang boleh melakukan ini.",
    };
  }

  return { ok: true, user };
}