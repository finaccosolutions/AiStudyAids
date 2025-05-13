import { createClient } from 'npm:@supabase/supabase-js@2.39.8';
import { corsHeaders } from '../_shared/cors.ts';

interface GenerateRequest {
  course: string;
  topic?: string;
  subtopic?: string;
  difficulty: string;
  language: string;
  questionTypes: string[];
  source: 'manual' | 'pdf';
  pdfContent?: string;
  questionCount: number;
  apiKey: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { 
      course, topic, subtopic, difficulty, language,
      questionTypes, source, pdfContent, questionCount, apiKey 
    } = await req.json() as GenerateRequest;

    if (!course || !difficulty || !language || !questionTypes || !source || !apiKey) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Build the prompt based on source and parameters
    const prompt = `Generate ${questionCount} ${difficulty} difficulty questions about ${course}${topic ? ` - ${topic}` : ''}${subtopic ? ` (${subtopic})` : ''} in ${language}.

Question types to include: ${questionTypes.join(', ')}

${source === 'pdf' ? `Use this content as reference:\n${pdfContent}` : ''}

Format each question as a JSON object with:
- text: question text
- type: question type (one of: ${questionTypes.join(', ')})
- options: array of possible answers (for multiple choice)
- correctAnswer: the correct answer
- explanation: detailed explanation of the answer
- difficulty: "${difficulty}"

For multiple-choice questions:
- Include exactly 4 distinct options
- Ensure options are complete and clear
- Mark the correct answer exactly as it appears in options

For true-false questions:
- Use ["True", "False"] as options
- Ensure statement is clear and unambiguous

For multi-select questions:
- Include exactly 6 options
- Include 2-3 correct options
- List correct options in correctOptions array

For sequence questions:
- Provide 4-6 steps in random order
- Include correct sequence in correctSequence array
- Explain each step in the sequence

For case-study and situation questions:
- Include detailed scenario (100+ words)
- Provide 4 distinct solution options
- Explain why the correct answer is best

Return the questions as a JSON array with proper validation:
- Each question must have all required fields
- No missing or null values
- Proper JSON formatting
- No trailing commas`;

    // Call Gemini API to generate questions
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + apiKey,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.2,
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

      // Validate questions
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error('Invalid questions format');
      }

      questions.forEach((q: any, index: number) => {
        if (!q.text || !q.type || !q.explanation) {
          throw new Error(`Question ${index + 1} missing required fields`);
        }

        // Validate based on question type
        switch (q.type) {
          case 'multiple-choice':
            if (!Array.isArray(q.options) || q.options.length !== 4 || !q.correctAnswer) {
              throw new Error(`Question ${index + 1} invalid multiple choice format`);
            }
            break;

          case 'true-false':
            if (!Array.isArray(q.options) || q.options.length !== 2 || 
                !['True', 'False'].includes(q.correctAnswer)) {
              throw new Error(`Question ${index + 1} invalid true/false format`);
            }
            break;

          case 'multi-select':
            if (!Array.isArray(q.options) || q.options.length !== 6 || 
                !Array.isArray(q.correctOptions) || 
                q.correctOptions.length < 2 || q.correctOptions.length > 3) {
              throw new Error(`Question ${index + 1} invalid multi-select format`);
            }
            break;

          case 'sequence':
            if (!Array.isArray(q.sequence) || !Array.isArray(q.correctSequence) ||
                q.sequence.length !== q.correctSequence.length ||
                q.sequence.length < 4 || q.sequence.length > 6) {
              throw new Error(`Question ${index + 1} invalid sequence format`);
            }
            break;

          case 'case-study':
          case 'situation':
            if (!q.options || q.options.length !== 4 || !q.correctAnswer ||
                (q.type === 'case-study' && (!q.caseStudy || q.caseStudy.length < 100)) ||
                (q.type === 'situation' && (!q.situation || q.situation.length < 100))) {
              throw new Error(`Question ${index + 1} invalid ${q.type} format`);
            }
            break;
        }
      });

      return new Response(
        JSON.stringify(questions),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } catch (error) {
      throw new Error(`Failed to parse questions: ${error.message}`);
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