import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const cookies = request.cookies.getAll()
  const supabaseCookies = cookies.filter(c => c.name.includes('sb-') || c.name.includes('supabase'))

  const supabase = await createClient()
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  return NextResponse.json({
    allCookieNames: cookies.map(c => c.name),
    supabaseCookies: supabaseCookies.map(c => ({ name: c.name, length: c.value.length })),
    session: session ? { user_id: session.user.id, email: session.user.email, expires_at: session.expires_at } : null,
    sessionError: sessionError?.message ?? null,
    user: user ? { id: user.id, email: user.email } : null,
    userError: userError?.message ?? null,
  })
}
