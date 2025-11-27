import React, { useState } from "react";
import axios from "axios";
import "../styles/Login.css"; // import file CSS

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

      onLogin(res.data);
      alert(`Đăng nhập thành công! Chào ${res.data.FULL_NAME}`);
    } catch (err) {
      console.error("Login error:", err);
      alert(err.response?.data?.error || "Có lỗi xảy ra khi đăng nhập");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Đang đăng nhập..." : "Login"}
        </button>
      </form>
    </div>
  );
}

export default Login;
