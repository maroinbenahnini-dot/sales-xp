import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getMaterial } from '@/lib/game/materials'
import { MaterialReader } from '@/components/game/material-reader'

interface Props {
  params: Promise<{ id: string }>
}

export default async function MaterialPage({ params }: Props) {
  const { id } = await params
  const material = getMaterial(id)
  if (!material) notFound()

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <Link
        href="/materials"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        ← Sales Material
      </Link>
      <MaterialReader material={material} />
    </div>
  )
}
