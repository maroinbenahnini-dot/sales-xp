'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/store/user'
import type { UserProfile } from '@/types/game'

interface Props {
  initialUser: UserProfile | null
  children: React.ReactNode
}

export function UserProvider({ initialUser, children }: Props) {
  const setUser = useUserStore((s) => s.setUser)

  useEffect(() => {
    setUser(initialUser)

    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (event === 'SIGNED_OUT') setUser(null)
      }
    )

    return () => subscription.unsubscribe()
  }, [initialUser, setUser])

  return <>{children}</>
}
