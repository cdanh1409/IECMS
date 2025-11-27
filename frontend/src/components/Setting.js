// Setting.js
import React, { useState } from "react";
import "../styles/Setting.css";

function Setting({ userId }) {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Validation trước khi submit
  const validate = () => {
    const errs = {};
    if (!form.currentPassword.trim())
      errs.currentPassword = "Nhập mật khẩu hiện tại";
    if (!form.newPassword.trim()) errs.newPassword = "Nhập mật khẩu mới";
    if (form.newPassword && form.newPassword.length < 6)
      errs.newPassword = "Mật khẩu mới ít nhất 6 ký tự";
    if (form.newPassword !== form.confirmPassword)
      errs.confirmPassword = "Xác nhận mật khẩu không khớp";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSaving(true);
      const res = await fetch(
        `http://localhost:5000/api/user/${userId}/change-password`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentPassword: form.currentPassword,
            newPassword: form.newPassword,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Đổi mật khẩu thất bại");
      alert("Mật khẩu đã được đổi thành công!");

      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setErrors({});
    } catch (err) {
      alert(err.message);
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="setting-container">
      <h2>Đổi mật khẩu</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Mật khẩu hiện tại
          {errors.currentPassword && (
            <span className="error">{errors.currentPassword}</span>
          )}
        </label>
        <input
          type="password"
          value={form.currentPassword}
          onChange={(e) =>
            setForm({ ...form, currentPassword: e.target.value })
          }
        />

        <label>
          Mật khẩu mới
          {errors.newPassword && (
            <span className="error">{errors.newPassword}</span>
          )}
        </label>
        <input
          type="password"
          value={form.newPassword}
          onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
        />

        <label>
          Xác nhận mật khẩu
          {errors.confirmPassword && (
            <span className="error">{errors.confirmPassword}</span>
          )}
        </label>
        <input
          type="password"
          value={form.confirmPassword}
          onChange={(e) =>
            setForm({ ...form, confirmPassword: e.target.value })
          }
        />

        <button type="submit" disabled={saving}>
          {saving ? "Đang cập nhật..." : "Đổi mật khẩu"}
        </button>
      </form>
    </div>
  );
}

export default Setting;
