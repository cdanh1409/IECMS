// App.js
import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import DeviceManager from "./components/DeviceManager";
import Setting from "./components/Setting";
import Login from "./components/Login";
import UserInfo from "./components/UserInfo";
import "./index.css"; // import CSS toàn cục
import "./App.css";

function App() {
  const [user, setUser] = useState(null); // user object { USER_ID, FULL_NAME, ... }
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

  // Fetch devices for a user
  const fetchDevicesFromAPI = async (userId) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/devices/user/${userId}`
      );
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

  // Determine which content to show
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
    case "UserInfo":
      content = <UserInfo userId={user?.USER_ID} />; // pass only USER_ID
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
