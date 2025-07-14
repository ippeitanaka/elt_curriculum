"use client"

import type { Dispatch, SetStateAction } from "react"
import { Calendar, List } from "lucide-react"

type ViewToggleProps = {
  view: string
  setView: Dispatch<SetStateAction<string>>
}

export default function ViewToggle({ view, setView }: ViewToggleProps) {
  return (
    <div className="flex bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => setView("calendar")}
        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
          view === "calendar" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-800"
        }`}
        aria-label="カレンダー表示"
      >
        <Calendar size={16} />
        カレンダー
      </button>
      <button
        onClick={() => setView("list")}
        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
          view === "list" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-800"
        }`}
        aria-label="リスト表示"
      >
        <List size={16} />
        リスト
      </button>
    </div>
  )
}
