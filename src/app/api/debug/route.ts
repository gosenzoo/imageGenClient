export async function GET() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  // Supabase Storage のバケット一覧を確認
  const res = await fetch(`${url}/storage/v1/bucket`, {
    headers: {
      apikey: key!,
      Authorization: `Bearer ${key}`,
    },
  })

  const json = await res.json()
  return Response.json({ status: res.status, buckets: json })
}
