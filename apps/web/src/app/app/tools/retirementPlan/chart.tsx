"use client"

import { TrendingUp } from "lucide-react"
import { CartesianGrid, Line, ComposedChart, XAxis, Area } from "recharts"
import { useEffect, useState } from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

import { useTools } from "@/contexts/ToolsContext"
import { useAccount } from "@/hooks/useAccount"

import { getTransactionsByAccount, type Transaction } from "@repo/supabase/transactions"

export const description = "A line chart with dots"

const chartConfig = {
  range: {
    label: "Rango",
    color: "var(--chart-1)",
  },
  real: {
    label: "Real",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig

export function ChartLineDots(
    { planId }: { planId: string }
) {
    const { retirementPlans } = useTools();
    const retirementPlan = retirementPlans.find(plan => plan.id === planId);
    const { account } = useAccount(retirementPlan?.account_id || null);
    
    const [chartData, setChartData] = useState<Array<{ month: string; range: [number, number]; real: number }>>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTransactions = async () => {
            if (!account?.id) {
                setIsLoading(false);
                return;
            }

            try {
                const transactions = await getTransactionsByAccount(account.id);
                
                // Agrupar transacciones por mes
                const transactionsByMonth = transactions.reduce((acc, transaction) => {
                    const date = new Date(transaction.date);
                    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    const monthName = date.toLocaleString('en-US', { month: 'long' });
                    
                    if (!acc[monthKey]) {
                        acc[monthKey] = {
                            month: monthName,
                            incomes: 0,
                            spendings: 0,
                            count: 0
                        };
                    }
                    
                    // Sumar ingresos o gastos según el tipo de transacción
                    if (transaction.amount > 0) {
                        acc[monthKey].incomes += transaction.amount;
                    } else {
                        acc[monthKey].spendings += Math.abs(transaction.amount);
                    }
                    acc[monthKey].count += 1;
                    
                    return acc;
                }, {} as Record<string, { month: string; incomes: number; spendings: number; count: number }>);

                // Convertir a formato de gráfico
                const formattedData = Object.entries(transactionsByMonth)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .reduce((acc, [, data]) => {
                        const balance = data.incomes - data.spendings;
                        const previousReal = acc.length > 0 ? acc[acc.length - 1].real : 0;
                        const cumulativeBalance = previousReal + balance;
                        const minRange = 0;
                        const maxRange = 0;
                        
                        acc.push({
                            month: data.month,
                            range: [minRange, maxRange] as [number, number],
                            real: cumulativeBalance
                        });
                        
                        return acc;
                    }, [] as Array<{ month: string; range: [number, number]; real: number }>);

                setChartData(formattedData);
            } catch (error) {
                console.error('Error fetching transactions:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTransactions();
    }, [account?.id]);

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Loading...</CardTitle>
                </CardHeader>
            </Card>
        );
    }

  return (
    <Card>
      <CardHeader>
        <CardTitle></CardTitle>
        <CardDescription></CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && <div>Loading chart...</div>}
        {!isLoading &&
        <ChartContainer config={chartConfig}>
          <ComposedChart
            data={chartData}
            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
          >
            <CartesianGrid vertical={true} horizontal={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Line
              dataKey="real"
              type="natural"
              stroke="var(--chart-3)"
              strokeWidth={2}
              dot={{
                fill: "var(--chart-3)",
              }}
              activeDot={{
                r: 6,
              }}
            />
            <Area
              connectNulls
              dataKey="range"
              fill="var(--chart-1)"
              stroke="var(--chart-1)"
              fillOpacity={0.2}
              type="natural"
            />
          </ComposedChart>
        </ChartContainer>}
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
  )
}
