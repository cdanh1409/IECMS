import React from "react";
import "../styles/Sidebar.css";

function Sidebar({ activeMenu, setActiveMenu, user }) {
  const menuItems = ["Dashboard", "Device", "Setting"];

  const displayName = user?.FULL_NAME || user?.USER_NAME || "Guest";
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <div className="sidebar">
      {/* User info */}
      <div className="sidebar-user" onClick={() => setActiveMenu("UserInfo")}>
        <div className="sidebar-avatar">{avatarLetter}</div>
        <div className="sidebar-user-info">
          <div className="username">{displayName}</div>
          <div className="status">Online</div>
        </div>
      </div>

      {/* Menu */}
      <div>
        {menuItems.map((item) => (
          <div
            key={item}
            onClick={() => setActiveMenu(item)}
            className={`sidebar-menu-item ${
              activeMenu === item ? "active" : ""
            }`}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Sidebar;
