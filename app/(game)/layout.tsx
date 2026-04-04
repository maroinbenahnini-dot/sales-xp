import { XpBar } from '@/components/layout/xp-bar'

export default function GameLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <XpBar />
      <main className="flex-1">{children}</main>
    </div>
  )
}
