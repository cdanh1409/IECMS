import React, { useState } from "react";
import "../styles/DeviceCard.css";

function DeviceCard({ device, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    kWh: device.kWh,
    STATUS: device.STATUS,
    ADDRESS: device.ADDRESS,
  });

  const handleSave = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/devices/${device.DEVICE_ID}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editData),
        }
      );
      const updated = await res.json();
      onUpdate(updated);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert("Cập nhật thất bại");
    }
  };

  return (
    <div className="device-card">
      <h4>{device.DEVICE_NAME}</h4>

      {!isEditing ? (
        <div className="device-info">
          <p>kWh: {device.kWh}</p>
          <p>Status: {device.STATUS}</p>
          <p>Address: {device.ADDRESS}</p>
        </div>
      ) : (
        <div className="device-edit">
          <input
            type="number"
            value={editData.kWh}
            onChange={(e) =>
              setEditData({ ...editData, kWh: parseFloat(e.target.value) })
            }
            min="0"
            step="0.01"
          />
          <select
            value={editData.STATUS}
            onChange={(e) =>
              setEditData({ ...editData, STATUS: e.target.value })
            }
          >
            <option value="On">On</option>
            <option value="Off">Off</option>
          </select>

          <input
            type="text"
            value={editData.ADDRESS}
            onChange={(e) =>
              setEditData({ ...editData, ADDRESS: e.target.value })
            }
          />
        </div>
      )}

      <div className="device-actions">
        {!isEditing ? (
          <>
            <button onClick={() => setIsEditing(true)}>✏️</button>
            <button onClick={onDelete}>❌</button>
          </>
        ) : (
          <>
            <button onClick={handleSave}>💾</button>
            <button onClick={() => setIsEditing(false)}>❌</button>
          </>
        )}
      </div>
    </div>
  );
}

export default DeviceCard;
