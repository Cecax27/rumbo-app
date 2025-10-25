import React from "react";
import Image from "next/image";
import Navigation from "../ui/components/navigation";
import { quicksand, figtree } from "../ui/fonts";
import { ToolsProvider } from "@/contexts/ToolsContext";
import { TransactionsProvider } from "@/contexts/TransactionsContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ToolsProvider>
      <TransactionsProvider>
        <div className="flex h-full fixed inset-0">
          <aside className="inset-0 flex-1 h-full p-10 bg-background-light border-r-2 border-r-neutral-100 dark:border-r-neutral-900 dark:bg-neutral-950">
            <div id="logo" className="flex items-center gap-3">
              <Image src="/logo.png" alt="logo" width={30} height={30} />
              <h1 className={`${quicksand.className} font-bold text-2xl`}>
                Rumbo
              </h1>
            </div>
            <Navigation />
            <footer
              className={`absolute bottom-5 text-center font-semibold ${figtree.className} text-sm text-neutral-400`}
            >
              Rumbo - Open Source
            </footer>
          </aside>
          <main className="flex-4 flex flex-col items-left p-10 gap-6 max-h-screen overflow-hidden">
            {children}
          </main>
        </div>
      </TransactionsProvider>
    </ToolsProvider>
  );
}
