import { Question, QuizPreferences } from '../types';

export const generateQuiz = async (
  apiKey: string,
  preferences: QuizPreferences
): Promise<Question[]> => {
  try {
    const { topic, subtopic, questionCount, questionTypes, language, difficulty } = preferences;
    
    const prompt = `Generate a quiz about "${topic}${subtopic ? ` (${subtopic})` : ''}" with exactly ${questionCount} questions.

The questions MUST be in ${language} language and follow these strict requirements:
- Difficulty level: ${difficulty}
- ONLY use these question types: ${questionTypes.join(', ')}
- Each question MUST be one of these types: ${questionTypes.join(', ')}
- DO NOT generate any question types that are not in the list above
- Each question should be unique and not repetitive
- Include practical applications and real-world scenarios
- Ensure progressive complexity within the chosen difficulty level
- CRITICAL: ONLY generate questions of the types specified in questionTypes array
- CRITICAL: Ensure all JSON strings are properly escaped and terminated
- CRITICAL: Do not include any special characters or line breaks within JSON strings
- CRITICAL: All question text, options, answers, and explanations MUST be in ${language} language

For each question:
1. The question text should be clear and well-formulated in ${language}
2. The type MUST be one of: ${questionTypes.join(', ')}
3. For multiple-choice questions, provide exactly 4 distinct options in ${language}
4. The correct answer in ${language}
5. A detailed explanation of why this answer is correct in ${language}
6. The difficulty level (basic, intermediate, or advanced)

Format your response STRICTLY as a valid JSON array with this structure:
[
  {
    "id": 1,
    "text": "Question text here in ${language}",
    "type": "${questionTypes[0]}", 
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Correct option here in ${language}",
    "explanation": "Detailed explanation in ${language}",
    "difficulty": "basic"
  }
]

CRITICAL: 
- Ensure all JSON strings are properly escaped
- Do not include line breaks within JSON strings
- Use only basic ASCII characters in strings
- Verify the JSON is valid before returning`;
    
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
    const prompt = `Analyze this answer for a question about ${topic} in ${language} language:
    
Question: ${question}
User's Answer: ${userAnswer}
Correct Answer: ${correctAnswer}

Provide a detailed response in ${language} that includes:
1. Whether the answer is correct or incorrect
2. A thorough explanation of why the correct answer is right
3. If the user's answer was wrong, explain what made it incorrect
4. Additional context or related concepts to help understand the topic better
5. If applicable, real-world examples or applications

Keep the tone encouraging and educational. ENSURE THE ENTIRE RESPONSE IS IN ${language} LANGUAGE.`;

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
    
    // First, try to extract JSON from markdown code blocks
    let jsonString = textResponse;
    
    // Try different markdown code block patterns
    const patterns = [
      /```json\n([\s\S]*?)\n```/,
      /```javascript\n([\s\S]*?)\n```/,
      /```\n([\s\S]*?)\n```/,
      /\[([\s\S]*?)\]/  // Fallback: try to find array directly
    ];

    for (const pattern of patterns) {
      const match = textResponse.match(pattern);
      if (match && match[1]) {
        try {
          // Try parsing the extracted content
          const extracted = match[1].trim();
          JSON.parse(`[${extracted.replace(/^\[|\]$/g, '')}]`);
          jsonString = extracted;
          break;
        } catch (e) {
          continue; // Try next pattern if parsing fails
        }
      }
    }

    // Clean up and sanitize the JSON string
    jsonString = jsonString
      .replace(/^\s*```.*\n/, '') // Remove opening code fence
      .replace(/\n\s*```\s*$/, '') // Remove closing code fence
      .replace(/\/\/ .*$/gm, '') // Remove comments
      .replace(/[\u2018\u2019]/g, "'") // Replace smart quotes
      .replace(/[\u201C\u201D]/g, '"') // Replace smart double quotes
      .replace(/[\u2013\u2014]/g, '-') // Replace em/en dashes
      .replace(/[^\x20-\x7E]/g, '') // Remove non-ASCII characters
      .replace(/\\\\/g, '\\') // Fix double escaped backslashes
      .replace(/\\([^"\\\/bfnrt])/g, '$1') // Remove invalid escapes
      .trim();

    // Ensure we have array brackets
    if (!jsonString.startsWith('[')) {
      jsonString = `[${jsonString}]`;
    }
    
    let questions: Question[];
    try {
      questions = JSON.parse(jsonString);
    } catch (parseError) {
      // If parsing fails, try to fix common JSON issues
      jsonString = jsonString
        .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
        .replace(/([^\\])\\([^"\\\/bfnrt])/g, '$1$2') // Fix invalid escapes
        .replace(/\s+/g, ' '); // Normalize whitespace
      
      try {
        questions = JSON.parse(jsonString);
      } catch (finalError) {
        throw new Error(`Invalid JSON format in response: ${finalError.message}. Please try again.`);
      }
    }
    
    if (!Array.isArray(questions)) {
      throw new Error('Response is not an array of questions. Please try again.');
    }

    // Validate question structure and types
    const invalidQuestions = questions.filter(q => !questionTypes.includes(q.type));
    if (invalidQuestions.length > 0) {
      const invalidTypes = [...new Set(invalidQuestions.map(q => q.type))];
      throw new Error(
        `Invalid question types detected: ${invalidTypes.join(', ')}. ` +
        `Allowed types are: ${questionTypes.join(', ')}. Please try again.`
      );
    }
    
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
    throw new Error(`Failed to parse quiz questions: ${error.message}`);
  }
};