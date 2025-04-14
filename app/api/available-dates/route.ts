import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabaseの環境変数が設定されていません")
}

const supabase = createClient(supabaseUrl, supabaseKey)

interface ScheduleItem {
  日付?: string
  [key: string]: any
}

export async function GET() {
  try {
    // 利用可能なすべての日付を取得
    const { data, error } = await supabase.from("スケジュール").select("日付").order("日付", { ascending: true })

    if (error) {
      console.error("Supabaseクエリエラー:", error)
      return NextResponse.json({ error: `Supabaseクエリエラー: ${error.message}` }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ dates: [] })
    }

    // 有効なデータのみをフィルタリング
    const safeData = data.filter(
      (item): item is ScheduleItem =>
        item !== null && typeof item === "object" && item.日付 !== undefined && item.日付 !== null,
    )

    // 日付を取り出して重複を排除
    const uniqueDates = [...new Set(safeData.map((item) => item.日付))].filter(Boolean).sort()

    return NextResponse.json({
      dates: uniqueDates,
      count: uniqueDates.length,
    })
  } catch (error) {
    console.error("利用可能な日付の取得中にエラーが発生しました:", error)
    return NextResponse.json(
      {
        error: `利用可能な日付の取得に失敗しました: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
        dates: [],
      },
      { status: 500 },
    )
  }
}
