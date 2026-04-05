import fs from 'fs'
import path from 'path'
import type { SalesMaterial, ScenarioTheme, MaterialType } from '@/types/game'

const MATERIALS_DIR = path.join(process.cwd(), 'content', 'materials')

let _cache: SalesMaterial[] | null = null

export function getAllMaterials(): SalesMaterial[] {
  if (_cache) return _cache
  try {
    const files = fs.readdirSync(MATERIALS_DIR).filter(f => f.endsWith('.json'))
    _cache = files.flatMap(file => {
      const raw = fs.readFileSync(path.join(MATERIALS_DIR, file), 'utf-8')
      return JSON.parse(raw) as SalesMaterial[]
    })
    return _cache
  } catch {
    return []
  }
}

export function getMaterial(id: string): SalesMaterial | null {
  return getAllMaterials().find(m => m.id === id) ?? null
}

export function filterMaterials(
  materials: SalesMaterial[],
  opts: { theme?: ScenarioTheme; type?: MaterialType; q?: string }
): SalesMaterial[] {
  return materials.filter(m => {
    if (opts.theme && m.theme !== opts.theme) return false
    if (opts.type && m.type !== opts.type) return false
    if (opts.q) {
      const q = opts.q.toLowerCase()
      if (!m.title.toLowerCase().includes(q) && !m.subtitle.toLowerCase().includes(q) && !(m.tags ?? []).some(t => t.includes(q))) return false
    }
    return true
  })
}
