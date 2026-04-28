import Link from "next/link";
import type { Metadata } from "next";
import { docsSections } from "./_lib/sections";

export const metadata: Metadata = {
  title: "Docs",
  description: "Informacion general de Rumbo: mision, contribucion, donaciones y roadmap.",
};

export default function DocsPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Bienvenido a la documentacion de Rumbo</h2>
        <p className="max-w-3xl text-neutral-600 dark:text-neutral-300">
          Este espacio explica que es Rumbo, como colaborar con el proyecto open source,
          como apoyar con donaciones y que sigue en el roadmap. La idea es que cualquier
          persona pueda entender rapido el proyecto y participar.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {docsSections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="rounded-xl border border-neutral-200 p-4 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
          >
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{section.title}</h3>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">{section.description}</p>
          </Link>
        ))}
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          Quieres proponer una nueva funcion? Revisa la seccion FAQ y roadmap para ver como enviar ideas.
        </p>
      </div>
    </div>
  );
}