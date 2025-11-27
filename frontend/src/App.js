// App.js
import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import DeviceManager from "./components/DeviceManager";
import Setting from "./components/Setting";
import Login from "./components/Login";
import UserInfo from "./components/UserInfo";
import "./styles/App.css";
import { API_URL } from "./config";

function App() {
  const [user, setUser] = useState(null); // { USER_ID, USER_NAME, ROLE }
  const [devices, setDevices] = useState([]);
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [dashboardState, setDashboardState] = useState({
    timeRange: "today",
    customRange: [null, null],
    refreshInterval: 10000,
  });

  const handleLogout = () => {
    setUser(null);
    setDevices([]);
    setActiveMenu("Dashboard");
  };

  // Fetch devices by user ID
  const fetchDevicesFromAPI = async (userId) => {
    if (!userId) return [];
    try {
      const res = await fetch(`${API_URL}/api/devices/user/${userId}`);
      if (!res.ok)
        throw new Error(`Error fetching devices (status ${res.status})`);
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

  // Render content based on active menu
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
      content = <Setting userId={user?.USER_ID} />;
      break;
    case "UserInfo":
      content = <UserInfo userId={user?.USER_ID} />;
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

  // Show login if no user
  if (!user) return <Login onLogin={setUser} />;

  return (
    <div className="app-container" style={{ display: "flex" }}>
      <Sidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        user={user}
        onLogout={handleLogout}
      />
      <div className="main-content" style={{ flex: 1 }}>
        <Header user={user} onLogout={handleLogout} />
        {content}
      </div>
    </div>
  );
}

export default App;
