import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "¿Qué es Rumbo?",
  description: "Misión, enfoque y propuesta de valor de Rumbo para finanzas personales.",
};

export default function QueEsRumboPage() {
  return (
    <article className="space-y-6">
      <header>
        <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">¿Qué es Rumbo?</h2>
        <p className="mt-2 text-neutral-600 dark:text-neutral-300">
          Rumbo es una app de código abierto de finanzas personales para registrar movimientos, entender hábitos y tomar decisiones con más claridad.
        </p>
        <p className="mt-2 text-neutral-600 dark:text-neutral-300">
          Su objetivo es convertirse en una herramienta útil para tener una situación financiera saludable. Y no sólo eso, sino también una herramienta para aprender sobre finanzas personales, entender mejor el dinero y tomar mejores decisiones. Rumbo es para cualquier persona que quiera mejorar su relación con el dinero, sin importar su nivel de conocimiento o experiencia.
        </p>
      </header>

      <section className="space-y-3">
        <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Propósito</h3>
        <p className="text-neutral-700 dark:text-neutral-300">
          El proyecto busca hacer más simple el control financiero diario y convertir datos en acciones concretas.
        </p>
        <p className="text-neutral-700 dark:text-neutral-300">
          A futuro, la idea es incorporar funciones de planificación, análisis y educación financiera para acompañar a las personas en su camino hacia una mejor salud financiera. Rumbo no es sólo una app para registrar gastos, sino una herramienta para entender el dinero y tomar mejores decisiones.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">¿Qué puedes hacer en Rumbo?</h3>
        <ul className="list-disc space-y-2 pl-5 text-neutral-700 dark:text-neutral-300">
          <li>Registrar ingresos, gastos y transferencias.</li>
          <li>Organizar transacciones por cuentas y categorías.</li>
          <li>Crear planes de ahorro y presupuestos para cumplir objetivos financieros.</li>
          <li>Visualizar estado general para decidir mejor.</li>
        </ul>
      </section>
    </article>
  );
}