import { createClient } from 'npm:@supabase/supabase-js@2.39.8';
import { corsHeaders } from '../_shared/cors.ts';

interface GenerateRequest {
  subject: string;
  topic: string;
  questionCount: number;
  difficulty: string;
  language: string;
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

    const { subject, topic, questionCount, difficulty, language } = await req.json() as GenerateRequest;

    // Validate required parameters
    if (!subject || !topic || !questionCount || !difficulty || !language) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters',
          details: {
            subject: !subject,
            topic: !topic,
            questionCount: !questionCount,
            difficulty: !difficulty,
            language: !language
          }
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const prompt = `Generate ${questionCount} subjective questions for ${subject} - ${topic} with ${difficulty} difficulty level in ${language} language.

These are for written answer evaluation, so create questions that require detailed explanations, analysis, or problem-solving.

Requirements:
1. Questions should be suitable for subjective evaluation
2. Each question should have clear marking criteria
3. Questions should test understanding, application, and analysis
4. Vary the marks based on question complexity (5-20 marks each)
5. Include a mix of:
   - Explain/Describe questions
   - Analyze/Compare questions
   - Problem-solving questions
   - Application-based questions

Format each question as a JSON object with:
{
  "text": "Clear, detailed question text",
  "marks": number (5-20 based on complexity),
  "type": "subjective",
  "explanation": "Brief explanation of what the question tests",
  "keywords": ["key", "concepts", "to", "look", "for"]
}

Return as a JSON array of questions.`;

    // Call Gemini API
    const response = await fetch(
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
      const responseText = data.candidates[0].content.parts[0].text;
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const questions = JSON.parse(jsonMatch[0]);
      
      if (!Array.isArray(questions)) {
        throw new Error('Response is not an array');
      }

      // Validate questions
      questions.forEach((q, index) => {
        if (!q.text || !q.marks || typeof q.marks !== 'number') {
          throw new Error(`Question ${index + 1} is missing required fields`);
        }
      });

      return new Response(
        JSON.stringify({ 
          success: true,
          questions
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } catch (error) {
      throw new Error(`Failed to parse questions: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in generate-subjective-questions function:', error);
    
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