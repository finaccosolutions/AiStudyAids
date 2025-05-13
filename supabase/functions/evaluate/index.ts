import { corsHeaders } from '../_shared/cors.ts';

interface EvaluationRequest {
  questionPaper: {
    questions: Array<{
      text: string;
      marks: number;
      rubric?: string;
    }>;
  };
  answers: string[];
  apiKey: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { questionPaper, answers, apiKey } = await req.json() as EvaluationRequest;

    if (!questionPaper || !answers || !apiKey) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Evaluate each answer using Gemini
    const evaluations = await Promise.all(
      answers.map(async (answer, index) => {
        const question = questionPaper.questions[index];
        
        const prompt = `You are an expert evaluator. Evaluate this answer based on the following criteria:

Question: ${question.text}
Maximum Marks: ${question.marks}
${question.rubric ? `Evaluation Rubric: ${question.rubric}` : ''}

Student's Answer:
${answer}

Provide a detailed evaluation including:
1. Score (out of ${question.marks})
2. Detailed feedback
3. Areas for improvement
4. Key points covered/missed

Format the response as a JSON object with these fields:
{
  "score": number,
  "feedback": "detailed feedback",
  "improvements": ["area1", "area2", ...],
  "keyPoints": {
    "covered": ["point1", "point2", ...],
    "missed": ["point1", "point2", ...]
  }
}`;

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
                temperature: 0.3,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
              }
            })
          }
        );

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error?.message || 'Failed to evaluate answer');
        }

        try {
          const evaluation = JSON.parse(data.candidates[0].content.parts[0].text);
          return evaluation;
        } catch (error) {
          throw new Error('Failed to parse evaluation result');
        }
      })
    );

    // Calculate total score and compile feedback
    const totalScore = evaluations.reduce((sum, eval) => sum + eval.score, 0);
    const totalPossibleScore = questionPaper.questions.reduce((sum, q) => sum + q.marks, 0);
    
    const result = {
      score: totalScore,
      totalPossibleScore,
      percentage: (totalScore / totalPossibleScore) * 100,
      evaluations,
      overallFeedback: await generateOverallFeedback(evaluations, apiKey)
    };

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
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

async function generateOverallFeedback(evaluations: any[], apiKey: string) {
  const prompt = `Based on these evaluation results, provide overall feedback and recommendations:
${JSON.stringify(evaluations, null, 2)}

Focus on:
1. Overall performance
2. Common strengths
3. Common areas for improvement
4. Study recommendations

Keep the feedback constructive, specific, and actionable.`;

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
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    }
  );

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to generate overall feedback');
  }

  return data.candidates[0].content.parts[0].text;
}