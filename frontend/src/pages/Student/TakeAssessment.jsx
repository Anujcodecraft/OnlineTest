import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // Make sure this context exists

export default function TakeAssessment() {
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  const testCode = localStorage.getItem("testCode");

  useEffect(() => {
    if (!testCode) return;

    axios
      .get(`http://localhost:5000/api/test/join/${testCode}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      })
      .then((res) => {
        setTest(res.data);
        setAnswers(Array(res.data.questions.length).fill(null));
      })
      .catch((err) => {
        console.error(err);
      });
  }, [testCode, user.token]);

  const handleSelect = (qIndex, optIndex) => {
    const newAnswers = [...answers];
    newAnswers[qIndex] = optIndex;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/assessment/submit",
        {
          testCode,
          userAnswers: answers,
        },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );

      localStorage.setItem("result", JSON.stringify(res.data));
      navigate("/result");
    } catch (err) {
      console.error(err.response?.data?.message || "Error submitting test");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Take Test</h2>
      {!test ? (
        <p>Loading test...</p>
      ) : (
        <>
          {test.questions.map((q, i) => (
            <div key={i} style={{ marginBottom: "1rem" }}>
              <strong>
                Q{i + 1}: {q.question}
              </strong>
              <div>
                {q.options.map((opt, j) => (
                  <div key={j}>
                    <label>
                      <input
                        type="radio"
                        name={`q${i}`}
                        checked={answers[i] === j}
                        onChange={() => handleSelect(i, j)}
                      />
                      {opt}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <button onClick={handleSubmit}>Submit Assessment</button>
        </>
      )}
    </div>
  );
}
