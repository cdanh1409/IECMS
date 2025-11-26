import React, { useState, useEffect } from "react";
import axios from "axios";

const addresses = ["Phòng khách", "Phòng ngủ", "Nhà bếp", "Phòng làm việc"];

export default function DeviceManager({ user, onDevicesUpdate }) {
  const [devices, setDevices] = useState([]);
  const [form, setForm] = useState({
    DEVICE_NAME: "",
    ADDRESS: addresses[0],
    STATUS: "ON",
    kWh: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    kWh: 0,
    STATUS: "ON",
    ADDRESS: addresses[0],
  });

  // Load devices từ backend
  useEffect(() => {
    if (!user?.USER_ID) return;
    const fetchDevices = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/devices/user/${user.USER_ID}`
        );
        const colored = res.data.map((d) => ({
          ...d,
          color:
            d.color || "#" + Math.floor(Math.random() * 16777215).toString(16),
          kWh: Number(d.kWh ?? 0),
        }));
        setDevices(colored);
        if (onDevicesUpdate) onDevicesUpdate(colored);
      } catch (err) {
        console.error("❌ Error fetching devices:", err);
      }
    };
    fetchDevices();
  }, [user, onDevicesUpdate]);

  // Thêm device
  const handleAddDevice = async () => {
    if (!form.DEVICE_NAME.trim() || !form.kWh) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/devices", {
        DEVICE_NAME: form.DEVICE_NAME,
        ADDRESS: form.ADDRESS,
        STATUS: form.STATUS,
        kWh: Number(form.kWh),
        USER_ID: Number(user.USER_ID),
      });

      const newDevice = {
        ...res.data,
        color: "#" + Math.floor(Math.random() * 16777215).toString(16),
      };

      const updatedDevices = [...devices, newDevice];
      setDevices(updatedDevices);
      if (onDevicesUpdate) onDevicesUpdate(updatedDevices);

      // Reset form
      setForm({
        DEVICE_NAME: "",
        ADDRESS: addresses[0],
        STATUS: "ON",
        kWh: "",
      });
    } catch (err) {
      console.error("❌ Error adding device:", err);
      alert("Lỗi khi thêm thiết bị");
    }
  };

  // Xóa device
  const handleDelete = async (DEVICE_ID) => {
    try {
      await axios.delete(`http://localhost:5000/api/devices/${DEVICE_ID}`);
      const updatedDevices = devices.filter((d) => d.DEVICE_ID !== DEVICE_ID);
      setDevices(updatedDevices);
      if (onDevicesUpdate) onDevicesUpdate(updatedDevices);
    } catch (err) {
      console.error("❌ Error deleting device:", err);
      alert("Xóa thiết bị thất bại");
    }
  };

  // Bắt đầu edit
  const startEdit = (device) => {
    setEditingId(device.DEVICE_ID);
    setEditData({
      kWh: device.kWh,
      STATUS: device.STATUS,
      ADDRESS: device.ADDRESS,
    });
  };

  // Lưu edit
  const saveEdit = async (DEVICE_ID) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/devices/${DEVICE_ID}`,
        editData
      );
      const updatedDevices = devices.map((d) =>
        d.DEVICE_ID === DEVICE_ID ? res.data : d
      );
      setDevices(updatedDevices);
      if (onDevicesUpdate) onDevicesUpdate(updatedDevices);
      setEditingId(null);
    } catch (err) {
      console.error("❌ Error updating device:", err);
      alert("Cập nhật thất bại");
    }
  };

  return (
    <div
      style={{
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
      }}
    >
      {/* FORM THÊM DEVICE */}
      <div
        style={{
          backgroundColor: "#fff",
          padding: "26px",
          borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          maxWidth: "600px",
        }}
      >
        <h3>Thêm thiết bị mới</h3>
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
          <option>ON</option>
          <option>OFF</option>
        </select>
        <input
          type="number"
          placeholder="kWh"
          value={form.kWh}
          onChange={(e) => setForm({ ...form, kWh: e.target.value })}
          style={{
            width: "100%",
            marginBottom: "12px",
            padding: "8px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />
        <button
          onClick={handleAddDevice}
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

      {/* DANH SÁCH DEVICE */}
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

            {editingId === d.DEVICE_ID ? (
              <>
                <input
                  type="number"
                  value={editData.kWh}
                  onChange={(e) =>
                    setEditData({ ...editData, kWh: Number(e.target.value) })
                  }
                  style={{ width: "100%", marginBottom: "8px" }}
                />
                <select
                  value={editData.STATUS}
                  onChange={(e) =>
                    setEditData({ ...editData, STATUS: e.target.value })
                  }
                  style={{ width: "100%", marginBottom: "8px" }}
                >
                  <option>ON</option>
                  <option>OFF</option>
                </select>
                <select
                  value={editData.ADDRESS}
                  onChange={(e) =>
                    setEditData({ ...editData, ADDRESS: e.target.value })
                  }
                  style={{ width: "100%", marginBottom: "8px" }}
                >
                  {addresses.map((a) => (
                    <option key={a}>{a}</option>
                  ))}
                </select>
                <button
                  onClick={() => saveEdit(d.DEVICE_ID)}
                  style={{ marginRight: "8px" }}
                >
                  💾 Lưu
                </button>
                <button onClick={() => setEditingId(null)}>❌ Hủy</button>
              </>
            ) : (
              <>
                <p>
                  <strong>Địa chỉ:</strong> {d.ADDRESS}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    style={{ color: d.STATUS === "ON" ? "#4caf50" : "#f44336" }}
                  >
                    {d.STATUS}
                  </span>
                </p>
                <p>
                  <strong>kWh:</strong> {d.kWh}
                </p>
                <button
                  onClick={() => startEdit(d)}
                  style={{ marginRight: "8px" }}
                >
                  ✏️ Sửa
                </button>
                <button onClick={() => handleDelete(d.DEVICE_ID)}>
                  ❌ Xóa
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
