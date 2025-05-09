import { QuizPreferences, Question } from '../types';

// Function to generate quiz questions using Gemini API
export const generateQuiz = async (
  apiKey: string,
  preferences: QuizPreferences
): Promise<Question[]> => {
  const { course, topic, subtopic, questionCount, questionTypes, language: quizLanguage, difficulty } = preferences;

  // The prompt template for generating quiz questions
  const prompt = `Generate a premium-quality quiz about "${course}${topic ? ` - ${topic}` : ''}${subtopic ? ` (${subtopic})` : ''}" with exactly ${questionCount} questions.

STRICT COMMERCIAL REQUIREMENTS:
1. CORE PARAMETERS:
- Course/Stream: ${course}
${topic ? `- Topic: ${topic}` : '- Topic: General concepts and principles'}
${subtopic ? `- Subtopic: ${subtopic}` : ''}
- Language: ${quizLanguage} (flawless grammar)
- Difficulty: ${difficulty} (with natural variation)
- Question Types: ONLY ${questionTypes.join(', ')}
- Each question should be unique and not repetitive
- Include practical applications and real-world scenarios
- Ensure progressive complexity within the chosen difficulty level

2. QUESTION TYPE REQUIREMENTS:
For multiple-choice:
- Exactly 4 distinct options
- One clear correct answer
- Plausible distractors

For true-false:
- Clear, unambiguous statements
- No trick questions

For fill-blank:
- Clear context
- Single word or short phrase answer

For short-answer:
- Questions requiring 1-2 word answers
- Clear, specific answers

For sequence:
- 4-6 items to arrange
- Clear ordering principle
- Items as array in correct order

For case-study:
- Short scenario description
- Multiple related questions
- Clear correct answers

For situation:
- Real-world scenario
- Multiple possible actions
- One best solution

For multi-select:
- 4-6 options total
- 2-3 correct options
- Clear marking criteria

Format your response STRICTLY as a valid JSON array with this structure:
[
  {
    "id": 1,
    "text": "Question text here",
    "type": "question-type",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Correct answer here",
    "explanation": "Detailed explanation",
    "difficulty": "basic",
    "caseStudy": "Case study text (if applicable)",
    "sequence": ["Item 1", "Item 2", "Item 3", "Item 4"],
    "correctSequence": ["Item 2", "Item 1", "Item 4", "Item 3"],
    "correctOptions": ["Option A", "Option C"]
  }
]`;

  try {
    // First try the edge function
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
      throw new Error(`Failed to generate quiz: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response format from Gemini API');
    }

    const generatedText = data.candidates[0].content.parts[0].text;
    
    // Extract JSON from the response text
    const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }

    try {
      const questions = JSON.parse(jsonMatch[0]);
      
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error('Invalid questions format');
      }

      return questions.map((q: any, index: number) => ({
        id: index + 1,
        text: q.text,
        type: q.type,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        difficulty: q.difficulty,
        caseStudy: q.caseStudy,
        sequence: q.sequence,
        correctSequence: q.correctSequence,
        correctOptions: q.correctOptions,
        language: quizLanguage
      }));
    } catch (error) {
      console.error('Parse error:', error);
      throw new Error('Failed to parse generated questions');
    }
  } catch (error: any) {
    console.error('Quiz generation error:', error);
    throw new Error(`Quiz generation failed: ${error.message}`);
  }
};

// Function to get explanation for an answer
export const getAnswerExplanation = async (
  apiKey: string,
  question: string,
  correctAnswer: string,
  topic: string,
  language: string
): Promise<string> => {
  const prompt = `Explain why "${correctAnswer}" is the correct answer to this ${topic} question: "${question}"
  
Requirements:
- Use ${language} language
- Be clear and concise
- Include relevant concepts
- Explain step-by-step if applicable
- Add examples if helpful`;

  try {
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
      throw new Error(`Failed to get explanation: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response format from Gemini API');
    }

    return data.candidates[0].content.parts[0].text;
  } catch (error: any) {
    console.error('Explanation error:', error);
    throw new Error(`Failed to get explanation: ${error.message}`);
  }
};