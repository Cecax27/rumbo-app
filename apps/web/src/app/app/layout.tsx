import React from "react";
import Image from "next/image";
import Navigation from "../ui/components/navigation";
import { quicksand, figtree } from "../ui/fonts";
import { ToolsProvider } from "@/contexts/ToolsContext";
import { TransactionsProvider } from "@/contexts/TransactionsContext";
import { AccountsProvider } from "@/contexts/AccountsContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { RequireAuth } from "@/components/require-auth";
import { LearningProvider } from "@/contexts/LearningContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <RequireAuth>
        <ToolsProvider>
          <TransactionsProvider>
            <AccountsProvider>
              <LearningProvider>
              <div className="flex h-full fixed inset-0">
                <aside className="flex-1 h-full p-10 bg-background-light border-r-2 border-r-neutral-100 dark:border-r-neutral-900 dark:bg-neutral-950 overflow-y-auto">
                  <div id="logo" className="flex items-center gap-3">
                    <Image src="/logo.png" alt="logo" width={30} height={30} />
                    <h1 className={`${quicksand.className} font-bold text-2xl`}>
                      Rumbo
                    </h1>
                  </div>
                  <Navigation />
                  <footer
                    className={`mt-auto pt-10 text-center font-semibold ${figtree.className} text-sm text-neutral-400`}
                  >
                    Rumbo - Open Source
                  </footer>
                </aside>
                <main className="flex-[4] flex flex-col items-start p-10 gap-6 h-screen overflow-y-auto">
                  {children}
                </main>
              </div>
            </LearningProvider>
            </AccountsProvider>
          </TransactionsProvider>
        </ToolsProvider>
      </RequireAuth>
    </AuthProvider>
  );
}
