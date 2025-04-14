import { NextResponse } from "next/server"
import { parse } from "papaparse"

// パース結果の型定義
interface ParsedCsvResult {
  data: Record<string, any>[]
  errors: any[]
  meta: {
    delimiter: string
    linebreak: string
    aborted: boolean
    truncated: boolean
    cursor: number
    fields?: string[]
  }
}

export async function POST(request: Request) {
  try {
    // POSTリクエストからファイルを取得
    const formData = await request.formData()
    const file = formData.get("csvFile") as File

    if (!file) {
      return NextResponse.json({ error: "ファイルがアップロードされていません" }, { status: 400 })
    }

    // ファイルをテキストとして読み込む
    const csvContent = await file.text()

    // CSVをパースしてヘッダー情報を取得
    const parseResult: ParsedCsvResult = parse(csvContent, {
      header: true,
      skipEmptyLines: true,
    })

    if (parseResult.errors && parseResult.errors.length > 0) {
      // パースエラーがあった場合はエラー情報を返す
      return NextResponse.json({
        success: false,
        errors: parseResult.errors.slice(0, 5).map((err) => ({
          type: err.type,
          code: err.code,
          message: err.message,
          row: err.row,
        })),
      })
    }

    // ヘッダー情報と最初の数行のデータを返す
    const headers = parseResult.meta.fields || []
    const sampleData = parseResult.data.slice(0, 3).map((row) => {
      // 型安全のためにチェック
      if (typeof row !== "object" || row === null) return {}
      return row
    })

    return NextResponse.json({
      success: true,
      headers,
      rowCount: parseResult.data.length,
      sampleData,
    })
  } catch (error) {
    console.error("CSVファイル解析エラー:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "CSVの解析中にエラーが発生しました" },
      { status: 500 },
    )
  }
}
