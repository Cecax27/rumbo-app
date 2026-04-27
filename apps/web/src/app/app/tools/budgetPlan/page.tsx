"use client";

import { quicksand } from "@/app/ui/fonts";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	type ChartConfig,
} from "@/components/ui/chart";
import { useTools } from "@/contexts/ToolsContext";
import { formatMoney } from "@repo/formatters";
import {
	type BudgetPlan,
	type BudgetPlanGroupDetails,
	type BudgetPlanWithDetails,
} from "@repo/supabase/tools";
import { AlertTriangle, CircleCheck, Wallet } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

export const dynamic = "force-dynamic";

const chartConfig = {
	objetivo: {
		label: "Objetivo",
		color: "var(--chart-2)",
	},
	real: {
		label: "Real",
		color: "var(--chart-1)",
	},
} satisfies ChartConfig;

const isBudgetPlanWithDetails = (
	plan: BudgetPlan | BudgetPlanWithDetails
): plan is BudgetPlanWithDetails => {
	return "total_incomes" in plan && "start_date" in plan && "end_date" in plan;
};

export default function BudgetPlanPage() {
	const searchParams = useSearchParams();
	const id = searchParams.get("id");

	const { budgetPlans, loading } = useTools();
	const budgetPlan = budgetPlans.find((plan) => plan.id === id);

	if (loading) {
		return (
			<div className="w-full p-6">
				<Card>
					<CardHeader>
						<CardTitle>Cargando plan...</CardTitle>
						<CardDescription>Estamos preparando tu presupuesto.</CardDescription>
					</CardHeader>
				</Card>
			</div>
		);
	}

	if (!id || !budgetPlan || !isBudgetPlanWithDetails(budgetPlan)) {
		return (
			<div className="w-full p-6">
				<Card>
					<CardHeader>
						<CardTitle>Plan no encontrado</CardTitle>
						<CardDescription>
							No se encontró el plan de presupuesto solicitado.
						</CardDescription>
					</CardHeader>
				</Card>
			</div>
		);
	}

	const groups = budgetPlan.groups as BudgetPlanGroupDetails[];
	const totalIngresos = budgetPlan.total_incomes;
	const totalGastado = groups.reduce((sum, group) => sum + group.real_amount, 0);
	const disponible = totalIngresos - totalGastado;
	const porcentajeUso =
		totalIngresos > 0 ? Math.min((totalGastado / totalIngresos) * 100, 100) : 0;

	const chartData = groups.map((group) => ({
		categoria: group.name,
		objetivo: Number(group.target_amount.toFixed(2)),
		real: Number(group.real_amount.toFixed(2)),
	}));

	return (
		<div className="w-full mx-auto p-6 overflow-y-auto">
			<div className="flex flex-col gap-6">
				<header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h1
							className={`${quicksand.className} text-3xl font-bold text-neutral-800 dark:text-neutral-100`}
						>
							{budgetPlan.name}
						</h1>
						<p className="text-sm text-neutral-600 dark:text-neutral-400">
							Periodo: {budgetPlan.start_date} al {budgetPlan.end_date}
						</p>
					</div>
					<Badge
						variant={porcentajeUso >= 100 ? "destructive" : "secondary"}
						className="w-fit"
					>
						{porcentajeUso >= 100 ? "Límite superado" : "Plan en control"}
					</Badge>
				</header>

				<section className="grid gap-4 md:grid-cols-3">
					<Card>
						<CardHeader className="pb-2">
							<CardDescription>Ingresos del periodo</CardDescription>
							<CardTitle className="text-2xl">{formatMoney(totalIngresos)}</CardTitle>
						</CardHeader>
					</Card>

					<Card>
						<CardHeader className="pb-2">
							<CardDescription>Total gastado</CardDescription>
							<CardTitle className="text-2xl">{formatMoney(totalGastado)}</CardTitle>
						</CardHeader>
					</Card>

					<Card>
						<CardHeader className="pb-2">
							<CardDescription>Disponible</CardDescription>
							<CardTitle className="text-2xl">{formatMoney(disponible)}</CardTitle>
						</CardHeader>
					</Card>
				</section>

				<Card>
					<CardHeader>
						<CardTitle>Uso general del presupuesto</CardTitle>
						<CardDescription>
							Has usado {porcentajeUso.toFixed(1)}% de tus ingresos para este plan.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="h-3 w-full overflow-hidden rounded-full bg-muted">
							<div
								className="h-full rounded-full bg-shamrock-500 transition-all"
								style={{ width: `${porcentajeUso}%` }}
							/>
						</div>
					</CardContent>
				</Card>

				<div className="grid gap-6 lg:grid-cols-[1.1fr,1fr]">
					<Card>
						<CardHeader>
							<CardTitle>Comparativa por categoría</CardTitle>
							<CardDescription>
								Objetivo frente al gasto real por grupo de presupuesto.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<ChartContainer config={chartConfig} className="h-[280px] w-full">
								<BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
									<CartesianGrid vertical={false} />
									<XAxis dataKey="categoria" tickLine={false} axisLine={false} />
									<YAxis tickLine={false} axisLine={false} />
									<ChartTooltip content={<ChartTooltipContent />} />
									<Bar dataKey="objetivo" fill="var(--chart-2)" radius={6} />
									<Bar dataKey="real" fill="var(--chart-1)" radius={6} />
								</BarChart>
							</ChartContainer>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Detalle por grupos</CardTitle>
							<CardDescription>
								Estado de avance de cada categoría del plan.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{groups.map((group) => {
								const percent = Math.min(group.real_percentage * 100, 100);
								const isOver = group.real_amount > group.target_amount;

								return (
									<div key={group.id} className="rounded-lg border p-4">
										<div className="mb-2 flex items-center justify-between gap-3">
											<div className="flex items-center gap-2 font-medium">
												<Wallet className="h-4 w-4 text-neutral-500" />
												<span>{group.name}</span>
											</div>
											<span
												className={`inline-flex items-center gap-1 text-xs font-semibold ${
													isOver ? "text-punch-600" : "text-shamrock-600"
												}`}
											>
												{isOver ? (
													<AlertTriangle className="h-3.5 w-3.5" />
												) : (
													<CircleCheck className="h-3.5 w-3.5" />
												)}
												{isOver ? "Excedido" : "Dentro del límite"}
											</span>
										</div>

										<div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-muted">
											<div
												className={`h-full rounded-full ${
													isOver ? "bg-punch-500" : "bg-shamrock-500"
												}`}
												style={{ width: `${percent}%` }}
											/>
										</div>

										<div className="flex items-center justify-between text-sm text-muted-foreground">
											<span>{formatMoney(group.real_amount)}</span>
											<span>de {formatMoney(group.target_amount)}</span>
										</div>
									</div>
								);
							})}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
