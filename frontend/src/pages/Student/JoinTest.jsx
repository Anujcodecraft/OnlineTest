import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function JoinTest() {
  const [testCode, setTestCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleJoin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/api/assessment/start",
        { testCode },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      localStorage.setItem("assessment", JSON.stringify(res.data.assessment));
      localStorage.setItem("testCode", testCode);
      navigate("/take");
    } catch (err) {
      setError(err.response?.data?.message || "Could not join test");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Join Test</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleJoin}>
        <input
          type="text"
          placeholder="Enter Test Code"
          value={testCode}
          onChange={(e) => setTestCode(e.target.value)}
          required
        />
        <br /><br />
        <button type="submit">Start Test</button>
      </form>
    </div>
  );
}
