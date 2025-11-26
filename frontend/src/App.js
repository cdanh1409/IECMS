// App.js
import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import DeviceManager from "./components/DeviceManager";
import Setting from "./components/Setting";
import Login from "./components/Login";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [devices, setDevices] = useState([]);
  const [activeMenu, setActiveMenu] = useState("Dashboard");

  // Dashboard state lưu filter & interval
  const [dashboardState, setDashboardState] = useState({
    timeRange: "today",
    customRange: [null, null],
    refreshInterval: 10000,
  });

  const handleLogout = () => {
    setUser(null);
    setDevices([]);
  };

  // Hàm fetch devices từ API
  const fetchDevicesFromAPI = async (userId) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/devices/user/${userId}`
      );
      const data = await res.json();
      return data.map((d) => ({
        ...d,
        kWh: Number(d.kWh ?? 0),
        color:
          d.color ||
          "#" +
            ((d.DEVICE_ID * 1234567) % 0xffffff).toString(16).padStart(6, "0"),
      }));
    } catch (err) {
      console.error("❌ Error fetching devices:", err);
      return [];
    }
  };

  let content;
  switch (activeMenu) {
    case "Dashboard":
      content = (
        <Dashboard
          user={user}
          devices={devices}
          setDevices={setDevices}
          dashboardState={dashboardState}
          setDashboardState={setDashboardState}
          fetchData={fetchDevicesFromAPI}
        />
      );
      break;
    case "Device":
      content = (
        <DeviceManager
          user={user}
          devices={devices}
          onDevicesUpdate={setDevices}
        />
      );
      break;
    case "Setting":
      content = <Setting />;
      break;
    default:
      content = (
        <Dashboard
          user={user}
          devices={devices}
          setDevices={setDevices}
          dashboardState={dashboardState}
          setDashboardState={setDashboardState}
          fetchData={fetchDevicesFromAPI}
        />
      );
  }

  // Nếu chưa login, hiện login
  if (!user) return <Login onLogin={setUser} />;

  return (
    <div className="app-container">
      <Sidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        user={user}
        onLogout={handleLogout}
      />
      <div className="main-content">
        <Header user={user} onLogout={handleLogout} />
        {content}
      </div>
    </div>
  );
}

export default App;
