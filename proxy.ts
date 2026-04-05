import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/login', '/register']

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => {
            // Sur HTTP local, on retire le flag Secure pour que Safari mobile accepte les cookies
            const safeOptions = process.env.NODE_ENV === 'development'
              ? { ...options, secure: false, sameSite: 'lax' as const }
              : options
            supabaseResponse.cookies.set(name, value, safeOptions)
          })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  const pathname = request.nextUrl.pathname
  const isPublicRoute = PUBLIC_ROUTES.some(r => pathname.startsWith(r))

  if (!session && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (session && isPublicRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
