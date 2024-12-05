import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(request: Request) {
  const { prevQuestion } = await request.json();

  const questionPrompt = `Generate a unique medium level limit problem suitable for a advanced high school student. Make sure the question you ask is fully different than the previous question "${prevQuestion}". Provide only the question without the solution. Don't use latex format. Just provide it in plain text.`;

  const questionResponse = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: questionPrompt }],
    max_tokens: 1000,
    temperature: 0.9,
  });

  const newQuestion = questionResponse.choices[0].message?.content.trim();

  const correctAnswerPrompt = `Provide the correct step-by-step solution to the following problem:\n\n"Result: ...`;

  const correctAnswerResponse = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: correctAnswerPrompt }],
    max_tokens: 300,
    temperature: 0.4,
  });

  const correctAnswerText = correctAnswerResponse.choices[0].message?.content.trim();

  const imperfectAnswerPrompt = `Your goal is to create an WRONG answer with full of errors step by step. Every step must be either include logical fallacies, incorrect assumptions (but don't write they are incorrect), or algebraic mistakes. You must defend the incorrect errors,  so that students can later debug them and expand their understanding. The result AND THE STEPS (INCLUDING THE FIRST ONE)**must** be totally wrong, and at least 5 total steps to the following problem. The question :\n\n"${newQuestion}"\n\nJust provide it in plain text, Don't use latex format and Format the answer strictly in the following structure:\nSteps:\n1. ...\n2. ...\n...\nResult: ...`;

  const imperfectAnswerResponse = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: imperfectAnswerPrompt }],
    max_tokens: 1000,
    temperature: 0.6,
  });

  console.log(imperfectAnswerResponse.choices[0].message)


  const imperfectAnswerText = imperfectAnswerResponse.choices[0].message?.content.trim();

  // Generate a random student name
  const studentNames = ['Alex', 'Jamie', 'Taylor', 'Jordan', 'Casey', 'Morgan', 'Riley', 'Cameron', 'Drew', 'Avery'];
  const studentName = studentNames[Math.floor(Math.random() * studentNames.length)];

  return NextResponse.json({
    question: newQuestion,
    imperfectAnswer: imperfectAnswerText,
    correctAnswer: correctAnswerText,
    studentName,
  });
}
