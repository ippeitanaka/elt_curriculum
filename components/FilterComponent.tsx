"use client"

import type { Dispatch, SetStateAction } from "react"
import { GraduationCap, Users } from "lucide-react"

type FilterProps = {
  filter: { year: string; class: string }
  setFilter: Dispatch<SetStateAction<{ year: string; class: string }>>
}

export default function FilterComponent({ filter, setFilter }: FilterProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <GraduationCap size={18} className="text-blue-500" />
        <select
          value={filter.year}
          onChange={(e) => setFilter({ ...filter, year: e.target.value })}
          className="border-2 border-blue-200 rounded-lg px-3 py-2 text-sm font-medium bg-white hover:border-blue-300 focus:border-blue-500 focus:outline-none transition-colors"
        >
          <option value="1">1年</option>
          <option value="2">2年</option>
          <option value="3">3年</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <Users size={18} className="text-purple-500" />
        <select
          value={filter.class}
          onChange={(e) => setFilter({ ...filter, class: e.target.value })}
          className="border-2 border-purple-200 rounded-lg px-3 py-2 text-sm font-medium bg-white hover:border-purple-300 focus:border-purple-500 focus:outline-none transition-colors"
        >
          <option value="A">Aクラス</option>
          <option value="B">Bクラス</option>
          <option value="N">Nクラス</option>
        </select>
      </div>
    </div>
  )
}
