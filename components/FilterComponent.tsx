"use client"

import type { Dispatch, SetStateAction } from "react"
import { GraduationCap, Users } from "lucide-react"

type FilterProps = {
  filter: { year: string; class: string }
  setFilter: Dispatch<SetStateAction<{ year: string; class: string }>>
}

export default function FilterComponent({ filter, setFilter }: FilterProps) {
  return (
    <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:gap-3">
      <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-slate-100 px-2.5 py-1.5 sm:flex-initial sm:px-3 sm:py-2">
        <GraduationCap size={15} className="text-[#ff8a5b]" />
        <select
          value={filter.year}
          onChange={(e) => setFilter({ ...filter, year: e.target.value })}
          className="min-w-0 flex-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none ring-1 ring-slate-200 transition focus:ring-2 focus:ring-[#ff8a5b] sm:px-4 sm:py-2 sm:text-sm"
        >
          <option value="1">1年</option>
          <option value="2">2年</option>
          <option value="3">3年</option>
        </select>
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-slate-100 px-2.5 py-1.5 sm:flex-initial sm:px-3 sm:py-2">
        <Users size={15} className="text-[#1f5eff]" />
        <select
          value={filter.class}
          onChange={(e) => setFilter({ ...filter, class: e.target.value })}
          className="min-w-0 flex-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none ring-1 ring-slate-200 transition focus:ring-2 focus:ring-[#1f5eff] sm:px-4 sm:py-2 sm:text-sm"
        >
          <option value="A">Aクラス</option>
          <option value="B">Bクラス</option>
          <option value="N">Nクラス</option>
        </select>
      </div>
    </div>
  )
}
