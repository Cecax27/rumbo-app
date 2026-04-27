"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { type spendingsByCategories } from "@/hooks/useAccount";
import { formatMoney } from "@repo/formatters";

export const description = "A mixed bar chart";

const categories = {
  rent: "Renta",
  groceries: "Abarrotes",
  gasoline: "Gasolina",
  public_transport: "Transporte público",
  phone_and_internet: "Internet y celular",
  childcare: "Cuidado de niños",
  insurance: "Seguros",
  emergency_fund: "Fondo de emergencia",
  retirement: "Plan de retiro",
  investments: "Inversión",
  dining_out: "Comidas fuera",
  streaming_services: "Servicios de streaming",
  online_shopping: "Compras en línea",
  travel: "Viajes",
  hobbies: "Pasatiempos",
  entertainment: "Entretenimiento",
  clothing: "Ropa",
  subscriptions: "Suscripciones",
  courses: "Cursos",
  books: "Libros",
  gym: "Gimnasio",
  therapy: "Terapia",
  medical_bills: "Gastos médicos",
  supplements: "Suplementos",
  donations: "Donación",
};

const chartConfig = {
  amount: {
    label: "Cantidad",
    color: "#D6613C"
  },
  rent: {
    label: "Renta",
    color: "D5513C"},
  groceries: {
    label: "Abarrotes",
    color: "var(--chart-1)",
  },
  gasoline: {
    label: "Gasolina",
    color: "#DD5513C",
  },
  public_transport: {
    label: "Transporte público",
    color: "var(--chart-3)",
  },
  phone_and_internet: {
    label: "Internet y celular",
    color: "var(--chart-4)",
  },
  childcare: {
    label: "Cuidado de niños",
    color: "var(--chart-5)",
  },
  insurance: {
    label: "Seguros",
    color: "var(--chart-6)",
  },
  emergency_fund: {
    label: "Fondo de emergencia",
    color: "var(--chart-7)",
  },
  retirement: {
    label: "Plan de retiro",
    color: "var(--chart-8)",
  },
  investments: {
    label: "Inversión",
    color: "var(--chart-9)",
  },
  dining_out: {
    label: "Comidas fuera",
    color: "var(--chart-10)",
  },
  streaming_services: {
    label: "Servicios de streaming",
    color: "var(--chart-1)",
  },
  online_shopping: {
    label: "Compras en línea",
    color: "var(--chart-2)",
  },
  travel: {
    label: "Viajes",
    color: "var(--chart-3)",
  },
  hobbies: {
    label: "Pasatiempos",
    color: "var(--chart-4)",
  },
  entertainment: {
    label: "Entretenimiento",
    color: "var(--chart-5)",
  },
  clothing: {
    label: "Ropa",
    color: "var(--chart-6)",
  },
  subscriptions: {
    label: "Suscripciones",
    color: "var(--chart-7)",
  },
  courses: {
    label: "Cursos",
    color: "var(--chart-8)",
  },
  books: {
    label: "Libros",
    color: "var(--chart-9)",
  },
  gym: {
    label: "Gimnasio",
    color: "var(--chart-10)",
  },
  therapy: {
    label: "Terapia",
    color: "var(--chart-1)",
  },
  medical_bills: {
    label: "Gastos médicos",
    color: "var(--chart-2)",
  },
  supplements: {
    label: "Suplementos",
    color: "var(--chart-3)",
  },
  donations: {
    label: "Donación",
    color: "var(--chart-4)",
  },
  other: {
    label: "Otros",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

export function ChartBarMixed({
  chartData,
  dateRange,
  onChangeDateRange
}: {
  chartData?: spendingsByCategories;
  dateRange: {startDate: Date, endDate: Date},
  onChangeDateRange: (newRange: {startDate: Date, endDate: Date}) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gastos por categoría</CardTitle>
        <CardDescription>Enero - Junio 2024</CardDescription>
        <div className="flex gap-4 mt-4">
          <div>
            <label
              htmlFor="startDate"
              className="block text-sm font-medium text-gray-700"
            >
              Fecha inicio
            </label>
            <input
              id="startDate"
              type="date"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={dateRange.startDate.toISOString().split("T")[0]}
              onChange={(e) =>
                onChangeDateRange({
                  ...dateRange,
                  startDate: new Date(e.target.value),
                })
              }
            />
          </div>
          <div>
            <label
              htmlFor="endDate"
              className="block text-sm font-medium text-gray-700"
            >
              Fecha fin
            </label>
            <input
              id="endDate"
              type="date"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={dateRange.endDate.toISOString().split("T")[0]}
              onChange={(e) =>
                onChangeDateRange({
                  ...dateRange,
                  endDate: new Date(e.target.value),
                })
              }
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData?.sort((a, b) => b.amount - a.amount)}
            layout="vertical"
            margin={{
              left: 20,
            }}
          >
            <YAxis
              dataKey="category"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) =>
                chartConfig[value as keyof typeof chartConfig]?.label
              }
            />
            <XAxis dataKey="amount" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel formatter={(a)=>{return formatMoney(a as number)}}/>}
            />
            <Bar dataKey="amount" layout="vertical" radius={5} fill="#d5513c"/>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing total visitors for the last 6 months
        </div>
      </CardFooter>
    </Card>
  );
}
