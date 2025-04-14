import { createClient } from "@supabase/supabase-js"

// 環境変数のチェック
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 環境変数が設定されていない場合のダミークライアント
const dummyClient = {
  from: () => ({
    select: () => ({
      order: () => ({
        limit: () => ({
          data: [],
          error: new Error("Supabaseの環境変数が設定されていません"),
        }),
        range: () => ({
          data: [],
          error: new Error("Supabaseの環境変数が設定されていません"),
        }),
        data: [],
        error: new Error("Supabaseの環境変数が設定されていません"),
      }),
      limit: () => ({
        data: [],
        error: new Error("Supabaseの環境変数が設定されていません"),
      }),
      data: [],
      error: new Error("Supabaseの環境変数が設定されていません"),
    }),
    insert: () => ({
      count: 0,
      error: new Error("Supabaseの環境変数が設定されていません"),
    }),
    delete: () => ({
      gte: () => ({
        lte: () => ({
          count: 0,
          error: new Error("Supabaseの環境変数が設定されていません"),
        }),
      }),
    }),
  }),
  rpc: () => ({
    data: null,
    error: new Error("Supabaseの環境変数が設定されていません"),
  }),
}

// 環境変数が設定されている場合は実際のクライアントを作成、そうでなければダミークライアントを使用
export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : (dummyClient as any)

console.log(
  "Supabaseクライアントが初期化されました",
  supabaseUrl ? "（環境変数あり）" : "（環境変数なし - ダミークライアント）",
)
