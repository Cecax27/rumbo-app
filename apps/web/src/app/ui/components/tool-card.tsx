import React from "react";
import { Badge, MoreVert, Savings } from "@mui/icons-material";
import { formatMoney } from "@repo/formatters";
import clsx from "clsx";
import Link from "next/link";

type ToolType = "budgetPlan" | "retirementPlan";

export default function ToolCard({
  name,
  date,
  amount,
  max,
  type = "budgetPlan",
  hasContributed = false,
  id = "",
}: {
  name: string;
  date: string;
  amount: number;
  max: number;
  type?: ToolType;
  hasContributed?: boolean;
  id?: string;
}) {

    const percentage = Math.floor(Math.min((amount / max) * 100, 100));

  return (
    <Link href={`tools/${type}?id=${id}`}>
    <div
      key={name}
      className={clsx(
        "bg-gradient-to-br p-4 rounded-lg text-white mb-4 w-70",
        {
          "from-shamrock-400 to-shamrock-600": type === "budgetPlan",
          "from-punch-400 to-punch-600": type === "retirementPlan",
        }
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-white/30 rounded-lg w-fit">
          {type === "budgetPlan" ? <Badge className="" /> : <Savings className="" />}
        </div>
        <MoreVert />
      </div>
      <h3 className="font-bold text-xl">{name}</h3>
      <p className="text-sm text-white/80 mb-6">
      {type === "budgetPlan" && date}
      </p>
      <div className="bg-white/20 h-2 rounded-xl mb-2 flex">
        <div className={`bg-white flex-[${percentage}] rounded-xl`}></div>
        <div className={`flex-[${100-percentage}]`}></div>
      </div>
      <p className="text-right text-sm">
        {type === "budgetPlan" 
          ? `${formatMoney(amount)} / ${formatMoney(max)}`
          : hasContributed 
            ? "✓ Aporte realizado este mes" 
            : "⚠ Pendiente aporte este mes"
        }
      </p>
    </div>
    </Link>
  );
}
