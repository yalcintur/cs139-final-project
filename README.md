# Office Hours AI Tutor

An interactive web application that simulates a tutoring session with an AI student. Assist the student in solving calculus limit problems by providing guidance on specific steps.

## Setup Instructions

**Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/office-hours-ai-tutor.git
   cd office-hours-ai-tutor
   ```
Create a .env file with your OpenAI API key:

```bash
echo "OPENAI_API_KEY=your-api-key-here" > .env
```

Replace your-api-key-here with your actual OpenAI API key.

Install dependencies:

```
npm install
```

Start the development server:

```bash
npm run dev
```

The application will be running at http://localhost:3000.

Usage
Select a Step: Click on a specific step in the AI student's solution to provide guidance.
Provide Feedback: Enter your explanation to help correct the selected step.
Interact: Continue assisting the student until they reach the correct answer.
Next Question: Click the "Next Question" button to proceed to a new problem.

## Technologies Used
React
Next.js
OpenAI GPT-4 API
