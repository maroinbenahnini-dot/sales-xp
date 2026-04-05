import fs from 'fs'
import path from 'path'
import type { Rfp } from '@/types/game'

const RFP_DIR = path.join(process.cwd(), 'content', 'rfp')

export function getAllRfps(): Rfp[] {
  try {
    const files = fs.readdirSync(RFP_DIR).filter(f => f.endsWith('.json'))
    return files.map(file => {
      const raw = fs.readFileSync(path.join(RFP_DIR, file), 'utf-8')
      return JSON.parse(raw) as Rfp
    })
  } catch {
    return []
  }
}

export function getRfp(id: string): Rfp | null {
  try {
    const raw = fs.readFileSync(path.join(RFP_DIR, `${id.toLowerCase()}.json`), 'utf-8')
    return JSON.parse(raw) as Rfp
  } catch {
    return null
  }
}
