// DeviceCard.js
import React, { useState } from "react";

function DeviceCard({ device, onDelete, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    kWh: device.kWh,
    STATUS: device.STATUS,
    ADDRESS: device.ADDRESS,
  });

  const handleSave = () => {
    onUpdate({ ...device, ...editData });
    setIsEditing(false);
  };

  return (
    <div
      style={{
        padding: 15,
        background: "#fff",
        borderRadius: 8,
        boxShadow: "0 0 5px rgba(0,0,0,0.1)",
        position: "relative",
        width: 250,
        margin: 10,
      }}
    >
      <h4>{device.DEVICE_NAME || device.name}</h4>

      {!isEditing ? (
        <>
          <p>kWh: {device.kWh}</p>
          <p>Status: {device.STATUS}</p>
          <p>Address: {device.ADDRESS}</p>
        </>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <input
            type="number"
            value={editData.kWh}
            onChange={(e) =>
              setEditData({ ...editData, kWh: Number(e.target.value) })
            }
          />
          <input
            type="text"
            value={editData.STATUS}
            onChange={(e) =>
              setEditData({ ...editData, STATUS: e.target.value })
            }
          />
          <input
            type="text"
            value={editData.ADDRESS}
            onChange={(e) =>
              setEditData({ ...editData, ADDRESS: e.target.value })
            }
          />
        </div>
      )}

      <div
        style={{
          position: "absolute",
          top: 5,
          right: 5,
          display: "flex",
          gap: 5,
        }}
      >
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
