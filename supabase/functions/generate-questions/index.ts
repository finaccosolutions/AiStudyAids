import { createClient } from 'npm:@supabase/supabase-js@2.39.8';
import { corsHeaders } from '../_shared/cors.ts';

interface GenerateRequest {
  subject: string;
  topic: string;
  questionCount: number;
  difficulty: string;
  questionType: string;
  mode?: 'practice' | 'exam';
  previousQuestions?: boolean;
  yearCount?: number;
}

Deno.serve(async (req) => {
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

    const { subject, topic, questionCount, difficulty, questionType, mode = 'practice', previousQuestions, yearCount } = await req.json() as GenerateRequest;

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

    let prompt = '';
    
    if (previousQuestions) {
      // Generate previous year questions
      prompt = `Generate ${questionCount} previous year exam questions for ${subject} - ${topic} from the past ${yearCount || 5} years.

Requirements:
1. Include questions from actual exams where possible
2. Format each question with:
   - Year of appearance
   - Original exam/institution
   - Question text
   - Answer and explanation
3. Maintain difficulty level: ${difficulty}
4. Question type: ${questionType}

Format as JSON array with:
{
  "questions": [{
    "year": "YYYY",
    "exam": "exam name",
    "text": "question text",
    "type": "${questionType}",
    "options": ["option1", ...] (if applicable),
    "correctAnswer": "answer",
    "explanation": "detailed explanation"
  }]
}`;
    } else {
      // Generate new questions
      prompt = `Generate ${questionCount} ${difficulty} difficulty questions about ${subject} - ${topic}.

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

3. For essay questions:
   - Provide clear, focused topic
   - Include expected points to cover
   - Add sample answer outline
   - Include evaluation criteria

4. For short-answer questions:
   - Provide clear, concise questions
   - Include expected answer format
   - Add detailed explanation

Return the questions as a JSON array.`;
    }

    // Call Gemini API
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
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

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        `Gemini API error: ${response.status} ${response.statusText}${
          errorData ? ` - ${JSON.stringify(errorData)}` : ''
        }`
      );
    }

    const data = await response.json();
    
    try {
      // Extract and validate JSON from response
      const jsonMatch = data.candidates[0].content.parts[0].text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const questions = JSON.parse(jsonMatch[0]);
      
      // Save to question_banks table
      const { error: insertError } = await supabase
        .from('question_banks')
        .insert({
          user_id: user.id,
          course: subject,
          topic,
          difficulty,
          language: 'English',
          question_types: [questionType],
          source: 'manual',
          questions: questions.questions || questions,
          is_previous_year: previousQuestions || false,
          year_count: yearCount
        });

      if (insertError) {
        throw new Error(`Failed to save question bank: ${insertError.message}`);
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          questions: questions.questions || questions
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } catch (error) {
      throw new Error(`Failed to parse questions: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in generate-questions function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});