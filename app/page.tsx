'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';

export default function Home() {
  const [studentName, setStudentName] = useState('');
  const [question, setQuestion] = useState('');
  const [imperfectAnswer, setImperfectAnswer] = useState('');
  const [steps, setSteps] = useState<string[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [chatHistory, setChatHistory] = useState<{ sender: string; message: string }[]>([]);
  const [userInput, setUserInput] = useState('');
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [correct, setCorrect] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNewQuestion();
  }, []);

  const fetchNewQuestion = async () => {
    setLoading(true);
    const res = await fetch('/api/createQuestion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prevQuestion: question }),
    });
    const data = await res.json();
    setStudentName(data.studentName);
    setQuestion(data.question);
    setImperfectAnswer(data.imperfectAnswer);
    parseSteps(data.imperfectAnswer);
    setCorrectAnswer(data.correctAnswer);
    setCorrect(false);
    setChatHistory([]);
    setUserInput('');
    setSelectedStep(null);
    setLoading(false);
  };

  const parseSteps = (answer: string) => {
    const stepMatches = answer.match(/Steps:\s*([\s\S]*?)\n\s*Result:/i);
    if (stepMatches) {
      const stepsText = stepMatches[1];
      const steps = [];
      const regex = /(?:^|\n)(\d+)\.\s*([\s\S]*?)(?=\n\d+\.\s|$)/g;
      let match;
      while ((match = regex.exec(stepsText)) !== null) {
        const stepNumber = match[1];
        const stepContent = match[2].trim();
        steps.push(stepContent);
      }
      setSteps(steps);
    } else {
      setSteps([]);
    }
  };

  const handleSend = async () => {
    if (!userInput.trim() || selectedStep === null) return;
  
    const currentUserInput = userInput;
    const currentSelectedStep = selectedStep;
  
    setUserInput('');
    setSelectedStep(null);
  
    const newChatHistory = [
      ...chatHistory,
      {
        sender: 'You',
        message: `Step ${currentSelectedStep + 1}: ${currentUserInput}`,
      },
    ];
  
    setChatHistory(newChatHistory);
  
    const res = await fetch('/api/reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userResponse: currentUserInput,
        question,
        imperfectAnswer,
        correctAnswer,
        chatHistory: newChatHistory,
        stepNumber: currentSelectedStep + 1, 
      }),
    });
    const data = await res.json();
  
    setImperfectAnswer(data.updatedAnswer);
    parseSteps(data.updatedAnswer);
  
    if (data.correct) {
      setCorrect(true);
    } else {
      setChatHistory((prevChat) => [
        ...prevChat,
        { sender: studentName, message: data.reply },
      ]);
    }
  };
  
  return (
    <div className={styles.container}>
      {loading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingSpinner}>
            <div className={styles.spinner}></div>
            <p>Generating question...</p>
          </div>
        </div>
      )}
      <header className={styles.header}>
        <h1>Office Hours</h1>
        <div className={styles.studentInfo}>
          <img src="/avatar.png" alt="Student Avatar" className={styles.avatar} />
          <span>{studentName}</span>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.questionBox}>
          <h2>Question</h2>
          <p>{question}</p>
          <h3>{studentName}'s Current Answer</h3>
          <div className={styles.answer}>
            <ol>
              {steps.map((step, index) => (
                <li
                  key={index}
                  className={selectedStep === index ? styles.selectedStep : ''}
                  onClick={() => setSelectedStep(index)}
                >
                  {step}
                </li>
              ))}
            </ol>
            <p>
              <strong>Result:</strong> {imperfectAnswer.match(/Result:\s*(.+)/i)?.[1]}
            </p>
            {correct && (
              <div className={styles.correctContainer}>
                <img src="/tick.png" alt="Correct" className={styles.tick} />
                <h2>Correct Answer!</h2>
                <button onClick={fetchNewQuestion} className={styles.nextButton}>
                  Next Question
                </button>
              </div>
            )}
          </div>
        </div>

        <div className={styles.chatBox}>
          <h2>Chat with {studentName}</h2>
          <div className={styles.chatHistory}>
            {chatHistory.map((chat, index) => (
              <div key={index} className={chat.sender === 'You' ? styles.userMessage : styles.studentMessage}>
                <strong>{chat.sender}:</strong> {chat.message}
              </div>
            ))}
          </div>
          {selectedStep !== null && (
            <div className={styles.selectedStepInfo}>
              Correcting Step {selectedStep + 1}: "{steps[selectedStep]}"
            </div>
          )}
          <div className={styles.inputArea}>
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Provide your explanation for the selected step..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSend();
                }
              }}
            />
            <button onClick={handleSend}>Send</button>
          </div>
        </div>
      </main>
    </div>
  );
}
