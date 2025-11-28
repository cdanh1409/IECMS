import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/Dashboard.css";
import { Bar, Line, Pie } from "react-chartjs-2";
import { generateChartData } from "./chartData";

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
  { label: "2s", value: 2000 },
  { label: "5s", value: 5000 },
  { label: "10s", value: 10000 },
  { label: "30s", value: 30000 },
  { label: "1m", value: 60000 },
  { label: "5m", value: 300000 },
  { label: "10m", value: 600000 },
  { label: "30m", value: 1800000 },
  { label: "1h", value: 3600000 },
  { label: "3h", value: 10800000 },
  { label: "10h", value: 36000000 },
  { label: "24h", value: 86400000 },
];

function Dashboard({ user, devices, setDevices, dashboardState, setDashboardState, fetchData }) {
  const { timeRange, customRange, refreshInterval } = dashboardState;
  const [localCustomRange, setLocalCustomRange] = useState(customRange);
  const [highlightIndex, setHighlightIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef(null);

  // Initialize localCustomRange
  useEffect(() => {
    const today = new Date();
    setLocalCustomRange([today, today]);
  }, []);

  // Fetch devices function
  const fetchDevices = useCallback(async () => {
    if (!user?.USER_ID) return;
    setLoading(true);
    try {
      const data = await fetchData(user.USER_ID);
      const colored = data.map((d) => ({
        ...d,
        color: d.color || "#" + Math.floor(Math.random() * 16777215).toString(16),
      }));
      setDevices(colored);
    } catch (err) {
      console.error("❌ Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [user, fetchData, setDevices]);

  // Setup interval auto-refresh
  const setupInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(fetchDevices, refreshInterval);
  }, [fetchDevices, refreshInterval]);

  useEffect(() => {
    if (!user?.USER_ID) return;
    fetchDevices();
    setupInterval();
    return () => clearInterval(intervalRef.current);
  }, [user, fetchDevices, refreshInterval, setupInterval]);

  // Filter devices by timeRange / customRange
  const filteredDevices = useMemo(() => {
    if (!devices || devices.length === 0) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    return devices.filter((d) => {
      const deviceDate = new Date(d.lastUpdate || d.CREATE_AT || new Date());
      deviceDate.setHours(0, 0, 0, 0);

      if (timeRange === "today") return deviceDate.getTime() === today.getTime();
      if (timeRange === "yesterday") return deviceDate.getTime() === yesterday.getTime();
      if (timeRange === "custom" && localCustomRange[0] && localCustomRange[1]) {
        const start = new Date(localCustomRange[0]);
        start.setHours(0, 0, 0, 0);
        const end = new Date(localCustomRange[1]);
        end.setHours(23, 59, 59, 999);
        return deviceDate >= start && deviceDate <= end;
      }
      return true;
    });
  }, [devices, timeRange, localCustomRange]);

  // Total kWh
  const totalKwh = useMemo(
    () => filteredDevices.reduce((sum, d) => sum + (d.kWh || 0), 0),
    [filteredDevices]
  );

  // Chart data
  const barChartData = useMemo(() => generateChartData(filteredDevices, "bar"), [filteredDevices]);
  const lineChartData = useMemo(() => generateChartData(filteredDevices, "line"), [filteredDevices]);
  const pieChartData = useMemo(() => generateChartData(filteredDevices, "pie"), [filteredDevices]);

  return (
    <div className="dashboard">
      {/* Controls */}
      <div className="dashboard-controls">
        <div>
          <label>Time:</label>
          <select
            value={timeRange}
            onChange={(e) =>
              setDashboardState((p) => ({ ...p, timeRange: e.target.value }))
            }
          >
            <option value="yesterday">Hôm qua</option>
            <option value="today">Hôm nay</option>
            <option value="custom">Tùy chỉnh</option>
          </select>
        </div>

        {timeRange === "custom" && (
          <DatePicker
            selectsRange
            startDate={localCustomRange[0]}
            endDate={localCustomRange[1]}
            onChange={(range) => {
              setLocalCustomRange(range);
              setDashboardState((p) => ({ ...p, customRange: range }));
            }}
            isClearable
          />
        )}

        <div>
          <label>Refresh:</label>
          <select
            value={refreshInterval}
            onChange={(e) =>
              setDashboardState((p) => ({ ...p, refreshInterval: Number(e.target.value) }))
            }
          >
            {REFRESH_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <button type="button" onClick={fetchDevices} disabled={loading}>
          {loading ? "Loading..." : "Refresh Now"}
        </button>
      </div>

      {/* Summary */}
      <div className="dashboard-summary">
        <h4>Tổng năng lượng</h4>
        <p>{totalKwh} kWh</p>
      </div>

      {/* Legend */}
      <div className="dashboard-legend">
        {filteredDevices.map((d, idx) => (
          <div
            key={d.DEVICE_ID}
            className={`legend-item ${highlightIndex === idx ? "active" : ""}`}
            onClick={() => setHighlightIndex(highlightIndex === idx ? null : idx)}
          >
            <span className="legend-color" style={{ backgroundColor: d.color }}></span>
            <span className="legend-label">{d.DEVICE_NAME}</span>
            <span className="legend-kwh">{d.kWh} kWh</span>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="dashboard-charts">
        <div className="chart-card">
          <div className="chart-title">Biểu đồ cột</div>
          <Bar
            data={{
              ...barChartData,
              datasets: barChartData.datasets.map((ds, idx) => ({
                ...ds,
                backgroundColor:
                  highlightIndex === null
                    ? ds.backgroundColor
                    : idx === highlightIndex
                    ? ds.backgroundColor
                    : "rgba(200,200,200,0.3)",
              })),
            }}
            options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }}
          />
        </div>

        <div className="chart-card">
          <div className="chart-title">Biểu đồ đường</div>
          <Line
            data={{
              ...lineChartData,
              datasets: lineChartData.datasets.map((ds, idx) => ({
                ...ds,
                borderColor:
                  highlightIndex === null
                    ? ds.borderColor
                    : idx === highlightIndex
                    ? ds.borderColor
                    : "rgba(200,200,200,0.3)",
                backgroundColor:
                  highlightIndex === null
                    ? ds.backgroundColor
                    : idx === highlightIndex
                    ? ds.backgroundColor
                    : "rgba(200,200,200,0.1)",
              })),
            }}
            options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }}
          />
        </div>

        <div className="chart-card">
          <div className="chart-title">Biểu đồ tròn</div>
          <Pie
            data={{
              ...pieChartData,
              datasets: pieChartData.datasets.map((ds) => ({
                ...ds,
                backgroundColor:
                  highlightIndex === null
                    ? ds.backgroundColor
                    : ds.backgroundColor.map((c, i) => (i === highlightIndex ? c : "rgba(200,200,200,0.3)")),
              })),
            }}
            options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }}
          />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
