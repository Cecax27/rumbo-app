import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sobre el creador",
  description: "Conoce a la persona detras de Rumbo y su motivacion.",
};

export default function CreadorPage() {
  return (
    <article className="space-y-6">
      <header>
        <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Sobre el creador</h2>
        <p className="mt-2 text-neutral-600 dark:text-neutral-300">
          Soy Carlos Cervantes. Apasionado por la tecnologia, el open source y las finanzas personales. La idea de Rumbo surgió de mi propia necesidad de entender mejor mis finanzas y encontrar una herramienta que se adaptara a mi estilo de vida. Queria algo simple, flexible y transparente, sin las complicaciones técnicas de las opciones existentes. Por eso decidí crear Rumbo: para tener una app que realmente me ayudara a mejorar mi relacion con el dinero, y compartirla con otras personas que buscan lo mismo.
        </p>
        <p className="mt-2 text-neutral-600 dark:text-neutral-300">
            Soy desarrollador independiente, y este proyecto nació como un pequeño hobbie. Mi motivación es que Rumbo sea una herramienta útil para cualquier persona que quiera mejorar su salud financiera, sin importar su nivel de conocimiento o experiencia. Además, me encanta la idea de crear algo open source que pueda crecer con la comunidad y convertirse en un recurso valioso para aprender sobre finanzas personales y tomar mejores decisiones con el dinero.
        </p>
      </header>

         <section className="space-y-3">
        <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Canal de YouTube</h3>
        <p className="text-neutral-700 dark:text-neutral-300">
            Además de desarrollar Rumbo, también comparto contenido sobre ingeniería utilizando software de código libre. Si te interesa el mundo del desarrollo de software, la tecnología open source o simplemente quieres aprender algo nuevo, te invito a visitar mi canal de YouTube donde comparto tutoriales, charlas y proyectos relacionados con el software libre.
        </p>
        <Link
          href="https://www.youtube.com/@IngenioLibre"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-900"
        >
          Ingenio Libre en YouTube
        </Link> 
      </section>

      <section className="space-y-3">
        <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Contacto y comunidad</h3>
        <p className="text-neutral-700 dark:text-neutral-300">
            Me encantaría escuchar tus ideas, sugerencias o simplemente saber cómo Rumbo te ha ayudado. Puedes contactarme a través de GitHub, email o redes sociales.
        </p>
        <Link
          href="https://github.com/Cecax27"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-900"
        >
          Github
        </Link>
        <Link
          href="mailto:carlos27.10.98@gmail.com?subject=Contacto%20desde%20Rumbo&body=Hola%20Carlos,%0A%0AQuiero%20compartir%20lo%20siguiente%20sobre%20Rumbo:%0A%0A[Escribe%20tu%20mensaje%20aquí]%0A%0AGracias!"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-900"
        >
          Email
        </Link>
        <Link
          href="https://twitter.com/Cecax27"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-900"
        >
          Twitter
        </Link>
      </section>
    </article>
  );
}