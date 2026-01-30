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

import { getTransactionsByAccount } from "@repo/supabase/transactions"
import { calculateRetirementPlan } from "@repo/retirement-plan-calculation"

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
    
    const [chartData, setChartData] = useState<Array<{ 
      date: Date; 
      range: [number, number]; 
      real?: number;
      normal?: number;
    }>>([]);
    const [isLoading, setIsLoading] = useState(true);
    

    useEffect(() => {
        const fetchTransactions = async () => {
            // Validar que retirementPlan exista antes de continuar
            if (!retirementPlan || !account?.id) {
                setIsLoading(false);
                return;
            }

            try {
                // Calcular el plan de retiro con las 3 variantes
                const plan = calculateRetirementPlan(
                    retirementPlan.actual_age,
                    retirementPlan.retirement_age,
                    retirementPlan.retirement_duration,
                    retirementPlan.retirement_pay,
                    retirementPlan.initial_amount,
                    retirementPlan.interest_rate,
                    retirementPlan.inflation_rate,
                    retirementPlan.min_variation_interest,
                    retirementPlan.max_variation_interest
                );

                // Obtener transacciones reales
                const transactions = await getTransactionsByAccount(account.id);
                
                // Agrupar transacciones por mes
                const transactionsByMonth = transactions.reduce((acc, transaction) => {
                    const date = new Date(transaction.date);
                    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    
                    if (!acc[monthKey]) {
                        acc[monthKey] = {
                            date: date,
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
                }, {} as Record<string, { date: Date; incomes: number; spendings: number; count: number }>);

                // Convertir a formato de gráfico
                const realData = Object.entries(transactionsByMonth)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .reduce((acc, [, data], index) => {
                        const balance = data.incomes - data.spendings;
                        const previousReal = acc.length > 0 ? acc[acc.length - 1].real : 0;
                        const cumulativeBalance = previousReal + balance;
                        
                        // Obtener los valores del plan calculado para el mes actual si existen
                        const planMin = plan.min.table[index];
                        const planMax = plan.max.table[index];
                        
                        const minRange = planMin ? planMin.total_acumulated : cumulativeBalance * 0.8;
                        const maxRange = planMax ? planMax.total_acumulated : cumulativeBalance * 1.2;
                        
                        acc.push({
                            date: data.date,
                            range: [minRange, maxRange] as [number, number],
                            real: cumulativeBalance
                        });
                        
                        return acc;
                    }, [] as Array<{ date: Date; range: [number, number]; real: number }>);

                const initialDate = new Date(retirementPlan.created_at)
                console.log(plan.normal.table[0].year);
                const normalPlanData = plan.normal.table.map(entry => ({
                  date: new Date(entry.year + initialDate.getFullYear() - retirementPlan.actual_age, entry.month),
                  normal: entry.total_acumulated
                }))
                const rangePlanData = plan.min.table.map((entry,index) => ({
                  date: new Date(entry.year + initialDate.getFullYear() - retirementPlan.actual_age, entry.month),
                  range: [entry.total_acumulated, plan.max.table[index].total_acumulated] as [number, number]
                }))

                //Combine all the data
                const allDates = new Set([
                  ...realData.map(d => d.date.getTime()),
                  ...normalPlanData.map(d => d.date.getTime()),
                  ...rangePlanData.map(d => d.date.getTime())
                ]);

                const formattedData = Array.from(allDates)
                  .sort((a, b) => a - b)
                  .map(timestamp => {
                    const date = new Date(timestamp);
                    const realEntry = realData.find(d => d.date.getTime() === timestamp);
                    const normalEntry = normalPlanData.find(d => d.date.getTime() === timestamp);
                    const rangeEntry = rangePlanData.find(d => d.date.getTime() === timestamp);

                    return {
                      date,
                      real: realEntry?.real,
                      normal: normalEntry?.normal,
                      range: rangeEntry?.range || [0, 0] as [number, number]
                    };
                  }); 

                  const nextYearhDate = new Date()
                  nextYearhDate.setFullYear(nextYearhDate.getFullYear() + 1);
                  const filteredData = formattedData.filter(entry => entry.date < nextYearhDate);

                setChartData(filteredData);
            } catch (error) {
                console.error('Error fetching transactions:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTransactions();
    }, [account?.id, retirementPlan]);

    
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
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.toLocaleDateString(undefined, { month: "short", year: "2-digit" })}
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
            <Line
              dataKey="normal"
              type="natural"
              stroke="var(--chart-4)"
              strokeWidth={2}
              dot={{
                fill: "var(--chart-4)",
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
