'use client'

import { useState, useEffect } from 'react'
import GenerateForm from './GenerateForm'
import PresetManager from '@/app/presets/PresetManager'
import { getHistory } from '@/actions/history'
import type { PromptPreset, Generation } from '@/lib/types'
import styles from './MainTabs.module.css'
import historyStyles from '@/app/history/page.module.css'

type Tab = 'generate' | 'history' | 'presets'

const PAGE_SIZE = 10

type Props = {
  presets: PromptPreset[]
}

export default function MainTabs({ presets }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('generate')

  // 履歴タブ用の状態
  const [historyData, setHistoryData] = useState<Generation[]>([])
  const [historyPage, setHistoryPage] = useState(1)
  const [historyTotal, setHistoryTotal] = useState(0)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyLoaded, setHistoryLoaded] = useState(false)

  const totalPages = Math.ceil(historyTotal / PAGE_SIZE)

  const loadHistory = async (page: number) => {
    setHistoryLoading(true)
    try {
      const { data, total } = await getHistory(page)
      setHistoryData(data)
      setHistoryTotal(total)
      setHistoryPage(page)
      setHistoryLoaded(true)
    } finally {
      setHistoryLoading(false)
    }
  }

  // 履歴タブに切り替えたときに初回ロード
  useEffect(() => {
    if (activeTab === 'history' && !historyLoaded) {
      loadHistory(1)
    }
  }, [activeTab, historyLoaded])

  return (
    <div>
      {/* タブバー */}
      <div className={styles.tabBar}>
        <button
          className={`${styles.tab} ${activeTab === 'generate' ? styles.active : ''}`}
          onClick={() => setActiveTab('generate')}
        >
          生成
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'history' ? styles.active : ''}`}
          onClick={() => setActiveTab('history')}
        >
          履歴
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'presets' ? styles.active : ''}`}
          onClick={() => setActiveTab('presets')}
        >
          プリセット
        </button>
      </div>

      {/* 生成フォーム（常にマウントして状態を保持、非アクティブ時のみ非表示） */}
      <div style={{ display: activeTab === 'generate' ? undefined : 'none' }}>
        <GenerateForm presets={presets} />
      </div>

      {/* 履歴タブ */}
      {activeTab === 'history' && (
        <div>
          <h1 className={styles.tabTitle}>生成履歴</h1>
          {historyLoading ? (
            <p className={styles.muted}>読み込み中...</p>
          ) : !historyLoaded || historyData.length === 0 ? (
            <p className={styles.muted}>履歴がありません</p>
          ) : (
            <>
              <div className={historyStyles.grid}>
                {historyData.map((g) => (
                  <div key={g.id} className={historyStyles.card}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={g.generated_image_url} alt="生成画像" className={historyStyles.image} />
                    <div className={historyStyles.info}>
                      <p className={historyStyles.prompt}>{g.positive_prompt}</p>
                      {g.negative_prompt && (
                        <p className={historyStyles.negative}>{g.negative_prompt}</p>
                      )}
                      <p className={historyStyles.date}>
                        {new Date(g.created_at).toLocaleString('ja-JP')}
                      </p>
                      <div className={historyStyles.params}>
                        <span>Steps: {g.parameters.steps}</span>
                        <span>CFG: {g.parameters.cfg_scale}</span>
                        <span>Sampler: {g.parameters.sampler}</span>
                      </div>
                      {g.reference_image_url && (
                        <a href={g.reference_image_url} target="_blank" rel="noreferrer" className={historyStyles.refLink}>
                          参照画像を見る
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <button
                    className={styles.pageBtn}
                    disabled={historyPage <= 1}
                    onClick={() => loadHistory(historyPage - 1)}
                  >
                    ← 前へ
                  </button>
                  <span className={styles.pageInfo}>{historyPage} / {totalPages}</span>
                  <button
                    className={styles.pageBtn}
                    disabled={historyPage >= totalPages}
                    onClick={() => loadHistory(historyPage + 1)}
                  >
                    次へ →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* プリセットタブ */}
      {activeTab === 'presets' && (
        <div>
          <h1 className={styles.tabTitle}>プリセット管理</h1>
          <PresetManager initialPresets={presets} />
        </div>
      )}
    </div>
  )
}
