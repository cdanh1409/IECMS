import React from "react";

function Sidebar({ activeMenu, setActiveMenu, user }) {
  const menuItems = ["Dashboard", "Device", "Setting"];

  return (
    <div
      style={{
        width: "220px",
        minHeight: "100vh",
        backgroundColor: "#000a2eff",
        color: "#fff",
        padding: "16px",
        boxSizing: "border-box",
      }}
    >
      {/* User info */}
      <div
        style={{ display: "flex", alignItems: "center", marginBottom: "32px" }}
      >
        <div
          style={{
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            backgroundColor: "#af814cff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            fontSize: "18px",
            marginRight: "12px",
            color: "#fff",
          }}
        >
          {user.USER_NAME.charAt(0)}{" "}
        </div>{" "}
        <div>
          <div style={{ fontWeight: "bold" }}>{user.USER_NAME}</div>
          <div style={{ fontSize: "12px", color: "#aaa" }}>Online</div>{" "}
        </div>{" "}
      </div>

      {/* Menu */}
      <div>
        {menuItems.map((item) => (
          <div
            key={item}
            onClick={() => setActiveMenu(item)}
            style={{
              padding: "12px",
              borderRadius: "6px",
              backgroundColor: activeMenu === item ? "#00ad17ff" : "transparent",
              cursor: "pointer",
              marginBottom: "8px",
            }}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Sidebar;
