"use client"

import type { Dispatch, SetStateAction } from "react"
import { Calendar, List } from "lucide-react"

type ViewToggleProps = {
  view: string
  setView: Dispatch<SetStateAction<string>>
}

export default function ViewToggle({ view, setView }: ViewToggleProps) {
  return (
    <div className="flex bg-gray-100 rounded p-0.5">
      <button
        onClick={() => setView("calendar")}
        className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all ${
          view === "calendar" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-800"
        }`}
        aria-label="カレンダー表示"
      >
        <Calendar size={12} />
        カレンダー
      </button>
      <button
        onClick={() => setView("list")}
        className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all ${
          view === "list" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-800"
        }`}
        aria-label="リスト表示"
      >
        <List size={12} />
        リスト
      </button>
    </div>
  )
}
