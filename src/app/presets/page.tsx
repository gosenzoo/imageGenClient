import { getPresets } from '@/actions/presets'
import PresetManager from './PresetManager'

export default async function PresetsPage() {
  const presets = await getPresets()

  return (
    <div>
      <h1 style={{ marginBottom: '24px', fontSize: '1.4rem' }}>プリセット管理</h1>
      <PresetManager initialPresets={presets} />
    </div>
  )
}
