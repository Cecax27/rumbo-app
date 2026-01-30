import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ChartProps {
  data: Array<{ x: string } & { [key: string]: number }>;
  xKey: string;
  series: Array<{ key: string; label: string; color: string }>;
  xAxisLabel: string;
  yAxisLabel: string;
}

const Chart: React.FC<ChartProps> = ({ data, xKey, series, xAxisLabel, yAxisLabel }) => {
  const chartData = {
    labels: data.map((item) => item[xKey]),
    datasets: series.map((s) => ({
      label: s.label,
      data: data.map((item) => item[s.key]),
      borderColor: s.color,
      backgroundColor: s.color,
      tension: 0.4,
      borderWidth: 1,
      pointStyle: false
    })),
  };

  const options = {

  };

  return <Line options={options} data={chartData} />;
};

export default Chart;