'use client'

import type { PromptPreset, PresetType } from '@/lib/types'
import styles from './PresetPanel.module.css'

type Props = {
  presets: PromptPreset[]
  type: PresetType
  onSelect: (content: string) => void
}

export default function PresetPanel({ presets, type, onSelect }: Props) {
  const filtered = presets.filter((p) => p.type === type)

  if (filtered.length === 0) {
    return <p className={styles.empty}>プリセットなし</p>
  }

  return (
    <div className={styles.list}>
      {filtered.map((p) => (
        <button
          key={p.id}
          type="button"
          className={styles.item}
          onClick={() => onSelect(p.content)}
          title={p.content}
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}
