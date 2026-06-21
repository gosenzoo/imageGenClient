import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import './globals.css'

export const metadata: Metadata = {
  title: '画像生成クライアント',
  description: 'NovelAI を使った画像生成アプリ',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <Nav />
        <main style={{ padding: '24px 32px' }}>{children}</main>
      </body>
    </html>
  )
}
