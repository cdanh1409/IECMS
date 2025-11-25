import React from "react";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const dailyUsage = [
  { date: "2025-11-14", kWh: 5 },
  { date: "2025-11-15", kWh: 8 },
  { date: "2025-11-16", kWh: 6 },
  { date: "2025-11-17", kWh: 9 },
  { date: "2025-11-18", kWh: 4 },
  { date: "2025-11-19", kWh: 7 },
];

export function BarChart() {
  const data = {
    labels: dailyUsage.map((d) => d.date),
    datasets: [
      {
        label: "Điện tiêu thụ (kWh)",
        data: dailyUsage.map((d) => d.kWh),
        backgroundColor: "#3b82f6",
      },
    ],
  };
  return <Bar data={data} />;
}

export function LineChart() {
  const data = {
    labels: dailyUsage.map((d) => d.date),
    datasets: [
      {
        label: "Điện tiêu thụ (kWh)",
        data: dailyUsage.map((d) => d.kWh),
        borderColor: "#ef4444",
        backgroundColor: "rgba(239,68,68,0.2)",
        fill: true,
      },
    ],
  };
  return <Line data={data} />;
}
