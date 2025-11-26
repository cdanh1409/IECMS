import React from "react";

function Header({ user, onLogout }) {
  return (
    <div className="header">
      <button style={{ marginLeft: 20 }}>IECMS</button>
      <span style={{ marginRight: 20 }}>Hello, {user.name}</span>
      <button style={{ marginRight: 10 }}>🔔</button>
      <button onClick={onLogout}>Logout</button>
    </div>
  );
}

export default Header;
