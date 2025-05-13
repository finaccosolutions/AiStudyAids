import { createClient } from 'npm:@supabase/supabase-js@2.39.8';
import { corsHeaders } from '../_shared/cors.ts';

interface GenerateRequest {
  subject: string;
  topic: string;
  questionCount: number;
  difficulty: string;
  questionType: string;
  mode?: 'practice' | 'exam';
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user ID from auth header
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Invalid authentication');
    }

    // Get Gemini API key from api_keys table
    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from('api_keys')
      .select('gemini_api_key')
      .eq('user_id', user.id)
      .single();

    if (apiKeyError || !apiKeyData?.gemini_api_key) {
      throw new Error('Gemini API key not found. Please set up your API key in the API Settings page.');
    }

    const { subject, topic, questionCount, difficulty, questionType, mode = 'practice' } = await req.json() as GenerateRequest;

    // Validate required parameters
    if (!subject || !topic || !questionCount || !difficulty || !questionType) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters',
          details: {
            subject: !subject,
            topic: !topic,
            questionCount: !questionCount,
            difficulty: !difficulty,
            questionType: !questionType
          }
        }),
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

    // Call Gemini API with error handling and proper API key
    const geminiResponse = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKeyData.gemini_api_key,
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

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json().catch(() => null);
      if (geminiResponse.status === 401) {
        throw new Error('Invalid Gemini API key. Please check your API key in the API Settings page.');
      }
      throw new Error(
        `Gemini API error: ${geminiResponse.status} ${geminiResponse.statusText}${
          errorData ? ` - ${JSON.stringify(errorData)}` : ''
        }`
      );
    }

    const data = await geminiResponse.json();
    
    try {
      // Extract and validate JSON from response
      const jsonMatch = data.candidates[0].content.parts[0].text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const questions = JSON.parse(jsonMatch[0]);
      
      // Validate questions array
      if (!Array.isArray(questions)) {
        throw new Error('Response is not an array');
      }

      if (questions.length === 0) {
        throw new Error('No questions generated');
      }

      // Validate each question has required fields
      questions.forEach((q, i) => {
        if (!q.text || !q.type || !q.correctAnswer || !q.explanation) {
          throw new Error(`Question ${i + 1} is missing required fields`);
        }
      });

      // If in exam mode, remove answers and explanations
      const processedQuestions = questions.map(q => {
        if (mode === 'exam') {
          // Create a copy without answers
          const { correctAnswer, explanation, ...questionWithoutAnswers } = q;
          return questionWithoutAnswers;
        }
        return q;
      });

      return new Response(
        JSON.stringify({ questions: processedQuestions }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } catch (error) {
      throw new Error(`Failed to parse questions: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in generate-questions function:', error);
    
    const status = error.message.includes('Missing authorization') ? 401 :
                  error.message.includes('API key') ? 400 : 500;
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});