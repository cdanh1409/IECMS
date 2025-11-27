// Login.js
import React, { useState } from "react";
import axios from "axios";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      alert("Vui lòng điền username và password");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/api/login", {
        username,
        password,
      });

      // Gọi callback onLogin với dữ liệu user từ server
      onLogin(res.data);
      alert(`Đăng nhập thành công! Chào ${res.data.USER_NAME}`);
    } catch (err) {
      console.error("Login error:", err);
      alert(
        err.response?.data?.error || "Có lỗi xảy ra khi đăng nhập, thử lại"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "#f0f2f5",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          padding: 30,
          background: "#fff",
          borderRadius: 8,
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
          width: 300,
        }}
      >
        <h2 style={{ textAlign: "center" }}>Login</h2>
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{
            display: "block",
            marginBottom: 10,
            width: "100%",
            padding: 8,
          }}
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            display: "block",
            marginBottom: 10,
            width: "100%",
            padding: 8,
          }}
        />
        <button
          type="submit"
          style={{
            width: "100%",
            padding: 10,
            background: "#1890ff",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
          disabled={loading}
        >
          {loading ? "Đang đăng nhập..." : "Login"}
        </button>
      </form>
    </div>
  );
}

export default Login;
