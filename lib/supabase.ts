import { createClient } from "@supabase/supabase-js"

// 環境変数のチェックをより安全に行う
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    // 開発環境では警告を出し、プロダクション環境ではログを出すだけ
    if (process.env.NODE_ENV === "development") {
      console.warn("Warning: Supabaseの環境変数が設定されていません")
    } else {
      console.log("Supabase環境変数が見つかりませんが、静的ページの生成を続行します")
    }

    // ダミークライアントを返す（ほとんどの操作は失敗するが、アプリはクラッシュしない）
    return {
      from: () => ({
        select: () => ({
          order: () => ({
            limit: () => ({
              then: () => Promise.resolve({ data: [], error: null }),
              catch: () => Promise.resolve({ data: [], error: null }),
            }),
            range: () => ({
              then: () => Promise.resolve({ data: [], error: null }),
              catch: () => Promise.resolve({ data: [], error: null }),
            }),
            then: () => Promise.resolve({ data: [], error: null }),
            catch: () => Promise.resolve({ data: [], error: null }),
          }),
          then: () => Promise.resolve({ data: [], error: null }),
          catch: () => Promise.resolve({ data: [], error: null }),
        }),
      }),
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      },
    }
  }

  // 本物のクライアントを作成
  return createClient(supabaseUrl, supabaseKey)
}

export const supabase = getSupabaseClient()

console.log("Supabaseクライアントが初期化されました")
