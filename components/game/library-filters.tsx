'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'

const THEMES = [
  { value: '', label: 'Tous' },
  { value: 'apps', label: 'Apps' },
  { value: 'infra', label: 'Infra' },
  { value: 'dwp', label: 'DWP' },
  { value: 'data', label: 'Data' },
  { value: 'cyber', label: 'Cyber' },
  { value: 'cloud', label: 'Cloud' },
  { value: 'tma', label: 'TMA' },
]

const ACTS = [
  { value: '', label: 'Tous les actes' },
  { value: '1', label: 'Acte I' },
  { value: '2', label: 'Acte II' },
  { value: '3', label: 'Acte III' },
]

export function LibraryFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const theme = searchParams.get('theme') ?? ''
  const act = searchParams.get('act') ?? ''

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [router, pathname, searchParams]
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {THEMES.map(t => (
          <Badge
            key={t.value}
            variant={theme === t.value ? 'default' : 'outline'}
            className="cursor-pointer select-none"
            onClick={() => setParam('theme', t.value)}
          >
            {t.label}
          </Badge>
        ))}
      </div>

      <Tabs value={act} onValueChange={(v) => setParam('act', v)}>
        <TabsList>
          {ACTS.map(a => (
            <TabsTrigger key={a.value} value={a.value}>
              {a.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  )
}
