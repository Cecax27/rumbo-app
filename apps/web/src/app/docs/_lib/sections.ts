export type DocsSection = {
  href: string;
  title: string;
  description: string;
};

export const docsSections: DocsSection[] = [
  {
    href: "/docs/que-es-rumbo",
    title: "¿Qué es Rumbo?",
    description: "Visión del proyecto, para quién está hecho y qué puedes lograr con la app.",
  },
  {
    href: "/docs/contribuir",
    title: "Contribuir",
    description: "Guía para colaborar en código, reportar bugs y proponer mejoras.",
  },
  {
    href: "/docs/donar",
    title: "Donaciones",
    description: "Formas de apoyar el proyecto para mantener desarrollo y comunidad.",
  },
  {
    href: "/docs/creador",
    title: "Sobre el creador",
    description: "Quién está detrás de Rumbo, motivación y canales de contacto.",
  },
  {
    href: "/docs/faq-roadmap",
    title: "FAQ y roadmap",
    description: "Preguntas frecuentes, próximos pasos y canal para pedir features.",
  },
  {
    href: "/docs/borrar-cuenta",
    title: "Borrar cuenta",
    description: "Instrucciones para eliminar tu cuenta y datos asociados.",
  }
];