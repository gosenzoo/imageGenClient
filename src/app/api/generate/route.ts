import { NextRequest } from 'next/server'
import sharp from 'sharp'
import { generateImage } from '@/lib/novelai'
import { supabase, GENERATED_BUCKET, REFERENCE_BUCKET } from '@/lib/supabase'
import type { GenerationParameters } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()

    const positivePrompt = formData.get('positivePrompt') as string
    const negativePrompt = (formData.get('negativePrompt') as string) ?? ''
    const model = formData.get('model') as string
    const parametersRaw = formData.get('parameters') as string
    const parameters: GenerationParameters = JSON.parse(parametersRaw)
    const referenceFile = formData.get('referenceImage') as File | null
    const referenceStrength = parseFloat((formData.get('referenceStrength') as string) ?? '0.6')
    const referenceFidelity = parseFloat((formData.get('referenceFidelity') as string) ?? '1.0')

    // 参照画像をアップロード
    let referenceImageUrl: string | null = null
    let referenceImageBase64: string | undefined
    if (referenceFile && referenceFile.size > 0) {
      const refBuffer = Buffer.from(await referenceFile.arrayBuffer())

      // SDK に合わせて 1024×1536 の PNG にリサイズ（アスペクト比保持・黒パディング）
      const resizedBuffer = await sharp(refBuffer)
        .resize(1024, 1536, { fit: 'contain', background: { r: 0, g: 0, b: 0 } })
        .png()
        .toBuffer()
      referenceImageBase64 = resizedBuffer.toString('base64')

      const refPath = `${Date.now()}_ref.png`
      const { error: refError } = await supabase.storage
        .from(REFERENCE_BUCKET)
        .upload(refPath, resizedBuffer, { contentType: 'image/png' })
      if (refError) throw new Error(`参照画像アップロード失敗: ${refError.message}`)

      const { data: refData } = supabase.storage
        .from(REFERENCE_BUCKET)
        .getPublicUrl(refPath)
      referenceImageUrl = refData.publicUrl
    }

    // NovelAI で画像生成
    const imageBuffer = await generateImage({
      positivePrompt,
      negativePrompt,
      model,
      parameters,
      referenceImageBase64,
      referenceStrength,
      referenceFidelity,
    })

    // 生成画像をアップロード
    const genPath = `${Date.now()}_gen.png`
    const { error: genError } = await supabase.storage
      .from(GENERATED_BUCKET)
      .upload(genPath, imageBuffer, { contentType: 'image/png' })
    if (genError) throw new Error(`生成画像アップロード失敗: ${genError.message}`)

    const { data: genData } = supabase.storage
      .from(GENERATED_BUCKET)
      .getPublicUrl(genPath)
    const generatedImageUrl = genData.publicUrl

    // 履歴を DB に保存
    const { error: dbError } = await supabase.from('generations').insert({
      positive_prompt: positivePrompt,
      negative_prompt: negativePrompt || null,
      reference_image_url: referenceImageUrl,
      generated_image_url: generatedImageUrl,
      parameters,
    })
    if (dbError) throw new Error(`DB 保存失敗: ${dbError.message}`)

    return Response.json({ generatedImageUrl })
  } catch (e) {
    const message = e instanceof Error ? e.message : '不明なエラー'
    return Response.json({ error: message }, { status: 500 })
  }
}
