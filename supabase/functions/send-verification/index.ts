import { createClient } from 'npm:@supabase/supabase-js@2.39.8';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface EmailRequest {
  userId: string;
  email: string;
  name: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userId, email, name } = await req.json() as EmailRequest;

    // Update user metadata to indicate pending verification
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      userId,
      {
        user_metadata: {
          registration_status: 'pending_verification',
          registration_date: new Date().toISOString(),
        },
      }
    );

    if (updateError) {
      throw new Error('Failed to update user status');
    }

    // Generate verification link
    const { data: { user }, error: userError } = await supabase.auth.admin.generateLink({
      type: 'signup',
      email,
      options: {
        data: {
          name,
          registration_status: 'pending_verification',
        },
        redirectTo: `${new URL(req.url).origin}/auth?mode=signin`,
      },
    });

    if (userError || !user) {
      throw new Error(userError?.message || 'Failed to generate verification link');
    }

    // Send verification email
    const { error: emailError } = await supabase.auth.admin.sendEmail(email, {
      template: 'confirmation',
      templateData: {
        name,
        confirmation_url: user.confirmation_sent_at,
        site_name: 'QuizGenius',
        support_email: 'support@quizgenius.com',
      },
    });

    if (emailError) {
      throw emailError;
    }

    return new Response(
      JSON.stringify({ message: 'Verification email sent successfully' }),
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