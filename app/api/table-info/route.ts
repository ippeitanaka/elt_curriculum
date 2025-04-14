import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// 環境変数のチェックと Supabase クライアントの作成を関数として分離
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    // エラーを投げる代わりに null を返し、呼び出し側で処理する
    console.error("Supabaseの環境変数が設定されていません")
    return null
  }

  return createClient(supabaseUrl, supabaseKey)
}

export async function GET() {
  try {
    const supabase = getSupabaseClient()

    if (!supabase) {
      // Supabase クライアントが作成できない場合はエラーレスポンスを返す
      return NextResponse.json(
        {
          error: "Supabase の環境変数が設定されていません。Vercel ダッシュボードで環境変数を設定してください。",
        },
        { status: 500 },
      )
    }

    // スケジュールテーブルの情報を取得
    const { data, error } = await supabase.from("スケジュール").select("*").limit(1)

    if (error) {
      console.error("テーブル情報取得エラー:", error)
      return NextResponse.json({ error: `テーブル情報取得エラー: ${error.message}` }, { status: 500 })
    }

    if (!data || data.length === 0) {
      // テーブルは存在するが、データがない場合
      // システム情報からテーブル構造を取得する代替処理を実装
      try {
        const { data: tableData, error: tableError } = await supabase.rpc("get_table_info", {
          table_name: "スケジュール",
        })

        if (tableError) throw tableError

        return NextResponse.json({
          message: "テーブルは存在しますが、データがありません",
          structure: tableData || [],
        })
      } catch (rpcError) {
        // RPC関数が存在しない場合など
        return NextResponse.json({
          message: "テーブルは存在しますが、データがなく、構造も取得できません",
        })
      }
    }

    // テーブルのカラム情報を取得
    const columnInfo = Object.keys(data[0]).map((column) => {
      const value = data[0][column]
      return {
        name: column,
        type: typeof value,
        nullable: value === null,
        example: value,
      }
    })

    return NextResponse.json({
      hasData: true,
      columns: columnInfo,
    })
  } catch (error) {
    console.error("テーブル情報の取得中にエラーが発生しました:", error)
    return NextResponse.json(
      {
        error: `テーブル情報の取得に失敗しました: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
      },
      { status: 500 },
    )
  }
}
