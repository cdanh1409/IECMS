import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/DeviceManager.css";

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

  // Load device
  useEffect(() => {
    if (!user?.USER_ID) return;
    const fetchDevices = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/devices/user/${user.USER_ID}`
        );
        const result = res.data.map((d) => ({
          ...d,
          color:
            d.color || "#" + Math.floor(Math.random() * 16777215).toString(16),
          kWh: Number(d.kWh ?? 0),
        }));

        setDevices(result);
        onDevicesUpdate && onDevicesUpdate(result);
      } catch (err) {
        console.error("Error fetching devices:", err);
      }
    };
    fetchDevices();
  }, [user, onDevicesUpdate]);

  // Add device
  const handleAddDevice = async () => {
    if (!form.DEVICE_NAME.trim() || !form.kWh) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/devices", {
        ...form,
        kWh: Number(form.kWh),
        USER_ID: Number(user.USER_ID),
      });

      const newDevice = {
        ...res.data,
        color: "#" + Math.floor(Math.random() * 16777215).toString(16),
      };

      const updated = [...devices, newDevice];
      setDevices(updated);
      onDevicesUpdate && onDevicesUpdate(updated);

      setForm({
        DEVICE_NAME: "",
        ADDRESS: addresses[0],
        STATUS: "ON",
        kWh: "",
      });
    } catch (err) {
      console.error("Error adding device:", err);
      alert("Lỗi khi thêm thiết bị");
    }
  };

  // Delete device
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/devices/${id}`);
      const updated = devices.filter((d) => d.DEVICE_ID !== id);
      setDevices(updated);
      onDevicesUpdate && onDevicesUpdate(updated);
    } catch (err) {
      alert("Xóa thất bại");
    }
  };

  // Start editing
  const startEdit = (device) => {
    setEditingId(device.DEVICE_ID);
    setEditData({
      kWh: device.kWh,
      STATUS: device.STATUS,
      ADDRESS: device.ADDRESS,
    });
  };

  // Save edit
  const saveEdit = async (id) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/devices/${id}`,
        editData
      );

      const updated = devices.map((d) => (d.DEVICE_ID === id ? res.data : d));

      setDevices(updated);
      onDevicesUpdate && onDevicesUpdate(updated);
      setEditingId(null);
    } catch {
      alert("Cập nhật thất bại");
    }
  };

  return (
    <div className="device-manager">
      {/* FORM */}
      <div className="device-form">
        <h3>Thêm thiết bị mới</h3>

        <input
          className="device-input"
          type="text"
          placeholder="Tên thiết bị"
          value={form.DEVICE_NAME}
          onChange={(e) => setForm({ ...form, DEVICE_NAME: e.target.value })}
        />

        <select
          className="device-select"
          value={form.ADDRESS}
          onChange={(e) => setForm({ ...form, ADDRESS: e.target.value })}
        >
          {addresses.map((a) => (
            <option key={a}>{a}</option>
          ))}
        </select>

        <select
          className="device-select"
          value={form.STATUS}
          onChange={(e) => setForm({ ...form, STATUS: e.target.value })}
        >
          <option>ON</option>
          <option>OFF</option>
        </select>

        <input
          className="device-input"
          type="number"
          placeholder="kWh"
          value={form.kWh}
          onChange={(e) => setForm({ ...form, kWh: e.target.value })}
        />

        <button className="device-add-btn" onClick={handleAddDevice}>
          Thêm thiết bị
        </button>
      </div>

      {/* LIST */}
      <div className="device-list">
        {devices.map((d) => (
          <div
            key={d.DEVICE_ID}
            className="device-card"
            style={{ borderLeftColor: d.color }}
          >
            <h4>{d.DEVICE_NAME}</h4>

            {editingId === d.DEVICE_ID ? (
              <>
                <input
                  className="device-edit-input"
                  type="number"
                  value={editData.kWh}
                  onChange={(e) =>
                    setEditData({ ...editData, kWh: Number(e.target.value) })
                  }
                />

                <select
                  className="device-edit-select"
                  value={editData.STATUS}
                  onChange={(e) =>
                    setEditData({ ...editData, STATUS: e.target.value })
                  }
                >
                  <option>ON</option>
                  <option>OFF</option>
                </select>

                <select
                  className="device-edit-select"
                  value={editData.ADDRESS}
                  onChange={(e) =>
                    setEditData({ ...editData, ADDRESS: e.target.value })
                  }
                >
                  {addresses.map((a) => (
                    <option key={a}>{a}</option>
                  ))}
                </select>

                <button
                  className="device-btn"
                  onClick={() => saveEdit(d.DEVICE_ID)}
                >
                  💾 Lưu
                </button>
                <button
                  className="device-btn"
                  onClick={() => setEditingId(null)}
                >
                  ❌ Hủy
                </button>
              </>
            ) : (
              <>
                <p>
                  <strong>Địa chỉ:</strong> {d.ADDRESS}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={d.STATUS === "ON" ? "status-on" : "status-off"}
                  >
                    {d.STATUS}
                  </span>
                </p>
                <p>
                  <strong>kWh:</strong> {d.kWh}
                </p>

                <button className="device-btn" onClick={() => startEdit(d)}>
                  ✏️ Sửa
                </button>
                <button
                  className="device-btn"
                  onClick={() => handleDelete(d.DEVICE_ID)}
                >
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
