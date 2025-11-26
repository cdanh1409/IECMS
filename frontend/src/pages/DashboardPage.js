import React from "react";
import Dashboard from "../components/Dashboard";
import DeviceManager from "../components/DeviceManager";

function DashboardPage({ user }) {
  return (
    <div>
      <h1>Dashboard</h1>
      {/* Quản lý thiết bị */}
      <DeviceManager user={user} />
      {/* Dashboard hiển thị biểu đồ */}
      <Dashboard
        fetchData={async () => {
          const res = await fetch(
            `http://localhost:5000/api/devices/user/${user.USER_ID}`
          );
          const data = await res.json();
          return data;
        }}
      />
    </div>
  );
}

export default DashboardPage;
