"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { DataTableViewOptions } from "@/components/ui/data-table-view-options";
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter";
import {FACETED_TRANSACTION_CATEGORIES} from "../../../../../../shared/constants/appConstans"
import { AccountsContext } from "@/contexts/AccountsContext";
import { TransactionsContext } from "@/contexts/TransactionsContext";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const {accounts} = React.useContext(AccountsContext)
  const {filter, setFilter} = React.useContext(TransactionsContext)
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  // Convertir el filtro del contexto a DateRange para el componente
  const dateRange = React.useMemo<DateRange | undefined>(() => {
    return {
      from: filter.start_date,
      to: filter.end_date,
    };
  }, [filter.start_date, filter.end_date]);

  // Manejar el cambio de rango de fechas
  const handleDateRangeChange = React.useCallback((range: DateRange | undefined) => {
    if (range?.from) {
      setFilter({
        ...filter,
        start_date: range.from,
        end_date: range.to || range.from,
      });
    }
  }, [filter, setFilter]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  const tableContainerRef = React.useRef<HTMLDivElement>(null);

  const facetedAccounts = accounts.map((account) => ({
    label: account.name,
    value: account.name,
    icon: account.icon
  }));

  React.useEffect(() => {
    const updatePageSize = () => {
      if (tableContainerRef.current) {
        const containerHeight = tableContainerRef.current.offsetHeight;
        const rowHeight = 50; // Estima la altura de cada fila en píxeles
        const headerHeight = 56; // Altura del encabezado de la tabla
        const footerHeight = 56; // Altura del pie de página de la tabla
        const availableHeight = containerHeight - headerHeight - footerHeight;
        const itemsPerPage = Math.max(
          1,
          Math.floor(availableHeight / rowHeight)
        );
        table.setPageSize(itemsPerPage);
      }
    };

    const resizeObserver = new ResizeObserver(updatePageSize);
    if (tableContainerRef.current) {
      resizeObserver.observe(tableContainerRef.current);
    }

    window.addEventListener("resize", updatePageSize);
    updatePageSize();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updatePageSize);
    };
  }, [table]);

  return (
    <div className="flex-1 flex flex-col" ref={tableContainerRef}>
      <div id="table-header" className="flex items-center py-4 gap-2 flex-wrap">
        <DateRangePicker
          date={dateRange}
          onDateChange={handleDateRangeChange}
        />
        <Input
          placeholder="Buscar por descripción..."
          value={
            (table.getColumn("description")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("description")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DataTableFacetedFilter column={table.getColumn("account_name")} title="Cuenta" options={facetedAccounts} />
        <DataTableFacetedFilter column={table.getColumn("category_name")} title="Categoría" options={FACETED_TRANSACTION_CATEGORIES} />
        <DataTableViewOptions table={table} />
      </div>
      <div
        id="table-container"
        className="overflow-hidden rounded-md border flex-1"
      >
        <Table className="">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No hay resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div id="table-footer" className="select-none">
        <Pagination className="pt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => {
                  if (table.getCanPreviousPage()) table.previousPage();
                }}
                aria-disabled={!table.getCanPreviousPage()}
                className={`${
                  !table.getCanPreviousPage()
                    ? "opacity-50 pointer-events-none"
                    : undefined
                } cursor-pointer`}
              />
            </PaginationItem>

            {/* Dynamically render page numbers based on pageCount */}
            {Array.from({ length: Math.max(1, table.getPageCount()) }).map(
              (_, i) => {
                const pageIndex = i;
                const isActive =
                  table.getState().pagination.pageIndex === pageIndex;
                return (
                  <PaginationItem key={pageIndex}>
                    <PaginationLink
                      href="#"
                      isActive={isActive}
                      onClick={(e) => {
                        e.preventDefault();
                        table.setPageIndex(pageIndex);
                      }}
                    >
                      {pageIndex + 1}
                    </PaginationLink>
                  </PaginationItem>
                );
              }
            )}

            {/* Show ellipsis only if there are many pages (optional) */}
            {table.getPageCount() > 7 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            <PaginationItem>
              <PaginationNext
                onClick={() => {
                  if (table.getCanNextPage()) table.nextPage();
                }}
                aria-disabled={!table.getCanNextPage()}
                className={`${
                  !table.getCanNextPage()
                    ? "opacity-50 pointer-events-none"
                    : undefined
                } cursor-pointer`}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
