"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { useAccount } from "@/hooks/useAccount";
import { Spinner } from "@/components/ui/spinner";
import Icon from "@mui/material/Icon";
import { formatIcon, formatMoney } from "@repo/formatters";
import { Button } from "@/components/ui/button";
import { MoreVert } from "@mui/icons-material";
import { ChartBarMixed } from "./chart-bar";

export default function DetailsAccount() {
  const searchParams = useSearchParams();
  const accountId = searchParams.get("id");

  const {
    account,
    balance,
    spendingsByCategories,
    loading,
    error,
    setDataRangeForSpendings,
    dataRangeForSpendings,
  } = useAccount(accountId ? parseInt(accountId) : null);

  console.log(spendingsByCategories);

  if (loading) {
    return (
      <div className="flex items-center justify-center flex-1">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!account) {
    return <div>No se encontró la cuenta.</div>;
  }

  return (
    <article className="p-4 flex gap-4">
      <section className="flex-1 p-2 flex flex-col items-center">
        <div
          id="card"
          className="flex flex-col h-50 w-full rounded-xl p-4"
          style={{
            background: `linear-gradient(to bottom right, ${
              account.color ?? "#dfa131"
            }, ${account.color ?? "#dfa131"}90)`,
          }}
        >
          <div className="flex items-center gap-2 justify-between">
            <span className="text-white text-lg font-bold mb-10">
              {account.name}
            </span>
            <Button variant="ghost" className="text-white">
              <MoreVert />
            </Button>
          </div>
          <span className="text-white text-2xl font-semibold mb-10">
            {formatMoney(balance ?? 0)}
          </span>
          <div className="flex items-center gap-2 justify-between">
            <span className="text-white text-2xl font-bold">
              {account.bank_name}
            </span>
            <Icon className="text-white">{formatIcon(account.icon)}</Icon>
          </div>
        </div>
        <div className="w-full">
          {account.credit_limit && (
            <p className="flex justify-between">
              <span>Límite de crédito</span>
              <span>{formatMoney(account.credit_limit)}</span>
            </p>
          )}
          <p className="flex justify-between">
            <span>Color</span>
            <span>{account.color}</span>
          </p>
        </div>
      </section>
      <section className="flex-2 p-2">
        <ChartBarMixed
          chartData={spendingsByCategories}
          dateRange={dataRangeForSpendings}
          onChangeDateRange={setDataRangeForSpendings}
        />
      </section>
    </article>
  );
}
