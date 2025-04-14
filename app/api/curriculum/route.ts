import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

// スケジュールアイテムの型を定義
interface ScheduleItem {
  id?: number
  日付?: string
  曜日?: string
  時限?: string
  created_at?: string
  updated_at?: string
  [key: string]: any
}

// fetchAllData 関数を改善
async function fetchAllData(supabase) {
  try {
    let allData: ScheduleItem[] = []
    let hasMore = true
    let start = 0
    const pageSize = 1000

    // 最初にテーブルが存在するか確認
    const { error: tableCheckError } = await supabase.from("スケジュール").select("id").limit(1)

    if (tableCheckError) {
      console.error("テーブル確認エラー:", tableCheckError)
      throw new Error(`テーブル確認エラー: ${tableCheckError.message}`)
    }

    while (hasMore) {
      console.log(`API: ${start}行目からデータを取得中...`)

      const { data, error } = await supabase
        .from("スケジュール")
        .select("*")
        .order("日付", { ascending: true })
        .order("時限", { ascending: true })
        .range(start, start + pageSize - 1)

      if (error) {
        console.error("データ取得エラー:", error)
        throw error
      }

      // データが null または undefined の場合は処理を中断
      if (!data) {
        console.warn("Supabase からのレスポンスにデータがありません")
        return []
      }

      // 型安全のためにフィルタリング
      const safeData = data
        .filter((item): item is ScheduleItem => item !== null && typeof item === "object")
        .map((item) => ({
          ...item,
          日付: item.日付 || "",
          曜日: item.曜日 || "",
          時限: item.時限 || "",
        }))

      if (safeData.length > 0) {
        allData = [...allData, ...safeData]
        start += pageSize
        console.log(`API: ${start}行目までのデータを取得しました (${safeData.length}件)`)
      } else {
        console.log("API: これ以上データがありません")
      }

      // データが pageSize より少なければ、すべてのデータを取得完了
      hasMore = safeData.length === pageSize
    }

    console.log(`API: 合計 ${allData.length} 行のデータを取得しました`)
    return allData
  } catch (error) {
    console.error("データ取得中にエラーが発生しました:", error)
    // エラーを上位に伝播させる
    throw error
  }
}

export async function GET() {
  try {
    console.log("API: データ取得を開始します")

    // Supabase クライアントの初期化
    const supabase = createRouteHandlerClient({ cookies })

    // データ取得
    const data = await fetchAllData(supabase)

    // データが null または空の配列の場合でも200ステータスコードを返す
    if (!data || data.length === 0) {
      console.warn("データが見つかりません")
      return NextResponse.json(
        {
          message: "データが見つかりません",
          data: [],
        },
        { status: 200 },
      ) // 404ではなく200を返す
    }

    // データの範囲を確認
    const firstDate = data[0].日付
    const lastDate = data[data.length - 1].日付
    console.log(`API: データ範囲: ${firstDate} から ${lastDate}`)

    // 9月のデータを特に確認
    const septemberData = data.filter((item) => item.日付 && item.日付.startsWith("2025-09"))
    console.log(`API: 9月のデータ数: ${septemberData.length}件`)

    return NextResponse.json({
      data,
      metadata: {
        totalCount: data.length,
        dateRange: {
          first: firstDate,
          last: lastDate,
        },
      },
    })
  } catch (error) {
    console.error("カリキュラムデータの取得中にエラーが発生しました:", error)
    // エラー時にも空の配列を返す（200ステータスコード）
    return NextResponse.json(
      {
        message: `カリキュラムデータの取得に失敗しました: ${error instanceof Error ? error.message : JSON.stringify(error)}`,
        data: [],
      },
      { status: 200 }, // 500ではなく200を返す
    )
  }
}
