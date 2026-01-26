export default function ContactoHome() {
  return (
    <section className="max-w-6xl mx-auto px-6 mb-20">
      <h2 className="text-3xl font-bold text-blue-600 mb-6 text-center">
        ¿Listo para trabajar juntos?
      </h2>

      <div className="flex justify-center">
        <a
          href="/contacto"
          className="px-8 py-4 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 text-lg transition"
        >
          Contáctame ahora
        </a>
      </div>
    </section>
  );
}
