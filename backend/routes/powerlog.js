import React, { useState, useEffect } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";

export default function Dashboard({ user, devices }) {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedDevice, setSelectedDevice] = useState("all");
  const [chartData, setChartData] = useState(null);

  const fetchSummary = async () => {
    if (!fromDate || !toDate) return;

    const params = {
      USER_ID: user.USER_ID,
      fromDate,
      toDate,
      DEVICE_ID: selectedDevice === "all" ? null : selectedDevice,
    };

    try {
      const res = await axios.get(
        "http://localhost:5000/api/powerlog/summary",
        { params }
      );
      const labels = res.data.map((d) => d.DATE);
      const dataPoints = res.data.map((d) => d.totalKWh);

      setChartData({
        labels,
        datasets: [
          {
            label: "kWh tiêu thụ",
            data: dataPoints,
            borderColor: "#4caf50",
            backgroundColor: "rgba(76,175,80,0.2)",
            tension: 0.3,
          },
        ],
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [fromDate, toDate, selectedDevice]);

  return (
    <div style={{ padding: 16 }}>
      <h2>Dashboard Năng Lượng</h2>
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <div>
          <label>Từ ngày:</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>
        <div>
          <label>Đến ngày:</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
        <div>
          <label>Thiết bị:</label>
          <select
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
          >
            <option value="all">Tất cả</option>
            {devices.map((d) => (
              <option key={d.DEVICE_ID} value={d.DEVICE_ID}>
                {d.DEVICE_NAME}
              </option>
            ))}
          </select>
        </div>
        <button onClick={fetchSummary}>Xem</button>
      </div>

      {chartData ? (
        <Line data={chartData} />
      ) : (
        <p>Chọn ngày và thiết bị để xem biểu đồ.</p>
      )}
    </div>
  );
}
