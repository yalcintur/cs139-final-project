import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(request: Request) {
  const { userResponse, question, imperfectAnswer, correctAnswer, chatHistory, stepNumber } = await request.json();

  const stepMatches = imperfectAnswer.match(/Steps:\s*\n([\s\S]*?)\nResult:/i);
  let steps = [];
  if (stepMatches) {
    const stepsText = stepMatches[1];
    steps = stepsText
      .split(/\n\d+\.\s+/)
      .filter((s) => s.trim() !== '')
      .map((s) => s.trim());
  }

  const currentResultMatch = imperfectAnswer.match(/Result:\s*(.+)/i);
  const currentResult = currentResultMatch ? currentResultMatch[1].trim() : '';

  const updateAnswerPrompt = `You are an imperfect AI acting as a imperfect student solving the following problem:

"${question}"

Your current answer is:
Steps:
${steps.map((step, index) => `${index + 1}. ${step}`).join('\n')}
Result: ${currentResult}

Your teaching assistant has provided feedback to help you correct step ${stepNumber}:
"${userResponse}"

**If the suggestion does not explain the reason for the update**, or just answer shortly, ask for further clarification and DON'T UPDATE any of the steps.

If it is clear, Update ONLY step ${stepNumber} of your answer. You can only change the response of ${stepNumber}. NEVER change any of the next steps.
Then, respond to the teaching assistant in a polite and natural way, expressing your understanding or asking for further clarification if needed.

Format your response as follows:

Updated Answer:
Steps:
1. [Step 1]
2. [Step 2]
...
Result: [Result]

Your Message:
[Your message to the teaching assistant]`;

  const updateAnswerResponse = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: updateAnswerPrompt }],
    max_tokens: 600,
    temperature: 0.3,
  });

  const studentResponse = updateAnswerResponse.choices[0].message?.content.trim();

  const updatedAnswerMatch = studentResponse.match(/Updated Answer:\s*([\s\S]*?)\n\nYour Message:\s*([\s\S]*)/i);

  let updatedAnswer = '';
  let replyMessage = '';

  if (updatedAnswerMatch) {
    updatedAnswer = updatedAnswerMatch[1].trim();
    replyMessage = updatedAnswerMatch[2].trim();
  } else {
    updatedAnswer = studentResponse;
    replyMessage = "Thank you for your guidance.";
  }

  const updatedResultMatch = updatedAnswer.match(/Result:\s*(.+)/i);
  const updatedResult = updatedResultMatch ? updatedResultMatch[1].trim() : '';

  const correctResultMatch = correctAnswer.match(/Result:\s*(.+)/i);
  const correctResult = correctResultMatch ? correctResultMatch[1].trim() : '';

  const checkResultPrompt = `Is the student's result correct for the question?

  "${question}"

Student's Result: "${studentResponse}"

Just answer plainly: "yes" or "no".`;

  const checkResponse = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: checkResultPrompt }],
    max_tokens: 5,
    temperature: 0,
  });

  console.log(checkResponse.choices[0].message);

  const isCorrect = checkResponse.choices[0].message?.content.trim().toLowerCase().includes('yes');

  return NextResponse.json({
    reply: replyMessage,
    updatedAnswer,
    correct: isCorrect,
  });
}
