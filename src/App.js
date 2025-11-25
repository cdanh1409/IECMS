// App.js
import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import Device from "./components/Device";
import Setting from "./components/Setting";
import "./App.css";

function App() {
  const [user] = useState({ USER_ID: 101, USER_NAME: "Admin" });
  const [activeMenu, setActiveMenu] = useState("Dashboard");

  // Dữ liệu cứng
  const [devices, setDevices] = useState([
    {
      DEVICE_ID: 1,
      USER_ID: 101,
      DEVICE_NAME: "Máy lạnh",
      ADDRESS: "Phòng khách",
      STATUS: "On",
      kWh: 12.5,
      CREATE_AT: "2025-11-25",
      color: "#4caf50",
    },
    {
      DEVICE_ID: 2,
      USER_ID: 101,
      DEVICE_NAME: "Tủ lạnh",
      ADDRESS: "Nhà bếp",
      STATUS: "On",
      kWh: 8.2,
      CREATE_AT: "2025-11-24",
      color: "#2196f3",
    },
    {
      DEVICE_ID: 3,
      USER_ID: 101,
      DEVICE_NAME: "Quạt",
      ADDRESS: "Phòng ngủ",
      STATUS: "Off",
      kWh: 3.7,
      CREATE_AT: "2025-11-23",
      color: "#ff9800",
    },
  ]);

  // Render theo menu
  let content;
  switch (activeMenu) {
    case "Dashboard":
      content = <Dashboard devices={devices} />;
      break;
    case "Device":
      content = (
        <Device user={user} onDevicesUpdate={setDevices} devices={devices} />
      );
      break;
    case "Setting":
      content = <Setting />;
      break;
    default:
      content = <Dashboard devices={devices} />;
  }

  return (
    <div className="app-container">
      {" "}
      <Sidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        user={user}
      />
      <div className="main-content">
        {" "}
        <Header user={user} />
        {content}{" "}
      </div>{" "}
    </div>
  );
}

export default App;
