// File: src/pages/TakeAssessment.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/mode-c_cpp";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/mode-javascript";
import styled from "styled-components";
import { CheckCircle, AlertCircle, Clock, Send } from "lucide-react";

const Container = styled.div`
  padding: 2rem;
  background: #f9fafb;
  min-height: 100vh;
`;

const AssessmentContainer = styled.div`
  max-width: 900px;
  margin: auto;
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #4f46e5;
  font-weight: 700;
`;

const ErrorMessage = styled.div`
  background: #fee2e2;
  color: #991b1b;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 8px;
`;

const LoadingMessage = styled.div`
  text-align: center;
  color: #6b7280;
  font-size: 1.125rem;
`;

const TestInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
  gap: 1rem;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #374151;
`;

const QuestionCard = styled.div`
  border: 1px solid #e5e7eb;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
`;

const QuestionText = styled.div`
  font-weight: 600;
  margin-bottom: 1rem;
  display: flex;
  gap: 0.75rem;
`;

const QuestionNumber = styled.span`
  color: #4f46e5;
`;

const OptionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const OptionLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  cursor: pointer;
  background: ${(props) => (props.selected ? "#eef2ff" : "#fff")};
`;

const RadioInput = styled.input`
  accent-color: #6366f1;
`;

const OptionText = styled.span`
  flex-grow: 1;
`;

const SubmitButton = styled(motion.button)`
  background: #10b981;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 2rem;
  cursor: pointer;
  &:disabled {
    background: #d1fae5;
    cursor: not-allowed;
  }
`;

const languageOptions = [
  { name: "C++", mode: "c_cpp", id: 54 },
  { name: "Python", mode: "python", id: 71 },
  { name: "JavaScript", mode: "javascript", id: 63 },
];

export default function TakeAssessment() {
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [codingAnswers, setCodingAnswers] = useState({});
  const [codeResult, setCodeResult] = useState({});
  const [language, setLanguage] = useState(languageOptions[0]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const testCode = localStorage.getItem("testCode");

  useEffect(() => {
    if (!testCode) {
      setError("No test code found. Please join a test first.");
      return;
    }

    axios
      .get(`${import.meta.env.VITE_API_URL}/api/test/join/${testCode}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      })
      .then((res) => {
        setTest(res.data);
        setAnswers(Array(res.data.questions.length).fill(null));
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Error loading test");
      });
  }, [testCode, user.token]);

  const handleSelect = (qIndex, optIndex) => {
    const newAnswers = [...answers];
    newAnswers[qIndex] = optIndex;
    setAnswers(newAnswers);
  };

  const handleCodeChange = (questionId, code) => {
    setCodingAnswers((prev) => ({ ...prev, [questionId]: code }));
  };

  const handleCodeSubmit = async (questionId) => {
    const code = codingAnswers[questionId];
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/test/submit/code`,
        {
          code,
          language_id: language.id,
          questionId,
        },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setCodeResult((prev) => ({ ...prev, [questionId]: res.data }));
    } catch (err) {
      setCodeResult((prev) => ({
        ...prev,
        [questionId]: {
          status: "Error",
          message: err.response?.data?.message || "Execution failed",
        },
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/test/submit/code`,
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
      setError(err.response?.data?.message || "Error submitting test");
    }
  };

  return (
    <Container>
      <AssessmentContainer>
        <Header>
          <Title>Assessment</Title>
        </Header>

        {error ? (
          <ErrorMessage>
            <AlertCircle size={20} />
            {error}
          </ErrorMessage>
        ) : !test ? (
          <LoadingMessage>
            <Clock size={24} />
            <p>Loading test...</p>
          </LoadingMessage>
        ) : (
          <>
            <TestInfo>
              <InfoItem>
                <strong>Test:</strong> {test.title}
              </InfoItem>
              <InfoItem>
                <Clock size={18} /> Duration: {test.duration} minutes
              </InfoItem>
              <InfoItem>
                Language:
                <select
                  value={language.id}
                  onChange={(e) =>
                    setLanguage(
                      languageOptions.find(
                        (l) => l.id === parseInt(e.target.value)
                      )
                    )
                  }
                >
                  {languageOptions.map((lang) => (
                    <option key={lang.id} value={lang.id}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </InfoItem>
            </TestInfo>

            {test.questions.map((q, i) => (
              <QuestionCard key={i}>
                <QuestionText>
                  <QuestionNumber>{i + 1}</QuestionNumber>
                  {q.question}
                </QuestionText>

                {q.type === "mcq" ? (
                  <OptionsList>
                    {q.options.map((opt, j) => (
                      <OptionLabel key={j} selected={answers[i] === j}>
                        <RadioInput
                          type="radio"
                          name={`q${i}`}
                          checked={answers[i] === j}
                          onChange={() => handleSelect(i, j)}
                        />
                        <OptionText>{opt}</OptionText>
                        {answers[i] === j && <CheckCircle size={18} color="#667eea" />}
                      </OptionLabel>
                    ))}
                  </OptionsList>
                ) : (
                  <>
                    <AceEditor
                      mode={language.mode}
                      theme="monokai"
                      name={`code-editor-${i}`}
                      fontSize={14}
                      value={codingAnswers[q._id] || ""}
                      onChange={(value) => handleCodeChange(q._id, value)}
                      width="100%"
                      height="300px"
                      editorProps={{ $blockScrolling: true }}
                      setOptions={{
                        enableBasicAutocompletion: true,
                        enableLiveAutocompletion: true,
                        showLineNumbers: true,
                        tabSize: 4,
                      }}
                    />
                    <SubmitButton
                      onClick={() => handleCodeSubmit(q._id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{ marginTop: "1rem" }}
                    >
                      Run Code
                    </SubmitButton>
                    {codeResult[q._id] && (
                      <pre style={{ whiteSpace: "pre-wrap", marginTop: "0.5rem" }}>
                        {JSON.stringify(codeResult[q._id], null, 2)}
                      </pre>
                    )}
                  </>
                )}
              </QuestionCard>
            ))}

            <SubmitButton
              onClick={handleSubmit}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={answers.some((a, i) =>
                test.questions[i].type === "mcq" && a === null
              )}
            >
              <Send size={20} /> Submit Assessment
            </SubmitButton>
          </>
        )}
      </AssessmentContainer>
    </Container>
  );
}
