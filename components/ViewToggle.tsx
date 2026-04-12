"use client"

import type { Dispatch, SetStateAction } from "react"
import { Calendar, List } from "lucide-react"

type ViewToggleProps = {
  view: string
  setView: Dispatch<SetStateAction<string>>
}

export default function ViewToggle({ view, setView }: ViewToggleProps) {
  return (
    <div className="flex rounded-full bg-slate-100 p-1">
      <button
        onClick={() => setView("calendar")}
        className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
          view === "calendar"
            ? "bg-white text-slate-900 shadow-[0_10px_25px_rgba(15,23,42,0.08)]"
            : "text-slate-500 hover:text-slate-900"
        }`}
        aria-label="カレンダー表示"
      >
        <Calendar size={15} />
        カレンダー
      </button>
      <button
        onClick={() => setView("list")}
        className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
          view === "list"
            ? "bg-white text-slate-900 shadow-[0_10px_25px_rgba(15,23,42,0.08)]"
            : "text-slate-500 hover:text-slate-900"
        }`}
        aria-label="リスト表示"
      >
        <List size={15} />
        リスト
      </button>
    </div>
  )
}
