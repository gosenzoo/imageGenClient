import { getHistory } from '@/actions/history'
import Pagination from '@/components/Pagination'
import styles from './page.module.css'

type Props = {
  searchParams: Promise<{ page?: string }>
}

export default async function HistoryPage({ searchParams }: Props) {
  const { page: pageStr } = await searchParams
  const page = Math.max(1, parseInt(pageStr ?? '1', 10))

  const { data, total } = await getHistory(page)
  const totalPages = Math.ceil(total / 10)

  return (
    <div>
      <h1 style={{ marginBottom: '24px', fontSize: '1.4rem' }}>生成履歴</h1>
      {data.length === 0 ? (
        <p style={{ color: '#888' }}>履歴がありません</p>
      ) : (
        <div className={styles.grid}>
          {data.map((g) => (
            <div key={g.id} className={styles.card}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={g.generated_image_url} alt="生成画像" className={styles.image} />
              <div className={styles.info}>
                <p className={styles.prompt}>{g.positive_prompt}</p>
                {g.negative_prompt && (
                  <p className={styles.negative}>{g.negative_prompt}</p>
                )}
                <p className={styles.date}>
                  {new Date(g.created_at).toLocaleString('ja-JP')}
                </p>
                <div className={styles.params}>
                  <span>Steps: {g.parameters.steps}</span>
                  <span>CFG: {g.parameters.cfg_scale}</span>
                  <span>Sampler: {g.parameters.sampler}</span>
                </div>
                {g.reference_image_url && (
                  <a href={g.reference_image_url} target="_blank" rel="noreferrer" className={styles.refLink}>
                    参照画像を見る
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <Pagination currentPage={page} totalPages={totalPages} basePath="/history" />
    </div>
  )
}
