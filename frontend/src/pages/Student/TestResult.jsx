import React from "react";
import styled from "styled-components";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { motion } from "framer-motion";

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem;
`;

const ResultCard = styled(motion.div)`
  max-width: 500px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  text-align: center;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const Title = styled.h2`
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 2rem;
`;

const ScoreWrapper = styled.div`
  width: 200px;
  margin: 0 auto 1.5rem;
`;

const ScoreText = styled.p`
  font-size: 1.2rem;
  font-weight: 600;
  color: #374151;
`;

export default function TestResult() {
  const result = JSON.parse(localStorage.getItem("result"));

  if (!result)
    return (
      <Container>
        <ResultCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Title>Test Result</Title>
          <ScoreText>No result available.</ScoreText>
        </ResultCard>
      </Container>
    );

  const percent = ((result.score / result.total) * 100).toFixed(0);

  return (
    <Container>
      <ResultCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Title>Test Result</Title>

        <ScoreWrapper>
          <CircularProgressbar
            value={percent}
            text={`${percent}%`}
            styles={buildStyles({
              textColor: "#4b5563",
              pathColor: "#10b981",
              trailColor: "#d1fae5",
              textSize: "18px",
              pathTransitionDuration: 0.5,
            })}
          />
        </ScoreWrapper>

        <ScoreText>
          You scored {result.score} out of {result.total}
        </ScoreText>
      </ResultCard>
    </Container>
  );
}
