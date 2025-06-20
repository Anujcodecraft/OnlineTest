// File: src/pages/CreateTest.jsx

import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { FileText, Plus, Trash2, Clock, Calendar, AlertCircle, CheckCircle2, Settings, HelpCircle, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import styled from "styled-components";

const Container = styled.div`
  min-height: 100vh;
  padding: 2rem;
  background: #f9fafb;
`;

const Header = styled(motion.div)`
  text-align: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #4f46e5;
`;

const Subtitle = styled.p`
  color: #6b7280;
`;

const FormContainer = styled(motion.div)`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const Section = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1rem;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-weight: 500;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #d1d5db;
`;

const Message = styled(motion.div)`
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;

  ${props => props.type === 'success' && `
    background: #d1fae5;
    color: #065f46;
  `}

  ${props => props.type === 'error' && `
    background: #fee2e2;
    color: #991b1b;
  `}
`;

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
    { type: "mcq", question: "", options: ["", "", "", ""], correctAnswer: 0 }
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

  const handleTypeChange = (index, newType) => {
    const updated = [...questions];
    updated[index].type = newType;
    if (newType === "mcq") {
      updated[index].options = ["", "", "", ""];
      updated[index].correctAnswer = 0;
      delete updated[index].testCases;
    } else {
      delete updated[index].options;
      delete updated[index].correctAnswer;
    }
    setQuestions(updated);
  };

  const handleFileAttach = (index, type, file) => {
    const updated = [...questions];
    if (!updated[index].files) updated[index].files = {};
    updated[index].files[type] = file;
    setQuestions(updated);
  };

  const addQuestion = () => {
    setQuestions([...questions, { type: "mcq", question: "", options: ["", "", "", ""], correctAnswer: 0 }]);
  };

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      const updated = questions.filter((_, i) => i !== index);
      setQuestions(updated);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => payload.append(key, value));

      const processedQuestions = questions.map((q, i) => {
        const { files, ...rest } = q;
        if (q.type === 'coding' && files) {
          if (files.input) payload.append('inputFile', files.input);
          if (files.output) payload.append('outputFile', files.output);
        }
        return rest;
      });

      payload.append("questions", JSON.stringify(processedQuestions));

      await axios.post("http://localhost:5000/api/test/create", payload, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "multipart/form-data"
        },
      });

      setMessage("Test created successfully!");
      setForm({ title: "", description: "", testCode: "", duration: "", startTime: "", endTime: "" });
      setQuestions([{ type: "mcq", question: "", options: ["", "", "", ""], correctAnswer: 0 }]);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create test.");
    }
  };

  return (
    <Container>
      <Header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <Title>Create New Test</Title>
        <Subtitle>Design and configure your test with questions and settings</Subtitle>
      </Header>

      <FormContainer initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
        <AnimatePresence>
          {message && (
            <Message type="success" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <CheckCircle2 size={20} /> {message}
            </Message>
          )}
          {error && (
            <Message type="error" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <AlertCircle size={20} /> {error}
            </Message>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <Section>
            <SectionTitle><Settings size={20} /> Test Configuration</SectionTitle>
            <FormGrid>
              <InputGroup>
                <Label>Test Title *</Label>
                <Input name="title" value={form.title} onChange={handleFormChange} required />
              </InputGroup>
              <InputGroup>
                <Label>Test Code *</Label>
                <Input name="testCode" value={form.testCode} onChange={handleFormChange} required />
              </InputGroup>
              <InputGroup>
                <Label>Duration (minutes) *</Label>
                <Input name="duration" type="number" value={form.duration} onChange={handleFormChange} required />
              </InputGroup>
              <InputGroup>
                <Label>Start Time *</Label>
                <Input name="startTime" type="datetime-local" value={form.startTime} onChange={handleFormChange} required />
              </InputGroup>
              <InputGroup>
                <Label>End Time *</Label>
                <Input name="endTime" type="datetime-local" value={form.endTime} onChange={handleFormChange} required />
              </InputGroup>
            </FormGrid>
          </Section>

          <Section>
            <SectionTitle><HelpCircle size={20} /> Questions ({questions.length})</SectionTitle>
            {questions.map((q, i) => (
              <div key={i} style={{ border: "1px solid #e5e7eb", padding: "1rem", borderRadius: "8px", marginBottom: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h4>Question {i + 1}</h4>
                  <button type="button" onClick={() => removeQuestion(i)} style={{ background: "none", border: "none", cursor: "pointer" }}><Trash2 /></button>
                </div>

                <Label>Question Type</Label>
                <select value={q.type} onChange={(e) => handleTypeChange(i, e.target.value)}>
                  <option value="mcq">MCQ</option>
                  <option value="coding">Coding</option>
                </select>

                <Label style={{ marginTop: "1rem" }}>Question</Label>
                <Input type="text" value={q.question} onChange={(e) => handleQuestionChange(i, "question", e.target.value)} required />

                {q.type === "mcq" ? (
                  <>
                    {q.options.map((opt, j) => (
                      <InputGroup key={j}>
                        <Label>Option {String.fromCharCode(65 + j)}</Label>
                        <Input type="text" value={opt} onChange={(e) => handleOptionChange(i, j, e.target.value)} required />
                      </InputGroup>
                    ))}
                    <Label>Correct Answer</Label>
                    <select value={q.correctAnswer} onChange={(e) => handleQuestionChange(i, "correctAnswer", Number(e.target.value))}>
                      {q.options.map((_, j) => (
                        <option key={j} value={j}>Option {String.fromCharCode(65 + j)}</option>
                      ))}
                    </select>
                  </>
                ) : (
                  <FormGrid>
                    <InputGroup>
                      <Label>Input File *</Label>
                      <Input type="file" accept=".txt" onChange={(e) => handleFileAttach(i, "input", e.target.files[0])} required />
                    </InputGroup>
                    <InputGroup>
                      <Label>Output File *</Label>
                      <Input type="file" accept=".txt" onChange={(e) => handleFileAttach(i, "output", e.target.files[0])} required />
                    </InputGroup>
                  </FormGrid>
                )}
              </div>
            ))}

            <button type="button" onClick={addQuestion} style={{ marginTop: "1rem", padding: "0.75rem 1.5rem", background: "#6366f1", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}>
              <Plus /> Add Question
            </button>
          </Section>

          <button type="submit" style={{ padding: "0.75rem 1.5rem", background: "#10b981", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}>
            <Save /> Create Test
          </button>
        </form>
      </FormContainer>
    </Container>
  );
}
