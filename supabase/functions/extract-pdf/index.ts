import { createClient } from 'npm:@supabase/supabase-js@2.39.8';
import { corsHeaders } from '../_shared/cors.ts';
import { createWorker } from 'npm:tesseract.js@5.0.5';

interface ExtractRequest {
  pdfUrl: string;
}

Deno.serve(async (req) => {
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Validate request method
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { pdfUrl } = await req.json() as ExtractRequest;

    if (!pdfUrl) {
      return new Response(
        JSON.stringify({ error: 'Missing PDF URL' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Download PDF with error handling
    const pdfResponse = await fetch(pdfUrl);
    if (!pdfResponse.ok) {
      return new Response(
        JSON.stringify({ error: `Failed to download PDF: ${pdfResponse.statusText}` }),
        {
          status: pdfResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Initialize Tesseract worker with proper error handling
    try {
      const worker = await createWorker();
      await worker.loadLanguage('eng');
      await worker.initialize('eng');

      // Extract text from PDF
      const { data: { text } } = await worker.recognize(await pdfResponse.blob());
      await worker.terminate();

      return new Response(
        JSON.stringify({ text }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } catch (workerError) {
      return new Response(
        JSON.stringify({ error: `OCR processing failed: ${workerError.message}` }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
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