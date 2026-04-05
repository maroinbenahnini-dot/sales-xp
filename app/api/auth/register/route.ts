import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const { email, password, username } = await request.json()

  let response = NextResponse.json({ success: true })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            const safeOptions =
              process.env.NODE_ENV === 'development'
                ? { ...options, secure: false, sameSite: 'lax' as const }
                : options
            response.cookies.set(name, value, safeOptions)
          })
        },
      },
    }
  )

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } },
  })

  if (error) {
    const msg = error.message?.includes('already')
      ? 'Un compte existe déjà avec cet email.'
      : 'Erreur lors de la création du compte.'
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  return response
}
