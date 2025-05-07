import { Question, QuizPreferences } from '../types';

export const generateQuiz = async (
  apiKey: string,
  preferences: QuizPreferences
): Promise<Question[]> => {
  try {
    const { topic, questionCount, questionTypes, language } = preferences;
    
    const prompt = `Generate a ${language} quiz about "${topic}" with exactly ${questionCount} questions.

The questions should follow a progressive difficulty curve:
- Start with basic concept questions (30% of questions)
- Move to intermediate application questions (40% of questions)
- End with advanced analysis questions (30% of questions)

Include the following question types: ${questionTypes.join(', ')}.

For each question:
1. The question text
2. The type of question (multiple-choice, yes-no, or short-answer)
3. For multiple-choice questions, provide exactly 4 options
4. The correct answer
5. A detailed explanation of why this answer is correct
6. The difficulty level (basic, intermediate, or advanced)

Format your response as a JSON array with the following structure:
[
  {
    "id": 1,
    "text": "Question text here",
    "type": "multiple-choice",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Correct option here",
    "explanation": "Detailed explanation of the correct answer",
    "difficulty": "basic"
  }
]

Ensure questions build upon each other and cover different aspects of the topic.`;
    
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
  userAnswer: string,
  correctAnswer: string,
  topic: string,
  language: string
): Promise<string> => {
  try {
    const prompt = `Analyze this answer for a question about ${topic} in ${language}:
    
Question: ${question}
User's Answer: ${userAnswer}
Correct Answer: ${correctAnswer}

Provide a detailed response that includes:
1. Whether the answer is correct or incorrect
2. A thorough explanation of why the correct answer is right
3. If the user's answer was wrong, explain what made it incorrect
4. Additional context or related concepts to help understand the topic better
5. If applicable, real-world examples or applications

Keep the tone encouraging and educational.`;

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

const parseGeminiResponse = (response: any, questionTypes: string[]): Question[] => {
  try {
    const textResponse = response.candidates[0].content.parts[0].text;
    
    const jsonMatch = textResponse.match(/```json\n([\s\S]*?)\n```/) || 
                      textResponse.match(/```\n([\s\S]*?)\n```/) ||
                      [null, textResponse];
    
    const jsonString = jsonMatch[1].trim();
    
    const questions: Question[] = JSON.parse(jsonString);
    
    // Sort questions by difficulty
    const difficultyOrder = { 'basic': 0, 'intermediate': 1, 'advanced': 2 };
    questions.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
    
    return questions.map((q, index) => ({
      id: index + 1,
      text: q.text,
      type: q.type as any,
      options: q.options || undefined,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      difficulty: q.difficulty
    }));
  } catch (error) {
    console.error('Error parsing Gemini response:', error);
    throw new Error('Failed to parse quiz questions. Please try again.');
  }
};