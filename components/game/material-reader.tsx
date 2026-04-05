'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { SalesMaterial } from '@/types/game'

const THEME_ICONS: Record<string, string> = {
  apps: '📱', infra: '🖥️', dwp: '💼', data: '📊', cyber: '🛡️', cloud: '☁️', tma: '🔧',
}

const TYPE_LABELS: Record<string, string> = {
  cheatsheet: 'Cheat Sheet', glossary: 'Glossaire', pitch: 'Pitch', objections: 'Objections', methodo: 'Méthodo',
}

const TYPE_COLORS: Record<string, string> = {
  cheatsheet:  'bg-blue-500/15 text-blue-400',
  glossary:    'bg-purple-500/15 text-purple-400',
  pitch:       'bg-green-500/15 text-green-400',
  objections:  'bg-orange-500/15 text-orange-400',
  methodo:     'bg-yellow-500/15 text-yellow-400',
}

/** Transforms markdown-lite text into JSX elements */
function renderContent(text: string) {
  const lines = text.split('\n')
  const elements: React.ReactNode[] = []
  let key = 0

  for (const line of lines) {
    if (line.trim() === '') {
      key++
      continue
    }

    // Bullet point
    if (line.startsWith('- ')) {
      elements.push(
        <li key={key++} className="ml-4 text-sm text-muted-foreground leading-relaxed list-disc">
          {renderInline(line.slice(2))}
        </li>
      )
      continue
    }

    // Normal paragraph
    elements.push(
      <p key={key++} className="text-sm text-muted-foreground leading-relaxed">
        {renderInline(line)}
      </p>
    )
  }

  return elements
}

function renderInline(text: string): React.ReactNode[] {
  // Handle **bold**, `code`, and plain text
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-foreground font-semibold">{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className="px-1.5 py-0.5 rounded bg-muted border border-border text-xs font-mono text-primary">{part.slice(1, -1)}</code>
    }
    return part
  })
}

interface Props { material: SalesMaterial }

export function MaterialReader({ material }: Props) {
  const [activeSection, setActiveSection] = useState(0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border bg-card p-5">
        <div className="flex items-start gap-4">
          <span className="text-4xl shrink-0">{THEME_ICONS[material.theme]}</span>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_COLORS[material.type]}`}>
                {TYPE_LABELS[material.type]}
              </span>
              <span className="text-xs text-muted-foreground">{material.read_time_min} min de lecture</span>
            </div>
            <h1 className="text-xl font-bold leading-tight">{material.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">{material.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Key numbers */}
      {material.key_numbers && material.key_numbers.length > 0 && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
          <p className="text-xs text-primary font-semibold uppercase tracking-wide mb-3">Chiffres clés à retenir</p>
          <div className="space-y-2">
            {material.key_numbers.map((num, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-primary mt-0.5 shrink-0">💡</span>
                <p className="text-sm font-medium">{num}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section nav (mobile friendly — tabs) */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {material.sections.map((section, i) => (
          <button
            key={i}
            onClick={() => setActiveSection(i)}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
              activeSection === i
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {i + 1}. {section.title.length > 28 ? section.title.slice(0, 28) + '…' : section.title}
          </button>
        ))}
      </div>

      {/* Section content */}
      <motion.div
        key={activeSection}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="rounded-xl border border-border bg-card p-5 space-y-4"
      >
        <h2 className="font-semibold text-base">{material.sections[activeSection].title}</h2>
        <div className="space-y-2">
          {renderContent(material.sections[activeSection].content)}
        </div>
      </motion.div>

      {/* Prev/Next navigation */}
      <div className="flex justify-between gap-3">
        <button
          onClick={() => setActiveSection(prev => Math.max(0, prev - 1))}
          disabled={activeSection === 0}
          className="flex-1 py-2.5 rounded-lg border border-border text-sm disabled:opacity-30 hover:bg-muted transition-colors"
        >
          ← Précédent
        </button>
        <button
          onClick={() => setActiveSection(prev => Math.min(material.sections.length - 1, prev + 1))}
          disabled={activeSection === material.sections.length - 1}
          className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm disabled:opacity-30 hover:bg-primary/90 transition-colors"
        >
          Suivant →
        </button>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-1.5">
        {material.sections.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveSection(i)}
            className={`w-2 h-2 rounded-full transition-colors ${
              i === activeSection ? 'bg-primary' : i < activeSection ? 'bg-primary/40' : 'bg-muted'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
