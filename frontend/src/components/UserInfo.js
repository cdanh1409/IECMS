// UserInfo.js
import React, { useState, useEffect } from "react";
import "../styles/Setting.css"; // Dùng lại CSS Setting cho form đẹp
import { API_URL } from "../config";

function UserInfo({ userId }) {
  const [form, setForm] = useState({
    FULL_NAME: "",
    EMAIL: "",
    PHONE: "",
    ADDRESS: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_URL}/api/user/${userId}`);
        const data = await res.json();
        if (!res.ok)
          throw new Error(data.error || "Không thể tải thông tin user");

        setForm({
          FULL_NAME: data.FULL_NAME || "",
          EMAIL: data.EMAIL || "",
          PHONE: data.PHONE || "",
          ADDRESS: data.ADDRESS || "",
        });
      } catch (err) {
        console.error(err);
        setError(err.message || "Lỗi khi load user");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  if (loading) return <div>Đang tải thông tin user...</div>;
  if (error) return <div style={{ color: "red" }}>Lỗi: {error}</div>;

  const validate = () => {
    const errs = {};
    if (!form.FULL_NAME.trim())
      errs.FULL_NAME = "Họ và tên không được để trống";
    if (!form.EMAIL.trim()) errs.EMAIL = "Email không được để trống";
    if (!form.PHONE.trim()) errs.PHONE = "Số điện thoại không được để trống";
    if (!form.ADDRESS.trim()) errs.ADDRESS = "Địa chỉ không được để trống";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSaving(true);
      setError(null);
      const res = await fetch(`${API_URL}/api/user/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Cập nhật thất bại");
      alert("Cập nhật thông tin thành công!");
    } catch (err) {
      console.error(err);
      setError(err.message);
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="setting-container">
      <h2>Thông tin User</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Họ và tên
          {errors.FULL_NAME && (
            <span className="error visible">{errors.FULL_NAME}</span>
          )}
        </label>
        <input
          type="text"
          value={form.FULL_NAME}
          onChange={(e) => setForm({ ...form, FULL_NAME: e.target.value })}
        />

        <label>
          Email
          {errors.EMAIL && (
            <span className="error visible">{errors.EMAIL}</span>
          )}
        </label>
        <input
          type="email"
          value={form.EMAIL}
          onChange={(e) => setForm({ ...form, EMAIL: e.target.value })}
        />

        <label>
          Số điện thoại
          {errors.PHONE && (
            <span className="error visible">{errors.PHONE}</span>
          )}
        </label>
        <input
          type="text"
          value={form.PHONE}
          onChange={(e) => setForm({ ...form, PHONE: e.target.value })}
        />

        <label>
          Địa chỉ
          {errors.ADDRESS && (
            <span className="error visible">{errors.ADDRESS}</span>
          )}
        </label>
        <input
          type="text"
          value={form.ADDRESS}
          onChange={(e) => setForm({ ...form, ADDRESS: e.target.value })}
        />

        <div className="form-actions">
          <button type="submit" className="save-btn" disabled={saving}>
            {saving ? "Đang cập nhật..." : "Cập nhật"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default UserInfo;
