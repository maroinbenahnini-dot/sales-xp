import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const { email, password } = await request.json()

  // On construit la response AVANT de créer le client pour pouvoir
  // écrire les cookies directement dedans
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
            // Pas de Secure en dev HTTP (mobile Safari rejette sinon)
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

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return NextResponse.json(
      { error: 'Email ou mot de passe incorrect.' },
      { status: 401 }
    )
  }

  return response
}
