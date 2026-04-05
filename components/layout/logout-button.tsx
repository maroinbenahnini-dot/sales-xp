'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { logout } from '@/lib/auth/actions'

export function LogoutButton() {
  const [isPending, startTransition] = useTransition()

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={isPending}
      onClick={() => startTransition(() => logout())}
    >
      {isPending ? '…' : 'Déconnexion'}
    </Button>
  )
}
