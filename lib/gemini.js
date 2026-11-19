const ALAMAT = "https://generativelanguage.googleapis.com/v1beta/models";
const PERCOBAAN_MAKS = 3;

function tunggu(ms) {
  return new Promise((selesai) => setTimeout(selesai, ms));
}

// Bertanya ke Gemini.
// instruksi: aturan untuk chatbot (teks).
// riwayat: daftar pesan { pengirim: "user" | "chatbot", pesan: "..." }, yang terakhir
//          adalah pertanyaan user saat ini.
// Hasilnya teks jawaban. Kalau gagal, melempar Error.
export async function tanyaGemini({ instruksi, riwayat }) {
  const kunci = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL;

  if (!kunci || !model) {
    throw new Error("GEMINI_API_KEY atau GEMINI_MODEL belum diisi di .env");
  }

  const body = {
    system_instruction: { parts: [{ text: instruksi }] },
    contents: riwayat.map((p) => ({
      role: p.pengirim === "user" ? "user" : "model",
      parts: [{ text: p.pesan }],
    })),
  };

  let errorTerakhir = null;

  for (let percobaan = 1; percobaan <= PERCOBAAN_MAKS; percobaan++) {
    try {
      const res = await fetch(`${ALAMAT}/${model}:generateContent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": kunci,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(30000),
      });

      if (res.ok) {
        const data = await res.json();
        const teks = (data.candidates?.[0]?.content?.parts ?? [])
          .filter((bagian) => typeof bagian.text === "string" && !bagian.thought)
          .map((bagian) => bagian.text)
          .join("")
          .trim();

        if (!teks) {
          throw new Error("Gemini tidak memberi jawaban.");
        }
        return teks;
      }

      const isiError = await res.text();
      errorTerakhir = new Error(`Gemini error ${res.status}: ${isiError.slice(0, 300)}`);
      errorTerakhir.status = res.status;

      // Gangguan sementara di server Google: coba lagi sebentar lagi.
      // Error lain (kunci salah, model salah, batas habis) tidak berguna diulang.
      if (res.status !== 503 && res.status !== 500) {
        throw errorTerakhir;
      }
    } catch (error) {
      if (error === errorTerakhir && error.status !== 503 && error.status !== 500) {
        throw error;
      }
      errorTerakhir = error;
    }

    if (percobaan < PERCOBAAN_MAKS) {
      await tunggu(1500 * percobaan);
    }
  }

  throw errorTerakhir ?? new Error("Gemini tidak bisa dihubungi.");
}