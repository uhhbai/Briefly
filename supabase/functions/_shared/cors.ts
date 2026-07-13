import { corsHeaders as supabaseCorsHeaders } from 'npm:@supabase/supabase-js@2.110.0/cors';

export const corsHeaders = {
  ...supabaseCorsHeaders,
  'Access-Control-Allow-Headers': `${supabaseCorsHeaders['Access-Control-Allow-Headers']}, stripe-signature`,
};
