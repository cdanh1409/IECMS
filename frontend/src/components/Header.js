import React from "react";
import "../styles/Header.css";

function Header({ user, onLogout }) {
  const displayName = user?.FULL_NAME || user?.USER_NAME || "Guest";
  return (
    <div className="header">
      <button>IECMS</button>
      <span>Hello, {displayName}</span>
      <div>
        <button>🔔</button>
        <button onClick={onLogout}>Logout</button>
      </div>
    </div>
  );
}

export default Header;
