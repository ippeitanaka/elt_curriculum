import { NextResponse } from "next/server"

export async function GET() {
  try {
    // 環境変数が設定されていない場合は、エラーメッセージを返す
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.warn("Supabaseの環境変数が設定されていません。")
      return NextResponse.json({
        error: "Supabaseの環境変数が設定されていません",
        message: "環境変数を設定してください",
      })
    }

    // 環境変数が設定されている場合のみ、Supabaseクライアントを初期化
    const { createClient } = await import("@supabase/supabase-js")
    const supabase = createClient(supabaseUrl, supabaseKey)

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
