import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import styled from "styled-components";
import { CheckCircle, AlertCircle, Clock, Send } from "lucide-react";

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem;
`;

const AssessmentContainer = styled(motion.div)`
  max-width: 900px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const Title = styled.h2`
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
`;

const TestInfo = styled.div`
  display: flex;
  justify-content: space-between;
  background: rgba(102, 126, 234, 0.1);
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  border: 1px solid rgba(102, 126, 234, 0.2);
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
`;

const QuestionCard = styled(motion.div)`
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const QuestionText = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1rem;
  display: flex;
  gap: 0.5rem;
`;

const QuestionNumber = styled.span`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 600;
`;

const OptionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const OptionLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.selected ? 'rgba(102, 126, 234, 0.1)' : 'transparent'};
  border: 2px solid ${props => props.selected ? '#667eea' : '#e2e8f0'};
  
  &:hover {
    background: rgba(102, 126, 234, 0.05);
    border-color: #667eea;
  }
`;

const RadioInput = styled.input`
  width: 18px;
  height: 18px;
  accent-color: #667eea;
`;

const OptionText = styled.span`
  flex: 1;
`;

const SubmitButton = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin: 2rem auto 0;
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
  
  &:hover {
    background: linear-gradient(135deg, #059669 0%, #047857 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.5);
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #666;
`;

const ErrorMessage = styled.div`
  padding: 1rem;
  border-radius: 12px;
  background: rgba(239, 68, 68, 0.1);
  color: #991b1b;
  border: 1px solid rgba(239, 68, 68, 0.2);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: center;
`;

const formatTime = (secs) => {
  const m = Math.floor(secs / 60)
    .toString()
    .padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};


export default function TakeAssessment() {
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState([]);
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
      .get(`http://localhost:5000/api/test/join/${testCode}`, {
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
      setError(err.response?.data?.message || "Error submitting test");
    }
  };

  return (
    <Container>
      <AssessmentContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
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
                <Clock size={18} />
                Duration: {test.duration} minutes
              </InfoItem>
            </TestInfo>

            {test.questions.map((q, i) => (
              <QuestionCard
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <QuestionText>
                  <QuestionNumber>{i + 1}</QuestionNumber>
                  {q.question}
                </QuestionText>
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
              </QuestionCard>
            ))}

            <SubmitButton
              onClick={handleSubmit}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={answers.some(a => a === null)}
            >
              <Send size={20} />
              Submit Assessment
            </SubmitButton>
          </>
        )}
      </AssessmentContainer>
    </Container>
  );
}