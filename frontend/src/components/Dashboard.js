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

// Refresh options
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

// Chart data generator
function generateChartData(devices, type = "bar") {
  if (!devices || devices.length === 0) return { labels: [], datasets: [] };
  const colors = devices.map((d) => d.color || "#007bff");

  switch (type) {
    case "line":
      return {
        labels: devices.map((d) => d.DEVICE_NAME),
        datasets: [
          {
            label: "kWh",
            data: devices.map((d) => d.kWh || 0),
            borderColor: colors,
            backgroundColor: "transparent",
            tension: 0.3,
            fill: false,
          },
        ],
      };
    case "pie":
      return {
        labels: devices.map((d) => d.DEVICE_NAME),
        datasets: [
          {
            label: "kWh",
            data: devices.map((d) => d.kWh || 0),
            backgroundColor: colors,
            borderColor: "#fff",
            borderWidth: 1,
          },
        ],
      };
    case "bar":
    default:
      return {
        labels: devices.map((d) => d.DEVICE_NAME),
        datasets: [
          {
            label: "kWh",
            data: devices.map((d) => d.kWh || 0),
            backgroundColor: colors,
            borderColor: colors,
            borderWidth: 2,
          },
        ],
      };
  }
}

// Fetch devices from API
async function fetchDevicesAPI(USER_ID) {
  const res = await fetch(`http://localhost:5000/api/devices/user/${USER_ID}`);
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

  // Fetch devices
  const fetchDevices = useCallback(async () => {
    if (!user?.USER_ID) return;
    setLoading(true);

    try {
      let data = await fetchDevicesAPI(user.USER_ID);

      // Filter by time range
      const filtered = data.filter((d) => {
        const deviceDate = new Date(d.CREATE_AT);

        if (timeRange === "today") {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          return deviceDate >= today && deviceDate < tomorrow;
        }

        if (timeRange === "yesterday") {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          yesterday.setHours(0, 0, 0, 0);
          const today = new Date(yesterday);
          today.setDate(today.getDate() + 1);
          return deviceDate >= yesterday && deviceDate < today;
        }

        if (timeRange === "custom" && customRange[0] && customRange[1]) {
          const start = new Date(customRange[0]);
          start.setHours(0, 0, 0, 0);
          const dayAfterEnd = new Date(customRange[1]);
          dayAfterEnd.setDate(dayAfterEnd.getDate() + 1);
          dayAfterEnd.setHours(0, 0, 0, 0);
          return deviceDate >= start && deviceDate < dayAfterEnd;
        }

        return true;
      });

      const colored = filtered.map((d, index) => ({
        ...d,
        color:
          d.color || ["#007bff", "#28a745", "#ffc107", "#dc3545"][index % 4],
      }));

      setDevices(colored);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user, timeRange, customRange]);

  // Fetch on mount or user change
  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  // Auto refresh
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(fetchDevices, refreshInterval);
    return () => clearInterval(intervalRef.current);
  }, [fetchDevices, refreshInterval]);

  const totalKwh = useMemo(
    () => devices.reduce((sum, d) => sum + (d.kWh || 0), 0),
    [devices]
  );

  const barChartData = useMemo(
    () => generateChartData(devices, "bar"),
    [devices]
  );
  const lineChartData = useMemo(
    () => generateChartData(devices, "line"),
    [devices]
  );
  const pieChartData = useMemo(
    () => generateChartData(devices, "pie"),
    [devices]
  );

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } },
  };

  return (
    <div className="dashboard">
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

      <div className="dashboard-summary">
        <h4>Tổng năng lượng</h4>
        <p>{totalKwh} kWh</p>
      </div>

      <div className="dashboard-charts">
        <div className="chart-card">
          <div className="chart-title">Biểu đồ cột</div>
          <Bar data={barChartData} options={chartOptions} />
        </div>
        <div className="chart-card">
          <div className="chart-title">Biểu đồ đường</div>
          <Line data={lineChartData} options={chartOptions} />
        </div>
        <div className="chart-card">
          <div className="chart-title">Biểu đồ tròn</div>
          <Pie data={pieChartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
