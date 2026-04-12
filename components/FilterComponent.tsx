"use client"

import type { Dispatch, SetStateAction } from "react"
import { GraduationCap, Users } from "lucide-react"

type FilterProps = {
  filter: { year: string; class: string }
  setFilter: Dispatch<SetStateAction<{ year: string; class: string }>>
}

export default function FilterComponent({ filter, setFilter }: FilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2">
        <GraduationCap size={15} className="text-[#ff8a5b]" />
        <select
          value={filter.year}
          onChange={(e) => setFilter({ ...filter, year: e.target.value })}
          className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 outline-none ring-1 ring-slate-200 transition focus:ring-2 focus:ring-[#ff8a5b]"
        >
          <option value="1">1年</option>
          <option value="2">2年</option>
          <option value="3">3年</option>
        </select>
      </div>

      <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2">
        <Users size={15} className="text-[#1f5eff]" />
        <select
          value={filter.class}
          onChange={(e) => setFilter({ ...filter, class: e.target.value })}
          className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 outline-none ring-1 ring-slate-200 transition focus:ring-2 focus:ring-[#1f5eff]"
        >
          <option value="A">Aクラス</option>
          <option value="B">Bクラス</option>
          <option value="N">Nクラス</option>
        </select>
      </div>
    </div>
  )
}
