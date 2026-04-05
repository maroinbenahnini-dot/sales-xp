'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { loginSchema, registerSchema } from './schemas'

export async function login(formData: FormData) {
  const raw = Object.fromEntries(formData)
  const parsed = loginSchema.safeParse(raw)

  if (!parsed.success) {
    return { error: 'Données invalides.', redirectTo: null }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) {
    return { error: 'Email ou mot de passe incorrect.', redirectTo: null }
  }

  return { error: null, redirectTo: '/dashboard' }
}

export async function register(formData: FormData) {
  const raw = Object.fromEntries(formData)
  const parsed = registerSchema.safeParse(raw)

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Données invalides.'
    return { error: firstError, redirectTo: null }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { username: parsed.data.username },
    },
  })

  if (error) {
    if (error.code === 'user_already_exists') {
      return { error: 'Un compte existe déjà avec cet email.', redirectTo: null }
    }
    return { error: 'Erreur lors de la création du compte.', redirectTo: null }
  }

  return { error: null, redirectTo: '/dashboard' }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
