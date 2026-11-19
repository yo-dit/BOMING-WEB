import Link from "next/link";

// Tujuan tombol "Lihat katalog". Ganti kalau halaman daftar film temanmu beralamat lain.
const LINK_KATALOG = "/film";

const daftarPoster = [
  { judul: "Bad Apples", dari: "#7a1d12", ke: "#1a0a08" },
  { judul: "Malam Merah", dari: "#d4141c", ke: "#150405" },
  { judul: "Kota Neon", dari: "#0d6b73", ke: "#13042b" },
  { judul: "Hujan Terakhir", dari: "#3b4a5c", ke: "#0a0d12" },
  { judul: "Lari Dari Senin", dari: "#e0a31b", ke: "#4a2208" },
  { judul: "Sang Penjaga", dari: "#555555", ke: "#0a0a0a" },
  { judul: "Rumah No. 13", dari: "#4a1c3a", ke: "#0a0509" },
  { judul: "Senja di Kota Tua", dari: "#c75c2a", ke: "#2a0f1f" },
];

const daftarKeunggulan = [
  {
    judul: "Tonton di mana saja",
    isi: "Lanjutkan film dari titik terakhir di perangkat apa pun.",
  },
  {
    judul: "Rating dari penonton",
    isi: "Beri bintang dan tulis komentar sebelum atau sesudah nonton.",
  },
  {
    judul: "Tanya si Chatbot",
    isi: "Bingung mau nonton apa? Sebutkan suasana hatimu, kami carikan.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_99%_141%_at_70%_0%,#5c1013_0%,#0c0c0c_60%)]">
      <header className="flex h-20 items-center justify-between px-12">
        <span className="font-judul text-4xl leading-10 text-merah">BOMING</span>
        <Link
          href="/login"
          className="rounded bg-merah px-4 py-2 text-sm font-bold leading-5 text-white hover:opacity-90"
        >
          Masuk
        </Link>
      </header>

      <section className="px-12 pt-28">
        <h1 className="max-w-[800px] font-judul text-[56px] uppercase leading-[0.95] text-white md:text-[96px]">
          Film bagus,
          <br />
          langsung <span className="text-merah">boming</span> di layarmu.
        </h1>
        <p className="mt-6 max-w-[576px] text-lg leading-7 text-white/75">
          Ribuan film dan serial, tanpa iklan di tengah adegan. Tonton di ponsel,
          laptop, atau TV. Batalkan kapan saja.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/register"
            className="rounded bg-merah px-7 py-3.5 text-lg font-bold leading-7 text-white hover:opacity-90"
          >
            Daftar gratis
          </Link>
          <Link
            href={LINK_KATALOG}
            className="rounded bg-white px-7 py-3.5 text-lg font-bold leading-7 text-[#0c0c0c] hover:opacity-90"
          >
            Lihat katalog
          </Link>
        </div>
      </section>

      <section className="px-12 pt-16">
        <div className="overflow-hidden">
          <div className="flex gap-3">
            {daftarPoster.map((poster) => (
              <div
                key={poster.judul}
                className="flex h-[264px] w-[176px] shrink-0 items-end rounded-md border border-white/10 p-3"
                style={{
                  background: `linear-gradient(151deg, ${poster.dari}, ${poster.ke})`,
                }}
              >
                <span className="font-judul text-xl uppercase leading-6 text-white">
                  {poster.judul}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-8 px-12 py-16 md:grid-cols-3">
        {daftarKeunggulan.map((item) => (
          <div key={item.judul}>
            <h2 className="font-judul text-2xl leading-8 text-white">
              {item.judul}
            </h2>
            <p className="mt-2 text-base leading-6 text-white/80">{item.isi}</p>
          </div>
        ))}
      </section>
    </div>
  );
}