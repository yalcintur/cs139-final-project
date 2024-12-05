import { FC } from 'react';
import styles from './QuestionBox.module.css';

interface QuestionBoxProps {
  question: string;
  imperfectAnswer: string;
}

const QuestionBox: FC<QuestionBoxProps> = ({ question, imperfectAnswer }) => {
  return (
    <div className={styles.questionBox}>
      <h2>Question</h2>
      <p>{question}</p>
      <h3>Imperfect Answer</h3>
      <div className={styles.answer}>
        <pre>{imperfectAnswer}</pre>
      </div>
    </div>
  );
};

export default QuestionBox;
