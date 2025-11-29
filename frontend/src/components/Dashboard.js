import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/Dashboard.css";
import "../styles/Charts.css";
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
import { generateChartData } from "./chartData.js";

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

// --------- API fetch ---------
async function fetchDevicesAPI(USER_ID, startDate, endDate) {
  const query = [];
  if (startDate) query.push(`startDate=${encodeURIComponent(startDate)}`);
  if (endDate) query.push(`endDate=${encodeURIComponent(endDate)}`);
  const qs = query.length ? `?${query.join("&")}` : "";
  const res = await fetch(
    `http://localhost:5000/api/devices/user/${USER_ID}/devices${qs}`
  );
  if (!res.ok) throw new Error("Error fetching devices");
  return res.json();
}

function Dashboard({ user }) {
  const [devices, setDevices] = useState([]);
  const [dashboardState, setDashboardState] = useState({
    timeRange: "today",
    customRange: [new Date(), new Date()],
    refreshInterval: 5000,
  });
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef(null);
  const { timeRange, customRange, refreshInterval } = dashboardState;

  const toUTCISOString = (date) => {
    const offsetMs = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offsetMs).toISOString();
  };

  // --------- tính date range ---------
  const getDateRange = useCallback(() => {
    let startDate, endDate;
    if (timeRange === "today") {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      startDate = toUTCISOString(start);
      endDate = toUTCISOString(end);
    } else if (timeRange === "yesterday") {
      const start = new Date();
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setDate(end.getDate() - 1);
      end.setHours(23, 59, 59, 999);
      startDate = toUTCISOString(start);
      endDate = toUTCISOString(end);
    } else if (timeRange === "custom" && customRange[0] && customRange[1]) {
      const start = new Date(customRange[0]);
      start.setHours(0, 0, 0, 0);
      const end = new Date(customRange[1]);
      end.setHours(23, 59, 59, 999);
      startDate = toUTCISOString(start);
      endDate = toUTCISOString(end);
    }
    return { startDate, endDate };
  }, [timeRange, customRange]);

  // --------- fetch devices ---------
  const fetchDevices = useCallback(async () => {
    if (!user?.USER_ID) return;
    setLoading(true);
    try {
      const { startDate, endDate } = getDateRange();
      const data = await fetchDevicesAPI(user.USER_ID, startDate, endDate);
      setDevices(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user, getDateRange]);

  // --------- auto fetch on mount ---------
  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  // --------- refresh interval ---------
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(fetchDevices, refreshInterval);
    return () => clearInterval(intervalRef.current);
  }, [fetchDevices, refreshInterval]);

  // --------- chart data ---------
  const chartDataBar = useMemo(
    () => generateChartData(devices, "bar"),
    [devices]
  );
  const chartDataLine = useMemo(
    () => generateChartData(devices, "line"),
    [devices]
  );
  const chartDataPie = useMemo(
    () => generateChartData(devices, "pie"),
    [devices]
  );

  const totalKwh = useMemo(
    () => devices.reduce((sum, d) => sum + (d.totalKWh || 0), 0),
    [devices]
  );

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true } },
    scales: { y: { beginAtZero: true } },
  };

  return (
    <div className="dashboard">
      {/* Controls */}
      <div className="dashboard-controls">
        <div className="control-group">
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
            className="datepicker"
            selectsRange
            startDate={customRange[0]}
            endDate={customRange[1]}
            onChange={(range) =>
              setDashboardState((p) => ({ ...p, customRange: range }))
            }
            isClearable
          />
        )}
        <div className="control-group">
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
        <button
          className="refresh-button"
          onClick={fetchDevices}
          disabled={loading}
        >
          {loading ? <div className="spinner" /> : "Refresh"}
        </button>
      </div>

      {/* Summary */}
      <div className="dashboard-summary">
        <h4>Tổng năng lượng</h4>
        <p>{totalKwh.toFixed(2)} kWh</p>
      </div>

      {/* Charts */}
      <div className="dashboard-charts">
        <div className="chart-card">
          <div className="chart-title">Biểu đồ cột (Mỗi device)</div>
          <Bar data={chartDataBar} options={chartOptions} />
        </div>
        <div className="chart-card">
          <div className="chart-title">Biểu đồ đường (Mỗi device)</div>
          <Line data={chartDataLine} options={chartOptions} />
        </div>
        <div className="chart-card">
          <div className="chart-title">Biểu đồ tròn (Mỗi device)</div>
          <Pie data={chartDataPie} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
