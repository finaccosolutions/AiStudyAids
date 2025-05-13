import { corsHeaders } from '../_shared/cors.ts';

interface SummarizeRequest {
  content: string;
  outputFormat: string[];
  apiKey: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { content, outputFormat, apiKey } = await req.json() as SummarizeRequest;

    if (!content || !outputFormat || !apiKey) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const prompt = `Generate the following for this content:
${outputFormat.includes('summary') ? '1. A concise summary' : ''}
${outputFormat.includes('key_points') ? '2. Key points and concepts' : ''}
${outputFormat.includes('mind_map') ? '3. A text-based mind map structure' : ''}
${outputFormat.includes('questions') ? '4. Practice questions with answers' : ''}
${outputFormat.includes('definitions') ? '5. Important terms and definitions' : ''}

Content:
${content}

Format the response as a JSON object with these sections (include only requested sections):
{
  ${outputFormat.includes('summary') ? '"summary": "concise summary",' : ''}
  ${outputFormat.includes('key_points') ? '"keyPoints": ["point1", "point2", ...],' : ''}
  ${outputFormat.includes('mind_map') ? '"mindMap": {"central": "main topic", "branches": [...]},' : ''}
  ${outputFormat.includes('questions') ? '"questions": [{"question": "...", "answer": "..."}],' : ''}
  ${outputFormat.includes('definitions') ? '"definitions": [{"term": "...", "definition": "..."}]' : ''}
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
        JSON.stringify({ error: data.error?.message || 'Failed to generate summary' }),
        {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    try {
      const result = JSON.parse(data.candidates[0].content.parts[0].text);
      return new Response(
        JSON.stringify(result),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } catch (error) {
      throw new Error('Failed to parse summary result');
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