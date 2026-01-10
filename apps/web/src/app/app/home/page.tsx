"use client";

import React, { useContext, useState } from "react";
import { quicksand } from "../../ui/fonts";
import Button from "../../ui/components/button";
import NotificationIcon from "@mui/icons-material/Notifications";
import { useTools } from "@/contexts/ToolsContext";
import ToolCard from "@/app/ui/components/tool-card";
import { TransactionsContext } from "@/contexts/TransactionsContext";
import { AccountsContext } from "@/contexts/AccountsContext";
import { TransactionType } from "@repo/supabase/transactions";
import { formatIcon, formatMoney } from "@repo/formatters";
import Icon from "@mui/material/Icon";
import clsx from "clsx";
import { BudgetPlanWithDetails, BudgetPlanGroupDetails } from "@repo/supabase/tools";
import { RetirementPlanWithDetails } from "@repo/supabase/retirementPlans";
import AddToolModal from "@/app/ui/components/add-tool-modal";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { budgetPlans, loading, retirementPlans } = useTools();
  const { data: transactions } = useContext(TransactionsContext);
  const { accounts } = useContext(AccountsContext);

  console.log(transactions);

  return (
    <>
      <div id="header" className="flex justify-between items-center">
        <div className="leading-loose">
          <h1
            className={`${quicksand.className} text-3xl font-bold text-neutral-700 dark:text-neutral-200`}
          >
            Hola
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Bienvenido a tu dashboard financiero
          </p>
        </div>
        <div className="flex items-center gap-5">
          <NotificationIcon className="text-neutral-600 dark:text-neutral-200" />
          <div className="rounded-full bg-amber-100 w-10 h-10"></div>
        </div>
      </div>
      <div id="main" className="flex flex-col gap-6 flex-1 overflow-hidden">
        <div id="tools">
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-semibold text-2xl text-neutral-800 dark:text-neutral-200">
              Herramientas
            </h2>
            <Button onClick={() => setIsModalOpen(true)} type="button">+ Agregar</Button>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-4">
            {loading ? (
              <p>Loading tools...</p>
            ) : budgetPlans && budgetPlans.length > 0 ? (
              budgetPlans.map((budgetPlan) => (
                <ToolCard
                  key={budgetPlan.name}
                  name={budgetPlan.name}
                  type="budgetPlan"
                  date={(budgetPlan as BudgetPlanWithDetails).start_date}
                  amount={parseFloat(((budgetPlan as BudgetPlanWithDetails).groups as BudgetPlanGroupDetails[])
                    .reduce((sum, group) => sum + group.real_amount, 0)
                    .toFixed(2))}
                  max={parseFloat((budgetPlan as BudgetPlanWithDetails).total_incomes.toFixed(2))}
                />
              ))
            ) : (
              <p>No hay planes de presupuesto disponibles</p>
            )}
            {retirementPlans && retirementPlans.length > 0 ? (
              retirementPlans.map((retirementPlan) => (
                <ToolCard
                  key={retirementPlan.id}
                  name={retirementPlan.name}
                  type="retirementPlan"
                  date={(retirementPlan as RetirementPlanWithDetails).created_at}
                  amount={(retirementPlan as RetirementPlanWithDetails).total_accumulated || 0}
                  max={(retirementPlan as RetirementPlanWithDetails).monthly_contribution || 0}
                />
              ))
            ) : (
              <></>)}
          </div>
        </div>
        <div id="row" className="flex gap-10 overflow-hidden flex-1">
          <div
            id="transactions"
            className="flex-2 overflow-hidden flex flex-col"
          >
            <div
              id="transactions-header"
              className="flex justify-between items-center mb-8"
            >
              <h2 className="font-semibold text-2xl text-neutral-800 dark:text-neutral-200">
                Transacciones recientes
              </h2>
              <Button href="/app/transactions" secondary>
                Ver más
              </Button>
            </div>
            <div
              id="transactions-list"
              className="flex flex-col overflow-y-auto flex-1 pr-4 gap-4"
            >
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex justify-between items-center"
                >
                  <div className="flex gap-4">
                    <div className={clsx("p-2 rounded-xl text-xs ",{
                      "bg-shamrock-800/50 text-shamrock-300": transaction.transaction_type === TransactionType.INCOME,
                      "bg-punch-800/50 text-punch-300": transaction.transaction_type === TransactionType.SPENDING,
                      "bg-navy-blue-800/50 text-navy-blue-300": transaction.transaction_type === TransactionType.TRANSFER
                    })}>
                      <Icon>{formatIcon(transaction.category_icon)} </Icon>
                    </div>
                    <div>
                      <h3 className="font-medium text-neutral-800 dark:text-neutral-200">
                        { /* TODO Translate category names */ }

                        {transaction.category_name}
                      </h3>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {transaction.description}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`font-semibold ${
                      transaction.transaction_type === TransactionType.INCOME
                        ? "text-shamrock-600"
                        : "text-punch-600"
                    }`}
                  >
                    {formatMoney(transaction.amount)}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div id="accounts" className="flex-1">
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-semibold text-2xl text-neutral-800 dark:text-neutral-200">
                Cuentas
              </h2>
              <Button href="/app/accounts" secondary>
                Ver más
              </Button>
            </div>
            <div className="flex flex-col gap-4">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex justify-between items-center"
                >
                  <div className="flex gap-4 items-center">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: account.color }}
                    ></div>
                    <h3 className="font-medium text-neutral-800 dark:text-neutral-200">
                      {account.name}
                    </h3>
                  </div>
                  <div className="font-semibold text-neutral-800 dark:text-neutral-200">
                    {account.balance !== undefined
                      ? formatMoney(account.balance)
                      : "Cargando..."}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <AddToolModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
