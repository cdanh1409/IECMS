import React, { useState, useEffect, useCallback } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Bar, Line, Pie } from "react-chartjs-2";
import DeviceCard from "./DeviceCard";

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

const REFRESH_OPTIONS = [
  { label: "5 giây", value: 5000 },
  { label: "10 giây", value: 10000 },
  { label: "30 giây", value: 30000 },
  { label: "1 phút", value: 60000 },
  { label: "5 phút", value: 300000 },
  { label: "10 phút", value: 600000 },
  { label: "30 phút", value: 1800000 },
  { label: "1 giờ", value: 3600000 },
  { label: "3 giờ", value: 10800000 },
  { label: "5 giờ", value: 18000000 },
  { label: "10 giờ", value: 36000000 },
  { label: "24 giờ", value: 86400000 },
];

function Dashboard({ devices = [], fetchData }) {
  const [allDevices, setAllDevices] = useState(devices);
  const [visibleDevices, setVisibleDevices] = useState(
    devices.reduce((acc, d) => ({ ...acc, [d.DEVICE_ID]: true }), {})
  );
  const [timeRange, setTimeRange] = useState("day");
  const [customRange, setCustomRange] = useState([null, null]);
  const [startDate, endDate] = customRange;
  const [refreshInterval, setRefreshInterval] = useState(10000);

  const handleToggleDevice = (id) =>
    setVisibleDevices((prev) => ({ ...prev, [id]: !prev[id] }));

  const filterDevices = useCallback(() => {
    const now = new Date();
    return allDevices.filter((d) => {
      if (!visibleDevices[d.DEVICE_ID]) return false;
      const deviceDate = new Date(d.timestamp || now);
      if (timeRange === "day")
        return deviceDate.toDateString() === now.toDateString();
      if (timeRange === "week") {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        return deviceDate >= weekStart && deviceDate <= now;
      }
      if (timeRange === "month") {
        return (
          deviceDate.getMonth() === now.getMonth() &&
          deviceDate.getFullYear() === now.getFullYear()
        );
      }
      if (timeRange === "custom" && startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        return deviceDate >= start && deviceDate <= end;
      }
      return true;
    });
  }, [allDevices, visibleDevices, timeRange, startDate, endDate]);

  useEffect(() => {
    if (!fetchData) return;
    const interval = setInterval(async () => {
      const newDevices = await fetchData();
      setAllDevices(newDevices);
    }, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  const filteredDevices = filterDevices();

  const totalKwh = filteredDevices.reduce(
    (sum, d) => sum + Number(d.kWh || 0),
    0
  );

  const chartData = {
    labels: filteredDevices.map((d) => d.DEVICE_NAME),
    datasets: [
      {
        label: "kWh",
        data: filteredDevices.map((d) => Number(d.kWh || 0)),
        backgroundColor: filteredDevices.map((d) => d.color || "#4caf50"),
        borderColor: filteredDevices.map((d) => d.color || "#4caf50"),
        borderWidth: 2,
      },
    ],
  };

  const lineChartData = {
    labels: filteredDevices.map((d) => d.DEVICE_NAME),
    datasets: [
      {
        label: "kWh",
        data: filteredDevices.map((d) => Number(d.kWh || 0)),
        borderColor: filteredDevices.map((d) => d.color || "#4caf50"),
        borderWidth: 3,
        fill: false,
        tension: 0.4,
      },
    ],
  };

  const pieData = {
    labels: filteredDevices.map((d) => d.DEVICE_NAME),
    datasets: [
      {
        data: filteredDevices.map((d) => Number(d.kWh || 0)),
        backgroundColor: filteredDevices.map((d) => d.color || "#4caf50"),
        borderColor: "#fff",
        borderWidth: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            const d = filteredDevices[context.dataIndex];
            if (!d) return "";
            return `${d.DEVICE_NAME}: ${d.kWh} kWh | ${d.ADDRESS || ""} | ${
              d.STATUS || ""
            }`;
          },
        },
      },
      legend: { display: false },
    },
    scales: { y: { beginAtZero: true } },
  };

  const handleUpdateDevice = (updated) => {
    setAllDevices((prev) =>
      prev.map((d) => (d.DEVICE_ID === updated.DEVICE_ID ? updated : d))
    );
  };

  const handleDeleteDevice = (id) => {
    setAllDevices((prev) => prev.filter((d) => d.DEVICE_ID !== id));
  };

  // const [newDevice, setNewDevice] = useState({
  //   DEVICE_NAME: "",
  //   kWh: 0,
  //   STATUS: "Off",
  //   ADDRESS: "",
  // });
  // const handleAddDevice = () => {
  //   const id = Date.now().toString();
  //   setAllDevices((prev) => [...prev, { ...newDevice, DEVICE_ID: id }]);
  //   setNewDevice({ DEVICE_NAME: "", kWh: 0, STATUS: "Off", ADDRESS: "" });
  // };

  return (
    <div
      style={{ padding: 16, display: "flex", flexDirection: "column", gap: 24 }}
    >
      {/* Filters */}
      <div
        style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 12 }}
      >
        {" "}
        <div>
          {" "}
          <label>Time Range:</label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            style={{ marginLeft: 8, padding: "4px 8px" }}
          >
            {" "}
            <option value="day">Hôm nay</option>{" "}
            <option value="week">Tuần này</option>{" "}
            <option value="month">Tháng này</option>{" "}
            <option value="custom">Tùy chỉnh</option>{" "}
          </select>{" "}
        </div>
        {timeRange === "custom" && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <DatePicker
              selectsRange
              startDate={startDate}
              endDate={endDate}
              onChange={(update) => setCustomRange(update)}
              isClearable
              placeholderText="Chọn khoảng ngày"
            />{" "}
          </div>
        )}{" "}
        <div>
          {" "}
          <label>Refresh:</label>
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            style={{ marginLeft: 8, padding: "4px 8px" }}
          >
            {REFRESH_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}{" "}
          </select>{" "}
        </div>{" "}
      </div>

      {/* Device cards */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
        {filteredDevices.map((d) => (
          <DeviceCard
            key={d.DEVICE_ID}
            device={d}
            onUpdate={handleUpdateDevice}
            onDelete={() => handleDeleteDevice(d.DEVICE_ID)}
          />
        ))}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        {allDevices.map((d) => (
          <button
            key={d.DEVICE_ID}
            onClick={() => handleToggleDevice(d.DEVICE_ID)}
            style={{
              padding: "6px 12px",
              borderRadius: 8,
              border: visibleDevices[d.DEVICE_ID]
                ? `2px solid ${d.color || "#4caf50"}`
                : "1px solid #ccc",
              backgroundColor: visibleDevices[d.DEVICE_ID]
                ? d.color || "#4caf50"
                : "#fff",
              color: visibleDevices[d.DEVICE_ID] ? "#fff" : "#000",
              cursor: "pointer",
              transition: "0.2s",
            }}
          >
            {d.DEVICE_NAME}
          </button>
        ))}
      </div>

      {/* Total energy */}
      <div
        style={{
          backgroundColor: "#fff",
          padding: 16,
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          minWidth: 200,
        }}
      >
        <h4>Tổng năng lượng</h4>
        <p style={{ fontSize: 24, fontWeight: "bold", margin: 0 }}>
          {totalKwh} kWh
        </p>
      </div>

      {/* Charts */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
        <div
          style={{
            flex: "1 1 400px",
            height: 300,
            backgroundColor: "#fff",
            borderRadius: 12,
            padding: 16,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <h4>Biểu đồ cột</h4>
          <Bar data={chartData} options={chartOptions} />
        </div>
        <div
          style={{
            flex: "1 1 400px",
            height: 300,
            backgroundColor: "#fff",
            borderRadius: 12,
            padding: 16,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <h4>Biểu đồ đường</h4>
          <Line data={lineChartData} options={chartOptions} />
        </div>
        <div
          style={{
            flex: "1 1 300px",
            height: 300,
            backgroundColor: "#fff",
            borderRadius: 12,
            padding: 16,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <h4>Biểu đồ tròn</h4>
          <Pie
            data={pieData}
            options={{ ...chartOptions, maintainAspectRatio: true }}
          />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
