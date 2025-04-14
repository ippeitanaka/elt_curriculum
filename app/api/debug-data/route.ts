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

    // 日付の範囲を指定せずに全データを取得
    const { data, error } = await supabase.from("スケジュール").select("*").order("日付", { ascending: true })

    if (error) {
      console.error("Supabaseクエリエラー:", error)
      return NextResponse.json({ error: `Supabaseクエリエラー: ${error.message}` }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: "データが見つかりません" }, { status: 404 })
    }

    // スケジュールアイテムとして型を保証
    const safeData = data.filter((item) => item !== null && typeof item === "object")

    // 日付ごとのデータ数を集計
    const dateCount = {}
    safeData.forEach((item) => {
      if (item.日付) {
        const date = item.日付
        dateCount[date] = (dateCount[date] || 0) + 1
      }
    })

    // 日付の範囲を確認
    const dates = safeData.map((item) => item.日付).filter((date) => typeof date === "string")
    const uniqueDates = [...new Set(dates)].sort()

    // 9月のデータを特に詳しく調査
    const septemberDates = uniqueDates.filter((date) => date.startsWith("2025-09"))

    // 最初と最後の10件のデータを抽出
    const firstTenItems = safeData.slice(0, 10)
    const lastTenItems = safeData.slice(-10)

    return NextResponse.json({
      totalCount: safeData.length,
      dateRange: {
        first: uniqueDates[0],
        last: uniqueDates[uniqueDates.length - 1],
      },
      uniqueDatesCount: uniqueDates.length,
      septemberDates,
      dateCount,
      sampleData: {
        first: firstTenItems,
        last: lastTenItems,
      },
    })
  } catch (error) {
    console.error("デバッグデータの取得中にエラーが発生しました:", error)
    return NextResponse.json(
      {
        error: `デバッグデータの取得に失敗しました: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
      },
      { status: 500 },
    )
  }
}
