import { Question, QuizPreferences } from '../types';

export const generateQuiz = async (
  apiKey: string,
  preferences: QuizPreferences
): Promise<Question[]> => {
  try {
    const { 
      course,
      topic, 
      subtopic, 
      questionCount, 
      questionTypes, 
      language, 
      difficulty,
      negativeMarking,
      negativeMarks 
    } = preferences;
    
    if (!course) {
      throw new Error('Course/Stream is required');
    }
    
    // Ensure language is properly formatted for the prompt
    const quizLanguage = language || 'English';
    
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
- CRITICAL: Ensure all JSON strings are properly escaped and terminated
- CRITICAL: For non-English languages, use proper Unicode characters and ensure correct grammar
- CRITICAL: Do not use placeholders or question marks for non-English characters

2. QUALITY STANDARDS:
For each question:
→ The question text should be clear and well-formulated in ${quizLanguage}
→ For multiple-choice questions, provide exactly 4 distinct options in ${quizLanguage}
→ must be professionally crafted
→ Zero repetition or similarity between questions
→ 25% real-world application questions
→ Mix conceptual (40%), factual (30%), analytical (30%) questions

Format your response STRICTLY as a valid JSON array with this structure:
[
  {
    "id": 1,
    "text": "Question text here in ${quizLanguage}",
    "type": "${questionTypes[0]}", 
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Correct option here in ${quizLanguage}",
    "explanation": "Detailed explanation in ${quizLanguage}",
    "difficulty": "basic"
  }
]

QUALITY CONTROL:
✓ Professional wording
✓ Perfect ${quizLanguage} grammar
✓ Balanced difficulty
✓ Valid JSON formatting
✓ Complete metadata
✓ Commercial-ready content

CRITICAL INSTRUCTIONS:
1. Generate ${questionCount} questions
2. Ensure all JSON strings are properly escaped
3. Do not include line breaks within JSON strings
3. Ensure 100% unique questions
4. Make content worth paying for
5. Use proper Unicode encoding for non-English characters
6. Do not use ASCII-only characters for non-English content
7. Verify the JSON is valid before returning
8. All content MUST be in ${quizLanguage} language with proper grammar and characters

FINAL CHECK:
- All fields populated
- No empty values
- Proper escaping
- UTF-8 compliant
- Ready for API response`;
    
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
    // Ensure language is properly formatted
    const explanationLanguage = language || 'English';

    const prompt = `Analyze this answer for a question about ${topic} in ${explanationLanguage} language:
    
Question: ${question}
User's Answer: ${userAnswer}
Correct Answer: ${correctAnswer}

Provide a detailed response in ${explanationLanguage} that includes:
1. Whether the answer is correct or incorrect
2. A thorough explanation of why the correct answer is right
3. If the user's answer was wrong, explain what made it incorrect
4. Additional context or related concepts to help understand the topic better
5. If applicable, real-world examples or applications

CRITICAL:
- Use proper Unicode characters for non-English text
- Ensure correct grammar and natural language flow
- Do not use placeholders or question marks for non-English characters
- Keep the tone encouraging and educational
- ENSURE THE ENTIRE RESPONSE IS IN ${explanationLanguage} LANGUAGE`;

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
      difficulty: q.difficulty,
      language: q.language // Preserve the language information
    }));
  } catch (error) {
    console.error('Error parsing Gemini response:', error);
    throw new Error(`Failed to parse quiz questions: ${error.message}`);
  }
};