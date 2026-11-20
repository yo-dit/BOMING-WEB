"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Bintang untuk tampilan (tanpa klik)
function Bintang({ nilai }) {
  const penuh = nilai ?? 0;
  return (
    <span className="text-xs tracking-wide text-merah" aria-label={`${penuh} dari 5`}>
      {"★".repeat(penuh)}
      {"☆".repeat(5 - penuh)}
    </span>
  );
}

export default function RatingKomentar({ idMovie, adalahAdmin = false }) {
  const router = useRouter();
  const [data, setData] = useState(null); // null = masih memuat
  const [errorMuat, setErrorMuat] = useState("");
  const [versi, setVersi] = useState(0);
  const [nilaiPilih, setNilaiPilih] = useState(null);
  const [isi, setIsi] = useState("");
  const [error, setError] = useState("");
  const [proses, setProses] = useState(false);

  // Memuat ulasan. Diulang setiap kali "versi" bertambah (setelah kirim atau hapus).
  useEffect(() => {
    let dibatalkan = false;

    fetch(`/api/movies/${idMovie}/ulasan`)
      .then(async (res) => {
        const hasil = await res.json();
        if (!res.ok) throw new Error(hasil.pesan);
        return hasil;
      })
      .then((hasil) => {
        if (dibatalkan) return;
        setData(hasil);
        setErrorMuat("");
      })
      .catch((err) => {
        if (dibatalkan) return;
        setErrorMuat(err.message || "Gagal memuat komentar.");
      });

    return () => {
      dibatalkan = true;
    };
  }, [idMovie, versi]);

  // Kalau user belum memilih bintang, pakai rating lamanya (kalau ada).
  const nilaiTampil = nilaiPilih ?? data?.nilaiSaya ?? 0;

  async function kirim(e) {
    e.preventDefault();
    setError("");

    if (!nilaiTampil) {
      setError("Pilih nilai dulu.");
      return;
    }

    setProses(true);
    try {
      const res = await fetch(`/api/movies/${idMovie}/ulasan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nilai: nilaiTampil, isi_komentar: isi }),
      });
      const hasil = await res.json();
      if (!res.ok) {
        setError(hasil.pesan || "Gagal mengirim komentar.");
        return;
      }
      setIsi("");
      setNilaiPilih(null);
      setVersi((v) => v + 1);
      router.refresh(); // supaya rata-rata rating di atas ikut berubah
    } catch {
      setError("Tidak bisa terhubung ke server.");
    } finally {
      setProses(false);
    }
  }

  async function hapus(idComment) {
    setError("");
    try {
      const res = await fetch(`/api/comments/${idComment}`, { method: "DELETE" });
      const hasil = await res.json();
      if (!res.ok) {
        setError(hasil.pesan || "Gagal menghapus komentar.");
        return;
      }
      setVersi((v) => v + 1);
    } catch {
      setError("Tidak bisa terhubung ke server.");
    }
  }

  const ulasan = data?.ulasan ?? [];

  return (
    <section className="mt-8">
      <h2 className="font-judul text-2xl leading-8 text-white">
        Komentar ({ulasan.length})
      </h2>

      <form onSubmit={kirim} className="mt-3 rounded-lg bg-[#1a1a1a] p-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-white">Nilaimu:</span>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setNilaiPilih(n)}
                aria-label={`Beri nilai ${n}`}
                className="text-2xl leading-none text-merah"
              >
                {n <= nilaiTampil ? "★" : "☆"}
              </button>
            ))}
          </div>
        </div>

        <textarea
          value={isi}
          onChange={(e) => setIsi(e.target.value)}
          maxLength={500}
          placeholder="Tulis komentarmu tentang film ini..."
          className="mt-4 h-[98px] w-full resize-none rounded-md border border-[#333333] bg-[#222222] px-[15px] py-[13px] text-base leading-6 text-white outline-none placeholder:text-white/50 focus:border-merah"
        />

        {error && <p className="mt-2 text-sm text-[#f86b70]">{error}</p>}

        <button
          type="submit"
          disabled={proses}
          className="mt-3 h-10 rounded bg-merah px-5 text-base font-bold text-white disabled:opacity-50"
        >
          Kirim komentar
        </button>
      </form>

      {errorMuat && <p className="mt-3 text-sm text-[#f86b70]">{errorMuat}</p>}
      {!data && !errorMuat && (
        <p className="mt-3 text-sm text-white/60">Memuat komentar...</p>
      )}

      {ulasan.map((u) => (
        <article key={u.id_comment} className="mt-3 rounded-lg bg-[#1a1a1a] px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-bold text-white">{u.nama}</p>
            <Bintang nilai={u.nilai} />
          </div>
          <p className="text-sm text-white/85">{u.isi_komentar}</p>
          {adalahAdmin && (
            <button
              type="button"
              onClick={() => hapus(u.id_comment)}
              className="mt-2 h-8 rounded bg-merah px-5 text-base font-bold leading-6 text-white"
            >
              Hapus Komentar
            </button>
          )}
        </article>
      ))}
    </section>
  );
}
