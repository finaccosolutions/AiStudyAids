import { Question, QuizPreferences } from '../types';

export const generateQuiz = async (
  apiKey: string,
  preferences: QuizPreferences
): Promise<Question[]> => {
  try {
    const { topic, questionCount, questionTypes, language } = preferences;
    
    const prompt = constructQuizPrompt(topic, questionCount, questionTypes, language);
    
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gemini`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        prompt,
        apiKey
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate quiz');
    }

    const data = await response.json();
    return parseGeminiResponse(data, questionTypes);
  } catch (error) {
    console.error('Error generating quiz:', error);
    throw new Error(`Failed to generate quiz: ${error.message}`);
  }
};

export const getAnswerExplanation = async (
  apiKey: string,
  question: string,
  answer: string,
  topic: string,
  language: string
): Promise<string> => {
  try {
    const prompt = `Provide a detailed explanation for the following question about ${topic} in ${language}:
    
Question: ${question}
Answer: ${answer}

Explain why this answer is correct, provide context and additional information that helps understand the concept better.`;

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gemini`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        prompt,
        apiKey
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to get explanation');
    }

    return data.candidates[0].content.parts[0].text || 'No explanation available.';
  } catch (error) {
    console.error('Error getting explanation:', error);
    return `Unable to generate explanation: ${error.message}`;
  }
};

const constructQuizPrompt = (
  topic: string,
  questionCount: number,
  questionTypes: string[],
  language: string
): string => {
  return `Generate a ${language} quiz about "${topic}" with exactly ${questionCount} questions.

Include the following question types: ${questionTypes.join(', ')}.
  
For each question, provide:
1. The question text
2. The type of question (multiple-choice, yes-no, or short-answer)
3. For multiple-choice questions, provide exactly 4 options
4. The correct answer

Format your response as a JSON array with the following structure:
[
  {
    "id": 1,
    "text": "Question text here",
    "type": "multiple-choice",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Correct option here"
  },
  {
    "id": 2,
    "text": "Question text here",
    "type": "yes-no",
    "correctAnswer": "Yes" or "No"
  },
  {
    "id": 3,
    "text": "Question text here",
    "type": "short-answer",
    "correctAnswer": "Correct answer here"
  }
]

Ensure the questions cover a range from basic to advanced level on the topic. Make the questions clear, accurate, and engaging.`;
};

const parseGeminiResponse = (response: any, questionTypes: string[]): Question[] => {
  try {
    const textResponse = response.candidates[0].content.parts[0].text;
    
    const jsonMatch = textResponse.match(/```json\n([\s\S]*?)\n```/) || 
                      textResponse.match(/```\n([\s\S]*?)\n```/) ||
                      [null, textResponse];
    
    const jsonString = jsonMatch[1].trim();
    
    const questions: Question[] = JSON.parse(jsonString);
    
    return questions.map((q, index) => ({
      id: index + 1,
      text: q.text,
      type: q.type as any,
      options: q.options || undefined,
      correctAnswer: q.correctAnswer,
    }));
  } catch (error) {
    console.error('Error parsing Gemini response:', error);
    throw new Error('Failed to parse quiz questions. Please try again.');
  }
};