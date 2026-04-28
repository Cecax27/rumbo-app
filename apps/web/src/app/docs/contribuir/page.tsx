import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cómo contribuir",
  description: "Guía rápida para contribuir al proyecto open source Rumbo.",
};

export default function ContribuirPage() {
  return (
    <article className="space-y-6">
      <header>
        <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Cómo contribuir</h2>
        <p className="mt-2 text-neutral-600 dark:text-neutral-300">
          Rumbo es open source. Eso quiere decir que cualquiera puede colaborar con el proyecto, ya sea con código, ideas, feedback o difusión. Si quieres aportar, esta guía rápida te muestra cómo hacerlo de forma efectiva y alineada con la visión del proyecto.
        </p>
      </header>

      <section className="space-y-3">
        <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Como programador</h3>
        <Link
          href="https://github.com/Cecax27/rumbo-app"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-900"
        >
          Ver repositorio en GitHub
        </Link>
        <ol className="list-decimal space-y-2 pl-5 text-neutral-700 dark:text-neutral-300">
          <li>Revisa issues abiertas o crea una propuesta de mejora.</li>
          <li>Haz fork del repositorio y crea una rama para tu cambio.</li>
          <li>Implementa, prueba y documenta el cambio.</li>
          <li>Abre un pull request con contexto claro y evidencia.</li>
        </ol>
      </section>

      <section className="space-y-3">
        <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Como usuario</h3>
        <p className="text-neutral-700 dark:text-neutral-300">
          Tu experiencia y feedback son fundamentales para mejorar Rumbo. Puedes contribuir reportando bugs, sugiriendo funciones o compartiendo tu experiencia con otros.
        </p>
        <Link
          href="https://github.com/Cecax27/rumbo-app/issues"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-900"
        >
          Reportar un bug o sugerir una función en Github
        </Link>
        <br />
        <Link
          href="mailto:carlos27.10.98@gmail.com?subject=Feedback%20para%20Rumbo&body=Hola%20Carlos,%0A%0AQuiero%20compartir%20el%20siguiente%20feedback%20sobre%20Rumbo:%0A%0A[Escribe%20tu%20feedback%20aquí]%0A%0AGracias!"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-900"
        >
          Envía tus comentarios por email
        </Link>

      </section>
    </article>
  );
}