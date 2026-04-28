"use client";

import { ColumnDef } from "@tanstack/react-table";
import { TransactionType, TransactionWithDetails } from "@repo/supabase/transactions";
import Icon from "@mui/material/Icon";
import { formatMoney, formatIcon } from "@repo/formatters";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";

interface TransactionsTableMeta {
  onDeleteTransaction?: (transactionId: string, type: TransactionType) => Promise<void>;
  onEditTransaction?: (transactionId: string, type: TransactionType) => Promise<void>;
}

export const columns: ColumnDef<TransactionWithDetails>[] = [
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <DataTableColumnHeader column={column} title="Fecha"/>
      )
    },
    cell: ({ row }) => {
      const formattedDate = format(new Date(row.original.date), "dd MMM yyyy");
      return <span>{formattedDate}</span>;
    },
  },
  {
    accessorKey: "description",
    header: "Descripción",
    cell: ({ row }) => {
      const description = row.original.description;
      return (
        <span className="block max-w-[260px] overflow-hidden text-ellipsis whitespace-nowrap">
          {description.split(/(\d+\/\d+)/).map((part, index) =>
            /\d+\/\d+/.test(part) ? (
              <span key={index} className="text-gray-500 text-sm">
                {part}
              </span>
            ) : (
              part
            )
          )}
        </span>
      );
    },
  },
  {
    accessorKey: "account_name",
    header: ({ column }) => {
      return (
        <DataTableColumnHeader column={column} title="Cuenta"/>
      );
    },
    cell: ({ row }) => {
      const accountName = row.original.account_name || "Sin cuenta";
      return (
        <Badge style={{ backgroundColor: row.original.account_color }}>
          {accountName}
        </Badge>
      );
    },
  },
  {
    accessorKey: "category_name",
    header: ({ column }) => {
      return (
        <DataTableColumnHeader column={column} title="Categoría"/>
      );
    },
    cell: ({ row }) => {
      const category = row.original.category_name;
      const iconName = row.original.category_icon || "category";
      return (
        <Badge
        variant="secondary"
          className="gap-2 "
        >
          <Icon>{formatIcon(iconName)}</Icon>
          {category}
        </Badge>
      );
    },
  },
  {
    accessorKey: "budget_group",
    header: ({ column }) => {
      return (
        <DataTableColumnHeader column={column} title="Grupo"/>
      );
    },
    cell: ({ row }) => {
      const group = row.original.budget_group;
      return (
        <Badge variant="secondary" >
          {group}
        </Badge>
      );
    },
  },
  {
    accessorKey: "amount",
    header: ({ column }) => {
      return (
        <DataTableColumnHeader column={column} title="Cantidad"/>
      );
    },
    cell: ({ row }) => {
      const amount = row.original.amount;
      const category = row.original.transaction_type || "spending";
      const amountColor =
        category === "income"
          ? "text-green-500"
          : category === "transfer"
          ? "text-blue-500"
          : "text-red-500";
      return (
        <p className={`${amountColor} font-semibold text-right font`}>{formatMoney(amount)}</p>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row, table }) => {
      const meta = table.options.meta as TransactionsTableMeta | undefined;

      const handleDelete = async () => {
        const transaction = row.original;
        const confirmed = window.confirm("¿Seguro que quieres eliminar esta transacción?");

        if (!confirmed || !meta?.onDeleteTransaction) {
          return;
        }

        await meta.onDeleteTransaction(
          transaction.id.toString(),
          transaction.transaction_type as TransactionType
        );
      };

      const handleEdit = async () => {
        const transaction = row.original;

        if (!meta?.onEditTransaction) {
          return;
        }

        await meta.onEditTransaction(
          transaction.id.toString(),
          transaction.transaction_type as TransactionType
        );
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {/* TODO Add ignore */}
            <DropdownMenuCheckboxItem>Ignorar en resúmen</DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            {/* TODO Add link to details */}
            <DropdownMenuItem>Detalles</DropdownMenuItem>
            {/* TODO Add link to edit */}
            <DropdownMenuItem onClick={handleEdit}>Editar</DropdownMenuItem>
            <DropdownMenuItem className="text-punch-500" onClick={handleDelete}>
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
];
