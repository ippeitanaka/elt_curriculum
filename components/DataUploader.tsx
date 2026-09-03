"use client"

import type React from "react"

import { useRef, useState } from "react"
import Papa from "papaparse"
import { AlertCircle, Check, Upload, X } from "lucide-react"

interface ParsedData {
  data: Record<string, any>[]
  errors: Papa.ParseError[]
  meta: Papa.ParseMeta
}

const normalizeHeader = (rawHeader: string): string => {
  const header = rawHeader.replace(/^\uFEFF/, "").trim()

  const basicHeaderMapping: Record<string, string> = {
    "�ｿ譌･莉�": "日付",
    "譌･莉�": "日付",
    月日: "日付",
    日付: "日付",
    譖懈律: "曜日",
    曜日: "曜日",
    譎る俣: "時間",
    時間: "時間",
    譎る剞: "時限",
    時限: "時限",
    時: "時限",
    限: "時限",
    全体行事: "全体行事",
    広報: "広報",
    学科予定: "学科予定",
    試験: "試験",
  }

  if (basicHeaderMapping[header]) {
    return basicHeaderMapping[header]
  }

  // 新しい元データCSVの短縮ヘッダーを、既存Supabase列名へ自動変換する。
  const contentMatch = header.match(/^([123])年([ABN])$/)
  if (contentMatch) {
    return `${contentMatch[1]}年${contentMatch[2]}クラスの授業内容`
  }

  const teacherMatch = header.match(/^([123])([ABN])講師$/)
  if (teacherMatch) {
    return `${teacherMatch[1]}年${teacherMatch[2]}クラス担当講師名`
  }

  const periodsMatch = header.match(/^([123])([ABN])コマ数$/)
  if (periodsMatch) {
    return `${periodsMatch[1]}年${periodsMatch[2]}クラスコマ数`
  }

  // 旧CSVで発生していた文字化けヘッダーにも引き続き対応する。
  const mojibakeClassPattern = /(\d+)蟷ｴ([A-Z])繧ｯ繝ｩ繧ｹ(.+)/
  const mojibakeMatch = header.match(mojibakeClassPattern)
  if (mojibakeMatch) {
    const year = mojibakeMatch[1]
    const className = mojibakeMatch[2]
    const suffix = mojibakeMatch[3]

    let normalizedSuffix = suffix
    if (suffix.includes("縺ｮ謗域･ｭ蜀�ｮｹ")) {
      normalizedSuffix = "の授業内容"
    } else if (suffix.includes("諡�ｽ楢ｬ帛ｸｫ蜷�")) {
      normalizedSuffix = "担当講師名"
    } else if (suffix.includes("繧ｳ繝樊焚")) {
      normalizedSuffix = "コマ数"
    }

    return `${year}年${className}クラス${normalizedSuffix}`
  }

  if (header.includes("讓｡謫ｬ隧ｦ鬨�")) {
    return "模擬試験"
  }

  return header
}

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
    if (bytes < 1024) return `${bytes} bytes`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const resetUploader = () => {
    setFile(null)
    setMessage("")
    setMessageType(null)
    setProgress(0)
    if (fileInputRef.current) fileInputRef.current.value = ""
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
      const arrayBuffer = await file.arrayBuffer()
      setProgress(20)

      const encodings = ["utf-8", "shift-jis", "euc-jp"]
      const encodingResults: Array<{ encoding: string; text: string; corruptionCount: number; headerScore: number }> = []
      const expectedHeaders = ["月日", "日付", "曜日", "時間", "時限", "1年A", "1A講師"]

      for (const encoding of encodings) {
        try {
          const decodedText = new TextDecoder(encoding).decode(arrayBuffer)
          const corruptionCount = (decodedText.match(/[\uFFFD\u0000-\u0008\u000B-\u000C\u000E-\u001F]/g) || []).length
          const firstLine = decodedText.split(/\r?\n/)[0] || ""
          const headerScore = expectedHeaders.reduce((score, item) => score + (firstLine.includes(item) ? 1 : 0), 0)
          encodingResults.push({ encoding, text: decodedText, corruptionCount, headerScore })
        } catch {
          // 未対応エンコーディングは無視
        }
      }

      if (encodingResults.length === 0) {
        throw new Error("ファイルのエンコーディングを検出できませんでした")
      }

      encodingResults.sort((a, b) => {
        if (b.headerScore !== a.headerScore) return b.headerScore - a.headerScore
        return a.corruptionCount - b.corruptionCount
      })
      const text = encodingResults[0].text
      setProgress(30)

      const firstLine = text.split(/\r?\n/)[0] || ""
      const delimiter = firstLine.includes("\t") && !firstLine.includes(",") ? "\t" : ","

      const parseResult = Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        delimiter,
        transformHeader: normalizeHeader,
        transform: (value, field) => {
          if (value === null || value === undefined || value === "") return null
          const trimmed = String(value).trim()
          if (/[\uFFFD\u0000-\u0008\u000B-\u000C\u000E-\u001F]/.test(trimmed)) return null
          if (field === "日付") return normalizeDate(trimmed)
          return trimmed || null
        },
      }) as ParsedData

      if (parseResult.errors.length > 0) {
        throw new Error(`ファイルパースエラー: ${parseResult.errors[0].message}`)
      }
      if (!parseResult.data.length) {
        throw new Error("ファイルにデータが含まれていません")
      }

      setProgress(50)

      const requiredFields = ["日付", "曜日", "時限"]
      const missingFields = requiredFields.filter((field) => !parseResult.meta.fields?.includes(field))

      if (missingFields.includes("時限") && parseResult.meta.fields?.includes("時間")) {
        parseResult.data.forEach((row) => {
          if (row["時間"] && !row["時限"]) row["時限"] = row["時間"]
        })
        missingFields.splice(missingFields.indexOf("時限"), 1)
      }

      if (missingFields.length > 0) {
        throw new Error(`必須フィールドがファイルに存在しません: ${missingFields.join(", ")}`)
      }

      const validatedData = parseResult.data.map((row) => {
        const newRow = { ...row, 日付: normalizeDate(row.日付) }

        if (newRow.hasOwnProperty("時間") && !newRow.hasOwnProperty("時限")) {
          newRow["時限"] = newRow["時間"]
        }

        Object.keys(newRow).forEach((key) => {
          if (newRow[key] === "") newRow[key] = null
        })

        return newRow
      })

      setProgress(60)
      setMessage("データをアップロード中...")

      const dates = validatedData.map((item) => item.日付).filter(Boolean)
      const uniqueDates = [...new Set(dates)].sort()

      if (uniqueDates.length > 0) {
        const deleteResponse = await fetch("/api/delete-range", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ minDate: uniqueDates[0], maxDate: uniqueDates[uniqueDates.length - 1] }),
        })

        if (!deleteResponse.ok) {
          throw new Error("既存データの削除に失敗しました")
        }
        setProgress(70)
      }

      const chunkSize = 10
      let uploadedCount = 0
      let failedChunks = 0

      for (let i = 0; i < validatedData.length; i += chunkSize) {
        const chunk = validatedData.slice(i, i + chunkSize)

        try {
          const response = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(chunk),
          })

          if (!response.ok) throw new Error("データのアップロードに失敗しました")
          const result = await response.json()
          uploadedCount += result.count || 0
        } catch {
          failedChunks++
        }

        setProgress(70 + Math.floor((i / validatedData.length) * 30))
        await new Promise((resolve) => setTimeout(resolve, 300))
      }

      setProgress(100)

      if (failedChunks > 0) {
        setMessage(
          uploadedCount > 0
            ? `一部のデータ (${uploadedCount} 件) がアップロードされましたが、エラーが発生しました。`
            : "データのアップロードに失敗しました。",
        )
        setMessageType("error")
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
          className={`flex justify-center w-full h-32 px-4 transition bg-white border-2 border-dashed rounded-md appearance-none cursor-pointer hover:border-blue-400 focus:outline-none ${
            file ? "border-green-500" : "border-gray-300"
          }`}
        >
          <span className="flex flex-col items-center justify-center space-y-2">
            {!file ? (
              <>
                <Upload className="w-8 h-8 text-gray-500" />
                <span className="text-sm text-gray-500">
                  ファイルをここにドラッグするか、<span className="text-blue-600 underline">参照</span>をクリックしてください
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
          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }} />
        </div>
      )}

      <div className="flex space-x-2">
        <button
          onClick={handleUpload}
          disabled={uploading || !file}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
        >
          {uploading ? "アップロード中..." : "アップロード"}
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
