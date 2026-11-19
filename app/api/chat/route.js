import { prisma } from "../../../lib/prisma";
import { ambilSession } from "../../../lib/session";
import { tanyaGemini } from "../../../lib/gemini";
import {
  INSTRUKSI_CHATBOT,
  BATAS_RIWAYAT,
  PANJANG_PESAN_MAKS,
} from "../../../lib/chatbot";

// Jumlah pesan terakhir yang dikirim ke halaman saat riwayat dibuka.
const BATAS_TAMPIL = 50;

const pilihanPesan = {
  id_message: true,
  pengirim: true,
  pesan: true,
  created_at: true,
};

function belumLogin() {
  return Response.json({ pesan: "Belum login." }, { status: 401 });
}

function errorServer() {
  return Response.json(
    { pesan: "Terjadi kesalahan pada server." },
    { status: 500 }
  );
}

// Riwayat obrolan milik user yang sedang login, urut dari yang terlama.
export async function GET() {
  try {
    const session = await ambilSession();
    if (!session) return belumLogin();

    const terbaru = await prisma.chatMessage.findMany({
      where: { id_user: session.id_user },
      orderBy: { id_message: "desc" },
      take: BATAS_TAMPIL,
      select: pilihanPesan,
    });

    return Response.json({ messages: terbaru.reverse() });
  } catch (error) {
    console.error("Error riwayat chat:", error);
    return errorServer();
  }
}

// Kirim satu pertanyaan, balasannya dari Gemini.
export async function POST(request) {
  try {
    const session = await ambilSession();
    if (!session) return belumLogin();

    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json({ pesan: "Data tidak valid." }, { status: 400 });
    }

    const pesan = String(body.pesan ?? "").trim();
    if (!pesan) {
      return Response.json(
        { pesan: "Pesan tidak boleh kosong." },
        { status: 400 }
      );
    }
    if (pesan.length > PANJANG_PESAN_MAKS) {
      return Response.json(
        { pesan: `Pesan maksimal ${PANJANG_PESAN_MAKS} karakter.` },
        { status: 400 }
      );
    }

    // Pastikan user-nya masih ada di database.
    const user = await prisma.user.findUnique({
      where: { id_user: session.id_user },
      select: { id_user: true },
    });
    if (!user) return belumLogin();

    // Ambil beberapa pesan terakhir sebagai konteks obrolan.
    const sebelumnya = await prisma.chatMessage.findMany({
      where: { id_user: user.id_user },
      orderBy: { id_message: "desc" },
      take: BATAS_RIWAYAT - 1,
      select: { pengirim: true, pesan: true },
    });
    const riwayat = sebelumnya.reverse();

    // Percakapan yang dikirim ke Gemini harus diawali oleh pengguna.
    while (riwayat.length > 0 && riwayat[0].pengirim !== "user") {
      riwayat.shift();
    }
    riwayat.push({ pengirim: "user", pesan });

    let jawaban;
    try {
      jawaban = await tanyaGemini({ instruksi: INSTRUKSI_CHATBOT, riwayat });
    } catch (error) {
      console.error("Error Gemini:", error.message);
      if (error.status === 429) {
        return Response.json(
          { pesan: "Batas pemakaian chatbot sedang habis. Coba lagi sebentar lagi." },
          { status: 429 }
        );
      }
      return Response.json(
        { pesan: "Chatbot sedang sibuk. Coba lagi sebentar lagi." },
        { status: 503 }
      );
    }

    // Simpan pertanyaan dan jawabannya sekaligus, hanya kalau Gemini berhasil menjawab.
    const [pesanUser, pesanBot] = await prisma.$transaction([
      prisma.chatMessage.create({
        data: { id_user: user.id_user, pengirim: "user", pesan },
        select: pilihanPesan,
      }),
      prisma.chatMessage.create({
        data: { id_user: user.id_user, pengirim: "chatbot", pesan: jawaban },
        select: pilihanPesan,
      }),
    ]);

    return Response.json({ messages: [pesanUser, pesanBot] }, { status: 201 });
  } catch (error) {
    console.error("Error kirim chat:", error);
    return errorServer();
  }
}