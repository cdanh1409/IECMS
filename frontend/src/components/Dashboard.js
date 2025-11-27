import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/Dashboard.css"; // ⬅️ mới
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

  useEffect(() => {
    const today = new Date();
    setLocalCustomRange([today, today]);
  }, []);

  const fetchDevices = useCallback(async () => {
    if (!user?.USER_ID) return;
    try {
      const data = await fetchData(user.USER_ID);
      const colored = data.map((d) => ({
        ...d,
        color:
          d.color || "#" + Math.floor(Math.random() * 16777215).toString(16),
      }));
      setDevices(colored);
    } catch (err) {
      console.error("❌ Dashboard fetch error:", err);
    }
  }, [user, fetchData, setDevices]);

  useEffect(() => {
    if (!user?.USER_ID) return;

    const fetchLoop = async () => {
      await fetchDevices();
    };

    fetchLoop();
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(fetchLoop, refreshInterval);

    return () => clearInterval(intervalRef.current);
  }, [user, fetchDevices, refreshInterval]);

  const filteredDevices = useMemo(() => {
    return devices.filter((d) => {
      const deviceDate = new Date(d.lastUpdate || d.CREATE_AT || new Date());
      deviceDate.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (timeRange === "today")
        return deviceDate.getTime() === today.getTime();

      if (timeRange === "yesterday") {
        const y = new Date(today);
        y.setDate(y.getDate() - 1);
        return deviceDate.getTime() === y.getTime();
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

  const totalKwh = useMemo(
    () => filteredDevices.reduce((sum, d) => sum + (d.kWh || 0), 0),
    [filteredDevices]
  );

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
              setDashboardState((p) => ({
                ...p,
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

      {/* Tổng */}
      <div className="dashboard-summary">
        <h4>Tổng năng lượng</h4>
        <p>{totalKwh} kWh</p>
      </div>

      {/* Charts */}
      <div className="dashboard-charts">
        <div className="chart-card">
          <h4>Biểu đồ cột</h4>
          <Bar data={chartData} options={{ responsive: true }} />
        </div>

        <div className="chart-card">
          <h4>Biểu đồ đường</h4>
          <Line data={chartData} options={{ responsive: true }} />
        </div>

        <div className="chart-card small">
          <h4>Biểu đồ tròn</h4>
          <Pie data={chartData} options={{ responsive: true }} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
