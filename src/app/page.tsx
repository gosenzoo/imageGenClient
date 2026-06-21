import { getPresets } from '@/actions/presets'
import GenerateForm from '@/components/GenerateForm'

export default async function Page() {
  const presets = await getPresets()

  return (
    <div>
      <h1 style={{ marginBottom: '24px', fontSize: '1.4rem' }}>画像生成</h1>
      <GenerateForm presets={presets} />
    </div>
  )
}
