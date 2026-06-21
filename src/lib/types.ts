export type GenerationParameters = {
  steps: number
  cfg_scale: number
  noise_schedule: string
  sampler: string
  seed?: number
}

export type Generation = {
  id: string
  created_at: string
  positive_prompt: string
  negative_prompt: string | null
  reference_image_url: string | null
  generated_image_url: string
  parameters: GenerationParameters
}

export type PresetType = 'positive' | 'negative'

export type PromptPreset = {
  id: string
  created_at: string
  type: PresetType
  label: string
  content: string
}
