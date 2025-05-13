import { corsHeaders } from '../_shared/cors.ts';

interface PlannerRequest {
  course: string;
  syllabus: {
    topics: Array<{
      name: string;
      subtopics: string[];
      difficulty: 'easy' | 'medium' | 'hard';
    }>;
  };
  examDate: string;
  startDate: string;
  dailyHours: number;
  apiKey: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { course, syllabus, examDate, startDate, dailyHours, apiKey } = await req.json() as PlannerRequest;

    if (!course || !syllabus || !examDate || !startDate || !dailyHours || !apiKey) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const prompt = `Create a detailed study plan with the following parameters:

Course: ${course}
Syllabus: ${JSON.stringify(syllabus, null, 2)}
Start Date: ${startDate}
Exam Date: ${examDate}
Daily Study Hours: ${dailyHours}

Requirements:
1. Calculate total available days and study hours
2. Distribute topics based on difficulty and importance
3. Include revision days
4. Account for breaks and buffer time
5. Provide daily schedule with specific topics
6. Include study strategies for each topic
7. Add milestones and progress checks

Format the response as a JSON object with:
{
  "overview": {
    "totalDays": number,
    "totalHours": number,
    "topicsPerDay": number
  },
  "schedule": [{
    "date": "YYYY-MM-DD",
    "topics": [{
      "name": "topic name",
      "subtopics": ["subtopic1", ...],
      "duration": number,
      "strategy": "study strategy",
      "resources": ["resource1", ...]
    }],
    "revision": boolean,
    "milestones": ["milestone1", ...]
  }],
  "recommendations": ["recommendation1", ...]
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
            maxOutputTokens: 2048,
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: data.error?.message || 'Failed to generate study plan' }),
        {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    try {
      const plan = JSON.parse(data.candidates[0].content.parts[0].text);
      return new Response(
        JSON.stringify(plan),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } catch (error) {
      throw new Error('Failed to parse study plan');
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