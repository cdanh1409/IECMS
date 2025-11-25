import React from "react";

function DeviceCard({ device, onDelete, onEdit }) {
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
      {" "}
      <h4>{device.name}</h4>{" "}
      <p>
        <strong>Device ID:</strong> {device.device_id}
      </p>{" "}
      <p>
        <strong>User ID:</strong> {device.user_id}
      </p>{" "}
      <p>
        <strong>Điện tiêu thụ:</strong> {device.kWh} kWh
      </p>{" "}
      <p>
        <strong>Thời gian sử dụng:</strong> {device.time}
      </p>{" "}
      <p>
        <strong>Địa chỉ:</strong> {device.address}
      </p>{" "}
      <p>
        <strong>Status:</strong> {device.status}
      </p>
      ```
      {/* Nút xóa */}
      <button
        onClick={onDelete}
        style={{
          position: "absolute",
          top: 5,
          right: 5,
          display: "inline-block",
          cursor: "pointer",
        }}
      >
        ❌
      </button>
      {/* Nút sửa */}
      <button
        onClick={onEdit}
        style={{
          position: "absolute",
          top: 5,
          right: 35,
          display: "inline-block",
          cursor: "pointer",
        }}
      >
        ✏️
      </button>
    </div>
  );
}

export default DeviceCard;
