import { createClient } from '@/lib/supabase/server'
import { XpBar } from '@/components/layout/xp-bar'
import { UserProvider } from '@/components/providers/user-provider'
import { LevelUpOverlay } from '@/components/game/level-up-overlay'
import type { UserProfile } from '@/types/game'

export default async function GameLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile: UserProfile | null = null
  if (user) {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()
    profile = data
  }

  return (
    <UserProvider initialUser={profile}>
      <div className="min-h-screen bg-background flex flex-col">
        <XpBar />
        <main className="flex-1">{children}</main>
        <LevelUpOverlay />
      </div>
    </UserProvider>
  )
}
