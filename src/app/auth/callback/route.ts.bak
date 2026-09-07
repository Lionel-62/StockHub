import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const isSignup = searchParams.get('flow') === 'signup';

  if (!code) {
    // No code — redirect to login with error
    return NextResponse.redirect(`${origin}/login?error=oauth_missing_code`);
  }

  // Exchange the code for a session using the public (anon) client
  // because only the browser-side Supabase client can exchange the code
  // We need a server-side client that can handle cookies
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabasePublic = createClient(supabaseUrl, supabaseAnonKey);
  const { data: sessionData, error: sessionError } = await supabasePublic.auth.exchangeCodeForSession(code);

  if (sessionError || !sessionData?.user) {
    console.error('OAuth code exchange error:', sessionError);
    return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
  }

  const user = sessionData.user;
  const adminSupabase = createAdminClient();

  // Check if the user already has a profile in our database
  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('id, shop_id, onboarding_completed')
    .eq('id', user.id)
    .single();

  // --- SIGNUP FLOW: User doesn't have a profile yet ---
  if (!profile && isSignup) {
    // Create the profile with shop_id = null and onboarding_completed = false
    const { error: profileError } = await adminSupabase.from('profiles').insert({
      id: user.id,
      name: user.user_metadata?.full_name || user.email,
      identifier: user.email,
      role: 'owner',
      permissions: { canViewDashboard: true },
      onboarding_completed: false,
    });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      return NextResponse.redirect(`${origin}/login?error=profile_creation_failed`);
    }

    // New user → send to onboarding
    return NextResponse.redirect(`${origin}/onboarding`);
  }

  // --- LOGIN FLOW: User has no profile = never registered ---
  if (!profile) {
    // Sign out and redirect to register
    return NextResponse.redirect(`${origin}/login?error=account_not_found`);
  }

  // --- User has a profile ---
  // Check if onboarding is complete: onboarding_completed flag AND shop exists
  const needsOnboarding = !profile.onboarding_completed || !profile.shop_id;

  if (needsOnboarding) {
    return NextResponse.redirect(`${origin}/onboarding`);
  }

  // All good → dashboard
  return NextResponse.redirect(`${origin}/dashboard`);
}
