import KartuFilm from "./KartuFilm";

// Satu bagian di Home: judul Anton dan poster berjajar mendatar.
export default function DeretanFilm({ judul, films }) {
  return (
    <section>
      <h2 className="font-judul text-2xl leading-8 text-white">{judul}</h2>
      <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
        {films.map((film) => (
          <KartuFilm key={film.id_movie} film={film} />
        ))}
      </div>
    </section>
  );
}