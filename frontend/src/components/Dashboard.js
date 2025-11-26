// Dashboard.js
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
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

function Dashboard({
  user,
  devices,
  setDevices,
  dashboardState,
  setDashboardState,
  fetchData,
}) {
  const { timeRange, customRange, refreshInterval } = dashboardState;
  const [localCustomRange, setLocalCustomRange] = useState(customRange);
  const intervalRef = useRef(null);

  // Load default today range
  useEffect(() => {
    const today = new Date();
    setLocalCustomRange([today, today]);
  }, []);

  // Stable fetchDevices
  const fetchDevices = useCallback(async () => {
    if (!user?.USER_ID) return;
    const data = await fetchData(user.USER_ID);
    setDevices(data);
  }, [user, fetchData, setDevices]);

  // Fetch & interval
  useEffect(() => {
    let isFetching = false;

    const fetchLoop = async () => {
      if (isFetching) return;
      isFetching = true;
      await fetchDevices();
      isFetching = false;
    };

    fetchLoop();
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(fetchLoop, refreshInterval);

    return () => clearInterval(intervalRef.current);
  }, [fetchDevices, refreshInterval]);

  // Filtered devices
  const filteredDevices = useMemo(() => {
    return devices.filter((d) => {
      const deviceDate = new Date(d.lastUpdate || d.CREATE_AT || new Date());
      deviceDate.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (timeRange === "today")
        return deviceDate.getTime() === today.getTime();
      if (timeRange === "yesterday") {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return deviceDate.getTime() === yesterday.getTime();
      }
      if (
        timeRange === "custom" &&
        localCustomRange[0] &&
        localCustomRange[1]
      ) {
        const start = new Date(localCustomRange[0]);
        start.setHours(0, 0, 0, 0);
        const end = new Date(localCustomRange[1]);
        end.setHours(23, 59, 59, 999);
        return deviceDate >= start && deviceDate <= end;
      }
      return true;
    });
  }, [devices, timeRange, localCustomRange]);

  const totalKwh = useMemo(() => {
    return filteredDevices.reduce((sum, d) => sum + (d.kWh || 0), 0);
  }, [filteredDevices]);

  // Chart data
  const chartData = useMemo(
    () => ({
      labels: filteredDevices.map((d) => d.DEVICE_NAME),
      datasets: [
        {
          label: "kWh",
          data: filteredDevices.map((d) => d.kWh),
          backgroundColor: filteredDevices.map((d) => d.color),
          borderColor: filteredDevices.map((d) => d.color),
          borderWidth: 2,
        },
      ],
    }),
    [filteredDevices]
  );

  return (
    <div
      style={{ padding: 16, display: "flex", flexDirection: "column", gap: 24 }}
    >
      {/* Time & Refresh controls */}
      <div
        style={{
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div>
          <label>Time: </label>
          <select
            value={timeRange}
            onChange={(e) =>
              setDashboardState((prev) => ({
                ...prev,
                timeRange: e.target.value,
              }))
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
            onChange={(update) => {
              setLocalCustomRange(update);
              setDashboardState((prev) => ({ ...prev, customRange: update }));
            }}
            isClearable
          />
        )}
        <div>
          <label>Refresh: </label>
          <select
            value={refreshInterval}
            onChange={(e) =>
              setDashboardState((prev) => ({
                ...prev,
                refreshInterval: Number(e.target.value),
              }))
            }
          >
            {REFRESH_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <button onClick={fetchDevices}>Refresh Now</button>
      </div>

      {/* Tổng kWh */}
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
          <Bar data={chartData} options={{ responsive: true }} />
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
          <Line data={chartData} options={{ responsive: true }} />
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
          <Pie data={chartData} options={{ responsive: true }} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
