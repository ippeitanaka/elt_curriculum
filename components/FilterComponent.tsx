"use client"

import type { Dispatch, SetStateAction } from "react"

type FilterProps = {
  filter: { year: string; class: string }
  setFilter: Dispatch<SetStateAction<{ year: string; class: string }>>
}

export default function FilterComponent({ filter, setFilter }: FilterProps) {
  return (
    <div className="flex space-x-2">
      <select
        value={filter.year}
        onChange={(e) => setFilter({ ...filter, year: e.target.value })}
        className="border rounded px-2 py-1 text-sm"
      >
        <option value="1">1年</option>
        <option value="2">2年</option>
        <option value="3">3年</option>
      </select>
      <select
        value={filter.class}
        onChange={(e) => setFilter({ ...filter, class: e.target.value })}
        className="border rounded px-2 py-1 text-sm"
      >
        <option value="A">A</option>
        <option value="B">B</option>
        <option value="N">N</option>
      </select>
    </div>
  )
}
