import React, { useState } from "react";
import "..styles/DeviceForm.css";

function DeviceForm({ onAdd, user }) {
  const [deviceName, setDeviceName] = useState("");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState("On");
  const [kWh, setKWh] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!deviceName || !address || !status || kWh === "" || !user?.USER_ID) {
      return alert("Vui lòng điền đầy đủ thông tin");
    }

    try {
      const res = await fetch("http://localhost:5000/api/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          DEVICE_NAME: deviceName,
          ADDRESS: address,
          STATUS: status,
          kWh: parseFloat(kWh),
          USER_ID: user.USER_ID,
        }),
      });

      const newDevice = await res.json();
      onAdd(newDevice);

      setDeviceName("");
      setAddress("");
      setStatus("On");
      setKWh("");
    } catch (err) {
      console.error(err);
      alert("Thêm device thất bại");
    }
  };

  return (
    <form className="device-form" onSubmit={handleSubmit}>
      <input
        placeholder="Tên thiết bị"
        value={deviceName}
        onChange={(e) => setDeviceName(e.target.value)}
      />

      <select value={address} onChange={(e) => setAddress(e.target.value)}>
        <option value="">Chọn phòng</option>
        <option value="Phòng khách">Phòng khách</option>
        <option value="Phòng ngủ">Phòng ngủ</option>
        <option value="Nhà bếp">Nhà bếp</option>
        <option value="Phòng làm việc">Phòng làm việc</option>
      </select>

      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="On">On</option>
        <option value="Off">Off</option>
      </select>

      <input
        type="number"
        placeholder="kWh"
        value={kWh}
        onChange={(e) => setKWh(e.target.value)}
        min="0"
        step="0.01"
      />

      <button type="submit">Thêm thiết bị</button>
    </form>
  );
}

export default DeviceForm;
