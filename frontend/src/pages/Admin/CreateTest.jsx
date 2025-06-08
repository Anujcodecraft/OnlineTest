import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

export default function CreateTest() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: "",
    description: "",
    testCode: "",
    duration: "",
    startTime: "",
    endTime: "",
  });

  const [questions, setQuestions] = useState([
    { question: "", options: ["", "", "", ""], correctAnswer: 0 },
  ]);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const handleOptionChange = (qIdx, optIdx, value) => {
    const updated = [...questions];
    updated[qIdx].options[optIdx] = value;
    setQuestions(updated);
  };

  const addQuestion = () => {
    setQuestions([...questions, { question: "", options: ["", "", "", ""], correctAnswer: 0 }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      await axios.post(
        "http://localhost:5000/api/test/create",
        {
          ...form,
          duration: Number(form.duration),
          questions,
        },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setMessage("Test created successfully.");
      setForm({
        title: "",
        description: "",
        testCode: "",
        duration: "",
        startTime: "",
        endTime: "",
      });
      setQuestions([{ question: "", options: ["", "", "", ""], correctAnswer: 0 }]);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create test.");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Create Test</h2>
      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <input name="title" placeholder="Title" value={form.title} onChange={handleFormChange} required /><br />
        <input name="description" placeholder="Description" value={form.description} onChange={handleFormChange} /><br />
        <input name="testCode" placeholder="Test Code" value={form.testCode} onChange={handleFormChange} required /><br />
        <input name="duration" type="number" placeholder="Duration (mins)" value={form.duration} onChange={handleFormChange} required /><br />
        <input name="startTime" type="datetime-local" value={form.startTime} onChange={handleFormChange} required /><br />
        <input name="endTime" type="datetime-local" value={form.endTime} onChange={handleFormChange} required /><br />

        <h3>Questions</h3>
        {questions.map((q, i) => (
          <div key={i} style={{ border: "1px solid #ccc", padding: "1rem", marginBottom: "1rem" }}>
            <input
              type="text"
              placeholder={`Question ${i + 1}`}
              value={q.question}
              onChange={(e) => handleQuestionChange(i, "question", e.target.value)}
              required
            />
            {q.options.map((opt, j) => (
              <div key={j}>
                <input
                  type="text"
                  placeholder={`Option ${j + 1}`}
                  value={opt}
                  onChange={(e) => handleOptionChange(i, j, e.target.value)}
                  required
                />
              </div>
            ))}
            <label>
              Correct Answer Index (0-3):
              <input
                type="number"
                min="0"
                max="3"
                value={q.correctAnswer}
                onChange={(e) => handleQuestionChange(i, "correctAnswer", Number(e.target.value))}
                required
              />
            </label>
          </div>
        ))}

        <button type="button" onClick={addQuestion}>Add Question</button><br /><br />
        <button type="submit">Create Test</button>
      </form>
    </div>
  );
}
