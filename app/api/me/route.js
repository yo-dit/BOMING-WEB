import { prisma } from "../../../lib/prisma";
import { ambilSession } from "../../../lib/session";

export async function GET() {
  try {
    const session = await ambilSession();

    if (!session) {
      return Response.json({ pesan: "Belum login." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id_user: session.id_user },
      select: {
        id_user: true,
        nama: true,
        email: true,
        role: true,
        created_at: true,
      },
    });

    if (!user) {
      return Response.json({ pesan: "User tidak ditemukan." }, { status: 401 });
    }

    return Response.json({ user });
  } catch (error) {
    console.error("Error me:", error);
    return Response.json(
      { pesan: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}