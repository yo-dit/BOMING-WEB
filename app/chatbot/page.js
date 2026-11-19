"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const SAPAAN = "Halo, aku asisten Boming. Mau nonton apa malam ini?";
const SARAN = [
  "Aku mau yang lucu",
  "Film horor dong",
  "Rating tertinggi",
  "Lagi baper nih",
];
const PANJANG_MAKS = 500;

function Gelembung({ dari, redup = false, children }) {
  const milikUser = dari === "user";
  return (
    <div className={milikUser ? "flex justify-end" : "flex justify-start"}>
      <div
        className={`max-w-[85%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm leading-5 ${
          milikUser ? "bg-merah text-white" : "bg-[#2a2a2a] text-white"
        } ${redup ? "opacity-60" : ""}`}
      >
        {children}
      </div>
    </div>
  );
}

export default function ChatbotPage() {
  const router = useRouter();
  const [daftarPesan, setDaftarPesan] = useState([]);
  const [isian, setIsian] = useState("");
  const [mengirim, setMengirim] = useState(false);
  const [error, setError] = useState("");
  const kotakRef = useRef(null);
  const urutanSementara = useRef(0);

  // Memuat riwayat obrolan saat halaman dibuka.
  useEffect(() => {
    let dibatalkan = false;

    fetch("/api/chat")
      .then(async (res) => {
        if (res.status === 401) {
          router.push("/login");
          return null;
        }
        const data = await res.json();
        if (!res.ok) throw new Error(data.pesan);
        return data.messages;
      })
      .then((messages) => {
        if (!dibatalkan && messages) setDaftarPesan(messages);
      })
      .catch(() => {
        if (!dibatalkan) setError("Riwayat obrolan gagal dimuat.");
      });

    return () => {
      dibatalkan = true;
    };
  }, [router]);

  // Gulung ke pesan paling bawah setiap ada pesan baru.
  useEffect(() => {
    const kotak = kotakRef.current;
    if (kotak) kotak.scrollTop = kotak.scrollHeight;
  }, [daftarPesan, mengirim]);

  async function kirim(teks) {
    const pesan = teks.trim();
    if (!pesan || mengirim) return;

    setError("");
    setMengirim(true);
    setIsian("");

    // Pesan sementara supaya terlihat langsung, sebelum jawaban datang.
    urutanSementara.current += 1;
    const sementara = {
      id_message: `sementara-${urutanSementara.current}`,
      pengirim: "user",
      pesan,
    };
    setDaftarPesan((lama) => [...lama, sementara]);

    function batalkanSementara(pesanError) {
      setDaftarPesan((lama) =>
        lama.filter((p) => p.id_message !== sementara.id_message)
      );
      setIsian(pesan);
      setError(pesanError);
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pesan }),
      });

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        batalkanSementara(data.pesan || "Pesan gagal dikirim.");
        return;
      }

      setDaftarPesan((lama) => [
        ...lama.filter((p) => p.id_message !== sementara.id_message),
        ...data.messages,
      ]);
    } catch {
      batalkanSementara("Tidak bisa terhubung ke server.");
    } finally {
      setMengirim(false);
    }
  }

  function kirimForm(e) {
    e.preventDefault();
    kirim(isian);
  }

  return (
    <main className="mx-auto max-w-[672px] px-4 pb-10 pt-8">
      <h1 className="font-judul text-[30px] leading-9 text-white">
        Asisten Boming
      </h1>
      <p className="text-sm leading-5 text-white/60">
        Ceritakan suasana hatimu atau genre favoritmu.
      </p>

      <div
        ref={kotakRef}
        className="mt-4 h-[464px] space-y-3 overflow-y-auto rounded-lg bg-[#1a1a1a] p-4"
      >
        <Gelembung dari="chatbot">{SAPAAN}</Gelembung>
        {daftarPesan.map((p) => (
          <Gelembung key={p.id_message} dari={p.pengirim}>
            {p.pesan}
          </Gelembung>
        ))}
        {mengirim && (
          <Gelembung dari="chatbot" redup>
            Asisten sedang mengetik...
          </Gelembung>
        )}
      </div>

      {error && (
        <p role="alert" className="pt-3 text-sm text-red-400">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-2 pt-3">
        {SARAN.map((saran) => (
          <button
            key={saran}
            type="button"
            onClick={() => kirim(saran)}
            disabled={mengirim}
            className="h-8 rounded-full bg-[#222222] px-4 text-sm text-white hover:bg-[#2c2c2c] disabled:opacity-50"
          >
            {saran}
          </button>
        ))}
      </div>

      <form onSubmit={kirimForm} className="flex gap-2 pt-3">
        <input
          type="text"
          value={isian}
          onChange={(e) => setIsian(e.target.value)}
          placeholder="Tulis pesan..."
          maxLength={PANJANG_MAKS}
          disabled={mengirim}
          aria-label="Tulis pesan"
          className="h-12 flex-1 rounded-md border border-[#333333] bg-[#222222] px-[14px] text-sm text-white outline-none placeholder:text-[#9ca3af] focus:border-merah disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={mengirim || !isian.trim()}
          className="h-12 rounded bg-merah px-6 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50"
        >
          Kirim
        </button>
      </form>
    </main>
  );
}