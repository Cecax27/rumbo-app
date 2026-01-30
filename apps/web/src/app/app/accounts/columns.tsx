"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Account } from "@repo/supabase/accounts";
import Icon from "@mui/material/Icon";
import { formatMoney, formatIcon } from "@repo/formatters";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import Link from "next/link";

const accountTypeLabels: { [key: number]: string } = {
  1: "Débito",
  2: "Crédito",
  3: "Efectivo",
  4: "Inversión",
  5: "Préstamo",
};

export const columns: ColumnDef<Account>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Nombre" />;
    },
    cell: ({ row }) => {
      const name = row.original.name;
      const icon = row.original.icon || "account-balance-wallet";
      const color = row.original.color;
      return (
        <Link href={`/app/accounts/details?id=${row.original.id}`}>
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: color }}
          >
            <Icon className="text-white text-sm">{formatIcon(icon)}</Icon>
          </div>
          <span className="font-medium">{name}</span>
        </div>
        </Link>
      );
    },
  },
  {
    accessorKey: "account_type",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Tipo" />;
    },
    cell: ({ row }) => {
      const accountType = row.original.account_type;
      const label = accountTypeLabels[accountType] || "Desconocido";
      return <Badge variant="secondary">{label}</Badge>;
    },
  },
  {
    accessorKey: "bank_name",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Banco" />;
    },
    cell: ({ row }) => {
      const bankName = row.original.bank_name || "N/A";
      return <span>{bankName}</span>;
    },
  },
  {
    accessorKey: "balance",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Saldo" />;
    },
    cell: ({ row }) => {
      const balance = row.original.balance || 0;
      return (
        <span className={balance >= 0 ? "text-green-600" : "text-red-600"}>
          {formatMoney(balance)}
        </span>
      );
    },
  },
  {
    accessorKey: "credit_limit",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Límite de crédito" />;
    },
    cell: ({ row }) => {
      const creditLimit = row.original.credit_limit;
      if (creditLimit === null || creditLimit === undefined) {
        return <span className="text-gray-400">N/A</span>;
      }
      return <span>{formatMoney(creditLimit)}</span>;
    },
  },
  {
    accessorKey: "is_primary_account",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Principal" />;
    },
    cell: ({ row }) => {
      const isPrimary = row.original.is_primary_account;
      return isPrimary ? (
        <Badge className="bg-blue-500">Principal</Badge>
      ) : (
        <span className="text-gray-400">-</span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const account = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(account.id.toString())}
            >
              Copiar ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => console.log("Editar", account)}>
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => console.log("Eliminar", account)}
            >
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
