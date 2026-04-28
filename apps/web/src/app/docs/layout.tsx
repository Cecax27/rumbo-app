import Link from "next/link";
import type { Metadata } from "next";
import { docsSections } from "./_lib/sections";

export const metadata: Metadata = {
  title: {
    default: "Documentacion",
    template: "%s | Documentacion | Rumbo",
  },
  description: "Centro de documentacion de Rumbo para entender el proyecto y colaborar.",
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-neutral-200 bg-white/90 px-6 py-4 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <img src="/logo.png" alt="Rumbo Logo" className="h-10 w-10" />
          <div>
            <p className="text-sm font-semibold tracking-wide text-neutral-500 dark:text-neutral-400">
              Rumbo Open Source
            </p>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Documentación</h1>
          </div>
          <Link
            href="/"
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-900"
          >
            Volver al inicio
          </Link>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-8 lg:grid-cols-[280px,1fr]">
        <aside className="h-fit rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Secciones
          </h2>
          <nav>
            <ul className="space-y-2 text-sm flex flex-row flex-wrap gap-2">
              <li>
                <Link
                  href="/docs"
                  className="block rounded-md px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-900"
                >
                  Inicio
                </Link>
              </li>
              {docsSections.map((section) => (
                <li key={section.href}>
                  <Link
                    href={section.href}
                    className="block rounded-md px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-900"
                  >
                    {section.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <section className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950">
          {children}
        </section>
      </main>
    </div>
  );
}