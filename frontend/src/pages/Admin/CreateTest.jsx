import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { 
  FileText, 
  Plus, 
  Trash2, 
  Clock, 
  Calendar, 
  AlertCircle, 
  CheckCircle2,
  Settings,
  HelpCircle,
  Save
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import styled from "styled-components";

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Header = styled(motion.div)`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: #666;
  font-size: 1.1rem;
  margin: 0;
`;

const FormContainer = styled(motion.div)`
  max-width: 900px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const Section = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.3rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e2e8f0;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const InputGroup = styled.div`
  position: relative;
`;

const Label = styled.label`
  display: block;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    transform: translateY(-1px);
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  transition: all 0.3s ease;
  background: white;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    transform: translateY(-1px);
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`;

const QuestionCard = styled(motion.div)`
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const QuestionHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 1rem;
`;

const QuestionNumber = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  font-weight: 600;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const DeleteButton = styled(motion.button)`
  background: linear-gradient(135deg, #ff6b6b, #ee5a52);
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(135deg, #ff5252, #d32f2f);
    transform: scale(1.05);
  }
`;

const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 0.75rem;
  margin: 1rem 0;
`;

const OptionGroup = styled.div`
  position: relative;
`;

const OptionInput = styled(Input)`
  padding-left: 2.5rem;
`;

const OptionLabel = styled.span`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 600;
`;

const CorrectAnswerGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(102, 126, 234, 0.2);
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 1rem;
`;

const RadioOption = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(102, 126, 234, 0.1);
  }
`;

const RadioInput = styled.input`
  width: 18px;
  height: 18px;
  accent-color: #667eea;
`;

const Button = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  ${props => props.variant === 'primary' && `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    
    &:hover {
      background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
    }
  `}
  
  ${props => props.variant === 'secondary' && `
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
    border: 2px solid #667eea;
    
    &:hover {
      background: rgba(102, 126, 234, 0.2);
      transform: translateY(-1px);
    }
  `}
  
  ${props => props.variant === 'success' && `
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
    
    &:hover {
      background: linear-gradient(135deg, #059669 0%, #047857 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(16, 185, 129, 0.5);
    }
  `}
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Message = styled(motion.div)`
  padding: 1rem 1.5rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  
  ${props => props.type === 'success' && `
    background: rgba(16, 185, 129, 0.1);
    color: #065f46;
    border: 1px solid rgba(16, 185, 129, 0.2);
  `}
  
  ${props => props.type === 'error' && `
    background: rgba(239, 68, 68, 0.1);
    color: #991b1b;
    border: 1px solid rgba(239, 68, 68, 0.2);
  `}
`;

export default function CreateTest() {
  const { user } = useAuth();
  console.log("heyy",user)
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
      setMessage("Test created successfully!");
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
    <Container>
      <Header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Title>Create New Test</Title>
        <Subtitle>Design and configure your test with questions and settings</Subtitle>
      </Header>

      <FormContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <AnimatePresence>
          {message && (
            <Message
              type="success"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <CheckCircle2 size={20} />
              {message}
            </Message>
          )}
          {error && (
            <Message
              type="error"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <AlertCircle size={20} />
              {error}
            </Message>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit}>
          <Section>
            <SectionTitle>
              <Settings size={20} />
              Test Configuration
            </SectionTitle>
            
            <FormGrid>
              <InputGroup>
                <Label>Test Title *</Label>
                <Input
                  name="title"
                  placeholder="Enter test title"
                  value={form.title}
                  onChange={handleFormChange}
                  required
                />
              </InputGroup>
              
              <InputGroup>
                <Label>Test Code *</Label>
                <Input
                  name="testCode"
                  placeholder="Enter unique test code"
                  value={form.testCode}
                  onChange={handleFormChange}
                  required
                />
              </InputGroup>
            </FormGrid>

            <InputGroup>
              <Label>Description</Label>
              <TextArea
                name="description"
                placeholder="Describe the test purpose and instructions"
                value={form.description}
                onChange={handleFormChange}
              />
            </InputGroup>

            <FormGrid>
              <InputGroup>
                <Label>
                  <Clock size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  Duration (minutes) *
                </Label>
                <Input
                  name="duration"
                  type="number"
                  placeholder="60"
                  value={form.duration}
                  onChange={handleFormChange}
                  min="1"
                  required
                />
              </InputGroup>
              
              <InputGroup>
                <Label>
                  <Calendar size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  Start Time *
                </Label>
                <Input
                  name="startTime"
                  type="datetime-local"
                  value={form.startTime}
                  onChange={handleFormChange}
                  required
                />
              </InputGroup>
              
              <InputGroup>
                <Label>
                  <Calendar size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  End Time *
                </Label>
                <Input
                  name="endTime"
                  type="datetime-local"
                  value={form.endTime}
                  onChange={handleFormChange}
                  required
                />
              </InputGroup>
            </FormGrid>
          </Section>

          <Section>
            <SectionTitle>
              <HelpCircle size={20} />
              Questions ({questions.length})
            </SectionTitle>
            
            <AnimatePresence>
              {questions.map((q, i) => (
                <QuestionCard
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <QuestionHeader>
                    <QuestionNumber>
                      <FileText size={16} />
                      Question {i + 1}
                    </QuestionNumber>
                    {questions.length > 1 && (
                      <DeleteButton
                        type="button"
                        onClick={() => removeQuestion(i)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Trash2 size={16} />
                      </DeleteButton>
                    )}
                  </QuestionHeader>
                  
                  <InputGroup>
                    <Input
                      type="text"
                      placeholder={`Enter question ${i + 1}`}
                      value={q.question}
                      onChange={(e) => handleQuestionChange(i, "question", e.target.value)}
                      required
                    />
                  </InputGroup>
                  
                  <OptionsGrid>
                    {q.options.map((opt, j) => (
                      <OptionGroup key={j}>
                        <OptionLabel>{String.fromCharCode(65 + j)}</OptionLabel>
                        <OptionInput
                          type="text"
                          placeholder={`Option ${String.fromCharCode(65 + j)}`}
                          value={opt}
                          onChange={(e) => handleOptionChange(i, j, e.target.value)}
                          required
                        />
                      </OptionGroup>
                    ))}
                  </OptionsGrid>
                  
                  <CorrectAnswerGroup>
                    <Label style={{ margin: 0, fontWeight: 600 }}>Correct Answer:</Label>
                    <RadioGroup>
                      {q.options.map((_, j) => (
                        <RadioOption key={j}>
                          <RadioInput
                            type="radio"
                            name={`correct-${i}`}
                            value={j}
                            checked={q.correctAnswer === j}
                            onChange={(e) => handleQuestionChange(i, "correctAnswer", Number(e.target.value))}
                          />
                          Option {String.fromCharCode(65 + j)}
                        </RadioOption>
                      ))}
                    </RadioGroup>
                  </CorrectAnswerGroup>
                </QuestionCard>
              ))}
            </AnimatePresence>
            
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <Button
                type="button"
                variant="secondary"
                onClick={addQuestion}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus size={20} />
                Add Question
              </Button>
            </div>
          </Section>

          <ButtonGroup>
            <Button
              type="submit"
              variant="success"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Save size={20} />
              Create Test
            </Button>
          </ButtonGroup>
        </form>
      </FormContainer>
    </Container>
  );
}