import { NextResponse } from "next/server"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  const supabase = createServerComponentClient({ cookies })

  try {
    const { minDate, maxDate } = await request.json()

    if (!minDate || !maxDate) {
      return NextResponse.json({ error: "日付範囲が指定されていません" }, { status: 400 })
    }

    // この日付範囲のデータを削除
    const { error, count } = await supabase
      .from("スケジュール")
      .delete({ count: "exact" })
      .gte("日付", minDate)
      .lte("日付", maxDate)

    if (error) {
      throw new Error(`既存データの削除エラー: ${error.message}`)
    }

    return NextResponse.json({
      message: `${minDate}から${maxDate}までの既存データを削除しました`,
      deletedCount: count,
    })
  } catch (error) {
    console.error("データ削除エラー:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "データの削除に失敗しました",
      },
      { status: 500 },
    )
  }
}
