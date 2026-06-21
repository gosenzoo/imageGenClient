'use client'

import { useState, useRef, useId, useCallback } from 'react'
import PromptInput from './PromptInput'
import PresetPanel from './PresetPanel'
import type { PromptPreset, GenerationParameters } from '@/lib/types'
import { DEFAULT_PARAMETERS, DEFAULT_MODEL, DEFAULT_REFERENCE_STRENGTH, DEFAULT_REFERENCE_FIDELITY, MODEL_OPTIONS, SAMPLER_OPTIONS, NOISE_SCHEDULE_OPTIONS } from '@/lib/novelai'
import styles from './GenerateForm.module.css'

type Props = {
  presets: PromptPreset[]
}

export default function GenerateForm({ presets }: Props) {
  const [positivePrompt, setPositivePrompt] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')
  const [model, setModel] = useState(DEFAULT_MODEL)
  const [qualityTags, setQualityTags] = useState(true)
  const [nsfw, setNsfw] = useState(false)
  const [parameters, setParameters] = useState<GenerationParameters>(DEFAULT_PARAMETERS)
  const [referenceFile, setReferenceFile] = useState<File | null>(null)
  const [referenceStrength, setReferenceStrength] = useState(DEFAULT_REFERENCE_STRENGTH)
  const [referenceFidelity, setReferenceFidelity] = useState(DEFAULT_REFERENCE_FIDELITY)
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const fileInputId = useId()

  const updateParam = <K extends keyof GenerationParameters>(key: K, value: GenerationParameters[K]) => {
    setParameters((prev) => ({ ...prev, [key]: value }))
  }

  // 非同期処理本体（onClick からは呼び出すだけで await しない）
  const runGenerate = useCallback(async (
    positivePrompt: string,
    negativePrompt: string,
    model: string,
    nsfw: boolean,
    qualityTags: boolean,
    parameters: GenerationParameters,
    referenceFile: File | null,
    referenceStrength: number,
    referenceFidelity: number,
  ) => {
    const QUALITY_POSITIVE = ', very aesthetic, masterpiece, no text'
    const QUALITY_NEGATIVE = ', lowres, artistic error, film grain, scan artifacts, worst quality, bad quality, jpeg artifacts, very displeasing, chromatic aberration, dithering, halftone, screentone, multiple views, logo, too many watermarks, negative space, blank page'

    try {
      let finalPositivePrompt = nsfw ? `nsfw, ${positivePrompt}` : positivePrompt
      let finalNegativePrompt = negativePrompt
      if (qualityTags) {
        finalPositivePrompt += QUALITY_POSITIVE
        finalNegativePrompt += QUALITY_NEGATIVE
      }

      const formData = new FormData()
      formData.append('positivePrompt', finalPositivePrompt)
      formData.append('negativePrompt', finalNegativePrompt)
      formData.append('model', model)
      formData.append('parameters', JSON.stringify(parameters))
      if (referenceFile) {
        formData.append('referenceImage', referenceFile)
        formData.append('referenceStrength', String(referenceStrength))
        formData.append('referenceFidelity', String(referenceFidelity))
      }

      // デバッグ: /api/generate に送る内容（ブラウザコンソールに出力）
      const debugObj: Record<string, unknown> = {}
      for (const [key, value] of formData.entries()) {
        debugObj[key] = value instanceof File
          ? { name: value.name, size: value.size, type: value.type }
          : value
      }
      console.log('[GenerateForm] request to /api/generate:', JSON.stringify(debugObj, null, 2))

      const res = await fetch('/api/generate', { method: 'POST', body: formData })
      const json = await res.json()
      if (!res.ok || json.error) throw new Error(json.error ?? '生成に失敗しました')
      setGeneratedImageUrl(json.generatedImageUrl)
    } catch (e) {
      setError(e instanceof Error ? e.message : '不明なエラー')
    } finally {
      setLoading(false)
    }
  }, [])

  // 同期関数でローディング状態をセットしてから非同期処理を起動
  const handleSubmit = () => {
    if (!positivePrompt.trim()) {
      setError('ポジティブプロンプトを入力してください')
      return
    }
    setLoading(true)
    setError(null)
    setGeneratedImageUrl(null)
    runGenerate(positivePrompt, negativePrompt, model, nsfw, qualityTags, parameters, referenceFile, referenceStrength, referenceFidelity)
  }

  return (
    <div className={styles.container}>
      <div className={styles.form}>
        {/* ポジティブプロンプト */}
        <section className={styles.section}>
          <div className={styles.promptHeader}>
            <span className={styles.label}>ポジティブプロンプト</span>
            <div className={styles.promptButtons}>
              <button
                type="button"
                className={`${styles.qualityBtn} ${qualityTags ? styles.qualityActive : ''}`}
                onClick={() => setQualityTags((v) => !v)}
              >
                品質タグ
              </button>
              <button
                type="button"
                className={`${styles.nsfwBtn} ${nsfw ? styles.nsfwActive : ''}`}
                onClick={() => setNsfw((v) => !v)}
              >
                NSFW
              </button>
            </div>
          </div>
          <PromptInput
            label=""
            value={positivePrompt}
            onChange={setPositivePrompt}
          />
          <PresetPanel
            presets={presets}
            type="positive"
            onSelect={(c) => setPositivePrompt((prev) => prev + (prev ? ', ' : '') + c)}
          />
        </section>

        {/* ネガティブプロンプト */}
        <section className={styles.section}>
          <PromptInput
            label="ネガティブプロンプト"
            value={negativePrompt}
            onChange={setNegativePrompt}
          />
          <PresetPanel
            presets={presets}
            type="negative"
            onSelect={(c) => setNegativePrompt((prev) => prev + (prev ? ', ' : '') + c)}
          />
        </section>

        {/* 参照画像 */}
        <section className={styles.section}>
          <span className={styles.label}>参照画像（任意）</span>
          <div className={styles.fileRow}>
            {/* label で input をラップすることで iOS Safari でも動作する */}
            <input
              ref={fileInputRef}
              id={fileInputId}
              type="file"
              accept="image/*"
              className={styles.fileInput}
              onChange={(e) => setReferenceFile(e.target.files?.[0] ?? null)}
            />
            <label htmlFor={fileInputId} className={styles.fileBtn}>
              ファイルを選択
            </label>
            {referenceFile && (
              <>
                <span className={styles.fileName}>{referenceFile.name}</span>
                <button
                  type="button"
                  className={styles.clearFileBtn}
                  onClick={() => {
                    setReferenceFile(null)
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  }}
                >
                  ✕
                </button>
              </>
            )}
          </div>
          {referenceFile && (
            <div className={styles.referenceSliders}>
              <label className={styles.sliderLabel}>
                <span>強度</span>
                <span className={styles.sliderValue}>{referenceStrength.toFixed(2)}</span>
                <input
                  type="range"
                  min={0} max={1} step={0.05}
                  value={referenceStrength}
                  className={styles.slider}
                  onChange={(e) => setReferenceStrength(Number(e.target.value))}
                />
              </label>
              <label className={styles.sliderLabel}>
                <span>忠実度</span>
                <span className={styles.sliderValue}>{referenceFidelity.toFixed(2)}</span>
                <input
                  type="range"
                  min={0} max={1} step={0.05}
                  value={referenceFidelity}
                  className={styles.slider}
                  onChange={(e) => setReferenceFidelity(Number(e.target.value))}
                />
              </label>
            </div>
          )}
        </section>

        {/* 生成パラメータ */}
        <section className={styles.section}>
          <label className={styles.label}>生成パラメータ</label>
          <div className={styles.params}>
            <label className={styles.paramLabel}>
              モデル
              <select
                className={styles.paramSelect}
                value={model}
                onChange={(e) => setModel(e.target.value)}
              >
                {MODEL_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </label>
            <label className={styles.paramLabel}>
              ステップ数
              <input
                type="number"
                className={styles.paramInput}
                value={parameters.steps}
                min={1}
                max={50}
                onChange={(e) => updateParam('steps', Number(e.target.value))}
              />
            </label>
            <label className={styles.paramLabel}>
              CFG スケール
              <input
                type="number"
                className={styles.paramInput}
                value={parameters.cfg_scale}
                min={1}
                max={20}
                step={0.5}
                onChange={(e) => updateParam('cfg_scale', Number(e.target.value))}
              />
            </label>
            <label className={styles.paramLabel}>
              ノイズスケジュール
              <select
                className={styles.paramSelect}
                value={parameters.noise_schedule}
                onChange={(e) => updateParam('noise_schedule', e.target.value)}
              >
                {NOISE_SCHEDULE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </label>
            <label className={styles.paramLabel}>
              サンプラー
              <select
                className={styles.paramSelect}
                value={parameters.sampler}
                onChange={(e) => updateParam('sampler', e.target.value)}
              >
                {SAMPLER_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </label>
            <label className={styles.paramLabel}>
              シード（空欄でランダム）
              <input
                type="number"
                className={styles.paramInput}
                value={parameters.seed ?? ''}
                onChange={(e) =>
                  updateParam('seed', e.target.value === '' ? undefined : Number(e.target.value))
                }
              />
            </label>
          </div>
        </section>

        {error && <p className={styles.error}>{error}</p>}

        <button type="button" onClick={handleSubmit} className={styles.submitBtn} disabled={loading}>
          {loading ? '生成中...' : '画像を生成'}
        </button>
      </div>

      {/* 生成結果 */}
      {generatedImageUrl && (
        <div className={styles.result}>
          <h2 className={styles.resultTitle}>生成結果</h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={generatedImageUrl} alt="生成画像" className={styles.resultImage} />
          <a href={generatedImageUrl} download className={styles.downloadBtn}>
            ダウンロード
          </a>
        </div>
      )}
    </div>
  )
}
