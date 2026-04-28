import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "¿Cómo donar?",
  description: "Opciones para apoyar economicamente el desarrollo de Rumbo.",
};

export default function DonarPage() {
  return (
    <article className="space-y-6">
      <header>
        <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">¿Por qué donar?</h2>
        <p className="mt-2 text-neutral-600 dark:text-neutral-300">
          Rumbo es y siempre será gratis. Pero tu apoyo ayuda a mantener infraestructura, mejorar experiencia y dedicar más tiempo al producto.
        </p>
      </header>

      <section className="space-y-3">
        <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Formas de apoyo</h3>
        <p className="text-neutral-700 dark:text-neutral-300">Donar no es la única forma de apoyar el proyecto. También puedes contribuir con tu tiempo, conocimientos o difusión.</p>
        <ul className="list-disc space-y-2 pl-5 text-neutral-700 dark:text-neutral-300">
          <li>Donacion directa para mantenimiento y mejoras.</li>
          <li>Contribuye con código, ideas o feedback.</li>
          <li>Difusion del proyecto con tus amigos y familiares.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Canal sugerido</h3>
        <iframe src="https://github.com/sponsors/Cecax27/button" title="Sponsor Cecax27" height="32" width="114" style={{ border: 0, borderRadius: 6 }}></iframe>
      </section>
    </article>
  );
}