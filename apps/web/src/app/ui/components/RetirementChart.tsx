import React from "react";
import Chart from "./Chart";

interface RetirementChartProps {
  table: Array<{
    year: number;
    month: number;
    contribution: number;
    total_acumulated: number;
  }>;
}

const RetirementChart: React.FC<RetirementChartProps> = ({ table }) => {
  return (
    <div className="bg-linear-to-br from-blue-50 to-sky-50 dark:from-blue-900/20 dark:to-sky-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
      <h4 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-4 flex items-center gap-2">
        Gráfica de Proyección
      </h4>

      <div className="h-64">
        <Chart
          data={table.map((row) => ({
            x: `${row.year}-${row.month}`,
            contribution: row.contribution,
            totalAccumulated: row.total_acumulated,
          }) as unknown as { x: string } & { [key: string]: number })}
          xKey="x"
          series={[
            { key: "contribution", label: "Contribución Mensual", color: "#4CAF50" },
            { key: "totalAccumulated", label: "Total Acumulado", color: "#2196F3" },
          ]}
          xAxisLabel="Tiempo (Año-Mes)"
          yAxisLabel="Monto ($)"
        />
      </div>
    </div>
  );
};

export default RetirementChart;