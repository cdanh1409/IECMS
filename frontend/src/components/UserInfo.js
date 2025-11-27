// UserInfo.js
import React, { useState, useEffect } from "react";
import "../UserInfo.css";
import vietNamAddress from "../data/vietNamAddress.json";

function UserInfo({ userId }) {
  const [user, setUser] = useState(null); // dữ liệu user từ server
  const [formData, setFormData] = useState({
    FULL_NAME: "",
    EMAIL: "",
    PHONE: "",
    houseNumber: "",
    address: "",
  });
  const [errors, setErrors] = useState({});
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");

  // --- Load user từ server ---
  useEffect(() => {
    if (!userId) return;
    fetch(`http://localhost:5000/api/user/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setUser(data);
        // parse địa chỉ thành houseNumber, ward, district, city nếu muốn
        const addrParts = (data.ADDRESS || "").split(",").map((p) => p.trim());
        setFormData({
          FULL_NAME: data.FULL_NAME || "",
          EMAIL: data.EMAIL || "",
          PHONE: data.PHONE || "",
          houseNumber: addrParts[0] || "",
          address: data.ADDRESS || "",
        });
        setSelectedWard(addrParts[1] || "");
        setSelectedDistrict(addrParts[2] || "");
        setSelectedCity(addrParts[3] || "");
      })
      .catch((err) => console.error("❌ Lỗi load user:", err));
  }, [userId]);

  // --- Cập nhật địa chỉ khi chọn địa chỉ ---
  useEffect(() => {
    const parts = [
      formData.houseNumber,
      selectedWard,
      selectedDistrict,
      selectedCity,
    ].filter(Boolean);
    setFormData((prev) => ({ ...prev, address: parts.join(", ") }));
  }, [formData.houseNumber, selectedCity, selectedDistrict, selectedWard]);

  // --- Validation ---
  const validate = () => {
    const errs = {};
    if (!formData.FULL_NAME.trim()) errs.FULL_NAME = "Tên không được để trống";
    if (!formData.EMAIL.trim()) errs.EMAIL = "Email không được để trống";
    else if (!/^\S+@\S+\.\S+$/.test(formData.EMAIL))
      errs.EMAIL = "Email không hợp lệ";
    if (!formData.PHONE.trim()) errs.PHONE = "SĐT không được để trống";
    else if (!/^\d{9,11}$/.test(formData.PHONE))
      errs.PHONE = "SĐT không hợp lệ";
    if (!formData.houseNumber.trim())
      errs.houseNumber = "Số nhà không được để trống";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // --- Submit form ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/user/${Number(userId)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            FULL_NAME: formData.FULL_NAME,
            EMAIL: formData.EMAIL,
            PHONE: formData.PHONE,
            ADDRESS: formData.address,
          }),
        }
      );
      const data = await res.json();
      console.log("Server response:", data);
      if (res.ok) {
        alert("Cập nhật thành công!");
        setUser(data); // update lại state user
      } else {
        alert("Cập nhật thất bại: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra khi cập nhật user.");
    }
  };

  // --- Lọc districts và wards ---
  const districts = selectedCity
    ? vietNamAddress.find((c) => c.label === selectedCity)?.districts || []
    : [];
  const wards = selectedDistrict
    ? districts.find((d) => d.label === selectedDistrict)?.wards || []
    : [];

  if (!user) return <div>Đang tải thông tin user...</div>;

  return (
    <div className="user-info-container">
      <h2>Thông tin User</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Tên đầy đủ (*)
          <span className={`error ${errors.FULL_NAME ? "visible" : ""}`}>
            {errors.FULL_NAME}
          </span>
        </label>
        <input
          type="text"
          value={formData.FULL_NAME}
          onChange={(e) =>
            setFormData({ ...formData, FULL_NAME: e.target.value })
          }
        />

        <label>
          Email (*)
          <span className={`error ${errors.EMAIL ? "visible" : ""}`}>
            {errors.EMAIL}
          </span>
        </label>
        <input
          type="email"
          value={formData.EMAIL}
          onChange={(e) => setFormData({ ...formData, EMAIL: e.target.value })}
        />

        <label>
          Số điện thoại (*)
          <span className={`error ${errors.PHONE ? "visible" : ""}`}>
            {errors.PHONE}
          </span>
        </label>
        <input
          type="text"
          value={formData.PHONE}
          onChange={(e) => setFormData({ ...formData, PHONE: e.target.value })}
        />

        <label>Chọn địa chỉ</label>
        <div className="address-select-container">
          <select
            value={selectedCity}
            onChange={(e) => {
              setSelectedCity(e.target.value);
              setSelectedDistrict("");
              setSelectedWard("");
            }}
          >
            <option value="">--Chọn Thành phố--</option>
            {vietNamAddress.map((c, idx) => (
              <option key={`${c.label}-${idx}`} value={c.label}>
                {c.label}
              </option>
            ))}
          </select>

          <select
            value={selectedDistrict}
            onChange={(e) => {
              setSelectedDistrict(e.target.value);
              setSelectedWard("");
            }}
            disabled={!selectedCity}
          >
            <option value="">--Chọn Quận/Huyện--</option>
            {districts.map((d, idx) => (
              <option key={`${d.label}-${idx}`} value={d.label}>
                {d.label}
              </option>
            ))}
          </select>

          <select
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
            disabled={!selectedDistrict}
          >
            <option value="">--Chọn Phường/Xã--</option>
            {wards.map((w, idx) => (
              <option key={`${w}-${idx}`} value={w}>
                {w}
              </option>
            ))}
          </select>
        </div>

        <label>
          Số nhà (*)
          <span className={`error ${errors.houseNumber ? "visible" : ""}`}>
            {errors.houseNumber}
          </span>
        </label>
        <input
          type="text"
          value={formData.houseNumber}
          placeholder="Nhập số nhà"
          onChange={(e) =>
            setFormData({ ...formData, houseNumber: e.target.value })
          }
        />

        <label>Địa chỉ chi tiết</label>
        <input
          type="text"
          value={formData.address}
          placeholder="Địa chỉ đầy đủ sẽ hiển thị ở đây"
          readOnly
        />

        <div className="form-actions">
          <button type="submit" className="save-btn">
            Lưu
          </button>
          <button
            type="button"
            className="cancel-btn"
            onClick={() => {
              // Reset chỉ phần địa chỉ
              setFormData((prev) => ({
                ...prev,
                FULL_NAME: "",
                EMAIL: "",
                PHONE: "",
                houseNumber: "",
                address: "",
              }));
              setSelectedCity("");
              setSelectedDistrict("");
              setSelectedWard("");
              setErrors((prev) => ({
                ...prev,
                houseNumber: undefined, // xóa lỗi số nhà nếu có
              }));
            }}
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}

export default UserInfo;
