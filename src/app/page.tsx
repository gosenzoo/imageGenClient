import { getPresets } from '@/actions/presets'
import MainTabs from '@/components/MainTabs'

export default async function Page() {
  const presets = await getPresets()

  return <MainTabs presets={presets} />
}
