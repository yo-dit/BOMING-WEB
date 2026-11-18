import { hapusSession } from "../../../lib/session";

export async function POST() {
  try {
    await hapusSession();
    return Response.json({ pesan: "Logout berhasil." });
  } catch (error) {
    console.error("Error logout:", error);
    return Response.json(
      { pesan: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}