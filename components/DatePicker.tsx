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

  return (
    <div className="relative">
      <div
        className="flex cursor-pointer items-center justify-between rounded-[1.4rem] border border-white/80 bg-white/90 p-4 shadow-[0_16px_40px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fff1e8] text-[#ff8a5b]">
            <CalendarIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Selected Day</p>
            <span className="text-sm font-semibold text-slate-800">{selectedDate ? formatDate(selectedDate) : "日付を選択"}</span>
          </div>
        </div>
        <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">変更</span>
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-2 w-full rounded-[1.6rem] border border-white/80 bg-white/95 p-4 shadow-[0_24px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl">
          <div className="flex justify-between items-center mb-3">
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

          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {["日", "月", "火", "水", "木", "金", "土"].map((day, index) => (
              <div
                key={day}
                className={`p-2 font-semibold ${index === 0 ? "text-red-500" : index === 6 ? "text-blue-500" : "text-slate-500"}`}
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
                  className={`cursor-pointer rounded-2xl p-2 text-center transition ${
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
