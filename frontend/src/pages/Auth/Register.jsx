import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/register",
        form
      );

      const decoded = JSON.parse(atob(res.data.token.split('.')[1]));
      login(res.data.token, decoded.role);

      if (decoded.role === "admin") navigate("/admin/create");
      else navigate("/join");

    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Register</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          required
        /><br /><br />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        /><br /><br />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        /><br /><br />
        <label>Role: </label>
        <select name="role" value={form.role} onChange={handleChange}>
          <option value="student">Student</option>
          <option value="admin">Admin</option>
        </select><br /><br />
        <button type="submit">Register</button>
      </form>
    </div>
  );
}
