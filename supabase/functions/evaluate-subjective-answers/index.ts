import { createClient } from 'npm:@supabase/supabase-js@2.39.8';
import { corsHeaders } from '../_shared/cors.ts';

interface EvaluationRequest {
  mode: 'generate' | 'custom' | 'upload';
  subject?: string;
  topic?: string;
  questions?: Array<{
    question: string;
    answer: string;
    marks: number;
  }>;
  questionPaperPath?: string;
  answerSheetPath?: string;
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

    const requestData = await req.json() as EvaluationRequest;

    let evaluationPrompt = '';
    let questionsToEvaluate: Array<{question: string, answer: string, marks: number}> = [];

    if (requestData.mode === 'upload') {
      // Handle PDF upload mode
      if (!requestData.questionPaperPath || !requestData.answerSheetPath) {
        throw new Error('Missing file paths for upload mode');
      }

      // Get file URLs from storage
      const { data: questionPaperUrl } = supabase.storage
        .from('evaluations')
        .getPublicUrl(requestData.questionPaperPath);

      const { data: answerSheetUrl } = supabase.storage
        .from('evaluations')
        .getPublicUrl(requestData.answerSheetPath);

      evaluationPrompt = `You are an expert evaluator. I have uploaded a question paper and answer sheet as PDFs.

Question Paper URL: ${questionPaperUrl.publicUrl}
Answer Sheet URL: ${answerSheetUrl.publicUrl}

Please:
1. Extract questions from the question paper
2. Extract answers from the answer sheet
3. Match questions with answers
4. Evaluate each answer based on correctness, completeness, and clarity
5. Provide detailed feedback for each question
6. Calculate total score and percentage

Provide evaluation in this JSON format:
{
  "score": total_marks_obtained,
  "totalMarks": total_possible_marks,
  "percentage": percentage_score,
  "feedback": "overall_feedback",
  "improvements": ["area1", "area2", ...],
  "questionAnalysis": [{
    "questionNumber": 1,
    "question": "question_text",
    "studentAnswer": "student_answer",
    "score": marks_obtained,
    "maxMarks": max_possible_marks,
    "feedback": "detailed_feedback",
    "mistakes": ["mistake1", "mistake2", ...],
    "suggestions": ["suggestion1", "suggestion2", ...]
  }]
}`;
    } else {
      // Handle generate/custom mode
      if (!requestData.questions || requestData.questions.length === 0) {
        throw new Error('No questions provided for evaluation');
      }

      questionsToEvaluate = requestData.questions;
      const totalMarks = questionsToEvaluate.reduce((sum, q) => sum + q.marks, 0);

      evaluationPrompt = `You are an expert evaluator. Please evaluate the following subjective answers:

${questionsToEvaluate.map((q, index) => `
Question ${index + 1} (${q.marks} marks):
${q.question}

Student's Answer:
${q.answer}
`).join('\n')}

Evaluation Criteria:
1. Correctness of content
2. Completeness of answer
3. Clarity of explanation
4. Use of relevant examples
5. Logical structure

For each question, provide:
- Score out of maximum marks
- Detailed feedback
- Specific mistakes (if any)
- Suggestions for improvement

Total possible marks: ${totalMarks}

Provide evaluation in this JSON format:
{
  "score": total_marks_obtained,
  "totalMarks": ${totalMarks},
  "percentage": percentage_score,
  "feedback": "overall_feedback_on_performance",
  "improvements": ["area1", "area2", ...],
  "questionAnalysis": [{
    "questionNumber": 1,
    "question": "question_text",
    "studentAnswer": "student_answer",
    "score": marks_obtained,
    "maxMarks": max_possible_marks,
    "feedback": "detailed_feedback_for_this_question",
    "mistakes": ["mistake1", "mistake2", ...],
    "suggestions": ["suggestion1", "suggestion2", ...]
  }]
}`;
    }

    // Call Gemini API for evaluation
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
              text: evaluationPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.3,
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
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const evaluation = JSON.parse(jsonMatch[0]);
      
      // Validate evaluation structure
      if (!evaluation.score || !evaluation.totalMarks || !evaluation.percentage || !evaluation.feedback) {
        throw new Error('Invalid evaluation format');
      }

      // Add metadata
      evaluation.id = `eval-${Date.now()}`;
      evaluation.evaluatedAt = new Date().toISOString();

      return new Response(
        JSON.stringify(evaluation),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } catch (error) {
      throw new Error(`Failed to parse evaluation: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in evaluate-subjective-answers function:', error);
    
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