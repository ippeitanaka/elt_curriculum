"use client"

import type React from "react"

import { useState, useRef } from "react"
import Papa from "papaparse"
import { AlertCircle, Check, Upload, X } from "lucide-react"

// CSVパース結果の型定義
interface ParsedData {
  data: Record<string, any>[]
  errors: Papa.ParseError[]
  meta: Papa.ParseMeta
}

export default function DataUploader() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error" | "info" | null>(null)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      setMessage(`ファイル "${selectedFile.name}" (${formatFileSize(selectedFile.size)}) を選択しました`)
      setMessageType("info")
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " bytes"
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  const resetUploader = () => {
    setFile(null)
    setMessage("")
    setMessageType(null)
    setProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const normalizeHeader = (header: string): string => {
    // 基本的なヘッダーマッピング
    const basicHeaderMapping: Record<string, string> = {
      "�ｿ譌･莉�": "日付",
      "譌･莉�": "日付",
      日付: "日付",
      譖懈律: "曜日",
      曜日: "曜日",
      譎る俣: "時間",
      時間: "時間",
      譎る剞: "時限",
      時限: "時限",
      時: "時限",
      限: "時限",
    }

    // 完全一致のマッピングをチェック
    if (basicHeaderMapping[header]) {
      return basicHeaderMapping[header]
    }

    // 部分一致のマッピングをチェック
    for (const [pattern, replacement] of Object.entries(basicHeaderMapping)) {
      if (header.includes(pattern)) {
        return replacement
      }
    }

    // クラス情報のヘッダーを正規化
    // 例: "1蟷ｴA繧ｯ繝ｩ繧ｹ縺ｮ謗域･ｭ蜀�ｮｹ" → "1年Aクラスの授業内容"
    const classPattern = /(\d+)蟷ｴ([A-Z])繧ｯ繝ｩ繧ｹ(.+)/
    const match = header.match(classPattern)

    if (match) {
      const year = match[1] // 学年
      const className = match[2] // クラス名 (A, B, N)
      const suffix = match[3] // 残りの部分

      // 残りの部分を正規化
      let normalizedSuffix = ""
      if (suffix.includes("縺ｮ謗域･ｭ蜀�ｮｹ")) {
        normalizedSuffix = "の授業内容"
      } else if (suffix.includes("諡�ｽ楢ｬ帛ｸｫ蜷�")) {
        normalizedSuffix = "担当講師名"
      } else if (suffix.includes("繧ｳ繝樊焚")) {
        normalizedSuffix = "コマ数"
      } else {
        // その他の場合はそのまま使用
        normalizedSuffix = suffix
      }

      return `${year}年${className}クラス${normalizedSuffix}`
    }

    // 特殊なケース: 模擬試験
    if (header.includes("讓｡謫ｬ隧ｦ鬨�")) {
      return "模擬試験"
    }

    // それ以外の場合は元のヘッダーをそのまま返す
    return header
  }

  const handleUpload = async () => {
    if (!file) {
      setMessage("ファイルを選択してください。")
      setMessageType("error")
      return
    }

    setUploading(true)
    setProgress(10)
    setMessage("CSVファイルを解析中...")
    setMessageType("info")

    try {
      // ファイルを ArrayBuffer として読み込み
      const arrayBuffer = await file.arrayBuffer()
      setProgress(20)

      // 複数のエンコーディングを試す
      let text = ""
      const encodings = ["shift-jis", "utf-8", "euc-jp"]

      // 各エンコーディングを試して、最も文字化けが少ないものを選択
      const encodingResults = []

      for (const encoding of encodings) {
        try {
          const decoder = new TextDecoder(encoding)
          const decodedText = decoder.decode(arrayBuffer)

          // 文字化けの検出（�や制御文字の数をカウント）
          const corruptionCount = (decodedText.match(/[\uFFFD\u0000-\u0008\u000B-\u000C\u000E-\u001F]/g) || []).length

          encodingResults.push({
            encoding,
            text: decodedText,
            corruptionCount,
          })
        } catch (error) {
          // エンコーディングエラーは無視
        }
      }

      // 文字化けが最も少ないエンコーディングを選択
      if (encodingResults.length > 0) {
        encodingResults.sort((a, b) => a.corruptionCount - b.corruptionCount)
        const bestResult = encodingResults[0]
        text = bestResult.text
      }

      if (!text) {
        throw new Error("ファイルのエンコーディングを検出できませんでした")
      }

      setProgress(30)

      // ファイルの先頭部分を確認してデリミタ（区切り文字）を推測
      const firstLine = text.split("\n")[0]
      const hasCommas = firstLine.includes(",")
      const hasTabs = firstLine.includes("\t")

      let delimiter = "," // デフォルト

      if (hasTabs && !hasCommas) {
        delimiter = "\t"
      }

      // CSV をパース
      const parseResult: ParsedData = Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        delimiter: delimiter,
        transformHeader: (header) => {
          // ヘッダーを正規化
          return normalizeHeader(header)
        },
        transform: (value, field) => {
          // 値を正規化（文字化け対策）
          if (!value) return null

          const trimmed = value.trim()

          // 明らかな文字化けパターンを検出
          if (/[\uFFFD\u0000-\u0008\u000B-\u000C\u000E-\u001F]/.test(trimmed)) {
            return null
          }

          // 日付フィールドの特別処理
          if (field === "日付") {
            // 様々な日付形式に対応
            if (trimmed.includes("-") || trimmed.includes("/") || /\d+年\d+月\d+日/.test(trimmed)) {
              return trimmed // 日付形式は upload API で処理
            }

            // 数字のみの場合（例: 20250930）
            if (/^\d{8}$/.test(trimmed)) {
              const year = trimmed.substring(0, 4)
              const month = trimmed.substring(4, 6)
              const day = trimmed.substring(6, 8)
              return `${year}-${month}-${day}`
            }
          }

          return trimmed
        },
      }) as ParsedData

      // エラーチェック
      if (parseResult.errors && parseResult.errors.length > 0) {
        throw new Error(`ファイルパースエラー: ${parseResult.errors[0].message}`)
      }

      // データチェック
      if (!parseResult.data || parseResult.data.length === 0) {
        throw new Error("ファイルにデータが含まれていません")
      }

      setProgress(50)

      // 必要なフィールドが存在するか確認
      const requiredFields = ["日付", "曜日", "時限"]
      const missingFields = requiredFields.filter((field) => !parseResult.meta.fields?.includes(field))

      if (missingFields.length > 0) {
        // 時間フィールドがあれば時限として使用
        if (missingFields.includes("時限") && parseResult.meta.fields?.includes("時間")) {
          // データの各行で時間を時限にコピー
          parseResult.data.forEach((row) => {
            if (row["時間"] && !row["時限"]) {
              row["時限"] = row["時間"]
            }
          })

          // 時限フィールドを必須フィールドから削除
          const timeIndex = missingFields.indexOf("時限")
          if (timeIndex !== -1) {
            missingFields.splice(timeIndex, 1)
          }
        }

        // それでも必須フィールドが不足している場合はエラー
        if (missingFields.length > 0) {
          throw new Error(`必須フィールドがファイルに存在しません: ${missingFields.join(", ")}`)
        }
      }

      // データの検証と前処理
      const validatedData = parseResult.data.map((row) => {
        const newRow = { ...row }

        // 日付フォーマットの統一
        if (newRow.日付) {
          // 様々な日付形式に対応
          let dateParts
          if (newRow.日付.includes("-")) {
            dateParts = newRow.日付.split("-").filter((part) => part !== "")
          } else if (newRow.日付.includes("/")) {
            dateParts = newRow.日付.split("/").filter((part) => part !== "")
          } else {
            // 年月日形式 (例: 2025年9月30日)
            dateParts = newRow.日付.split(/[年月日]/).filter((part) => part !== "")
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

            newRow.日付 = `${year}-${month}-${day}`
          }
        }

        // 「時間」フィールドを「時限」にマッピング
        if (newRow.hasOwnProperty("時間") && !newRow.hasOwnProperty("時限")) {
          newRow["時限"] = newRow["時間"]
        }

        // 空文字列を null に変換
        Object.keys(newRow).forEach((key) => {
          if (newRow[key] === "") {
            newRow[key] = null
          }
        })

        return newRow
      })

      setProgress(60)
      setMessage("データをアップロード中...")

      // 日付範囲を取得して先に削除リクエストを送信
      const dates = validatedData.map((item) => item.日付).filter(Boolean)
      const uniqueDates = [...new Set(dates)].sort()

      if (uniqueDates.length > 0) {
        const minDate = uniqueDates[0]
        const maxDate = uniqueDates[uniqueDates.length - 1]

        try {
          const deleteResponse = await fetch("/api/delete-range", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ minDate, maxDate }),
          })

          if (!deleteResponse.ok) {
            throw new Error("既存データの削除に失敗しました")
          }

          setProgress(70)
        } catch (error) {
          throw new Error("既存データの削除中にエラーが発生しました")
        }
      }

      // データを一度に10件ずつに分割してアップロード
      const chunkSize = 10
      let uploadedCount = 0
      let failedChunks = 0

      for (let i = 0; i < validatedData.length; i += chunkSize) {
        const chunk = validatedData.slice(i, i + chunkSize)

        try {
          const response = await fetch("/api/upload", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(chunk),
          })

          if (!response.ok) {
            throw new Error("データのアップロードに失敗しました")
          }

          const result = await response.json()
          uploadedCount += result.count || 0
        } catch (error) {
          failedChunks++
        }

        // プログレスバーを更新
        setProgress(70 + Math.floor((i / validatedData.length) * 30))

        // 処理の負荷を分散するために少し待機
        await new Promise((resolve) => setTimeout(resolve, 300))
      }

      setProgress(100)

      if (failedChunks > 0) {
        if (uploadedCount > 0) {
          setMessage(`一部のデータ (${uploadedCount} 件) がアップロードされましたが、エラーが発生しました。`)
          setMessageType("error")
        } else {
          setMessage("データのアップロードに失敗しました。")
          setMessageType("error")
        }
      } else {
        setMessage(`データが正常にアップロードされました (${uploadedCount} 件)`)
        setMessageType("success")
      }
    } catch (error) {
      console.error("Error uploading data:", error)
      setProgress(0)
      const errorMsg = error instanceof Error ? error.message : "不明なエラー"
      setMessage(`データのアップロードに失敗しました: ${errorMsg}`)
      setMessageType("error")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="mt-4 border rounded-lg p-4 bg-white shadow-sm">
      <h2 className="text-xl font-semibold mb-4">カリキュラムデータのアップロード</h2>

      <div className="mb-4">
        <label
          htmlFor="file-upload"
          className={`flex justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-blue-400 focus:outline-none ${
            file ? "border-green-500" : "border-gray-300"
          }`}
        >
          <span className="flex flex-col items-center justify-center space-y-2">
            {!file ? (
              <>
                <Upload className="w-8 h-8 text-gray-500" />
                <span className="text-sm text-gray-500">
                  ファイルをここにドラッグするか、<span className="text-blue-600 underline">参照</span>
                  をクリックしてください
                </span>
                <span className="text-xs text-gray-500">CSV/TSVファイル (*.csv, *.tsv)</span>
              </>
            ) : (
              <>
                <Check className="w-8 h-8 text-green-500" />
                <span className="font-medium text-gray-900">{file.name}</span>
                <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
              </>
            )}
          </span>
          <input
            ref={fileInputRef}
            id="file-upload"
            name="file-upload"
            type="file"
            accept=".csv,.tsv"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>

      {messageType && (
        <div
          className={`p-3 mb-4 rounded-md ${
            messageType === "success"
              ? "bg-green-50 text-green-700"
              : messageType === "error"
                ? "bg-red-50 text-red-700"
                : "bg-blue-50 text-blue-700"
          }`}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {messageType === "success" ? (
                <Check className="h-5 w-5 text-green-400" />
              ) : messageType === "error" ? (
                <X className="h-5 w-5 text-red-400" />
              ) : (
                <AlertCircle className="h-5 w-5 text-blue-400" />
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{message}</p>
            </div>
          </div>
        </div>
      )}

      {progress > 0 && progress < 100 && (
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
        </div>
      )}

      <div className="flex space-x-2">
        <button
          onClick={handleUpload}
          disabled={uploading || !file}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
        >
          {uploading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              アップロード中...
            </>
          ) : (
            "アップロード"
          )}
        </button>
        {file && (
          <button
            onClick={resetUploader}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 flex items-center"
          >
            <X className="w-4 h-4 mr-1" />
            リセット
          </button>
        )}
      </div>
    </div>
  )
}
