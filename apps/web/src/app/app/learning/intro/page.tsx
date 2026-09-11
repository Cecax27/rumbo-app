"use client";

import { useRouter } from "next/navigation";
import { useLearning } from "@/contexts/LearningContext";
import { ArrowRight, Leaf, Target, Repeat, TrendingUp } from "lucide-react";

export default function LearningIntroPage() {
  const router = useRouter();
  const { markIntroSeen, introSeen } = useLearning();

  const handleStart = async () => {
    await markIntroSeen();
    router.replace("/app/learning");
  };

  const steps = [
    {
      icon: BookOpenIcon,
      title: "Lee un tema",
      body: "Absorbe una idea a la vez. No hay prisa.",
    },
    {
      icon: Target,
      title: "Entiéndelo",
      body: "Conecta lo nuevo con lo que ya sabes.",
    },
    {
      icon: Repeat,
      title: "Practica el hábito",
      body: "La teoría sin acción no cambia nada.",
    },
    {
      icon: TrendingUp,
      title: "Mejora un 1%",
      body: "Avanza al siguiente tema cuando estés listo.",
    },
  ];

  return (
    <div className="flex flex-col gap-10 w-full max-w-2xl">
      {/* Hero */}
      <div className="flex flex-col gap-4">
        <div className="w-12 h-12 rounded-2xl bg-navy-blue-100 dark:bg-navy-blue-950 flex items-center justify-center">
          <Leaf className="w-6 h-6 text-navy-blue-600 dark:text-navy-blue-400" />
        </div>
        <h1
          className="text-3xl font-bold text-stone-900 dark:text-stone-100 tracking-tight"
          style={{ fontFamily: "Quicksand, sans-serif" }}
        >
          Antes de empezar
        </h1>
        <p className="text-stone-500 dark:text-stone-400 text-base leading-relaxed max-w-lg">
          No necesitas leer todo de una sola vez, ni entenderlo todo en un solo
          día. Las finanzas sanas no son de quien más sabe, sino de quien tiene
          los <strong className="text-stone-700 dark:text-stone-300">mejores hábitos</strong>.
        </p>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {steps.map((step, i) => (
          <div
            key={i}
            className="rounded-2xl p-5 bg-white dark:bg-stone-950 border border-stone-100 dark:border-stone-900 flex flex-col gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-900 flex items-center justify-center">
              <step.icon className="w-5 h-5 text-stone-600 dark:text-stone-400" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-900 dark:text-stone-100">
                {step.title}
              </h3>
              <p className="text-sm text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                {step.body}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleStart}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy-blue-600 text-white rounded-xl hover:bg-navy-blue-700 active:scale-[0.98] transition-all text-sm font-medium"
        >
          {introSeen ? "Volver al camino" : "Comenzar"}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function BookOpenIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}
