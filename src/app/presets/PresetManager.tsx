'use client'

import { useState, useTransition } from 'react'
import { createPreset, deletePreset } from '@/actions/presets'
import type { PromptPreset, PresetType } from '@/lib/types'
import styles from './PresetManager.module.css'

type Props = {
  initialPresets: PromptPreset[]
}

export default function PresetManager({ initialPresets }: Props) {
  const [presets, setPresets] = useState(initialPresets)
  const [type, setType] = useState<PresetType>('positive')
  const [label, setLabel] = useState('')
  const [content, setContent] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleCreate = () => {
    if (!label.trim() || !content.trim()) {
      setError('ラベルと内容を入力してください')
      return
    }
    setError(null)
    startTransition(async () => {
      await createPreset(type, label.trim(), content.trim())
      setPresets((prev) => [
        { id: crypto.randomUUID(), created_at: new Date().toISOString(), type, label: label.trim(), content: content.trim() },
        ...prev,
      ])
      setLabel('')
      setContent('')
    })
  }

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deletePreset(id)
      setPresets((prev) => prev.filter((p) => p.id !== id))
    })
  }

  const positivePresets = presets.filter((p) => p.type === 'positive')
  const negativePresets = presets.filter((p) => p.type === 'negative')

  return (
    <div className={styles.container}>
      {/* 新規作成フォーム */}
      <section className={styles.form}>
        <h2 className={styles.sectionTitle}>新規プリセット</h2>
        <div className={styles.formRow}>
          <label className={styles.formLabel}>種別</label>
          <select
            className={styles.select}
            value={type}
            onChange={(e) => setType(e.target.value as PresetType)}
          >
            <option value="positive">ポジティブ</option>
            <option value="negative">ネガティブ</option>
          </select>
        </div>
        <div className={styles.formRow}>
          <label className={styles.formLabel}>ラベル（日本語）</label>
          <input
            className={styles.input}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="例：高品質"
          />
        </div>
        <div className={styles.formRow}>
          <label className={styles.formLabel}>プロンプト内容</label>
          <textarea
            className={styles.textarea}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            placeholder="例：masterpiece, best quality"
          />
        </div>
        {error && <p className={styles.error}>{error}</p>}
        <button onClick={handleCreate} disabled={isPending} className={styles.createBtn}>
          {isPending ? '保存中...' : '保存'}
        </button>
      </section>

      {/* プリセット一覧 */}
      <div className={styles.lists}>
        <PresetList
          title="ポジティブ"
          presets={positivePresets}
          onDelete={handleDelete}
          isPending={isPending}
        />
        <PresetList
          title="ネガティブ"
          presets={negativePresets}
          onDelete={handleDelete}
          isPending={isPending}
        />
      </div>
    </div>
  )
}

function PresetList({
  title,
  presets,
  onDelete,
  isPending,
}: {
  title: string
  presets: PromptPreset[]
  onDelete: (id: string) => void
  isPending: boolean
}) {
  return (
    <section className={styles.listSection}>
      <h2 className={styles.sectionTitle}>{title}プリセット</h2>
      {presets.length === 0 ? (
        <p className={styles.empty}>プリセットなし</p>
      ) : (
        <ul className={styles.list}>
          {presets.map((p) => (
            <li key={p.id} className={styles.item}>
              <div className={styles.itemInfo}>
                <span className={styles.itemLabel}>{p.label}</span>
                <span className={styles.itemContent}>{p.content}</span>
              </div>
              <button
                onClick={() => onDelete(p.id)}
                disabled={isPending}
                className={styles.deleteBtn}
              >
                削除
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
