"use client"

import { useState } from "react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"

export default function DatePicker({ selectedDate, onDateChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const handleDateClick = (day) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    onDateChange(newDate)
    setIsOpen(false)
  }

  const formatDate = (date) => {
    return format(date, "yyyy年MM月dd日 (eee)", { locale: ja })
  }

  const formatCompactDate = (date) => {
    return format(date, "M/d (eee)", { locale: ja })
  }

  return (
    <div className="relative">
      <div
        className="flex cursor-pointer items-center justify-between gap-3 rounded-[1rem] border border-white/80 bg-white/90 p-3 shadow-[0_12px_30px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 sm:rounded-[1.4rem] sm:p-4 sm:shadow-[0_16px_40px_rgba(15,23,42,0.06)]"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex min-w-0 items-center">
          <div className="mr-2.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#fff1e8] text-[#ff8a5b] sm:mr-3 sm:h-10 sm:w-10 sm:rounded-2xl">
            <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 sm:text-[11px] sm:tracking-[0.24em]">Selected Day</p>
            <span className="block truncate text-xs font-semibold text-slate-800 sm:hidden">{selectedDate ? formatCompactDate(selectedDate) : "日付を選択"}</span>
            <span className="hidden text-sm font-semibold text-slate-800 sm:block">{selectedDate ? formatDate(selectedDate) : "日付を選択"}</span>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-semibold text-white sm:px-3 sm:text-xs">変更</span>
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-2 w-full rounded-[1.3rem] border border-white/80 bg-white/95 p-3 shadow-[0_20px_40px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:rounded-[1.6rem] sm:p-4 sm:shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
          <div className="mb-3 flex items-center justify-between">
            <button
              onClick={handlePrevMonth}
              className="rounded-full bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-900 hover:text-white"
              aria-label="前月"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="text-sm font-bold text-slate-800">
              {format(currentMonth, "yyyy年MM月", { locale: ja })}
            </div>
            <button
              onClick={handleNextMonth}
              className="rounded-full bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-900 hover:text-white"
              aria-label="翌月"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0.5 text-center text-[11px] sm:gap-1 sm:text-xs">
            {["日", "月", "火", "水", "木", "金", "土"].map((day, index) => (
              <div
                key={day}
                className={`p-1.5 font-semibold sm:p-2 ${index === 0 ? "text-red-500" : index === 6 ? "text-blue-500" : "text-slate-500"}`}
              >
                {day}
              </div>
            ))}

            {Array.from({ length: firstDayOfMonth }).map((_, index) => (
              <div key={`empty-${index}`} className="p-1"></div>
            ))}

            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1
              const currentDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
              const isSelected =
                selectedDate &&
                currentDate.getDate() === selectedDate.getDate() &&
                currentDate.getMonth() === selectedDate.getMonth() &&
                currentDate.getFullYear() === selectedDate.getFullYear()

              const isToday =
                currentDate.getDate() === new Date().getDate() &&
                currentDate.getMonth() === new Date().getMonth() &&
                currentDate.getFullYear() === new Date().getFullYear()

              const dayOfWeek = currentDate.getDay()
              const isSunday = dayOfWeek === 0
              const isSaturday = dayOfWeek === 6

              return (
                <div
                  key={day}
                  className={`cursor-pointer rounded-xl p-1.5 text-center transition sm:rounded-2xl sm:p-2 ${
                    isSelected
                      ? "bg-slate-900 text-white font-bold shadow-lg"
                      : isToday
                        ? "bg-[#fff1e8] font-semibold text-[#a14c1f]"
                        : isSunday
                          ? "text-red-500 hover:bg-red-50"
                          : isSaturday
                            ? "text-blue-500 hover:bg-blue-50"
                            : "text-slate-700 hover:bg-slate-100"
                  }`}
                  onClick={() => handleDateClick(day)}
                >
                  {day}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
