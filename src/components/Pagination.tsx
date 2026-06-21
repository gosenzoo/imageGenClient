import Link from 'next/link'
import styles from './Pagination.module.css'

type Props = {
  currentPage: number
  totalPages: number
  basePath: string
}

export default function Pagination({ currentPage, totalPages, basePath }: Props) {
  if (totalPages <= 1) return null

  return (
    <div className={styles.wrapper}>
      {currentPage > 1 && (
        <Link href={`${basePath}?page=${currentPage - 1}`} className={styles.btn}>
          ← 前へ
        </Link>
      )}
      <span className={styles.info}>
        {currentPage} / {totalPages}
      </span>
      {currentPage < totalPages && (
        <Link href={`${basePath}?page=${currentPage + 1}`} className={styles.btn}>
          次へ →
        </Link>
      )}
    </div>
  )
}
