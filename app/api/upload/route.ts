import { NextResponse } from "next/server"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

// アップロードされるデータの型を定義
interface ScheduleItem {
  日付?: string
  曜日?: string
  時限?: string
  時間?: string
  [key: string]: any
}

export async function POST(request: Request) {
  const supabase = createServerComponentClient({ cookies })

  try {
    const data = await request.json()

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("無効なデータ形式です")
    }

    // データの前処理
    const processedData = data
      .filter((item): item is ScheduleItem => item !== null && typeof item === "object")
      .map((item) => {
        const processedItem = { ...item }

        // 「時間」フィールドを「時限」にマッピング（存在する場合）
        if (processedItem.hasOwnProperty("時間") && !processedItem.hasOwnProperty("時限")) {
          processedItem["時限"] = processedItem["時間"]
        }

        // 日付フォーマットの統一（YYYY-MM-DD形式に変換）
        if (processedItem.日付) {
          // 様々な日付形式に対応
          let dateParts
          if (processedItem.日付.includes("-")) {
            // YYYY-MM-DD形式またはYY-MM-DD形式
            dateParts = processedItem.日付.split("-").filter((part) => part !== "")
          } else if (processedItem.日付.includes("/")) {
            // YYYY/MM/DD形式またはYY/MM/DD形式
            dateParts = processedItem.日付.split("/").filter((part) => part !== "")
          } else {
            // 年月日形式 (例: 2025年9月30日)
            dateParts = processedItem.日付.split(/[年月日]/).filter((part) => part !== "")
          }

          if (dateParts && dateParts.length === 3) {
            let [year, month, day] = dateParts

            // 年が2桁の場合は4桁に変換
            if (year.length <= 2) {
              year = `20${year.padStart(2, "0")}`
            }

            // 月と日が1桁の場合は2桁に変換
            month = month.padStart(2, "0")
            day = day.padStart(2, "0")

            processedItem.日付 = `${year}-${month}-${day}`
          }
        }

        // クラス情報のフィールドを正規化
        Object.keys(processedItem).forEach((key) => {
          // 例: "1年Aクラスの授業内容" のようなフィールドを処理
          const classMatch = key.match(/(\d+)年([A-Z])クラス(.+)/)
          if (classMatch) {
            // 値が空文字列の場合はnullに設定
            if (processedItem[key] === "") {
              processedItem[key] = null
            }

            // 値が文字化けしている場合はnullに設定
            if (
              processedItem[key] &&
              typeof processedItem[key] === "string" &&
              /[\uFFFD\u0000-\u0008\u000B-\u000C\u000E-\u001F]/.test(processedItem[key])
            ) {
              processedItem[key] = null
            }
          }
        })

        // 空文字列をnullに変換
        Object.keys(processedItem).forEach((key) => {
          if (processedItem[key] === "") {
            processedItem[key] = null
          }
        })

        return processedItem
      })

    // 必須フィールドの確認
    const requiredFields = ["日付", "時限", "曜日"]
    const firstItem = processedData[0]
    const missingFields = requiredFields.filter((field) => !firstItem.hasOwnProperty(field))

    if (missingFields.length > 0) {
      throw new Error(`必須フィールドがファイルに存在しません: ${missingFields.join(", ")}`)
    }

    // テーブル構造を取得
    const { data: tableInfo, error: tableError } = await supabase.from("スケジュール").select("*").limit(1)

    if (tableError) {
      throw new Error(`テーブル構造確認エラー: ${tableError.message}`)
    }

    // テーブルのカラムと一致しないフィールドを削除
    const tableColumns = tableInfo && tableInfo.length > 0 ? Object.keys(tableInfo[0]) : []
    const cleanedData = processedData.map((item) => {
      const cleanItem: Record<string, any> = {}

      // テーブルに存在するカラムのみを保持
      tableColumns.forEach((column) => {
        if (item.hasOwnProperty(column)) {
          cleanItem[column] = item[column]
        }
      })

      // 必須フィールドが欠けていないか確認
      requiredFields.forEach((field) => {
        if (!cleanItem.hasOwnProperty(field)) {
          if (item.hasOwnProperty(field)) {
            cleanItem[field] = item[field]
          }
        }
      })

      return cleanItem
    })

    // データを挿入
    const { error: insertError, count } = await supabase.from("スケジュール").insert(cleanedData, { count: "exact" })

    if (insertError) {
      throw new Error(`データ挿入エラー: ${insertError.message}`)
    }

    return NextResponse.json({
      message: "データが正常に挿入されました",
      count: count,
    })
  } catch (error) {
    console.error("データアップロードエラー:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "データのアップロードに失敗しました",
      },
      { status: 500 },
    )
  }
}
