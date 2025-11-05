import React from "react";
import Link from "next/link";
import { quicksand } from "../fonts";

export default function Button({children, href, secondary = false, onClick, type, className,...params}: {children: React.ReactNode, href?: string, secondary?: boolean, onClick?: React.MouseEventHandler, type?: "button" | "submit" | "reset", className?: string} & React.HTMLAttributes<HTMLAnchorElement | HTMLButtonElement>) {
  const classNameApply = secondary
    ? `${quicksand.className} font-bold hover:opacity-80 cursor-pointer ${className}`
    : `${quicksand.className} font-bold bg-orange-400 px-6 py-1 rounded-xl hover:bg-orange-500 cursor-pointer text-white ${className}`;

  if (onClick || type) {
    return (
      <button className={classNameApply} onClick={onClick} type={type} {...params}>
        {children}
      </button>
    );
  }
  return (
    <Link href={href!} className={classNameApply} {...params}>
      {children}
    </Link>
  );
}
