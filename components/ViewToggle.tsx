"use client"

import type { Dispatch, SetStateAction } from "react"
import { Calendar, List } from "lucide-react"

type ViewToggleProps = {
  view: string
  setView: Dispatch<SetStateAction<string>>
}

export default function ViewToggle({ view, setView }: ViewToggleProps) {
  return (
    <div className="flex space-x-2">
      <button
        onClick={() => setView("calendar")}
        className={`p-1 rounded ${view === "calendar" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        aria-label="カレンダー表示"
      >
        <Calendar size={16} />
      </button>
      <button
        onClick={() => setView("list")}
        className={`p-1 rounded ${view === "list" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        aria-label="リスト表示"
      >
        <List size={16} />
      </button>
    </div>
  )
}
