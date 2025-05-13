import { corsHeaders } from '../_shared/cors.ts';

interface GenerateRequest {
  subject: string;
  topic: string;
  questionCount: number;
  difficulty: string;
  
  questionType: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { subject, topic, questionCount, difficulty, questionType } = await req.json() as GenerateRequest;

    if (!subject || !topic || !questionCount || !difficulty || !questionType) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Build the prompt for Gemini
    const prompt = `Generate ${questionCount} ${difficulty} difficulty questions about ${subject} - ${topic}.

Question type: ${questionType}

Format each question as a JSON object with:
- text: question text
- type: "${questionType}"
- options: array of possible answers (for multiple choice)
- correctAnswer: the correct answer
- explanation: detailed explanation of the answer

Requirements:
1. For multiple-choice questions:
   - Include exactly 4 distinct options
   - Ensure options are complete and clear
   - Mark the correct answer exactly as it appears in options

2. For true-false questions:
   - Use ["True", "False"] as options
   - Ensure statement is clear and unambiguous

3. For short-answer questions:
   - Provide clear, concise questions
   - Include expected answer format
   - Add detailed explanation

4. For fill-in-blank questions:
   - Create clear sentences with blanks
   - Provide exact word/phrase for blank
   - Include context in explanation

Return the questions as a JSON array.`;

    // Call Gemini API
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('GEMINI_API_KEY')}`,
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error('Failed to generate questions');
    }

    const data = await response.json();
    
    try {
      // Extract JSON from response
      const jsonMatch = data.candidates[0].content.parts[0].text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const questions = JSON.parse(jsonMatch[0]);

      return new Response(
        JSON.stringify({ questions }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } catch (error) {
      throw new Error('Failed to parse questions');
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});