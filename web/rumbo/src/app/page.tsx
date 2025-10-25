import Image from "next/image";
import { quicksand, figtree } from "./ui/fonts";
import Button from "./ui/components/button";

export default function Home() {
  return (
    <div className="fixed inset-0 w-full h-full bg-[url('/images/background.png')] bg-cover bg-center bg-no-repeat p-10">
      <div className="h-full flex flex-col  text-white border-2 border-white/50 rounded-3xl">
        <header className="flex items-center justify-between p-6">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="logo" width={50} height={50} />
            <h1 className={`${quicksand.className} font-bold text-4xl`}>
              Rumbo
            </h1>
          </div>
          <nav className="flex items-center gap-6">
            <Button href="/login?mode=login" secondary>Iniciar sesión</Button>
            <Button href="/login?mode=register">Regístrate </Button>
          </nav>
        </header>
        <main className="flex flex-1 items-center justify-center">
          <div className="max-w-xl text-center space-y-6 bg-black/20 p-5 rounded-4xl backdrop-blur-lg">
            <h2 className={`${quicksand.className} font-bold text-3xl`}>
              Tu camino hacia la libertad financiera
            </h2>
            <p
              className={`${figtree.className} text-sm leading-4 text-balance`}
            >
              Rumbo te ayuda a reconectar con tus finanzas personales. No se
              trata solo de registrar gastos, sino de entender hacia dónde va tu
              dinero y decidir con claridad hacia dónde quieres ir tú. Con Rumbo
              puedes planear, analizar y construir una relación más consciente
              con tu economía, paso a paso, hasta alcanzar estabilidad y
              libertad financiera.
            </p>
            <Button href="/login?mode=register">Comienza ahora</Button>
          </div>
        </main>
        <footer className="p-6 text-right text-sm">
          <p className="text-shadow-black/10 text-shadow-lg">
            Este es un proyecto de código abierto.{" "}
            <a
              href="https://github.com/Cecax27/rumbo-app"
              className="underline hover:text-neutral-200"
            >
              ¿Te gustaría contribuir?
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
