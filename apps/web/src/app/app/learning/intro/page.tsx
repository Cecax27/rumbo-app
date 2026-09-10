"use client";

import { useRouter } from "next/navigation";
import { useLearning } from "@/contexts/LearningContext";
import { quicksand } from "../../../ui/fonts";

export default function LearningIntroPage() {
  const router = useRouter();
  const { markIntroSeen, introSeen } = useLearning();

  const handleStart = async () => {
    await markIntroSeen();
    router.replace("/app/learning");
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <h1
        className={`${quicksand.className} text-2xl font-bold text-neutral-700 dark:text-neutral-200`}
      >
        Antes de empezar
      </h1>

      <div className="flex flex-col gap-4 text-neutral-600 dark:text-neutral-400">
        <p>
          No necesitas leer todo de una sola vez, ni entenderlo todo en un solo
          día. El objetivo es simple:
        </p>

        <ol className="list-decimal list-inside flex flex-col gap-2 pl-2">
          <li>Lee un tema.</li>
          <li>Entiéndelo.</li>
          <li>Pon en práctica su hábito.</li>
          <li>Pasa al siguiente tema solo cuando ese hábito esté establecido.</li>
        </ol>

        <p>
          Al final, unas finanzas sanas no son de quien más sabe ni de quien más
          lee, sino de quien tiene los <strong>mejores hábitos</strong>.
        </p>

        <p>
          Los hábitos se construyen con constancia y paciencia, buscando mejorar
          un 1% cada día.
        </p>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleStart}
          className="px-4 py-2 bg-navy-blue-600 text-white rounded-md hover:bg-navy-blue-700 text-sm"
        >
          {introSeen ? "Volver al camino" : "Comenzar"}
        </button>
      </div>
    </div>
  );
}
