import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

async function signOut(request: Request) {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL('/login', request.url), 303);
}

// The header "Log out" is a plain link (GET), so both methods must sign out.
export async function GET(request: Request) { return signOut(request); }
export async function POST(request: Request) { return signOut(request); }
