import React from "react";
import "../styles/Header.css";

function Header({ user, onLogout }) {
  const displayName = user?.FULL_NAME || user?.USER_NAME || "Guest";

  return (
    <header className="header">
      {/* Logo / App name */}
      <div className="header-title">
        <button>IECMS</button>
      </div>

      {/* User greeting */}
      <span className="header-user">Hello, {displayName}</span>

      {/* Buttons */}
      <div className="header-buttons">
        <button>🔔</button>
        <button onClick={onLogout}>Logout</button>
        {/* Nếu cần thêm nút khác, sẽ scroll ngang tự động trên mobile */}
      </div>
    </header>
  );
}

export default Header;
