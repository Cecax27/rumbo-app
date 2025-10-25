import React from "react";
import { Badge, MoreVert } from "@mui/icons-material";
import { formatMoney } from "@shared/utils/formatters";

export default function ToolCard({
  name,
  date,
  amount,
  max,
}: {
  name: string;
  date: string;
  amount: number;
  max: number;
}) {

    const percentage = Math.floor(Math.min((amount / max) * 100, 100));

  return (
    <div
      key={name}
      className="bg-gradient-to-br from-shamrock-400 to-shamrock-600 p-4 rounded-lg text-white mb-4 w-70"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-white/30 rounded-lg w-fit">
          <Badge className="" />
        </div>
        <MoreVert />
      </div>
      <h3 className="font-bold text-xl">{name}</h3>
      <p className="text-sm text-white/80 mb-6">{date}</p>
      <div className="bg-white/20 h-2 rounded-xl mb-2 flex">
        <div className={`bg-white flex-[${percentage}] rounded-xl`}></div>
        <div className={`flex-[${100-percentage}]`}></div>
      </div>
      <p className="text-right text-sm">
        {formatMoney(amount)} / {formatMoney(max)}
      </p>
    </div>
  );
}
