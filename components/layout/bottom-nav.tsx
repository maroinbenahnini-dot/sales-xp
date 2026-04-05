'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUserStore } from '@/store/user'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Accueil', icon: '🏠' },
  { href: '/library', label: 'Scénarios', icon: '🎯' },
  { href: '/materials', label: 'Fiches', icon: '📚' },
  { href: '/profile', label: 'Profil', icon: '👤' },
]

export function BottomNav() {
  const user = useUserStore((s) => s.user)
  const pathname = usePathname()

  if (!user) return null

  return (
    <nav
      className="sm:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-stretch">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-xs transition-colors ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              <span className="leading-none">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
