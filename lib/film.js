const TAHUN_MAKS = new Date().getFullYear() + 5;

function adalahUrl(teks) {
  try {
    const url = new URL(teks);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

// Memeriksa data film dari form. Hasilnya:
// { ok: true, data } kalau benar, atau { ok: false, pesan } kalau ada yang salah.
export function validasiFilm(body) {
  const judul = String(body.judul ?? "").trim();
  const sinopsis = String(body.sinopsis ?? "").trim();
  const genre = String(body.genre ?? "").trim();
  const poster = String(body.poster ?? "").trim();
  const videoMentah = String(body.video_url ?? "").trim();
  const tahun = Number(body.tahun);
  const durasi = Number(body.durasi);

  if (!judul || !sinopsis || !genre || !poster) {
    return {
      ok: false,
      pesan: "Judul, sinopsis, genre, dan link poster wajib diisi.",
    };
  }

  if (!Number.isInteger(tahun) || tahun < 1888 || tahun > TAHUN_MAKS) {
    return { ok: false, pesan: "Tahun tidak valid." };
  }

  if (!Number.isInteger(durasi) || durasi < 1 || durasi > 1000) {
    return { ok: false, pesan: "Durasi harus berupa angka menit (1-1000)." };
  }

  if (!adalahUrl(poster)) {
    return { ok: false, pesan: "Link poster harus diawali http:// atau https://." };
  }

  if (videoMentah && !adalahUrl(videoMentah)) {
    return { ok: false, pesan: "Link video harus diawali http:// atau https://." };
  }

  return {
    ok: true,
    data: {
      judul,
      sinopsis,
      genre,
      tahun,
      durasi,
      poster,
      // Link video boleh kosong, sesuai kolom opsional di database.
      video_url: videoMentah || null,
    },
  };
}