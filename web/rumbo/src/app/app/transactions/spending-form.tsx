"use client";

import React, { useContext } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { AccountsContext } from "@/contexts/AccountsContext";
import { TRANSACTION_CATEGORIES } from "../../../../../../shared/constants/appConstans";

// Schema de validación
const spendingFormSchema = z.object({
  amount: z.string().min(1, "El monto es requerido"),
  category_id: z.string().min(1, "La categoría es requerida"),
  date: z.date(),
  description: z.string().optional(),
  account_id: z.string().min(1, "La cuenta es requerida"),
  is_deferred: z.boolean().default(false),
  deferred_months: z.string().optional(),
}).refine((data) => {
  // Si es gasto diferido, los meses son requeridos
  if (data.is_deferred) {
    return data.deferred_months && parseInt(data.deferred_months) > 0;
  }
  return true;
}, {
  message: "Los meses son requeridos para gastos diferidos",
  path: ["deferred_months"],
});

type SpendingFormValues = z.infer<typeof spendingFormSchema>;

interface SpendingFormProps {
  onSubmit: (values: SpendingFormValues) => void;
  onCancel?: () => void;
}

export function SpendingForm({ onSubmit, onCancel }: SpendingFormProps) {
  const { accounts } = useContext(AccountsContext);

  // Aplanar las categorías para el select
  const categories = TRANSACTION_CATEGORIES.flatMap((group) =>
    group.categories.map((category) => ({
      id: category.id.toString(),
      name: category.name
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      icon: category.icon,
      budget_group: group.budget_group,
    }))
  );

  const form = useForm({
    resolver: zodResolver(spendingFormSchema),
    defaultValues: {
      amount: "",
      category_id: "",
      date: new Date(),
      description: "",
      account_id: "",
      is_deferred: false,
      deferred_months: "1",
    },
  });

  const isDeferred = form.watch("is_deferred");

  const handleSubmit = (values: any) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Monto */}
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monto</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Categoría */}
        <FormField
          control={form.control}
          name="category_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoría</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Fecha */}
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Fecha</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP", { locale: es })
                      ) : (
                        <span>Selecciona una fecha</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="p-0" align="start">
                  <Calendar
                    className="w-auto"
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Descripción */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción (opcional)</FormLabel>
              <FormControl>
                <Input placeholder="Detalles del gasto" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Cuenta */}
        <FormField
          control={form.control}
          name="account_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cuenta</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una cuenta" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id.toString()}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Switch para gasto diferido */}
        <FormField
          control={form.control}
          name="is_deferred"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel>Gasto diferido</FormLabel>
                <FormDescription>
                  Divide este gasto en varios meses
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Meses (solo si es gasto diferido) */}
        {isDeferred && (
          <FormField
            control={form.control}
            name="deferred_months"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de meses</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    placeholder="6"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  El gasto se dividirá en esta cantidad de meses
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Botones */}
        <div className="flex justify-end gap-2 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button type="submit">Guardar gasto</Button>
        </div>
      </form>
    </Form>
  );
}
