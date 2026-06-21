'use client'

import styles from './PromptInput.module.css'

type Props = {
  label: string
  value: string
  onChange: (value: string) => void
}

export default function PromptInput({ label, value, onChange }: Props) {
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      onChange(value + text)
    } catch {
      alert('クリップボードへのアクセスが許可されていません')
    }
  }

  const handleClear = () => onChange('')

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        {label && <label className={styles.label}>{label}</label>}
        <div className={styles.buttons}>
          <button type="button" onClick={handlePaste} className={styles.btn}>
            貼り付け
          </button>
          <button type="button" onClick={handleClear} className={styles.btn}>
            削除
          </button>
        </div>
      </div>
      <textarea
        className={styles.textarea}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
      />
    </div>
  )
}
