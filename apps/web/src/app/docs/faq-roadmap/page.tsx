import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ y roadmap",
  description: "Respuestas frecuentes, direccion del producto y solicitud de features.",
};

export default function FaqRoadmapPage() {
  return (
    <article className="space-y-8">
      <header>
        <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">FAQ y roadmap</h2>
        <p className="mt-2 text-neutral-600 dark:text-neutral-300">
          Preguntas frecuentes y prioridades actuales para seguir mejorando Rumbo.
        </p>
      </header>

      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Preguntas frecuentes</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">¿Rumbo es gratis?</h4>
            <p className="text-neutral-700 dark:text-neutral-300">Sí, la aplicación es gratis y sin límites, y siempre lo será.</p>
          </div>
          <div>
            <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">¿Mis datos peligran?</h4>
            <p className="text-neutral-700 dark:text-neutral-300">No, tus datos están seguros. Rumbo utiliza prácticas de seguridad estándar para proteger tu información. Nunca compartimos tus datos con terceros sin tu consentimiento. Si quieres saber más, puedes revisar nuestra <a href="/privacy" className="underline">política de privacidad</a>.</p>
            <p className="text-neutral-700 dark:text-neutral-300">Además, nosotros nunca vemos tus datos, ni los utilizamos para ningún propósito.</p>
          </div>
          <div>
            <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">¿Rumbo está en desarrollo?</h4>
            <p className="text-neutral-700 dark:text-neutral-300">Sí, Rumbo está en constante desarrollo. Estamos trabajando continuamente para mejorar la experiencia del usuario, agregar nuevas funcionalidades y mantener la seguridad y privacidad de tus datos. Aunque eso no significa que la aplicación no sea funcional, siempre estamos buscando formas de mejorar y evolucionar.</p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Roadmap a corto plazo</h3>
        <p className="text-neutral-700 dark:text-neutral-300">Actualmente, no hemos llegado a la versión 1.0, que representa una versión estable y con todas las características planeadas de Rumbo en la visión inicial. Los siguientes pasos son estos:</p>
        <ul className="list-disc space-y-2 pl-5 text-neutral-700 dark:text-neutral-300">
          <li>Agregar herramientas básicas de análisis: metas de ahorro, presupuestos y plan de retiro.</li>
          <li>Agregar herramientas de importación de datos desde bancos y otras fuentes.</li>
          <li>Crear la escuela de Rumbo: ofrecer recursos educativos sobre finanzas personales y uso de la aplicación.</li>
          <li>Tener las mismas funciones en la app móvil que en la web.</li>
        </ul>
      </section>

      <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
        <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">Pide una feature</h3>
        <p className="mt-2 text-sm text-emerald-800 dark:text-emerald-200">
          Queremos priorizar funciones útiles para los usuarios. Si tienes una idea o sugerencia, no dudes en compartirla. Estamos abiertos a escuchar y considerar todas las propuestas para hacer de Rumbo una herramienta cada vez mejor.
        </p>
        <Link
          href="https://github.com/Cecax27/rumbo-app/issues/new/choose"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex rounded-md border border-emerald-400 px-3 py-2 text-sm font-medium text-emerald-900 transition-colors hover:bg-emerald-100 dark:border-emerald-700 dark:text-emerald-100 dark:hover:bg-emerald-900/40"
        >
          Crear feature request en GitHub
        </Link>
      </section>
    </article>
  );
}