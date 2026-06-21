@AGENTS.md

# プロジェクト概要

画像生成クライアントアプリ。Next.js 16 + React 19 + TypeScript 構成。

# 技術スタック

- **Next.js** 16.2.9（App Router、`src/app/` 配置）
- **React** 19.2.4
- **TypeScript** 5
- **ESLint** 9（`eslint.config.mjs`）

> **注意:** このプロジェクトの Next.js はトレーニングデータと異なる可能性がある。コードを書く前に必ず `node_modules/next/dist/docs/` のドキュメントを参照すること。

# フォルダ構成

```
src/
└── app/              # App Router のルートディレクトリ
    ├── layout.tsx    # ルートレイアウト
    ├── page.tsx      # ホームページ
    ├── globals.css   # グローバルスタイル
    └── page.module.css

public/               # 静的アセット（SVG など）
next.config.ts        # Next.js 設定
tsconfig.json         # TypeScript 設定
eslint.config.mjs     # ESLint 設定
```

# パスエイリアス

`@/*` → `./src/*`

# 言語ルール

コード内のコメント、ドキュメント、コミットメッセージはすべて **日本語** で記述すること。

# 開発コマンド

```bash
npm run dev    # 開発サーバー起動
npm run build  # プロダクションビルド
npm run start  # プロダクションサーバー起動
npm run lint   # ESLint 実行
```
