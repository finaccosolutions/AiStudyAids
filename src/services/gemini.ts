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
- Each question must be unique and not repetitive
- Include practical applications and real-world scenarios
- Ensure progressive complexity within the chosen difficulty level

2. STRICT QUESTION TYPE REQUIREMENTS:

For multiple-choice:
- MUST have "text": clear, complete question
- MUST have "options": array of EXACTLY 4 distinct, complete answers
- MUST have "correctAnswer": exact match of the correct option
- MUST have "explanation": detailed explanation of why the answer is correct
Example:
{
  "type": "multiple-choice",
  "text": "What is the primary function of a CPU in a computer system?",
  "options": [
    "Execute instructions and perform calculations",
    "Store long-term data permanently",
    "Display graphics on the monitor",
    "Connect to the internet"
  ],
  "correctAnswer": "Execute instructions and perform calculations",
  "explanation": "The CPU (Central Processing Unit) is the brain of the computer..."
}

For true-false:
- MUST have "text": clear, complete statement to evaluate
- MUST have "options": ["True", "False"]
- MUST have "correctAnswer": either "True" or "False"
- MUST have "explanation": detailed explanation of why true or false
Example:
{
  "type": "true-false",
  "text": "The binary number system uses only 0s and 1s.",
  "options": ["True", "False"],
  "correctAnswer": "True",
  "explanation": "The binary number system is a base-2 system..."
}

For multi-select:
- MUST have "text": clear question specifying to select all that apply
- MUST have "options": array of EXACTLY 6 complete, distinct options
- MUST have "correctOptions": array of 2-3 correct options (exact matches)
- MUST have "explanation": explain why each correct option is right
Example:
{
  "type": "multi-select",
  "text": "Which of the following are object-oriented programming languages? (Select all that apply)",
  "options": [
    "Java",
    "C",
    "Python",
    "Assembly",
    "Ruby",
    "COBOL"
  ],
  "correctOptions": ["Java", "Python", "Ruby"],
  "explanation": "Java, Python, and Ruby are object-oriented languages because..."
}

For sequence:
- MUST have "text": clear instruction about what to sequence
- MUST have "sequence": array of 4-6 complete steps in RANDOM order
- MUST have "correctSequence": same steps in CORRECT order
- MUST have "explanation": explain the correct sequence logic
Example:
{
  "type": "sequence",
  "text": "Arrange the following steps of the software development lifecycle in the correct order:",
  "sequence": [
    "Testing the application",
    "Gathering requirements",
    "Deploying to production",
    "Designing the solution"
  ],
  "correctSequence": [
    "Gathering requirements",
    "Designing the solution",
    "Testing the application",
    "Deploying to production"
  ],
  "explanation": "The software development lifecycle follows this sequence because..."
}

For case-study:
- MUST have "text": brief introduction to the case
- MUST have "caseStudy": detailed scenario description
- MUST have "options": array of EXACTLY 4 possible solutions
- MUST have "correctAnswer": the best solution (exact match)
- MUST have "explanation": detailed analysis of why it's the best solution
Example:
{
  "type": "case-study",
  "text": "Analyze the following database design scenario:",
  "caseStudy": "A social media application needs to store user posts, comments, and likes. The current design uses separate tables for each, but performance is slow...",
  "options": [
    "Implement database indexing on frequently queried columns",
    "Merge all tables into a single denormalized table",
    "Switch to a NoSQL database system",
    "Add more database servers"
  ],
  "correctAnswer": "Implement database indexing on frequently queried columns",
  "explanation": "Database indexing is the best solution because..."
}

For situation:
- MUST have "text": brief introduction to the situation
- MUST have "caseStudy": detailed situation description
- MUST have "options": array of EXACTLY 4 possible actions
- MUST have "correctAnswer": the most appropriate action (exact match)
- MUST have "explanation": detailed justification of the best action
Example:
{
  "type": "situation",
  "text": "How would you handle the following system outage scenario?",
  "caseStudy": "During peak business hours, the production server becomes unresponsive. Initial logs show high CPU usage and memory consumption...",
  "options": [
    "Immediately restart the server",
    "Scale up server resources",
    "Analyze logs and identify the root cause",
    "Roll back recent deployments"
  ],
  "correctAnswer": "Analyze logs and identify the root cause",
  "explanation": "Analyzing logs first is the best action because..."
}

CRITICAL REQUIREMENTS:
1. Every question MUST include:
   - Complete "text" field with clear question
   - Appropriate fields for its type (see examples)
   - Detailed "explanation" field
   - All text in ${quizLanguage}

2. Format as valid JSON array with no trailing commas
3. Use double quotes for strings
4. Escape quotes within strings
5. No text outside the JSON array
6. No missing or null fields`;

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
        apiKey,
        temperature: 0.0 // Lower temperature for more consistent output
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

      // Validate each question has the required fields for its type
      questions.forEach((q: any, index: number) => {
        if (!q.text || !q.type || !q.explanation) {
          throw new Error(`Question ${index + 1} missing required base fields (text, type, or explanation)`);
        }

        switch (q.type) {
          case 'multiple-choice':
            if (!Array.isArray(q.options) || q.options.length !== 4 || !q.correctAnswer) {
              throw new Error(`Question ${index + 1} (multiple-choice) must have exactly 4 options and a correctAnswer`);
            }
            if (!q.options.includes(q.correctAnswer)) {
              throw new Error(`Question ${index + 1} correctAnswer must match one of the options exactly`);
            }
            break;

          case 'true-false':
            if (!Array.isArray(q.options) || q.options.length !== 2 || 
                q.options[0] !== 'True' || q.options[1] !== 'False') {
              throw new Error(`Question ${index + 1} (true-false) must have options ["True", "False"]`);
            }
            if (q.correctAnswer !== 'True' && q.correctAnswer !== 'False') {
              throw new Error(`Question ${index + 1} correctAnswer must be "True" or "False"`);
            }
            break;

          case 'multi-select':
            if (!Array.isArray(q.options) || q.options.length !== 6) {
              throw new Error(`Question ${index + 1} (multi-select) must have exactly 6 options`);
            }
            if (!Array.isArray(q.correctOptions) || 
                q.correctOptions.length < 2 || q.correctOptions.length > 3) {
              throw new Error(`Question ${index + 1} must have 2-3 correct options`);
            }
            if (!q.correctOptions.every((opt: string) => q.options.includes(opt))) {
              throw new Error(`Question ${index + 1} correctOptions must match options exactly`);
            }
            break;

          case 'sequence':
            if (!Array.isArray(q.sequence) || !Array.isArray(q.correctSequence) ||
                q.sequence.length !== q.correctSequence.length ||
                q.sequence.length < 4 || q.sequence.length > 6) {
              throw new Error(`Question ${index + 1} (sequence) must have matching sequence and correctSequence arrays of 4-6 items`);
            }
            break;

          case 'case-study':
          case 'situation':
            if (!q.caseStudy || !Array.isArray(q.options) || q.options.length !== 4 || !q.correctAnswer) {
              throw new Error(`Question ${index + 1} (${q.type}) must have caseStudy, exactly 4 options, and correctAnswer`);
            }
            if (!q.options.includes(q.correctAnswer)) {
              throw new Error(`Question ${index + 1} correctAnswer must match one of the options exactly`);
            }
            break;
        }
      });

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
    } catch (error: any) {
      console.error('Parse error:', error);
      throw new Error(`Failed to parse generated questions: ${error.message}`);
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
        apiKey,
        temperature: 0.0
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