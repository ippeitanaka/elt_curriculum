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
        tableExists: false,
        message: "環境変数を設定してください",
      })
    }

    // 環境変数が設定されている場合のみ、Supabaseクライアントを初期化
    const { createClient } = await import("@supabase/supabase-js")
    const supabase = createClient(supabaseUrl, supabaseKey)

    // スケジュールテーブルの構造を確認
    const { data, error } = await supabase.from("スケジュール").select("*").limit(1)

    if (error) {
      console.error("Supabaseクエリエラー:", error)
      return NextResponse.json({ error: `Supabaseクエリエラー: ${error.message}` }, { status: 500 })
    }

    if (!data || data.length === 0) {
      // テーブルは存在するが、データがない場合
      return NextResponse.json({
        tableExists: true,
        columns: [],
        message: "テーブルは存在しますが、データがありません",
      })
    }

    // テーブルのカラム情報を取得
    const firstRow = data[0]
    const columns = Object.keys(firstRow).map((key) => ({
      name: key,
      type: typeof firstRow[key],
      sample: firstRow[key],
    }))

    return NextResponse.json({
      tableExists: true,
      columns: columns,
      rowExample: firstRow,
    })
  } catch (error) {
    console.error("テーブル情報の取得中にエラーが発生しました:", error)

    // エラーが PostgresError の場合、テーブルが存在しないと判断
    const errorMessage = error instanceof Error ? error.message : String(error)
    const isTableNotExistError =
      errorMessage.includes("does not exist") || errorMessage.includes("relation") || errorMessage.includes("42P01")

    if (isTableNotExistError) {
      return NextResponse.json({
        tableExists: false,
        error: "スケジュールテーブルが存在しません",
      })
    }

    return NextResponse.json(
      {
        error: `テーブル情報の取得に失敗しました: ${errorMessage}`,
      },
      { status: 500 },
    )
  }
}
