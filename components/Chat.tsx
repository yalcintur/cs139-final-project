import { FC, KeyboardEvent } from 'react';
import styles from './Chat.module.css';

interface ChatProps {
  studentName: string;
  chatHistory: { sender: string; message: string }[];
  userInput: string;
  setUserInput: (value: string) => void;
  handleSend: () => void;
  handleKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
}

const Chat: FC<ChatProps> = ({ studentName, chatHistory, userInput, setUserInput, handleSend, handleKeyDown }) => {
  return (
    <div className={styles.chatBox}>
      <h2>Chat with {studentName}</h2>
      <div className={styles.chatHistory}>
        {chatHistory.map((chat, index) => (
          <div key={index} className={chat.sender === 'You' ? styles.userMessage : styles.studentMessage}>
            <strong>{chat.sender}:</strong> {chat.message}
          </div>
        ))}
      </div>
      <div className={styles.inputArea}>
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type your message..."
          onKeyDown={handleKeyDown}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default Chat;
