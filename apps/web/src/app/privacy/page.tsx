"use client";

import { figtree, quicksand } from "../ui/fonts";

const sections = [
    {
        title: "Recopilación de datos",
        content:
            "Recopilamos los datos personales mínimos necesarios para operar esta aplicación. Esto puede incluir información que proporciones voluntariamente al usar nuestros servicios.",
    },
    {
        title: "Uso de los datos",
        content:
            "No utilizamos tus datos con fines comerciales, de marketing, análisis ni para ningún otro propósito. Tus datos no se comparten, venden ni analizan de ninguna forma.",
    },
    {
        title: "Almacenamiento de datos",
        content:
            "Cualquier dato recopilado se almacena de forma segura y solo se conserva durante el tiempo necesario para prestar el servicio. No retenemos datos por más tiempo del necesario.",
    },
    {
        title: "Compartición de datos",
        content:
            "No compartimos, vendemos ni divulgamos tus datos personales a terceros bajo ninguna circunstancia.",
    },
    {
        title: "Tus derechos",
        content:
            "Tienes derecho a solicitar acceso, corrección o eliminación de tus datos personales en cualquier momento. Contáctanos para ejercer estos derechos.",
    },
    {
        title: "Cambios en esta política",
        content:
            "Podemos actualizar esta política de privacidad ocasionalmente. Cualquier cambio se publicará en esta página con una fecha de entrada en vigor actualizada.",
    },
    {
        title: "Contacto",
        content:
            "Si tienes alguna pregunta sobre esta política de privacidad o nuestras prácticas de datos, por favor contáctanos.",
    },
];

export default function PrivacyPage() {
    return (
        <section className="h-full overflow-y-auto rounded-2xl border border-neutral-200 bg-background-light p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950 sm:p-8">
            <div className="mx-auto max-w-4xl">
                <header className="mb-8 border-b border-neutral-200 pb-6 dark:border-neutral-800">
                    <p className="mb-3 inline-flex rounded-full border border-neutral-300 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
                        Aviso legal
                    </p>
                    <h1 className={`${quicksand.className} text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-4xl`}>
                        Política de Privacidad
                    </h1>
                    <p className={`${figtree.className} mt-3 max-w-2xl text-sm text-neutral-600 dark:text-neutral-400 sm:text-base`}>
                        Priorizamos la transparencia y mantenemos el tratamiento de tus datos
                        de forma simple, explícita y limitada a lo necesario para que la app
                        funcione.
                    </p>
                </header>

                <div className="space-y-4">
                    {sections.map((section, index) => (
                        <article
                            key={section.title}
                            className="rounded-xl border border-neutral-200 bg-white/80 p-5 backdrop-blur-sm transition-colors hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900/70 dark:hover:border-neutral-700"
                        >
                            <h2
                                className={`${quicksand.className} mb-2 text-xl font-semibold text-neutral-900 dark:text-neutral-100`}
                            >
                                <span className="mr-2 text-neutral-400 dark:text-neutral-500">
                                    {String(index + 1).padStart(2, "0")}
                                </span>
                                {section.title}
                            </h2>
                            <p
                                className={`${figtree.className} leading-relaxed text-neutral-700 dark:text-neutral-300`}
                            >
                                {section.content}
                            </p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}