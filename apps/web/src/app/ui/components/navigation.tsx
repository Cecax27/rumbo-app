'use client'

import React from "react";
import Link from "next/link";
import { figtree } from "../fonts";
import {
  Dashboard,
  SwapHoriz,
  AccountBalanceWallet,
  Settings,
  MenuBook,
  OpenInNew,
} from "@mui/icons-material";
import { usePathname } from "next/navigation";
import clsx from "clsx";

export default function Navigation() {
  return (
    <nav className="mt-10 mb-10">
      <ul className="flex flex-col gap-5">
        <Item href="/app/home">
          <Dashboard /> Dashboard
        </Item>
        <Item href="/app/transactions">
          <SwapHoriz /> Transacciones
        </Item>
        <Item href="/app/accounts">
          <AccountBalanceWallet /> Cuentas
        </Item>
        <Item href="/app/settings">
          <Settings /> Ajustes
        </Item>
        <li className="rounded-lg hover:bg-navy-blue-200 transition-colors dark:hover:bg-navy-blue-950/20 text-neutral-600 dark:text-neutral-300">
          <Link
            href="/docs"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Documentacion (abre en nueva pestana)"
            className={`flex gap-4 p-3 ${figtree.className} font-semibold`}
          >
            <MenuBook /> Documentacion <OpenInNew fontSize="small" />
          </Link>
        </li>
      </ul>
    </nav>
  );
}

function Item({ children, href }: { children: React.ReactNode; href: string }) {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <li
      className={clsx("rounded-lg hover:bg-navy-blue-200 transition-colors dark:hover:bg-navy-blue-950/20", {
        "text-blue-700 bg-blue-200 dark:bg-navy-blue-950/50 dark:text-navy-blue-300": isActive,
        "text-neutral-600 dark:text-neutral-300": !isActive,
      })}
    >
      <Link
        href={href}
        className={`flex gap-4 p-3 ${figtree.className} font-semibold`}
      >
        {children}
      </Link>
    </li>
  );
}
