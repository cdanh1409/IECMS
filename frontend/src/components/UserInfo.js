import React, { useState, useEffect } from "react";
import "../styles/UserInfo.css";

function UserInfo({ userId }) {
  const [form, setForm] = useState({
    FULL_NAME: "",
    EMAIL: "",
    PHONE: "",
    CITY: "",
    DISTRICT: "",
    WARD: "",
    STREET: "",
    FULL_ADDRESS: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Load user info
  useEffect(() => {
    if (!userId) return;

    const fetchUser = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:5000/api/user/${userId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Không thể tải user");

        // Giả sử địa chỉ backend lưu dạng 1 string, tách ra
        const addrParts = (data.ADDRESS || "").split(",").map((s) => s.trim());
        setForm({
          FULL_NAME: data.FULL_NAME || "",
          EMAIL: data.EMAIL || "",
          PHONE: data.PHONE || "",
          CITY: addrParts[0] || "",
          DISTRICT: addrParts[1] || "",
          WARD: addrParts[2] || "",
          STREET: addrParts[3] || "",
          FULL_ADDRESS: data.ADDRESS || "",
        });
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  // Cập nhật FULL_ADDRESS khi bất cứ ô nào thay đổi
  useEffect(() => {
    const parts = [form.STREET, form.WARD, form.DISTRICT, form.CITY]
      .filter(Boolean)
      .join(", ");
    setForm((f) => ({ ...f, FULL_ADDRESS: parts }));
  }, [form.STREET, form.WARD, form.DISTRICT, form.CITY]);

  const validate = () => {
    const errs = {};
    if (!form.FULL_NAME.trim())
      errs.FULL_NAME = "Họ và tên không được để trống";
    if (!form.EMAIL.trim()) errs.EMAIL = "Email không được để trống";
    if (!form.PHONE.trim()) errs.PHONE = "Số điện thoại không được để trống";
    if (!form.CITY) errs.CITY = "Chọn Thành phố/Tỉnh";
    if (!form.DISTRICT) errs.DISTRICT = "Chọn Quận/Huyện";
    if (!form.WARD) errs.WARD = "Chọn Phường/Xã";
    if (!form.STREET.trim()) errs.STREET = "Nhập đường/số nhà";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSaving(true);
      const payload = {
        FULL_NAME: form.FULL_NAME,
        EMAIL: form.EMAIL,
        PHONE: form.PHONE,
        ADDRESS: form.FULL_ADDRESS,
      };
      const res = await fetch(`http://localhost:5000/api/user/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Cập nhật thất bại");
      alert("Cập nhật thông tin thành công!");
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Đang tải thông tin user...</div>;
  if (error) return <div style={{ color: "red" }}>Lỗi: {error}</div>;

  return (
    <div className="user-info-container">
      <h2>Thông tin User</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Họ và tên
          {errors.FULL_NAME && (
            <span className="error">{errors.FULL_NAME}</span>
          )}
        </label>
        <input
          type="text"
          value={form.FULL_NAME}
          onChange={(e) => setForm({ ...form, FULL_NAME: e.target.value })}
        />

        <label>
          Email
          {errors.EMAIL && <span className="error">{errors.EMAIL}</span>}
        </label>
        <input
          type="email"
          value={form.EMAIL}
          onChange={(e) => setForm({ ...form, EMAIL: e.target.value })}
        />

        <label>
          Số điện thoại
          {errors.PHONE && <span className="error">{errors.PHONE}</span>}
        </label>
        <input
          type="text"
          value={form.PHONE}
          onChange={(e) => setForm({ ...form, PHONE: e.target.value })}
        />

        <label>Địa chỉ</label>
        <div className="address-row">
          <input
            type="text"
            placeholder="Đường/Số nhà"
            value={form.STREET}
            onChange={(e) => setForm({ ...form, STREET: e.target.value })}
          />
          <input
            type="text"
            placeholder="Phường/Xã"
            value={form.WARD}
            onChange={(e) => setForm({ ...form, WARD: e.target.value })}
          />
          <input
            type="text"
            placeholder="Quận/Huyện"
            value={form.DISTRICT}
            onChange={(e) => setForm({ ...form, DISTRICT: e.target.value })}
          />
          <input
            type="text"
            placeholder="Thành phố/Tỉnh"
            value={form.CITY}
            onChange={(e) => setForm({ ...form, CITY: e.target.value })}
          />
        </div>

        <label>Địa chỉ đầy đủ</label>
        <input type="text" value={form.FULL_ADDRESS} readOnly />

        <div className="button-row">
          <button type="submit" className="save-btn" disabled={saving}>
            {saving ? "Đang cập nhật..." : "Cập nhật"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default UserInfo;
