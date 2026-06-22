'use client'

import { useEffect, useState } from 'react'
import styles from './AnlasBalance.module.css'

export default function AnlasBalance() {
  const [anlas, setAnlas] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/anlas')
      .then((r) => r.json())
      .then((d) => { if (typeof d.anlas === 'number') setAnlas(d.anlas) })
      .catch(() => {})
  }, [])

  if (anlas === null) return null

  return (
    <span className={styles.badge}>
      Anlas: {anlas.toLocaleString()}
    </span>
  )
}
