import Link from 'next/link'
import styles from './Nav.module.css'

export default function Nav() {
  return (
    <nav className={styles.nav}>
      <Link href="/" className={styles.brand}>画像生成</Link>
      <div className={styles.links}>
        <Link href="/" className={styles.link}>生成</Link>
        <Link href="/history" className={styles.link}>履歴</Link>
        <Link href="/presets" className={styles.link}>プリセット</Link>
      </div>
    </nav>
  )
}
