// Device.js
import React, { useState, useEffect } from "react";

const addresses = ["Phòng khách", "Phòng ngủ", "Nhà bếp", "Phòng làm việc"];

function Device({ user, devices: initialDevices = [], onDevicesUpdate }) {
  const [devices, setDevices] = useState([]);

  const [form, setForm] = useState({
    DEVICE_NAME: "",
    ADDRESS: addresses[0],
    STATUS: "On",
  });

  // Load thiết bị ban đầu (CHẠY MỘT LẦN)
  useEffect(() => {
    const coloredDevices = initialDevices.map((d) => ({
      ...d,
      color: d.color || "#" + Math.floor(Math.random() * 16777215).toString(16),
    }));

    setDevices(coloredDevices);

    if (onDevicesUpdate) onDevicesUpdate(coloredDevices);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // bỏ dependency → chạy 1 lần

  // ===========================
  // THÊM THIẾT BỊ
  // ===========================
  const handleAdd = () => {
    if (!form.DEVICE_NAME.trim()) {
      alert("Nhập Tên thiết bị");
      return;
    }

    const newDevice = {
      DEVICE_ID: devices.length + 1,
      USER_ID: user?.USER_ID || 100,
      DEVICE_NAME: form.DEVICE_NAME,
      ADDRESS: form.ADDRESS,
      STATUS: form.STATUS,
      color: "#" + Math.floor(Math.random() * 16777215).toString(16),
    };

    const updatedDevices = [...devices, newDevice];
    setDevices(updatedDevices);

    if (onDevicesUpdate) onDevicesUpdate(updatedDevices);

    // Reset form
    setForm({
      DEVICE_NAME: "",
      ADDRESS: addresses[0],
      STATUS: "On",
    });
  };

  // ===========================
  // JSX RENDER
  // ===========================
  return (
    <div
      style={{
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
      }}
    >
      {/* FORM THÊM THIẾT BỊ */}
      <div
        style={{
          backgroundColor: "#fff",
          padding: "26px",
          borderRadius: "26px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          maxWidth: "2000px",
        }}
      >
        <h3>Thêm thiết bị mới</h3>

        {/* Tên thiết bị */}
        <input
          type="text"
          placeholder="Tên thiết bị"
          value={form.DEVICE_NAME}
          onChange={(e) => setForm({ ...form, DEVICE_NAME: e.target.value })}
          style={{
            width: "100%",
            marginBottom: "12px",
            padding: "8px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />

        {/* Địa chỉ */}
        <select
          value={form.ADDRESS}
          onChange={(e) => setForm({ ...form, ADDRESS: e.target.value })}
          style={{
            width: "100%",
            marginBottom: "12px",
            padding: "8px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        >
          {addresses.map((a) => (
            <option key={a}>{a}</option>
          ))}
        </select>

        {/* Trạng thái */}
        <select
          value={form.STATUS}
          onChange={(e) => setForm({ ...form, STATUS: e.target.value })}
          style={{
            width: "100%",
            marginBottom: "12px",
            padding: "8px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        >
          <option>On</option>
          <option>Off</option>
        </select>

        <button
          onClick={handleAdd}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "6px",
            border: "none",
            backgroundColor: "#4caf50",
            color: "#fff",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Thêm thiết bị
        </button>
      </div>

      {/* DANH SÁCH THIẾT BỊ */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
        {devices.map((d) => (
          <div
            key={d.DEVICE_ID}
            style={{
              flex: "1 1 220px",
              backgroundColor: "#fff",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              padding: "16px",
              borderLeft: `6px solid ${d.color}`,
              transition: "transform 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.03)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <h4>{d.DEVICE_NAME}</h4>
            <p>
              <strong>Địa chỉ:</strong> {d.ADDRESS}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span
                style={{
                  color: d.STATUS === "On" ? "#4caf50" : "#f44336",
                }}
              >
                {d.STATUS}
              </span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Device;
