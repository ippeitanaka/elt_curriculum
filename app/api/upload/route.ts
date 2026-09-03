import { NextResponse } from "next/server"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

interface ScheduleItem {
  日付?: string
  曜日?: string
  時限?: string
  時間?: string
  [key: string]: any
}

const INSERT_CHUNK_SIZE = 500

const ALLOWED_COLUMNS = new Set([
  "日付",
  "曜日",
  "時間",
  "全体行事",
  "広報",
  "学科予定",
  "試験",
  "時限",
  "1年Aクラスの授業内容",
  "1年Aクラス担当講師名",
  "1年Aクラスコマ数",
  "1年Bクラスの授業内容",
  "1年Bクラス担当講師名",
  "1年Bクラスコマ数",
  "1年Nクラスの授業内容",
  "1年Nクラス担当講師名",
  "1年Nクラスコマ数",
  "2年Aクラスの授業内容",
  "2年Aクラス担当講師名",
  "2年Aクラスコマ数",
  "2年Bクラスの授業内容",
  "2年Bクラス担当講師名",
  "2年Bクラスコマ数",
  "2年Nクラスの授業内容",
  "2年Nクラス担当講師名",
  "2年Nクラスコマ数",
  "3年Aクラスの授業内容",
  "3年Aクラス担当講師名",
  "3年Aクラスコマ数",
  "3年Bクラスの授業内容",
  "3年Bクラス担当講師名",
  "3年Bクラスコマ数",
  "3年Nクラスの授業内容",
  "3年Nクラス担当講師名",
  "3年Nクラスコマ数",
  "3年各種模擬試験",
])

const normalizeDate = (value: unknown): string | null => {
  if (value === null || value === undefined || value === "") return null

  const dateText = String(value).trim()
  if (/^\d{8}$/.test(dateText)) {
    return `${dateText.slice(0, 4)}-${dateText.slice(4, 6)}-${dateText.slice(6, 8)}`
  }

  const parts = dateText.split(/[-/年月日]/).filter(Boolean)
  if (parts.length === 3) {
    let [year, month, day] = parts
    if (year.length <= 2) year = `20${year.padStart(2, "0")}`
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
  }

  return dateText
}

const sanitizeRow = (item: ScheduleItem): Record<string, any> => {
  const source = { ...item }

  if (source.hasOwnProperty("時間") && !source.hasOwnProperty("時限")) {
    source["時限"] = source["時間"]
  }

  if (source.日付) {
    source.日付 = normalizeDate(source.日付) ?? undefined
  }

  const cleanItem: Record<string, any> = {}

  for (const [key, rawValue] of Object.entries(source)) {
    if (!ALLOWED_COLUMNS.has(key)) continue

    let value = rawValue
    if (value === "") value = null

    if (
      typeof value === "string" &&
      /[\uFFFD\u0000-\u0008\u000B-\u000C\u000E-\u001F]/.test(value)
    ) {
      value = null
    }

    cleanItem[key] = value
  }

  return cleanItem
}

export async function POST(request: Request) {
  const supabase = createServerComponentClient({ cookies })

  try {
    const data = await request.json()

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("無効なデータ形式です")
    }

    const processedData = data
      .filter((item): item is ScheduleItem => item !== null && typeof item === "object")
      .map(sanitizeRow)

    if (processedData.length === 0) {
      throw new Error("アップロード対象のデータがありません")
    }

    const requiredFields = ["日付", "時限", "曜日"]
    const missingFields = requiredFields.filter((field) => !Object.prototype.hasOwnProperty.call(processedData[0], field))

    if (missingFields.length > 0) {
      throw new Error(`必須フィールドがファイルに存在しません: ${missingFields.join(", ")}`)
    }

    let insertedCount = 0
    let chunkCount = 0

    for (let i = 0; i < processedData.length; i += INSERT_CHUNK_SIZE) {
      const chunk = processedData.slice(i, i + INSERT_CHUNK_SIZE)
      const { error: insertError, count } = await supabase.from("curriculum").insert(chunk, { count: "exact" })

      if (insertError) {
        const start = i + 1
        const end = i + chunk.length
        throw new Error(`データ挿入エラー (${start}〜${end}件目): ${insertError.message}`)
      }

      insertedCount += count ?? chunk.length
      chunkCount++
    }

    return NextResponse.json({
      message: "データが正常に挿入されました",
      count: insertedCount,
      chunks: chunkCount,
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
