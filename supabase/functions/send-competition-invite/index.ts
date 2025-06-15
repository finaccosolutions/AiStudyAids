import { createClient } from 'npm:@supabase/supabase-js@2.39.8';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface InviteRequest {
  competitionId: string;
  emails: string[];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { competitionId, emails } = await req.json() as InviteRequest;

    // Get competition details
    const { data: competition, error: compError } = await supabase
      .from('competitions')
      .select(`
        *,
        profiles!competitions_creator_id_fkey (
          full_name
        )
      `)
      .eq('id', competitionId)
      .single();

    if (compError || !competition) {
      throw new Error('Competition not found');
    }

    // In a real implementation, you would send actual emails here
    // For now, we'll just log the invitation details
    console.log('Sending competition invites:', {
      competition: competition.title,
      creator: competition.profiles?.full_name,
      code: competition.competition_code,
      emails
    });

    // Here you would integrate with an email service like:
    // - SendGrid
    // - Mailgun
    // - AWS SES
    // - Resend
    // etc.

    return new Response(
      JSON.stringify({ 
        message: 'Invitations sent successfully',
        invitedEmails: emails.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});