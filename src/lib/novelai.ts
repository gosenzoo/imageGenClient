import JSZip from 'jszip'
import type { GenerationParameters } from './types'

const NOVELAI_API = 'https://image.novelai.net'

export const MODEL_OPTIONS = [
  { label: 'NAI Diffusion V4.5 Full', value: 'nai-diffusion-4-5-full' },
  { label: 'NAI Diffusion V4.5 Curated', value: 'nai-diffusion-4-5-curated-preview' },
]

export const DEFAULT_MODEL = 'nai-diffusion-4-5-full'

export const SAMPLER_OPTIONS = [
  { label: 'Euler Ancestral', value: 'k_euler_ancestral' },
  { label: 'Euler', value: 'k_euler' },
  { label: 'DPM++ 2S Ancestral', value: 'k_dpmpp_2s_ancestral' },
  { label: 'DPM++ 2M', value: 'k_dpmpp_2m' },
  { label: 'DPM++ SDE', value: 'k_dpmpp_sde' },
]

export const NOISE_SCHEDULE_OPTIONS = [
  { label: 'N/A (native)', value: 'native' },
  { label: 'Karras', value: 'karras' },
  { label: 'Exponential', value: 'exponential' },
]

export const DEFAULT_PARAMETERS: GenerationParameters = {
  steps: 23,
  cfg_scale: 5,
  noise_schedule: 'karras',
  sampler: 'k_euler_ancestral',
}

export const DEFAULT_REFERENCE_STRENGTH = 0.6
export const DEFAULT_REFERENCE_FIDELITY = 1.0

type GenerateImageInput = {
  positivePrompt: string
  negativePrompt: string
  model: string
  parameters: GenerationParameters
  referenceImageBase64?: string
  referenceStrength?: number
  referenceFidelity?: number
}

function isV4Model(model: string): boolean {
  return model.includes('-4-')
}

export async function generateImage(input: GenerateImageInput): Promise<Buffer> {
  const apiKey = process.env.NOVELAI_API_KEY
  if (!apiKey) throw new Error('NOVELAI_API_KEY が設定されていません')

  const v4 = isV4Model(input.model)
  const hasRef = !!input.referenceImageBase64
  const refStrength = input.referenceStrength ?? DEFAULT_REFERENCE_STRENGTH
  const refFidelity = input.referenceFidelity ?? DEFAULT_REFERENCE_FIDELITY

  // 公式リクエストと同じキー順序で parameters を構築
  const parameters: Record<string, unknown> = {
    params_version: 3,
    width: 832,
    height: 1216,
    scale: input.parameters.cfg_scale,
    sampler: input.parameters.sampler,
    steps: input.parameters.steps,
    ...(input.parameters.seed != null && { seed: input.parameters.seed }),
    n_samples: 1,
    ucPreset: 0,
    qualityToggle: true,
    autoSmea: false,
    dynamic_thresholding: false,
    controlnet_strength: 1,
    legacy: false,
    add_original_image: true,
    cfg_rescale: 0,
    noise_schedule: input.parameters.noise_schedule,
    legacy_v3_extend: false,
    skip_cfg_above_sigma: null,
    use_coords: false,
    legacy_uc: false,
    normalize_reference_strength_multiple: true,
    inpaintImg2ImgStrength: 1,
    characterPrompts: [],
    // 参照画像あり: v4_prompt の前に director_reference_descriptions 系
    ...(hasRef && v4 && {
      director_reference_descriptions: [{
        caption: { base_caption: 'character&style', char_captions: [] },
        legacy_uc: false,
      }],
      director_reference_information_extracted: [refFidelity],
      director_reference_strength_values: [refStrength],
      director_reference_secondary_strength_values: [
        Math.round((1 - refStrength) * 100) / 100,
      ],
    }),
    ...(v4 && {
      v4_prompt: {
        caption: { base_caption: input.positivePrompt, char_captions: [] },
        use_coords: false,
        use_order: true,
      },
      v4_negative_prompt: {
        caption: { base_caption: input.negativePrompt, char_captions: [] },
        legacy_uc: false,
      },
    }),
    negative_prompt: input.negativePrompt,
    deliberate_euler_ancestral_bug: false,
    prefer_brownian: true,
    image_format: 'png',
    // 参照画像あり: image_format の後に cached images
    ...(hasRef && v4 && {
      director_reference_images_cached: [{ cache_secret_key: '' }],
    }),
    stream: 'msgpack',
  }

  const body = {
    input: input.positivePrompt,
    model: input.model,
    action: 'generate',
    parameters,
    use_new_shared_trial: true,
  }

  // デバッグ: NovelAI に送るリクエスト JSON 全文をターミナルに出力
  console.log('[NovelAI] full request body:', JSON.stringify(body, null, 2))

  const res = await fetch(`${NOVELAI_API}/ai/generate-image`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`NovelAI API エラー ${res.status}: ${text}`)
  }

  // レスポンスは zip ファイル。最初の画像ファイルを取り出す
  const arrayBuffer = await res.arrayBuffer()
  const zip = await JSZip.loadAsync(arrayBuffer)
  const imageFile = Object.values(zip.files).find((f) => !f.dir)
  if (!imageFile) throw new Error('zip から画像ファイルが見つかりません')

  const imageBuffer = await imageFile.async('nodebuffer')
  return imageBuffer
}
