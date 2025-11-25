import React from "react";
import { Bar, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend
);

function Dashboard({ devices = [] }) {
  const totalKwh = devices.reduce((sum, d) => sum + Number(d.kWh || 0), 0);
  const chartLabels = devices.map((d) => d.DEVICE_NAME);

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: "kWh",
        data: devices.map((d) => Number(d.kWh || 0)),
        backgroundColor: devices.map((d) => d.color || "#4caf50"),
        borderColor: "#333",
        borderWidth: 1,
      },
    ],
  };

  const pieData = {
    labels: chartLabels,
    datasets: [
      {
        data: devices.map((d) => Number(d.kWh || 0)),
        backgroundColor: devices.map((d) => d.color || "#4caf50"),
        borderColor: "#fff",
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            const d = devices[context.dataIndex];
            return `${d.DEVICE_NAME}: ${d.kWh} kWh | ${d.ADDRESS} | ${d.STATUS}`;
          },
        },
      },
      legend: { position: "top" },
    },
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        padding: "16px",
      }}
    >
      {/* Tổng quan */}
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
        <div
          style={{
            flex: "1 1 250px",
            backgroundColor: "#fff",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            padding: "24px",
          }}
        >
          <h3 style={{ margin: "0 0 12px 0", color: "#333" }}>
            Tổng năng lượng
          </h3>
          <p style={{ fontSize: "24px", fontWeight: "bold", margin: 0 }}>
            {totalKwh} kWh
          </p>{" "}
        </div>
        <div
          style={{
            flex: "1 1 250px",
            backgroundColor: "#fff",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            padding: "24px",
          }}
        >
          <h3 style={{ margin: "0 0 12px 0", color: "#333" }}>Số thiết bị</h3>
          <p style={{ fontSize: "24px", fontWeight: "bold", margin: 0 }}>
            {devices.length}
          </p>{" "}
        </div>{" "}
      </div>

      {/* Biểu đồ */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "24px" }}>
        <div
          style={{
            flex: "1 1 400px",
            height: "300px",
            backgroundColor: "#fff",
            borderRadius: "12px",
            padding: "16px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <h4>Biểu đồ cột</h4>
          <Bar data={chartData} options={options} />
        </div>
        <div
          style={{
            flex: "1 1 400px",
            height: "300px",
            backgroundColor: "#fff",
            borderRadius: "12px",
            padding: "16px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <h4>Biểu đồ đường</h4>
          <Line data={chartData} options={options} />
        </div>
        <div
          style={{
            flex: "1 1 400px",
            height: "300px",
            backgroundColor: "#fff",
            borderRadius: "12px",
            padding: "16px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <h4>Biểu đồ tròn</h4>
          <Pie data={pieData} options={options} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
