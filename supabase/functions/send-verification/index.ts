import { createClient } from 'npm:@supabase/supabase-js@2.39.8';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface EmailRequest {
  userId: string;
  email: string;
  name: string;
  mobileNumber: string;
  countryCode: string;
  countryName: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userId, email, name, mobileNumber, countryCode, countryName } = await req.json() as EmailRequest;

    // Create profile using service role client (bypasses RLS)
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: userId,
        full_name: name,
        mobile_number: mobileNumber,
        country_code: countryCode,
        country_name: countryName
      });

    if (profileError) {
      throw new Error(`Failed to create profile: ${profileError.message}`);
    }

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
    const { data, error: linkError } = await supabase.auth.admin.generateLink({
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

    if (linkError || !data) {
      throw new Error(linkError?.message || 'Failed to generate verification link');
    }

    // The verification email will be automatically sent by Supabase when generating the signup link
    // No need to explicitly call sendEmail as it's handled by the generateLink method

    return new Response(
      JSON.stringify({ message: 'Profile created and verification email sent successfully' }),
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